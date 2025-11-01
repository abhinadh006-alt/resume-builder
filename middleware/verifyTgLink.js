// middleware/verifyTgLink.js
import fs from "fs";
import path from "path";

// middleware/verifyTgLink.js
export function isValidDailyKey(authHeader) {
    if (!authHeader) return false;

    // Remove "Bearer " prefix if present
    let token = authHeader.replace(/^Bearer\s+/i, "").trim();

    // Must start with TG-SECRET-
    if (!token.startsWith("TG-SECRET-")) return false;

    // Extract the part after TG-SECRET-
    token = token.replace("TG-SECRET-", "");

    // Split by hyphen: [datePart, chatId]
    const parts = token.split("-");
    if (parts.length < 2) return false;

    const datePart = parts[0];
    const chatId = parts[1];

    // Validate chatId is numeric
    if (!/^\d+$/.test(chatId)) return false;

    // Build expected date (YYYYMMDD)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const expectedDate = `${yyyy}${mm}${dd}`;

    console.log("🔍 Validating key:");
    console.log("   Received datePart:", datePart);
    console.log("   Expected date:", expectedDate);
    console.log("   ChatId:", chatId);

    return datePart === expectedDate;
}

export function logKeyUsage(req, authHeader) {
    try {
        const logDir = path.join(process.cwd(), "logs");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

        const logFile = path.join(logDir, "key-usage.log");
        const entry = {
            time: new Date().toISOString(),
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
            keyPrefix: authHeader ? authHeader.slice(0, 30) + "..." : "(none)",
            route: req.originalUrl,
            method: req.method,
        };

        fs.appendFileSync(logFile, JSON.stringify(entry) + "\n");
        console.log("🪵 Logged secure key usage:", entry);
    } catch (err) {
        console.error("⚠️ Failed to log key usage:", err.message);
    }
}
