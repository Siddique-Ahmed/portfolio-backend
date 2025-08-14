import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      default: "Itssidique786@gmail.com",
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      fullName: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
      bio: {
        type: String,
      },
      description: {
        type: String,
      },
      location: {
        type: String,
      },
      age: {
        type: Number,
      },
      experience: {
        type: String,
      },
      projects: {
        type: Number,
      },
      completedProjects: {
        type: Number,
      },
      languages: [
        {
          type: String,
        },
      ],
      skills: [
        {
          type: String,
        },
      ],
      myCV: {
        type: String,
      },
      portfolio: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const userModel =
  mongoose.models.Users || mongoose.model("User", userSchema);
