import dotenv from "dotenv";
import { transporter } from "../utils/nodemailer.js";

dotenv.config();

export const generateCode = () => {
  let code = [];

  for (let i = 0; i < 4; i++) {
    const randomNumber = Math.floor(Math.random() * 10);
    code.push(randomNumber);
  }

  return code.join("");
};

const contactEmailTemplate = (
  fullName,
  emailAddress,
  phoneNumber,
  projectType,
  subject,
  message
) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>📩 New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${emailAddress}</p>
      <p><strong>Phone:</strong> ${phoneNumber}</p>
      <p><strong>Project Type:</strong> ${projectType}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p style="background: #f1f1f1; padding: 10px; border-radius: 5px;">
        ${message}
      </p>
    </div>
  `;
};

export const sentContactEmail = async (
  fullName,
  emailAddress,
  phoneNumber,
  projectType,
  subject,
  message
) => {
  try {
    const info = await transporter.sendMail({
      from: `"My Website" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Message from ${fullName}`,
      html: contactEmailTemplate(
        fullName,
        emailAddress,
        phoneNumber,
        projectType,
        subject,
        message
      ),
    });

    return info.response;
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

export const getVerificationCodeTemplate = (name, code) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; background: #f4f6f8; border-radius: 8px; max-width: 500px; margin: auto;">
      <h2 style="color: #2c3e50; text-align: center;">Hello ${name},</h2>
      <p style="color: #555; font-size: 15px; text-align: center;">
        Here is your <strong>verification code</strong> to proceed:
      </p>
      <div style="font-size: 26px; font-weight: bold; color: #ffffff; background: linear-gradient(90deg, #4cafef, #007bff); padding: 12px 20px; text-align: center; border-radius: 6px; letter-spacing: 2px;">
        ${code}
      </div>
      <p style="color: #666; font-size: 14px; margin-top: 20px; text-align: center;">
        This code will expire in <strong>1 minutes</strong>. Please do not share it with anyone.
      </p>
      <p style="color: #999; font-size: 12px; text-align: center;">
        If you didn’t request this code, you can safely ignore this email.
      </p>
    </div>
  `;
};

export const sendVerificationEmail = async (name, email, code) => {
  try {
    const info = await transporter.sendMail({
      from: `"My Portfolio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: getVerificationCodeTemplate(name, code),
    });

    console.log("Verification email sent:", info.response);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};
