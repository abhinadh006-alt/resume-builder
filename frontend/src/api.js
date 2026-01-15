const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://resume-builder-jv01.onrender.com";

export async function generateResume(payload) {
    const res = await fetch(
        `${API_BASE}/api/resume/secure/generate-cv`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 🔓 no Authorization needed now
            },
            body: JSON.stringify(payload),
        }
    );

    const contentType = res.headers.get("content-type");

    // Handle server errors safely
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Resume generation failed");
    }

    // PDF response
    if (contentType && contentType.includes("application/pdf")) {
        const blob = await res.blob();
        return { fileBlob: blob };
    }

    // JSON response
    return await res.json();
}
