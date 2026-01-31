// src/api.js

const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://resume-builder-jv01.onrender.com";

/**
 * Generate resume PDF (returns Blob)
 * payload = { url, printData }
 */
export async function generateResumePDF(payload) {
    let res;

    try {
        res = await fetch(`${API_BASE}/api/generate-pdf`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
    } catch (networkError) {
        // 🔴 Network / CORS / backend-down errors
        throw new Error("Unable to reach PDF server. Please try again.");
    }

    // ❌ Server returned error status
    if (!res.ok) {
        let message = "PDF generation failed";

        try {
            const contentType = res.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {
                const json = await res.json();
                message = json?.details || json?.error || message;
            } else {
                const text = await res.text();
                if (text) message = text;
            }
        } catch (_) { }

        throw new Error(message);
    }

    // ✅ MUST be a PDF
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/pdf")) {
        const text = await res.text();
        throw new Error("Invalid PDF response from server: " + text);
    }

    // ✅ SUCCESS
    return await res.blob();
}
