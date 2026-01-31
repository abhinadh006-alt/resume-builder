// src/api.js

const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://resume-builder-jv01.onrender.com";

/**
 * Generate resume PDF (returns Blob)
 */
export async function generateResumePDF(payload) {
    const res = await fetch(`${API_BASE}/api/generate-pdf`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    // Hard failure (network / server crash)
    if (!res.ok) {
        let message = "PDF generation failed";

        try {
            const text = await res.text();
            message = text || message;
        } catch (_) { }

        throw new Error(message);
    }

    // MUST be PDF
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/pdf")) {
        const text = await res.text();
        throw new Error("Invalid PDF response: " + text);
    }

    return await res.blob(); // ✅ PDF blob
}
