// ✅ HARD LOCK — NO FALLBACK
const API_BASE = "https://resume-builder-jv01.onrender.com";

export async function generateResume(payload) {
    const res = await fetch(
        `${API_BASE}/api/resume/generate`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    if (contentType.includes("application/json")) {
        return await res.json();
    }

    // fallback (debug)
    return { text: await res.text() };
}
