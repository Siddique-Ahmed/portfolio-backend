import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

dotenv.config();

const app = express();

const corsOption = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowHeadersallowHeaders: ["Content-Type", "multipart/form-data"],
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOption));

app.use("/", (_, res) => {
  res.status(200).json({
    message: "Backend is Running Successfully!",
    success: true,
  });
  try {
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  connectDB();
  console.log(`Backend is running on port ${PORT}`);
});
