// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import axios from "axios";  // ✅ Add this import

import resumeRoutes from "./routes/resumeRoutes.js";
import telegramWebhook from "./routes/telegramWebhook.js";
import pendingRoutes from "./routes/pendingRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config({ path: path.join(__dirname, ".env") });
console.log("🧩 .env -> MONGO_URI:", !!process.env.MONGO_URI ? "✅" : "❌");
console.log("🧩 .env -> FRONTEND_URL:", process.env.FRONTEND_URL || "(none)");

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = `${process.env.FRONTEND_URL}/webhook/telegram`;


async function manageTelegramWebhook() {
  try {
    console.log("🔄 Checking Telegram webhook status...");
    const info = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
    const currentUrl = info.data?.result?.url;
    const pending = info.data?.result?.pending_update_count || 0;

    console.log("🔍 Current Telegram Webhook:", currentUrl || "(none)");
    console.log("📨 Pending updates:", pending);

    // If webhook already matches current FRONTEND_URL, no action needed
    if (currentUrl === WEBHOOK_URL) {
      console.log("✅ Webhook already up-to-date.");
      return;
    }

    // Otherwise, delete old one (cleanup)
    console.log("🧹 Removing old webhook...");
    await axios.get(`${TELEGRAM_API}/deleteWebhook`);

    // Register the new webhook
    console.log("⚙️ Registering new Telegram webhook...");
    const res = await axios.get(`${TELEGRAM_API}/setWebhook`, {
      params: { url: WEBHOOK_URL },
    });

    console.log("🤖 Telegram Webhook update:", res.data.description || res.data);

    // Verify again after registration
    const verify = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
    console.log("✅ Verified Telegram Webhook URL:", verify.data?.result?.url);
  } catch (err) {
    console.error("❌ Telegram webhook setup failed:", err.message);
  }
}

// Execute webhook management on startup
manageTelegramWebhook();

const app = express();

// basic middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// request logger (keep for now)
app.use((req, _res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// static folders (for generated PDFs & uploads)
app.use("/resumes", express.static(path.join(__dirname, "public", "resumes")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/resume", resumeRoutes);
app.use("/api/pending", pendingRoutes);
app.use("/webhook", telegramWebhook);

// secure-ish PDF delivery (kept from your version)
const FRONTEND_URL = process.env.FRONTEND_URL || "";
app.get("/resumes/:fileName", (req, res) => {
  try {
    const filePath = path.join(__dirname, "public", "resumes", req.params.fileName);
    if (!fs.existsSync(filePath)) return res.status(404).send("❌ File not found");
    const referer = req.get("referer") || "";
    const allowed = ["t.me", "telegram.org", "localhost", FRONTEND_URL].some(s => referer.includes(s));
    if (!allowed) return res.send(`<script>alert('Restricted');</script>`);
    res.sendFile(filePath);
  } catch (e) {
    console.error("❌ PDF route error:", e);
    res.status(500).send("Server error");
  }
});

// (optional) serve React build if you drop it into /frontend/build
const FRONTEND_BUILD_PATH = path.join(__dirname, "frontend", "build");
app.use(express.static(FRONTEND_BUILD_PATH));
app.get(/^\/(?!api|webhook).*/, (_req, res) =>
  res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"))
);

// DB + start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ Mongo error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
