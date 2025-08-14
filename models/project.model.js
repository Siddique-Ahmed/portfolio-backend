import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    liveUrl: {
      type: String,
    },
    repoUrl: {
      type: String,
    },
    clientType: {
      type: String,
      enum: ["client", "personal"],
      default: "personal",
    },
    projectType: {
      type: String,
      enum: ["Frontend", "Backend", "FullStack"],
      default: "Frontend",
    },
    keyFeatures: [
      {
        type: String,
      },
    ],
    technologies: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const projectModel =
  mongoose.models.Projects || mongoose.model("Project", ProjectSchema);
