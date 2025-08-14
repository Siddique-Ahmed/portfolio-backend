import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  code: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60,
  },
});

export const verificationModel =
  mongoose.models.VerificationCodes ||
  mongoose.model("VerificationCode", verificationSchema);
