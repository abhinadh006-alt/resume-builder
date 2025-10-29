// middleware/verifyTgLink.js
import crypto from "crypto";

/**
 * Middleware to verify secure Telegram access token.
 * Ensures the link came from your bot and expires daily.
 */
export default function verifyTgLink(req, res, next) {
    try {
        const { chatId, date, access } = req.body;

        // Basic checks
        if (!chatId || !date || !access) {
            console.warn("⚠️ Missing security params:", req.body);
            return res.status(401).json({ message: "Missing access parameters" });
        }

        // Recreate expected HMAC
        const expected = crypto
            .createHmac("sha256", process.env.APP_SECRET)
            .update(`${chatId}|${date}`)
            .digest("hex");

        // Ensure date matches today's
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        if (access !== expected || date !== today) {
            console.warn("🚫 Invalid or expired access:", { chatId, date });
            return res.status(403).json({ message: "Access expired or invalid" });
        }

        // Everything OK → allow next
        next();
    } catch (err) {
        console.error("❌ verifyTgLink error:", err.message);
        res.status(500).json({ message: "Server error validating link" });
    }
}
