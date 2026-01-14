// src/api.js

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

async function getAuthKey() {
    if (isLocalhost) {
        console.log("🧩 Localhost detected — skipping Telegram key");
        return "LOCAL-DEV";
    }

    const token = localStorage.getItem("RB_AUTH");
    return token || null;
}

export async function generateResume(formData) {
    const token = await getAuthKey();

    // 🔥🔥🔥 THIS IS THE FIX 🔥🔥🔥
    const url = `${BASE_URL}/resume/secure/generate-cv`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify(formData),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text}`);
    }

    return await res.json();
}

export default { generateResume };
