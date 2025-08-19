import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const uploadImage = async (file, folderName) => {
  try {
    if (!file) throw new Error("file is required please add file!");
    const uploadedFile = await cloudinary.uploader.upload(file, {
      folder: folderName,
    });
    return uploadedFile;
  } catch (error) {
    return error.message;
  }
};

export const deleteImage = async (public_id) => {
  try {
    if (!public_id) throw new Error("public id is required!");

    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    return error.message;
  }
};
