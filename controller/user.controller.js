import { userModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verificationModel } from "../models/verifiation.model.js";
import { generateCode, sendVerificationEmail } from "../methods/methods.js";
import redis from "../utils/redisClient.js";
import { getDataUri } from "../utils/datauri.js";
import { deleteImage, uploadImage } from "../utils/cloudinary.js";

// login user controller
const loginUser = async (req, res) => {
  try {
    const { email, password, otpCode } = req.body;

    // ✅ Allowed email
    const allowedEmail = "itssiddique786@gmail.com";

    if (!email || !password || !otpCode) {
      return res
        .status(400)
        .json({ message: "All fields are required!", success: false });
    }

    // ❌ Agar email allowed wali nahi hai
    if (email !== allowedEmail) {
      return res
        .status(403)
        .json({ message: "Access Denied!", success: false });
    }

    // 🔍 Check if user exists
    let user = await userModel.findOne({ email });

    // 🔹 Agar user nahi mila to create karo
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new userModel({
        email,
        password: hashedPassword,
      });
      await user.save();
    } else {
      // 🔹 Agar user hai to password check karo
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Invalid password!", success: false });
      }
    }

    // 🔍 OTP Verify
    const otpRecord = await verificationModel.findOne({
      userId: user._id,
      code: otpCode,
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "Invalid OTP code!", success: false });
    }

    // 🎫 Token Create
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // 🍪 Token Cookie me set karo
    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Login successful", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// request for otp Code controller
const verificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("Email:", email);

    if (!email) {
      return res.status(404).json({
        message: "email is required to get verification code",
        success: false,
      });
    }

    const user = await userModel.findOne({ email });

    const code = generateCode();

    const verifiationCode = new verificationModel({
      userId: user?._id,
      code,
    });

    await verifiationCode.save();
    await sendVerificationEmail(user?.name || "user", email, code);

    return res.status(200).json({
      message: "verification code sent to your email please check ur email",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || "Something went wrong",
      success: false,
    });
  }
};

// get user profile controller
const getuserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const cachedUser = await redis.get(`users/${userId}`);

    if (cachedUser) {
      return res.status(200).json({
        user: JSON.parse(cachedUser),
        success: true,
      });
    }

    const user = await userModel.findOne({ _id: userId }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "no user data found!",
        success: false,
      });
    }

    await redis.set(`users/${userId}`, JSON.stringify(user));

    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      email,
      fullName,
      phoneNumber,
      location,
      experience,
      projects,
      bio,
      description,
      languages,
      skills,
      portfolio,
      completedProjects,
      age,
    } = req.body;

    const files = req.files; // { profilePic: [..], myCV: [..] }
    const userId = req.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
        success: false,
      });
    }

    let updateProfilePic = null;
    let updateCV = null;

    // === Handle Profile Pic ===
    if (files?.profilePic && files.profilePic.length > 0) {
      // purani image delete
      if (user.cloudinaryPublicId) {
        await deleteImage(user.cloudinaryPublicId);
      }

      const dataUriPic = getDataUri(files.profilePic[0]);
      updateProfilePic = await uploadImage(dataUriPic);
    }

    // === Handle CV ===
    if (files?.myCV && files.myCV.length > 0) {
      // agar pehle se CV public id save hai to usko delete karo
      if (user.profile?.cvPublicId) {
        await deleteImage(user.profile.cvPublicId);
      }

      const dataUriCV = getDataUri(files.myCV[0]);
      updateCV = await uploadImage(dataUriCV);
    }

    const updatedUser = {
      email: email ?? user.email,
      cloudinaryPublicId:
        updateProfilePic?.public_id ?? user.cloudinaryPublicId,
      profile: {
        profilePic: updateProfilePic?.secure_url ?? user.profile.profilePic,
        fullName: fullName ?? user.profile.fullName,
        phoneNumber: phoneNumber ?? user.profile.phoneNumber,
        location: location ?? user.profile.location,
        experience: experience ?? user.profile.experience,
        projects: projects ?? user.profile.projects,
        bio: bio ?? user.profile.bio,
        description: description ?? user.profile.description,
        languages: languages ?? user.profile.languages,
        skills: skills ?? user.profile.skills,
        portfolio: portfolio ?? user.profile.portfolio,
        completedProjects: completedProjects ?? user.profile.completedProjects,
        age: age ?? user.profile.age,

        // === CV update ===
        myCV: updateCV?.secure_url ?? user.profile.myCV,
        cvPublicId: updateCV?.public_id ?? user.profile.cvPublicId,
      },
    };

    const updated = await userModel.findByIdAndUpdate(userId, updatedUser, {
      new: true,
    });

    // Redis cache update
    await redis.set(`users/${userId}`, JSON.stringify(updated));

    return res.status(200).json({
      message: "Profile updated successfully!",
      user: updated,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// check auth controller
const checAuth = async (req, res) => {
  res.json({
    success: true,
    user: req.userId,
  });
};

// logout controller
const logout = async (req, res) => {
  try {
    const userId = req.userId;
    await redis.del(`users/${userId}`);
    return res
      .status(200)
      .cookie("token", "", {
        maxAge: 0,
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      })
      .json({
        message: "logout successfully!",
        success: true,
      });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// Exporting all controllers
export {
  loginUser,
  verificationCode,
  getuserProfile,
  logout,
  updateProfile,
  checAuth,
};
