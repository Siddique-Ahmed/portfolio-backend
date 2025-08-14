import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    logo: {
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
  },
  {
    timestamps: true,
  }
);

export const serviceModel =
  mongoose.models.Services || mongoose.model("Service", serviceSchema);
