// src/api.js

const BASE_URL =
    process.env.REACT_APP_API_URL ||
    "https://resume-builder-jv01.onrender.com/api";

/**
 * Generate resume (PDF)
 * No auth, no Telegram, no secure routes
 */
export async function generateResume(formData) {
    const res = await fetch(`${BASE_URL}/resume/generate-cv`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text}`);
    }

    return await res.json();
}

export default {
    generateResume,
};
