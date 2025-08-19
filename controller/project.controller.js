import { projectModel } from "../models/project.model.js";
import { userModel } from "../models/user.model.js";
import { deleteImage, uploadImage } from "../utils/cloudinary.js";
import { getDataUri } from "../utils/datauri.js";
import redis from "../utils/redisClient.js";

// create project controller
const createProjects = async (req, res) => {
  try {
    const {
      title,
      description,
      projectImgUrl,
      liveUrl,
      repoUrl,
      clientType,
      projectType,
      keyFeatures,
      technologies,
    } = req.body;
    const projectImg = req.file;
    const userId = "689de84fc77bd991fcb9ea72";

    if (
      !title ||
      !description ||
      !liveUrl ||
      !repoUrl ||
      !clientType ||
      !projectType ||
      !Array.isArray(keyFeatures) ||
      !Array.isArray(technologies)
    ) {
      return res.status(400).json({
        message: "all fields are required!",
      });
    }

    if (!projectImgUrl && !projectImg) {
      return res.status(400).json({
        message: "Project image is required!",
      });
    }

    const dataUri = getDataUri(projectImg);
    const cloudRes = await uploadImage(dataUri, "projects");

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
        success: false,
      });
    }

    const newProject = await projectModel({
      title,
      description,
      liveUrl,
      repoUrl,
      clientType,
      projectType,
      keyFeatures,
      technologies,
      coverImage: projectImgUrl || cloudRes.secure_url,
      userId,
      cloudinaryPublicId: cloudRes.public_id,
    });

    await newProject.save();
    await redis.del("projects");

    return res.status(201).json({
      message: "project created successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// get all projects controller
const getProjects = async (req, res) => {
  try {
    const userId = "689de84fc77bd991fcb9ea72";

    const cachedProjects = await redis.get("projects");
    if (cachedProjects) {
      return res.status(200).json({
        message: "projects fetched successfully!",
        success: true,
        projects: JSON.parse(cachedProjects),
      });
    }

    const projects = await projectModel.find({ userId });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        message: "no projects found!",
        success: false,
      });
    }

    await redis.set("projects", JSON.stringify(projects));
    return res.status(200).json({
      message: "projects found successfully!",
      success: true,
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// get single project controller
const getSingleProjects = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = "689de84fc77bd991fcb9ea72";

    const cachedProject = await redis.get(`projects/${projectId}`);

    if (cachedProject) {
      return res.status(200).json({
        message: "project fetched successfully!",
        success: true,
        project: JSON.parse(cachedProject),
      });
    }

    const projects = await projectModel.findOne({
      _id: projectId,
      userId,
    });

    if (!projects) {
      return res.status(404).json({
        message: "project not found!",
        success: false,
      });
    }

    const parsedCachedProject = JSON.stringify(projects);

    await redis.set(`projects/${projectId}`, parsedCachedProject);
    return res.status(200).json({
      message: "project found successfully!",
      success: true,
      project: projects,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// update project controller
const updateProjects = async (req, res) => {
  try {
    const {
      title,
      description,
      projectImgUrl,
      liveUrl,
      repoUrl,
      clientType,
      projectType,
      keyFeatures,
      technologies,
    } = req.body;
    const projectImg = req.file;
    const projectId = req.params.id;

    const cachedProject = await redis.get(`projects/${projectId}`);
    if (cachedProject) {
      await redis.del(`projects/${projectId}`);
    }

    const dataUri = getDataUri(projectImg);
    const cloudRes = await uploadImage(dataUri, "projects");

    const project = await projectModel.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "project not found!",
        success: false,
      });
    }

    const newProject = await projectModel.findByIdAndUpdate(
      projectId,
      {
        title: title ? title : project.title,
        description: description ? description : project.description,
        liveUrl: liveUrl ? liveUrl : project.liveUrl,
        repoUrl: repoUrl ? repoUrl : project.repoUrl,
        clientType: clientType ? clientType : project.clientType,
        projectType: projectType ? projectType : project.projectType,
        keyFeatures: keyFeatures ? keyFeatures : project.keyFeatures,
        technologies: technologies ? technologies : project.technologies,
        coverImage: cloudRes
          ? cloudRes.secure_url
          : projectImgUrl
          ? projectImgUrl
          : project.coverImage,
        cloudinaryPublicId: cloudRes
          ? cloudRes.public_id
          : project.cloudinaryPublicId,
      },
      { new: true }
    );
    await deleteImage(project.cloudinaryPublicId);
    await redis.set(`projects/${projectId}`, JSON.stringify(newProject));
    return res.status(200).json({
      message: "project updated successfully!",
      success: true,
      project: newProject,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// delete project controller
const deleteProjects = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = "689de84fc77bd991fcb9ea72";

    const cachedProject = await redis.get(`projects/${projectId}`);
    console.log("cachedProject", cachedProject);
    const parsedCachedProject = await JSON.parse(cachedProject);
    await deleteImage(parsedCachedProject?.cloudinaryPublicId);
    if (cachedProject) {
      await redis.del(`projects/${projectId}`);
    }

    const project = await projectModel.findOneAndDelete({
      _id: projectId,
      userId,
    });

    if (!project) {
      return res.status(404).json({
        message: "project not found!",
        success: false,
      });
    }

    return res.status(200).json({
      message: "project deleted successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export {
  createProjects,
  getProjects,
  getSingleProjects,
  updateProjects,
  deleteProjects,
};
