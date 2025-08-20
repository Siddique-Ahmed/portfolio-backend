import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import serviceRoute from "./routes/service.route.js";
import projectRoute from "./routes/projects.route.js";
import contactRoute from "./routes/contact.route.js";
import { connectRedis } from "./utils/redisClient.js";

dotenv.config();

const app = express();

// ✅ CORS config
const corsOptions = {
  origin: ["http://localhost:5173", "https://portfolio-siddique.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/service", serviceRoute);
app.use("/api/v1/project", projectRoute);
app.use("/api/v1/contact", contactRoute);

app.get("/", (_, res) => {
  try {
    res.status(200).json({
      message: "Backend is Running Successfully!",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});

// port
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  connectDB();
  await connectRedis();
  console.log(`Backend is running on port ${PORT}`);
});
