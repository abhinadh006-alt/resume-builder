import express from "express";
import DailyKey from "../models/DailyKey.js";

const router = express.Router();

router.get("/daily-key", async (req, res) => {
    try {
        const chatId = req.query.chatId;
        if (!chatId) return res.status(400).json({ error: "Missing chatId" });

        // Format: TG-SECRET-YYYYMMDD-<chatId>
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const key = `TG-SECRET-${yyyy}${mm}${dd}-${chatId}`;

        // find existing (still valid) key
        let existing = await DailyKey.findOne({ chatId, key });
        if (!existing) {
            existing = await DailyKey.create({ chatId, key });
            console.log("🆕 Created new daily key for", chatId);
        } else {
            console.log("♻️ Using existing daily key for", chatId);
        }

        res.json({ key });
    } catch (err) {
        console.error("❌ daily-key error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
