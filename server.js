import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import axios from "axios";
import puppeteer from "puppeteer";
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
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL || "(none)");

const app = express();

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
   🖨️ PDF GENERATION (URL-BASED — FINAL)
====================================================== */
// server.js — replace your current /api/generate-pdf handler with this
app.post("/api/generate-pdf", async (req, res) => {
  try {
    const { url, printData } = req.body;
    if (!url || !printData) {
      return res.status(400).json({ error: "url and printData required" });
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // 🔑 CRITICAL: preload localStorage BEFORE navigation
    await page.evaluateOnNewDocument((data) => {
      localStorage.setItem("resume-print-data", JSON.stringify(data));
    }, printData);

    await page.goto(url, { waitUntil: "domcontentloaded" });

    // 🔑 Wait for ACTUAL content, not just DOM
    await page.waitForFunction(() => {
      const el = document.querySelector(".resume-preview");
      return el && el.innerText.trim().length > 20;
    }, { timeout: 20000 });

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true, // ✅ MUST BE TRUE
      margin: { top: 0, bottom: 0, left: 0, right: 0 }
    });



    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length,
    });

    res.end(pdf);
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed" });
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
   ROUTES (ONLY VALID ONES)
====================================================== */
app.use("/api/pending", pendingRoutes);
app.use("/webhook", telegramWebhook);

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
