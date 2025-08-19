import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    coverImage: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cloudinaryPublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const serviceModel =
  mongoose.models.Services || mongoose.model("Service", serviceSchema);
