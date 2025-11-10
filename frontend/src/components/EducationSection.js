import React from "react";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import "./SectionStyles.css";

export default function EducationSection({
    education = [],
    onAdd = () => { },
    onRemove = () => { },
    onEdit = () => { },
}) {
    return (
        <div className="section-container">
            {/* Header */}
            <div className="section-header">
                <div className="header-left">
                    <h4>🎓 Education</h4>
                </div>

                <button
                    className="add-btn"
                    onClick={onAdd}
                    aria-label="Add education"
                    title="Add education"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* List */}
            <div className="section-list">
                {education.length === 0 ? (
                    <p className="placeholder">Add your education details here.</p>
                ) : (
                    education.map((edu, index) => (
                        <div
                            key={edu.id ?? index}
                            className="section-item"
                            role="button"
                            tabIndex={0}
                            onClick={() => onEdit(index)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") onEdit(index);
                            }}
                        >
                            {/* Title: uses CSS class for truncation */}
                            <span
                                className="item-title"
                                title={edu.degree || "Untitled Degree"}
                            >
                                {edu.degree || "Untitled Degree"}
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
