import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    projectType: {
      type: String,
    },
    subject: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const contactModel =
  mongoose.models.Contacts || mongoose.model("Contact", contactSchema);
