export async function generateResume(payload) {
    const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/resume/generate`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Generate failed");
    }

    return res.json();
}
