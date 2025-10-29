// routes/pendingRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import PendingResume from "../models/PendingResume.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ensure uploads dir exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safe = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, safe);
    }
});
const upload = multer({ storage });

// Create pending record (used by bot/n8n)
router.post("/", async (req, res) => {
    try {
        const { chatId, template = "experienced", data = {} } = req.body;
        const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
        const pending = new PendingResume({ chatId, template, data, expiresAt });
        await pending.save();
        res.json({ success: true, id: pending._id });
    } catch (err) {
        console.error("create pending error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Fetch pending record
router.get("/:id", async (req, res) => {
    try {
        const pending = await PendingResume.findById(req.params.id);
        if (!pending) return res.status(404).json({ success: false, error: "Not found" });
        res.json({ success: true, pending });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Upload resume file (from frontend)
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("No file uploaded");
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, fileUrl, filename: req.file.filename });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
