// src/api.js

const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.hostname === "localhost"
        ? "http://localhost:5000/api"
        : "https://resume-builder-jv01.onrender.com/api");

export async function generateResume(payload) {
    const res = await fetch(`${API_BASE}/resume/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
        let message = "Resume generation failed";
        try {
            const err = await res.json();
            message = err.message || message;
        } catch (_) { }
        throw new Error(message);
    }

    if (contentType.includes("application/json")) {
        return await res.json();
    }

    throw new Error("Invalid server response");
}
