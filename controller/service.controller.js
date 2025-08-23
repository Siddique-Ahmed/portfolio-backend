import { serviceModel } from "../models/service.model.js";
import { userModel } from "../models/user.model.js";
import { deleteImage, uploadImage } from "../utils/cloudinary.js";
import { getDataUri } from "../utils/datauri.js";
import redis from "../utils/redisClient.js";

const createService = async (req, res) => {
  try {
    const { title, coverImageUrl, price, startDate, endDate, description } =
      req.body;
    const coverImageFile = req.file;
    const userId = req.userId;

    console.log("check cover img file", coverImageFile);

    if (!title || !price || !startDate || !endDate || !description) {
      return res.status(404).json({
        message: "all fields are required!",
        success: false,
      });
    }

    if (!coverImageUrl && !coverImageFile) {
      return res.status(401).json({
        message: "image is required!",
        success: false,
      });
    }

    const fileContentUrl = getDataUri(coverImageFile);

    const fileUrl = await uploadImage(fileContentUrl, "/services");

    if (!fileUrl) {
      return res.status(401).json({
        message: "file not uploaded on cloudinary!",
        success: false,
      });
    }

    const startDateScheduled = new Date(startDate);
    const endDateScheduled = new Date(endDate);

    if (isNaN(startDateScheduled) || isNaN(endDateScheduled)) {
      return res.status(400).json({
        message: "Start date or end date is invalid format!",
        success: false,
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "user not found!",
        success: false,
      });
    }

    const services = new serviceModel({
      title,
      description,
      price,
      startDate: startDateScheduled,
      endDate: endDateScheduled,
      coverImage: fileUrl ? fileUrl.secure_url : coverImageUrl,
      cloudinaryPublicId: fileUrl.public_id,
      userId,
    });

    await services.save();

    await redis.del("services");

    return res.status(201).json({
      message: "Services created successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getService = async (req, res) => {
  try {
    const userId = req.userId;

    const cachedServices = await redis.get("services");

    if (cachedServices) {
      const parsedService = JSON.parse(cachedServices);

      if (Array.isArray(parsedService) && parsedService.length > 0) {
        return res.status(200).json({
          message: "services fetched from DB",
          success: true,
          data: JSON.parse(cachedServices),
        });
      }
    }

    const services = await serviceModel.find({ userId });

    console.log("check service =>", services);

    if (!services) {
      return res.status(404).json({
        message: "no service data found!",
        success: false,
      });
    }

    await redis.set("services", JSON.stringify(services));

    return res.status(200).json({
      message: "servicess avialable!",
      data: services,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const getSingleService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const cachedServices = await redis.get(`services/${serviceId}`);

    if (cachedServices) {
      return res.status(201).json({
        message: "services fetched successfully!",
        success: true,
        data: JSON.parse(cachedServices),
      });
    }

    const singleServie = await serviceModel.findById(serviceId);

    if (!singleServie) {
      return res.status(404).json({
        message: "no data found!",
        success: false,
      });
    }

    await redis.set(`services/${serviceId}`, JSON.stringify(singleServie));

    return res.status(200).json({
      message: "service avialable",
      success: true,
      data: singleServie,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const updateService = async (req, res) => {
  try {
    const { title, coverImageUrl, price, startDate, endDate, description } =
      req.body;
    const coverImage = req.file;
    const servicesId = req.params.id;

    const service = await serviceModel.findById(servicesId);

    if (!service) {
      return res.status(404).json({
        message: "service not found",
        success: false,
      });
    }

    await deleteImage(service.cloudinaryPublicId);

    await redis.del(`services/${servicesId}`);

    const fileContentUrl = getDataUri(coverImage);

    const fileUrl = await uploadImage(fileContentUrl, "/services");

    if (!fileUrl) {
      return res.status(404).json({
        message: "image url from cloudinary is missing!",
        success: false,
      });
    }

    const startDateScheduled = new Date(startDate);
    const endDateScheduled = new Date(endDate);

    if (isNaN(startDateScheduled) || isNaN(endDateScheduled)) {
      return res.status(400).json({
        message: "Start date or end date is invalid format!",
        success: false,
      });
    }

    const updatedService = await serviceModel.findByIdAndUpdate(
      servicesId,
      {
        title: title ? title : service.title,
        coverImage: coverImageUrl
          ? coverImageUrl
          : fileUrl
          ? fileUrl.secure_url
          : service.coverImage,
        cloudinaryPublicId: fileUrl?.public_id
          ? fileUrl.public_id
          : service.cloudinaryPublicId,
        price: price ? price : service.price,
        startDate: startDateScheduled ? startDateScheduled : service.startDate,
        endDate: endDateScheduled ? endDateScheduled : service.endDate,
        description,
      },
      { new: true }
    );

    await redis.set(`services/${servicesId}`, JSON.stringify(updatedService));

    return res.status(201).json({
      message: "services updated successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const getRedisService = await redis.get(`services/${serviceId}`);
    const serviceObj = getRedisService ? JSON.parse(getRedisService) : null;

    if (serviceObj?.coverImage) {
      await deleteImage(serviceObj.cloudinaryPublicId);
    }

    await redis.del(`services/${serviceId}`);

    await serviceModel.findByIdAndDelete(serviceId);

    return res.status(200).json({
      message: "service deleted successfully!",
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
  createService,
  getService,
  getSingleService,
  updateService,
  deleteService,
};
