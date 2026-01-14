import mongoose from "mongoose";
import { config } from "./environment";

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodbUri, {
      dbName: "intervau_ai",
      retryWrites: true,
      w: "majority",
    } as any);
    console.log("✓ MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("✓ MongoDB disconnected");
  } catch (error) {
    console.error("✗ MongoDB disconnection failed:", error);
    throw error;
  }
};

/**
 * Handle connection events
 */
export const setupDatabaseEventListeners = () => {
  mongoose.connection.on("connected", () => {
    console.log("✓ Mongoose connected to database");
  });

  mongoose.connection.on("error", (error) => {
    console.error("✗ Mongoose connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("ℹ Mongoose disconnected from database");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✓ Mongoose reconnected to database");
  });
};
