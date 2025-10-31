// ✅ api.js — Centralized API helpers for Resume Builder
// Works for both local dev and Render/Netlify deployment

// ✅ Base URL setup (supports both CRA and Vite)
const BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    import.meta?.env?.VITE_API_BASE_URL ||
    "https://resume-builder-jv01.onrender.com/api";

// 🧩 Helper — Fetch secure daily key if not stored
async function getAuthKey() {
    let token = localStorage.getItem("RB_AUTH");
    if (!token) {
        try {
            const res = await fetch(`${BASE_URL}/daily-key`);
            const data = await res.json();
            if (data.key) {
                localStorage.setItem("RB_AUTH", data.key);
                token = data.key;
                console.log("✅ Fetched new daily key:", token);
            }
        } catch (err) {
            console.error("❌ Could not fetch daily key:", err);
        }
    }
    return token;
}

// 🧾 Generate resume (PDF) — secure route
export async function generateResume(formData) {
    const token = await getAuthKey();
    if (!token) throw new Error("Authorization key missing.");

    const res = await fetch(`${BASE_URL}/secure/generate-cv`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("❌ Server responded with error:", text);
        throw new Error(`Server error (${res.status})`);
    }

    // Expect JSON response: { success: true, file: "/resumes/filename.pdf" }
    const data = await res.json();
    return data;
}

// 🔒 Test secure API route
export async function testSecure() {
    const token = await getAuthKey();
    if (!token) throw new Error("Authorization key missing.");

    const res = await fetch(`${BASE_URL}/secure/ping`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text}`);
    }

    const data = await res.json();
    return data;
}

// ✅ Optional: export as a grouped object if you prefer `api.testSecure()`
export const api = {
    generateResume,
    testSecure,
};
