import { Schema } from "mongoose";

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
    fullName: {
      type: String,
    },
    profile: {
      bio: {
        type: String,
      },
      description: {
        type: String,
      },
      location: {
        type: String,
      },
      age : {
        type : Number,
      }
    },
  },
  {
    timestamps: true,
  }
);
