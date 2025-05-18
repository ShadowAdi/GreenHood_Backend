// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

export const connectDB = async () => {
    const URI = process.env.MONGO_CONNECTION;
    if (!URI) {
        logger.error("MongoDB URI not found in environment variables.");
        process.exit(1);
    }

    try {
        await mongoose.connect(URI);
        logger.info("MongoDB connected.");
    } catch (err) {
        logger.error("Error connecting to MongoDB: ", err);
        process.exit(1);
    }
};
