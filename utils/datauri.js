import DataURIParser from "datauri/parser.js";
import path from "path";

export const getDataUri = (file) => {
  try {
    const parser = new DataURIParser();
    const extName = path.extname(file.originalname).toString();
    const bufferParser = parser.format(extName, file.buffer);
    return bufferParser.content;
  } catch (error) {
    console.log("data uri error", error.message);
  }
};
