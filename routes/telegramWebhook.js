// routes/telegramWebhook.js
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
const BACKEND_URL = process.env.BASE_URL || "https://resume-builder-jv01.onrender.com"; // ✅ your Render backend
const FRONTEND_URL = process.env.FRONTEND_URL || "https://safetycrewindiaresumes.netlify.app";

console.log("🤖 Telegram Webhook Active");
console.log("🌐 FRONTEND_URL:", FRONTEND_URL);

// ✅ Telegram webhook endpoint
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

        if (text === "/start" || text === "/resume") {
            // 1️⃣ Request a daily key from your backend
            // ❌ OLD CODE (WRONG)
            // 1️⃣ Request a daily key from your backend
            let key;
            try {
                const { data } = await axios.get(`${BACKEND_URL}/api/daily-key?chatId=${chatId}`);
                key = data.key;
                console.log("✅ Fetched secure key:", key);
            } catch (err) {
                console.error("❌ Failed to get key:", err.message);
                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: chatId,
                    text: "⚠️ Sorry, I couldn't generate your secure key. Please try again.",
                });
                return res.sendStatus(200);
            }
            // 2️⃣ Create frontend links
            const makeLink = (template) =>
                `${FRONTEND_URL}/?template=${template}&auth=${key}&chatId=${chatId}`;

            // 3️⃣ Build message
            const reply = {
                chat_id: chatId,
                text: "👋 Welcome to *Resume Builder!*\n\nPlease choose your preferred resume style:",
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "💼 Modern (Experienced)", url: makeLink("modern") },
                            { text: "📘 Classic (Fresher)", url: makeLink("classic") },
                            { text: "🧩 Hybrid (Two Column)", url: makeLink("hybrid") },
                        ],
                    ],
                },
            };

            // 4️⃣ Send Telegram message
            console.log("📤 Sending Telegram link buttons...");
            await axios.post(`${TELEGRAM_API}/sendMessage`, reply);
            console.log("✅ Resume builder links sent to user:", chatId);
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("❌ Telegram webhook error:", err.message);
        res.sendStatus(500);
    }
});

export default router;
