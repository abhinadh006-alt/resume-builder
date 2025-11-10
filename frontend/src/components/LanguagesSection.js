import React from "react";
import { Plus, Trash2, Globe } from "lucide-react";
import "./SectionStyles.css";

export default function LanguagesSection({
    languages = [],
    onAdd = () => { },
    onRemove = () => { },
    onEdit = () => { },
}) {
    return (
        <div className="section-container">
            {/* Header */}
            <div className="section-header">
                <div className="header-left">
                    <h4>🌐 Languages</h4>
                </div>

                <button
                    className="add-btn"
                    onClick={onAdd}
                    aria-label="Add language"
                    title="Add language"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* List */}
            <div className="section-list">
                {languages.length === 0 ? (
                    <p className="placeholder">Add languages you know.</p>
                ) : (
                    languages.map((lang, index) => (
                        <div
                            key={lang.id ?? index}
                            className="section-item"
                            role="button"
                            tabIndex={0}
                            onClick={() => onEdit(index)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") onEdit(index);
                            }}
                        >
                            {/* Title + small proficiency (keeps truncation safe) */}
                            <span
                                className="item-title"
                                title={lang.language || "Unnamed Language"}
                            >
                                {lang.language || "Unnamed Language"}
                            </span>

                            {/* Delete: stop propagation so it won't trigger the card click */}
                            <div
                                className="item-actions"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    className="icon-btn remove-btn"
                                    onClick={() => onRemove(index)}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
