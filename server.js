import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import telegramWebhook from "./routes/telegramWebhook.js";
import pendingRoutes from "./routes/pendingRoutes.js";

/* ======================================================
   BASIC SETUP
====================================================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const isLocal = process.env.NODE_ENV !== "production";

console.log("🧩 ENV:", isLocal ? "LOCAL" : "PRODUCTION");
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL || "(none)");

const app = express();

/* ======================================================
   CORS (SAFE)
====================================================== */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* ======================================================
   BODY PARSERS
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   🖨️ PDF GENERATION (FINAL, STABLE)
====================================================== */
app.post("/api/generate-pdf", async (req, res) => {
  let browser;

  try {
    const { url, printData } = req.body;
    if (!url || !printData) {
      return res.status(400).json({ error: "url and printData required" });
    }

    // ✅ Launch browser (same logic for local & prod)
    browser = await puppeteerCore.launch(
      isLocal
        ? {
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }
        : {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        }
    );

    const page = await browser.newPage();

    // 🔑 PRELOAD localStorage BEFORE navigation
    await page.evaluateOnNewDocument((data) => {
      localStorage.setItem("resume-print-data", JSON.stringify(data));
    }, printData);

    // 🚀 Load print page
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // 🔥 STEP 6 — WAIT FOR PRINT READY FLAG (CRITICAL)
    await page.waitForFunction(() => {
      const root = document.querySelector(".resume-print-root");
      return root && root.dataset.printReady === "true";
    }, { timeout: 30000 });

    // 🖨️ Generate PDF
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length,
    });

    return res.end(pdf);
  } catch (err) {
    if (browser) await browser.close();

    console.error("❌ PDF generation error:", err.message);

    return res.status(500).json({
      error: "PDF generation failed",
      details: err.message,
    });
  }
});

/* ======================================================
   ROUTES
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
