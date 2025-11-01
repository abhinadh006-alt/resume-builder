// ===============================
// 📄 server.js — Clean & Correct Order
// ===============================
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import axios from "axios";

import resumeRoutes from "./routes/resumeRoutes.js";
import telegramWebhook from "./routes/telegramWebhook.js";
import pendingRoutes from "./routes/pendingRoutes.js";
import { generateResume } from "./controllers/resumeController.js";
import { isValidDailyKey, logKeyUsage } from "./middleware/verifyTgLink.js";

// ===============================
// 1️⃣ Setup + Load Environment
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("🧩 MONGO_URI:", process.env.MONGO_URI ? "✅" : "❌");
console.log("🧩 FRONTEND_URL:", process.env.FRONTEND_URL || "(none)");

// ===============================
// 2️⃣ Initialize App
// ===============================
const app = express();

// ===============================
// 3️⃣ CORS (must be before routes)
// ===============================
const allowedOrigins = [
  "https://safetycrewindiaresumes.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin.replace(/\/$/, ""))) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // ✅ Handle preflight requests fast
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use((req, res, next) => {
  console.log("🌍 Incoming origin:", req.headers.origin);
  next();
});


// ===============================
// 4️⃣ Body Parsers & Logging
// ===============================
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, _res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// ===============================
// 5️⃣ Static Files
// ===============================
app.use("/resumes", express.static(path.join(__dirname, "public", "resumes")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Public endpoint (used by Telegram bot) — Generates chat-bound daily key
app.get("/api/daily-key", (req, res) => {
  const chatId = req.query.chatId;
  if (!chatId) {
    return res.status(400).json({ error: "chatId is required" });
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const dailyKey = `TG-SECRET-${yyyy}${mm}${dd}-${chatId}`;
  res.json({ key: dailyKey });
});



/* ================================
   4️⃣  Secure Route Middleware
================================ */
app.use("/api/secure", (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔑 Checking secure key:", authHeader || "(none)");

  if (!isValidDailyKey(authHeader)) {
    console.warn("❌ Invalid or expired TG-SECRET key detected.");
    return res.status(401).json({ error: "Unauthorized: Invalid or expired key" });
  }

  logKeyUsage(req, authHeader);
  next();
});

app.get("/api/secure/ping", (_req, res) =>
  res.json({ ok: true, msg: "Secure route access granted ✅" })
);

app.post("/api/secure/generate-cv", generateResume);

// ===============================
// 8️⃣ API Routes
// ===============================
app.use("/api/resume", resumeRoutes);
app.use("/api/pending", pendingRoutes);
app.use("/webhook", telegramWebhook);

// ===============================
// 9️⃣ Resume File Delivery
// ===============================
const FRONTEND_URL = process.env.FRONTEND_URL || "";
app.get("/resumes/:fileName", (req, res) => {
  try {
    const filePath = path.join(__dirname, "public", "resumes", req.params.fileName);
    if (!fs.existsSync(filePath)) return res.status(404).send("❌ File not found");

    const referer = req.get("referer") || "";
    const allowed = ["t.me", "telegram.org", "localhost", FRONTEND_URL].some((s) =>
      referer.includes(s)
    );

    if (!allowed) return res.send(`<script>alert('Restricted');</script>`);
    res.sendFile(filePath);
  } catch (e) {
    console.error("❌ PDF route error:", e);
    res.status(500).send("Server error");
  }
});

// ===============================
// 🔟 Telegram Webhook Setup (Run Once)
// ===============================
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = `${process.env.BASE_URL}/webhook/telegram`;

async function manageTelegramWebhook() {
  try {
    console.log("🔄 Checking Telegram webhook status...");
    const info = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
    const currentUrl = info.data?.result?.url;
    const pending = info.data?.result?.pending_update_count || 0;

    console.log("🔍 Current Telegram Webhook:", currentUrl || "(none)");
    console.log("📨 Pending updates:", pending);

    if (currentUrl === WEBHOOK_URL) {
      console.log("✅ Webhook already up-to-date.");
      return;
    }

    await axios.get(`${TELEGRAM_API}/deleteWebhook`);
    console.log("🧹 Old webhook removed.");

    const res = await axios.get(`${TELEGRAM_API}/setWebhook`, {
      params: { url: WEBHOOK_URL },
    });
    console.log("🤖 Telegram Webhook update:", res.data.description || res.data);

    const verify = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
    console.log("✅ Verified Telegram Webhook URL:", verify.data?.result?.url);
  } catch (err) {
    console.error("❌ Telegram webhook setup failed:", err.message);
  }
}
manageTelegramWebhook();

// ===============================
// 11️⃣ Database + Start Server
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
