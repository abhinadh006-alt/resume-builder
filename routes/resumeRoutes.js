// routes/resumeRoutes.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";

import Resume from "../models/Resume.js";
import { generateResume } from "../controllers/resumeController.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const PUBLIC_PATH = path.join(process.cwd(), "public", "resumes");

/* ======================================================
   PDF UTILS (Puppeteer / JSX Templates)
====================================================== */
async function loadPdfUtils() {
    const mod = await import("../utils/generatePDF.cjs");
    return mod.default || mod;
}

async function produceAndSavePdf(formData, template = "modern") {
    const pdfUtils = await loadPdfUtils();

    if (typeof pdfUtils.renderPdfBuffer !== "function") {
        throw new Error("renderPdfBuffer not found in generatePDF.cjs");
    }

    if (!fs.existsSync(PUBLIC_PATH)) {
        fs.mkdirSync(PUBLIC_PATH, { recursive: true });
    }

    const safeName = (formData.name || "resume")
        .toString()
        .replace(/[<>:"/\\|?*]+/g, "")
        .replace(/\s+/g, "_");

    const fileName = `${safeName}-${Date.now()}.pdf`;
    const filePath = path.join(PUBLIC_PATH, fileName);

    const buffer = await pdfUtils.renderPdfBuffer({
        formData,
        template,
        placeholders: {},
    });

    fs.writeFileSync(filePath, buffer);

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    return {
        filePath,
        publicUrl: `${baseUrl.replace(/\/$/, "")}/resumes/${fileName}`,
    };
}

/* ======================================================
   🔥 MAIN ROUTE — EXACT MATCH WITH FRONTEND
   POST /api/resume/secure/generate-cv
====================================================== */
/* ======================================================
   ✅ PUBLIC GENERATE ROUTE (NO AUTH, NO TELEGRAM)
   POST /api/resume/generate
   — EXACT MATCH WITH FRONTEND
====================================================== */
router.post("/secure/generate", async (req, res) => {
    try {
        const { template = "modern", ...formData } = req.body;

        if (!formData.name || !formData.email) {
            return res.status(400).json({
                message: "Name and email are required",
            });
        }

        const { publicUrl } = await produceAndSavePdf(formData, template);

        return res.json({
            success: true,
            downloadURL: publicUrl,
        });
    } catch (err) {
        console.error("❌ generate error:", err);
        return res.status(500).json({
            message: "Resume generation failed",
            error: err.message,
        });
    }
});


router.post("/secure/generate-cv", async (req, res) => {
    try {
        /**
         * ⚠️ IMPORTANT:
         * - DO NOT validate Telegram key here
         * - Security is handled in server.js (/api/secure middleware)
         * - This avoids CORS + OPTIONS + 401 bugs
         */

        const { template = "modern", chatId, ...formData } = req.body;

        if (!formData.name || !formData.email) {
            return res.status(400).json({
                message: "Name and email are required",
            });
        }

        // Normalize photo URL
        if (formData.photo && !formData.photo.startsWith("http")) {
            formData.photo = `${process.env.BASE_URL || "http://localhost:5000"
                }${formData.photo}`;
        }

        const { publicUrl } = await produceAndSavePdf(formData, template);

        // Optional Telegram delivery
        if (chatId && publicUrl) {
            try {
                await axios.post(`${TELEGRAM_API}/sendDocument`, {
                    chat_id: chatId,
                    document: publicUrl,
                    caption: `✅ Your ${template} resume is ready`,
                });
            } catch (tgErr) {
                console.warn("Telegram delivery failed:", tgErr.message);
            }
        }

        return res.json({
            success: true,
            downloadURL: publicUrl,
        });
    } catch (err) {
        console.error("❌ generate-cv error:", err);
        return res.status(500).json({
            message: "Resume generation failed",
            error: err.message,
        });
    }
});

/* ======================================================
   HEALTH / TEST
====================================================== */
router.get("/test", (_req, res) => {
    res.json({ ok: true, message: "resumeRoutes working ✅" });
});

/* ======================================================
   BASIC CRUD (OPTIONAL)
====================================================== */
router.post("/", async (req, res) => {
    const resume = new Resume(req.body);
    await resume.save();
    res.status(201).json(resume);
});

router.get("/", async (_req, res) => {
    const items = await Resume.find().sort({ createdAt: -1 });
    res.json(items);
});

router.get("/:id", async (req, res) => {
    const r = await Resume.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Not found" });
    res.json(r);
});

router.put("/:id", async (req, res) => {
    const updated = await Resume.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.json(updated);
});

router.delete("/:id", async (req, res) => {
    await Resume.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

export default router;
