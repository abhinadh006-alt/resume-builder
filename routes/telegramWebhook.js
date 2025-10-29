import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const FRONTEND_URL = process.env.FRONTEND_URL;

console.log("🤖 Telegram Webhook Active");
console.log("🌐 FRONTEND_URL:", FRONTEND_URL);

// safer async wrapper
router.post("/telegram", async (req, res) => {
    try {
        console.log("📥 Incoming Telegram webhook");
        const message = req.body?.message;
        if (!message) {
            console.warn("⚠️ No message object received.");
            return res.sendStatus(200);
        }

        const chatId = message.chat?.id;
        const text = (message.text || "").trim().toLowerCase();
        console.log("🧠 chatId:", chatId, "| text:", text);

        if (text === "/start") {
            const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
            const ACCESS_KEY = `TG-SECRET-${today}`;

            const makeLink = (tmpl) =>
                `${FRONTEND_URL}?template=${tmpl}&auth=${ACCESS_KEY}&chatId=${chatId}`;

            const reply = {
                chat_id: chatId,
                text: "👋 Welcome to Resume Builder!\n\nChoose a resume style:",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Modern (Experienced)", url: makeLink("modern") },
                            { text: "Classic (Fresher)", url: makeLink("classic") },
                            { text: "Hybrid (Two column)", url: makeLink("hybrid") },
                        ],
                    ],
                },
            };

            console.log("📤 Sending Telegram reply...");
            await axios.post(`${TELEGRAM_API}/sendMessage`, reply);
            console.log("✅ Message sent successfully");
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("❌ Telegram webhook error:", err.message);
        res.sendStatus(500);
    }
});

export default router;
