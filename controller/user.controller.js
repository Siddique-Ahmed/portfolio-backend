import { userModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verificationModel } from "../models/verifiation.model.js";
import { generateCode, sendVerificationEmail } from "../methods/methods.js";

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

    const user = await userModel.findOne({ _id: userId }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "no user data found!",
        success: false,
      });
    }

    res.status(201).json({
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

const logout = async (req, res) => {
  try {
    return res
      .status(201)
      .cookie("token", "", {
        maxAge: 0,
      })
      .json({
        message: "logout successfully!",
        success: false,
      });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
export { loginUser, verificationCode, getuserProfile, logout };
