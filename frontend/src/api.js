const BASE_URL = "http://localhost:5000/api";

// 🧩 Helper — Detect local environment
const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

// 🧩 Helper — Read Telegram key from storage
async function getAuthKey() {
    if (isLocalhost) {
        // ✅ Localhost: bypass Telegram key
        console.log("🧩 Localhost detected — skipping Telegram key requirement");
        return "LOCAL-DEV-MODE";
    }

    const token = localStorage.getItem("RB_AUTH");
    if (!token) {
        console.warn("⚠️ No Telegram authorization key found in localStorage.");
        return null;
    }

    const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
    if (!cleanToken.startsWith("TG-SECRET-")) {
        console.error("❌ Invalid token format in storage!");
        return null;
    }

    console.log("🔑 Using auth key:", cleanToken.slice(0, 30) + "...");
    return cleanToken;
}

// 🧾 Generate resume (PDF)
export async function generateResume(formData) {
    const token = await getAuthKey();

    const res = await fetch(`${BASE_URL}/secure/generate-cv`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: token } : {}), // ✅ Only send if exists
        },
        body: JSON.stringify(formData),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("❌ Server responded with error:", text);
        throw new Error(`Server error (${res.status})`);
    }

    const data = await res.json();
    return data;
}

// 🔒 Test secure API route
export async function testSecure() {
    const token = await getAuthKey();

    const res = await fetch(`${BASE_URL}/secure/ping`, {
        headers: token ? { Authorization: token } : {},
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text}`);
    }

    const data = await res.json();
    return data;
}

export const api = {
    generateResume,
    testSecure,
};
