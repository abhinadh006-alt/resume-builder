// verifyTgLink.js
import fs from "fs";
import path from "path";

// ✅ Define and export isValidDailyKey
export function isValidDailyKey(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer TG-SECRET-")) return false;

    const token = authHeader.replace("Bearer TG-SECRET-", "").trim();
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const expectedBase = `${mm}06${yyyy}D11D`.replace(/[^\d]/g, "");

    return token.startsWith(expectedBase);
}

// ✅ Define and export logKeyUsage
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
