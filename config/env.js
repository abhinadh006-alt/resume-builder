// config/env.js
import dotenv from "dotenv";
dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const MONGO_URI = process.env.MONGO_URI;
export const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
