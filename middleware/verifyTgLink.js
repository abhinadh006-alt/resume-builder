import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * ✅ Default export — middleware for Telegram verification
 */
export default function verifyTgLink(req, res, next) {
    try {
        const { chatId, date, access } = req.body;
        if (!chatId || !date || !access) {
            console.warn("⚠️ Missing security params:", req.body);
            return res.status(401).json({ message: "Missing access parameters" });
        }

        const expected = crypto
            .createHmac("sha256", process.env.APP_SECRET)
            .update(`${chatId}|${date}`)
            .digest("hex");

        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        if (access !== expected || date !== today) {
            console.warn("🚫 Invalid or expired access:", { chatId, date });
            return res.status(403).json({ message: "Access expired or invalid" });
        }

        next();
    } catch (err) {
        console.error("❌ verifyTgLink error:", err.message);
        res.status(500).json({ message: "Server error validating link" });
    }
}

/**
 * ✅ Named exports for secure routes
 */
export function isValidDailyKey(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer TG-SECRET-")) return false;

    const token = authHeader.replace("Bearer TG-SECRET-", "").trim();
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const expectedBase = `${mm}06${yyyy}D11D`.replace(/[^\d]/g, "");

    return token.startsWith(expectedBase);
}

export function logKeyUsage(req, authHeader) {
    try {
        const logDir = path.join(process.cwd(), "logs");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

        const logFile = path.join(logDir, "key-usage.log");
        const entry = {
            time: new Date().toISOString(),
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
            keyPrefix: authHeader ? authHeader.slice(0, 20) + "..." : "(none)",
            route: req.originalUrl || req.url,
            method: req.method,
        };

        fs.appendFileSync(logFile, JSON.stringify(entry) + "\n");
        console.log("🪵 Logged secure key usage:", entry);
    } catch (err) {
        console.error("⚠️ Failed to log key usage:", err.message);
    }
}
