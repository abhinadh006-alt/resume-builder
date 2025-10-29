import React from "react";
import "./TemplateSelector.css";

export default function TemplateSelector({ selectedTemplate, onSelect }) {
    const templates = [
        { id: "modern", label: "💼 Modern (Experienced)" },
        { id: "classic", label: "📘 Classic (Fresher)" },
        { id: "hybrid", label: "🧩 Hybrid (Two Column)" },
    ];

    return (
        <div className="template-selector">
            <h3>Select Resume Style</h3>
            <div className="template-buttons">
                {templates.map((tpl) => (
                    <button
                        key={tpl.id}
                        className={`template-btn ${selectedTemplate === tpl.id ? "active" : ""}`}
                        onClick={() => onSelect(tpl.id)}
                    >
                        {tpl.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
