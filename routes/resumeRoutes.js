// routes/resumeRoutes.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

import Resume from "../models/Resume.js";
import { generatePDF } from "../utils/generatePDF.js";
import { isValidDailyKey, logKeyUsage } from "../middleware/verifyTgLink.js";


const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const PUBLIC_PATH = path.join(process.cwd(), "public", "resumes");

// --- sanity check ---
router.get("/test", (_req, res) => {
    console.log("✅ /api/resume/test hit");
    res.json({ success: true, message: "Route working fine!" });
});

/* 1️⃣ CREATE */
router.post("/", async (req, res) => {
    try {
        const resume = new Resume(req.body);
        await resume.save();

        if (process.env.N8N_WEBHOOK_URL) {
            axios
                .post(process.env.N8N_WEBHOOK_URL, {
                    event: "resume_saved",
                    resumeId: resume._id.toString(),
                    name: resume.name,
                    template: resume.template,
                })
                .catch(() => { });
        }

        res.status(201).json(resume);
    } catch (err) {
        console.error("❌ Create error:", err.message);
        res.status(400).json({ message: err.message });
    }
});

/* 2️⃣ GET ALL */
router.get("/", async (_req, res) => {
    try {
        const items = await Resume.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 3️⃣ GET BY ID */
router.get("/:id", async (req, res) => {
    try {
        const r = await Resume.findById(req.params.id);
        if (!r) return res.status(404).json({ message: "Not found" });
        res.json(r);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 4️⃣ UPDATE */
router.put("/:id", async (req, res) => {
    try {
        const updated = await Resume.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Not found" });

        if (process.env.N8N_WEBHOOK_URL) {
            axios
                .post(process.env.N8N_WEBHOOK_URL, {
                    event: "resume_updated",
                    resumeId: updated._id.toString(),
                    name: updated.name,
                    template: updated.template,
                })
                .catch(() => { });
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 5️⃣ DELETE */
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Resume.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 6️⃣ GENERATE PDF (existing method) */
/* 6️⃣ GENERATE PDF (secured with Telegram daily key) */
router.post("/generate", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!isValidDailyKey(authHeader)) {
            console.warn("❌ Invalid or expired TG-SECRET key on /generate.");
            return res.status(401).json({ error: "Unauthorized: Invalid or expired key" });
        }

        logKeyUsage(req, authHeader);

        const { name, email, phone, experience, education, skills, certifications, template = "modern", chatId } = req.body;
        if (!name || !email) return res.status(400).json({ message: "Name and Email required." });

        const data = { name, email, phone, experience, education, skills, certifications };
        const downloadURL = await generatePDF(data, template);

        // Send PDF to Telegram
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


/* 7️⃣ GENERATE PDF FOR SAVED RESUME */
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

/* 🆕 8️⃣ SECURE RESUME GENERATION — In-memory queue with limited concurrency */
const jobQueue = [];
const MAX_CONCURRENT_JOBS = 3;
let activeJobs = 0;

async function processQueue() {
    if (activeJobs >= MAX_CONCURRENT_JOBS || jobQueue.length === 0) return;

    const job = jobQueue.shift();
    activeJobs++;

    console.log(`⚙️ Processing job for chatId ${job.chatId} (${job.template})`);
    try {
        const { name, template, chatId, rest } = job;
        const pdfFileName = `${name || "resume"}-${Date.now()}.pdf`;
        const pdfPath = path.join(PUBLIC_PATH, pdfFileName);

        // Ensure directory exists
        if (!fs.existsSync(PUBLIC_PATH)) fs.mkdirSync(PUBLIC_PATH, { recursive: true });

        console.log("🧾 Fetching PDF from Cloudflare Worker...");
        const workerRes = await fetch(
            "https://resume-builder-worker.safetycrewindiaresumebuilder.workers.dev/api/secure/generate-cv",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: job.authHeader,
                },
                body: JSON.stringify({ name, template, chatId, ...rest }),
            }
        );

        if (!workerRes.ok) {
            const errText = await workerRes.text();
            console.error("❌ Worker error:", errText);
            throw new Error("Worker PDF generation failed");
        }

        // Save file
        const arrayBuffer = await workerRes.arrayBuffer();
        fs.writeFileSync(pdfPath, Buffer.from(arrayBuffer));
        console.log(`✅ PDF saved: ${pdfFileName}`);

        // Send to Telegram
        if (chatId) {
            try {
                const formData = new FormData();
                formData.append("chat_id", chatId);
                formData.append("document", fs.createReadStream(pdfPath));
                formData.append(
                    "caption",
                    `✅ Your ${template} resume is ready, ${name || "Candidate"}!`
                );

                await axios.post(`${TELEGRAM_API}/sendDocument`, formData, {
                    headers: formData.getHeaders(),
                });

                console.log(`📤 Sent PDF to Telegram chatId ${chatId}`);
            } catch (tgErr) {
                console.error("❌ Telegram sendDocument failed:", tgErr.message);
            }
        }
    } catch (err) {
        console.error("❌ Queue job failed:", err.message);
    } finally {
        activeJobs--;
        setTimeout(processQueue, 300); // check for next job shortly
    }
}

router.post("/secure/generate-cv", async (req, res) => {
    try {
        const { name, template = "modern", chatId, ...rest } = req.body;
        const authHeader = req.headers.authorization;
        if (!chatId) return res.status(400).json({ error: "Missing chatId" });

        jobQueue.push({ name, template, chatId, rest, authHeader });
        console.log(`📥 Queued job for chatId ${chatId} (${template})`);

        // Start processing loop
        for (let i = activeJobs; i < MAX_CONCURRENT_JOBS; i++) {
            processQueue();
        }

        res.json({
            ok: true,
            message:
                "✅ Your resume request is queued. You'll receive it via Telegram shortly.",
        });
    } catch (err) {
        console.error("❌ /secure/generate-cv error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

/* 🧠 9️⃣ Queue Status — Monitor running & pending jobs */
router.get("/queue-status", async (_req, res) => {
    try {
        res.json({
            ok: true,
            activeJobs,
            queuedJobs: jobQueue.length,
            maxConcurrent: MAX_CONCURRENT_JOBS,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("❌ Queue status error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


export default router;
