import React from "react";

export default function TemplateSelector({ template, setTemplate }) {
    const templates = [
        { id: "modern", name: "Modern (Experienced)" },
        { id: "classic", name: "Classic (Fresher)" },
        { id: "hybrid", name: "Hybrid (Two-column)" },
    ];

    return (
        <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "600" }}>Choose Template:</label>
            <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    marginTop: "5px",
                }}
            >
                {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
