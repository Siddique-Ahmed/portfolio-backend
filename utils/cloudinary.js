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
    return uploadedFile.secure_url;
  } catch (error) {
    return error.message;
  }
};

export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) throw new Error("imageUrl is required!");

    const parts = imageUrl.split("/");
    const fileWithExt = parts.pop();
    const folder = parts.slice(parts.indexOf("upload") + 1).join("/");
    const publicId = `${folder}/${fileWithExt.split(".")[0]}`;

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    return error.message;
  }
};
