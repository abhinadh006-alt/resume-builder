import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";

import { isValidDailyKey, logKeyUsage } from "../middleware/verifyTgLink.js";

const router = express.Router();

const PUBLIC_PATH = path.join(process.cwd(), "public", "resumes");

async function loadPdfUtils() {
    const mod = await import("../utils/generatePDF.cjs");
    return mod.default || mod;
}

router.post("/generate-cv", async (req, res) => {
    try {
        const auth = req.headers.authorization;

        if (!isValidDailyKey(auth)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        logKeyUsage(req, auth);

        const { template = "modern", ...formData } = req.body;

        const pdfUtils = await loadPdfUtils();
        const buffer = await pdfUtils.renderPdfBuffer({
            formData,
            template,
            placeholders: {},
        });

        if (!fs.existsSync(PUBLIC_PATH)) {
            fs.mkdirSync(PUBLIC_PATH, { recursive: true });
        }

        const fileName = `${Date.now()}-${formData.name || "resume"}.pdf`;
        const filePath = path.join(PUBLIC_PATH, fileName);
        fs.writeFileSync(filePath, buffer);

        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        res.json({
            success: true,
            downloadURL: `${baseUrl}/resumes/${fileName}`,
        });
    } catch (err) {
        console.error("generate-cv error:", err);
        res.status(500).json({ message: err.message });
    }
});

export default router;
