// routes/resumeRoutes.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";

import Resume from "../models/Resume.js";
import { generatePDF } from "../utils/generatePDF.js";
import verifyTgLink from "../middleware/verifyTgLink.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// --- sanity check first ---
router.get("/test", (_req, res) => {
    console.log("✅ /api/resume/test hit");
    res.json({ success: true, message: "Route working fine!" });
});

/* 1) CREATE */
router.post("/", async (req, res) => {
    try {
        const resume = new Resume(req.body);
        await resume.save();

        if (process.env.N8N_WEBHOOK_URL) {
            axios.post(process.env.N8N_WEBHOOK_URL, {
                event: "resume_saved",
                resumeId: resume._id.toString(),
                name: resume.name,
                template: resume.template,
            }).catch(() => { });
        }

        res.status(201).json(resume);
    } catch (err) {
        console.error("❌ Create error:", err.message);
        res.status(400).json({ message: err.message });
    }
});

/* 2) GET ALL (handy for testing) */
router.get("/", async (_req, res) => {
    try {
        const items = await Resume.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 3) GET BY ID */
router.get("/:id", async (req, res) => {
    try {
        const r = await Resume.findById(req.params.id);
        if (!r) return res.status(404).json({ message: "Not found" });
        res.json(r);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 4) UPDATE */
router.put("/:id", async (req, res) => {
    try {
        const updated = await Resume.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Not found" });

        if (process.env.N8N_WEBHOOK_URL) {
            axios.post(process.env.N8N_WEBHOOK_URL, {
                event: "resume_updated",
                resumeId: updated._id.toString(),
                name: updated.name,
                template: updated.template,
            }).catch(() => { });
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 5) DELETE */
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Resume.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 6) GENERATE PDF (via Telegram / web) */
router.post("/generate", verifyTgLink, async (req, res) => {

    try {
        const { name, email, phone, experience, education, skills, certifications, template = "modern", chatId, auth } = req.body;
        if (!name || !email) return res.status(400).json({ message: "Name and Email required." });

        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
        const expectedKey = `TG-SECRET-${today}`;
        if (auth && auth !== expectedKey) return res.status(403).json({ message: "Access denied: invalid auth key." });

        const data = { name, email, phone, experience, education, skills, certifications };
        const downloadURL = await generatePDF(data, template);

        if (chatId) {
            const fileAbsolute = `${process.env.BASE_URL || "http://localhost:5000"}${downloadURL}`;
            try {
                await axios.post(`${TELEGRAM_API}/sendDocument`, {
                    chat_id: chatId,
                    document: fileAbsolute,
                    caption: `Here is your resume (${template})`,
                });
            } catch (e) {
                console.warn("⚠️ Telegram sendDocument failed:", e?.response?.data || e.message);
            }
        }

        res.json({ success: true, downloadURL });
    } catch (err) {
        console.error("❌ /generate error:", err.message);
        res.status(500).json({ message: err.message });
    }
});

/* 7) GENERATE PDF FOR SAVED RESUME */
router.get("/pdf/:id", async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) return res.status(404).send("Resume not found");

        const downloadURL = await generatePDF(resume.toObject(), resume.template || "modern");
        res.json({ success: true, url: downloadURL });
    } catch (err) {
        console.error("PDF error:", err.message);
        res.status(500).json({ message: err.message });
    }
});

export default router;
