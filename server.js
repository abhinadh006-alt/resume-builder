import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import axios from "axios";
import pkg from "pg";
import { fileURLToPath } from "url";

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
console.log("🧵 SUPABASE_DB_URL:", process.env.SUPABASE_DB_URL ? "✅" : "❌");
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL || "(none)");

const app = express();

/* ======================================================
   OPTIONAL POSTGRES (SUPABASE) CONNECTION
====================================================== */
let pgPool = null;
const { Pool } = pkg;

if (process.env.SUPABASE_DB_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.SUPABASE_DB_URL,
      ssl: { rejectUnauthorized: false },
    });
    console.log("🟢 Postgres PDF queue enabled");
  } catch (err) {
    console.error("❌ Postgres init failed:", err);
    pgPool = null;
  }
} else {
  console.log("⚠️ Postgres PDF queue disabled (local dev)");
}

/* ======================================================
   CORS
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
      const clean = origin.replace(/\/$/, "");
      if (allowedOrigins.has(clean)) return callback(null, true);
      console.warn("🚫 CORS blocked:", origin);
      callback(null, false);
    },
    credentials: true,
  })
);

/* ======================================================
   BODY PARSERS
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   🖨️ PDF GENERATION — QUEUE
====================================================== */
app.post("/api/generate-pdf", async (req, res) => {
  if (!pgPool) {
    return res.status(503).json({
      error: "PDF queue not available in local mode",
    });
  }

  try {
    const { printData } = req.body;
    if (!printData) {
      return res.status(400).json({ error: "printData required" });
    }

    const { rows } = await pgPool.query(
      `INSERT INTO pdf_jobs (payload, status)
       VALUES ($1, 'pending')
       RETURNING id`,
      [printData]
    );

    res.json({ jobId: rows[0].id, status: "queued" });
  } catch (err) {
    console.error("❌ PDF queue insert failed:", err);
    res.status(500).json({ error: "Failed to queue PDF job" });
  }
});

/* ======================================================
   🧾 PDF JOB STATUS
====================================================== */
app.get("/api/pdf-status/:jobId", async (req, res) => {
  if (!pgPool) {
    return res.status(503).json({ error: "Queue not available" });
  }

  try {
    const { rows } = await pgPool.query(
      "SELECT status, result_url, error FROM pdf_jobs WHERE id = $1",
      [req.params.jobId]
    );

    if (!rows.length) {
      return res.status(404).json({ status: "not_found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Status check failed:", err);
    res.status(500).json({ error: "Status check failed" });
  }
});

/* ======================================================
   📥 PDF DOWNLOAD
====================================================== */
app.get("/api/pdf-download/:jobId", async (req, res) => {
  if (!pgPool) {
    return res.status(503).json({ error: "Queue not available" });
  }

  try {
    const { rows } = await pgPool.query(
      "SELECT result_url FROM pdf_jobs WHERE id = $1 AND status = 'done'",
      [req.params.jobId]
    );

    if (!rows.length || !rows[0].result_url) {
      return res.status(404).json({ error: "PDF not ready" });
    }

    res.redirect(rows[0].result_url);
  } catch (err) {
    console.error("❌ PDF download failed:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

/* ======================================================
   STATIC FILES
====================================================== */
app.use("/resumes", express.static(path.join(__dirname, "public", "resumes")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================================================
   DAILY KEY
====================================================== */
app.get("/api/daily-key", (req, res) => {
  const { chatId } = req.query;
  if (!chatId) return res.status(400).json({ error: "chatId required" });

  const d = new Date();
  const key = `TG-SECRET-${d.getFullYear()}${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(d.getDate()).padStart(2, "0")}-${chatId}`;

  res.json({ key });
});

/* ======================================================
   SECURE MIDDLEWARE
====================================================== */
app.use("/api/secure", (req, res, next) => {
  const auth = req.headers.authorization || "";
  const origin = req.headers.origin || "";
  const host = req.hostname || "";

  if (origin.includes("localhost") || host.includes("localhost")) {
    return next();
  }

  if (isValidDailyKey(auth)) {
    logKeyUsage(req, auth);
    return next();
  }

  return res.status(401).json({ error: "Unauthorized" });
});

/* ======================================================
   ROUTES
====================================================== */
app.use("/api/pending", pendingRoutes);
app.use("/webhook", telegramWebhook);

/* ======================================================
   START SERVER (SAFE)
====================================================== */
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed");
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} already in use. Stop the other process.`);
      process.exit(1);
    }
    throw err;
  });
})();
