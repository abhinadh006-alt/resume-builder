import "./babel-register.js";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import axios from "axios";
import { fileURLToPath } from "url";

import resumeRoutes from "./routes/resumeRoutes.js";
import telegramWebhook from "./routes/telegramWebhook.js";
import pendingRoutes from "./routes/pendingRoutes.js";
import { isValidDailyKey, logKeyUsage } from "./middleware/verifyTgLink.js";

/* ======================================================
   BASIC SETUP
====================================================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("🧩 MONGO_URI:", process.env.MONGO_URI ? "✅" : "❌");
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL || "(none)");

const app = express();

/* ======================================================
   ✅ CORS — SAFE + EXPRESS v5 COMPATIBLE
   ❌ NO app.options("*")
====================================================== */
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:5173",
  "https://safetycrewindiaresumes.netlify.app",
  (process.env.FRONTEND_URL || "").replace(/\/$/, ""),
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.has(cleanOrigin)) {
        return callback(null, true);
      }

      console.warn("🚫 CORS blocked:", origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ======================================================
   BODY PARSERS + LOGGING
====================================================== */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log("➡️", req.method, req.url, "origin:", req.headers.origin || "");
  next();
});

/* ======================================================
   STATIC FILES
====================================================== */
app.use("/resumes", express.static(path.join(__dirname, "public", "resumes")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================================================
   DAILY KEY (PUBLIC)
====================================================== */
app.get("/api/daily-key", (req, res) => {
  const { chatId } = req.query;
  if (!chatId) return res.status(400).json({ error: "chatId required" });

  const d = new Date();
  const key = `TG-SECRET-${d.getFullYear()}${String(
    d.getMonth() + 1
  ).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${chatId}`;

  res.json({ key });
});

/* ======================================================
   🔐 SECURE MIDDLEWARE
   Applies ONLY to /api/secure/*
====================================================== */
app.use("/api/secure", (req, res, next) => {
  const auth = req.headers.authorization || "";
  const origin = req.headers.origin || "";
  const host = req.hostname || "";

  // DEV MODE — localhost bypass
  if (origin.includes("localhost") || host.includes("localhost")) {
    console.log("🧩 Localhost — skipping TG key check");
    return next();
  }

  if (isValidDailyKey(auth)) {
    logKeyUsage(req, auth);
    return next();
  }

  console.warn("🚫 Unauthorized secure request");
  return res.status(401).json({ error: "Unauthorized" });
});

// Secure ping
app.get("/api/secure/ping", (_req, res) => {
  res.json({ ok: true, message: "Secure access OK ✅" });
});

/* ======================================================
   ROUTES
====================================================== */
app.use("/api/resume", resumeRoutes);
app.use("/api/pending", pendingRoutes);
app.use("/webhook", telegramWebhook);

/* ======================================================
   SAFE PDF DELIVERY
====================================================== */
const FRONTEND_URL = process.env.FRONTEND_URL || "";

app.get("/resumes/:file", (req, res) => {
  try {
    const filePath = path.join(__dirname, "public", "resumes", req.params.file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Not found");
    }

    const referer = req.get("referer") || "";
    const allowed = ["localhost", "t.me", "telegram.org", FRONTEND_URL].some(
      (s) => referer.includes(s)
    );

    if (!allowed) {
      return res.status(403).send("Forbidden");
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("PDF serve error:", err);
    res.status(500).send("Server error");
  }
});

/* ======================================================
   TELEGRAM WEBHOOK (OPTIONAL)
====================================================== */
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (TELEGRAM_TOKEN) {
  const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
  const WEBHOOK_URL = `${process.env.BASE_URL}/webhook/telegram`;

  (async () => {
    try {
      const info = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
      if (info.data?.result?.url !== WEBHOOK_URL) {
        await axios.get(`${TELEGRAM_API}/deleteWebhook`);
        await axios.get(`${TELEGRAM_API}/setWebhook`, {
          params: { url: WEBHOOK_URL },
        });
        console.log("📡 Telegram webhook set");
      }
    } catch (e) {
      console.warn("Telegram webhook error:", e.message);
    }
  })();
}

/* ======================================================
   START SERVER
====================================================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
