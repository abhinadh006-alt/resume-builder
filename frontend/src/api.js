// src/api.js

const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://resume-builder-jv01.onrender.com";

export async function generateResume(payload) {
    const res = await fetch(`${API_BASE}/api/resume/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") || "";

    // Handle server-side errors safely
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Resume generation failed");
    }


    // Expect JSON only
    if (contentType.includes("application/json")) {
        return await res.json();
    }

    throw new Error("Invalid server response");
}
