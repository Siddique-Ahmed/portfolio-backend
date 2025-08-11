import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    if (connection.connection.readyState === 1) {
      console.log("✅ Database Connected Successfully!");
    } else {
      console.log("❌ Database Connection Failed!");
    }
  } catch (error) {
    console.log("MongoDB Error:", error.message);
  }
};

export default connectDB;
