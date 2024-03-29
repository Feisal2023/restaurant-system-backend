import mongoose from "mongoose";
import { dbURL } from "./config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(dbURL);
    console.log("Connected to Database Successfully");
  } catch (error) {
    console.log("Error Occurred connecting to database", error.message);
    process.exit(1);
  }
};

export default connectDB;
