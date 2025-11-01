const BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    import.meta?.env?.VITE_API_BASE_URL ||
    "https://resume-builder-jv01.onrender.com/api";

// 🧩 Helper — Read Telegram key from storage
async function getAuthKey() {
    const token = localStorage.getItem("RB_AUTH");
    if (!token) {
        console.warn("⚠️ No Telegram authorization key found in localStorage.");
        return null;
    }

    // ✅ Ensure it starts with TG-SECRET-
    const cleanToken = token.replace(/^Bearer\s+/i, "").trim();

    if (!cleanToken.startsWith("TG-SECRET-")) {
        console.error("❌ Invalid token format in storage!");
        return null;
    }

    console.log("🔑 Using auth key:", cleanToken.slice(0, 30) + "...");
    return cleanToken;
}

// 🧾 Generate resume (PDF) — secure route
export async function generateResume(formData) {
    const token = await getAuthKey();
    if (!token) throw new Error("Authorization key missing.");

    const res = await fetch(`${BASE_URL}/secure/generate-cv`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token,  // ✅ Don't add "Bearer" prefix
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
    if (!token) throw new Error("Authorization key missing.");

    const res = await fetch(`${BASE_URL}/secure/ping`, {
        headers: { Authorization: token },  // ✅ Don't add "Bearer" prefix
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