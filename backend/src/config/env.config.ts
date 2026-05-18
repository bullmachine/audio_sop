import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const HOST = process.env.HOST || "localhost";
export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/rate-approval";
export const CLIENT_URL = process.env.CLIENT_URL || "http://192.168.1.49/";
export const NODE_ENV = process.env.NODE_ENV || "development";