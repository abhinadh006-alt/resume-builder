import React from "react";
import { Plus, Trash2, Briefcase } from "lucide-react";
import "./SectionStyles.css";

export default function ExperienceSection({
    experience = [],
    onAdd = () => { },
    onRemove = () => { },
    onEdit = () => { },
}) {
    return (
        <div className="section-container">
            {/* Header */}
            <div className="section-header">
                <div className="header-left">
                    <h4>💼 Experience</h4>
                </div>

                <button className="add-btn" onClick={onAdd} aria-label="Add experience">
                    <Plus size={16} />
                </button>
            </div>

            {/* List */}
            <div className="section-list">
                {experience.length === 0 ? (
                    <p className="placeholder">Add your experience details here.</p>
                ) : (
                    experience.map((exp, index) => (
                        <div
                            key={exp.id ?? index}
                            className="section-item"
                            onClick={() => onEdit(index)} // whole card clickable
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") onEdit(index);
                            }}
                        >
                            {/* Title (use class so CSS truncation works) */}
                            <span className="item-title">
                                {exp.title || "Untitled Role"}
                            </span>

                            {/* Delete only — stop event from bubbling to parent card */}
                            <div
                                className="item-actions"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
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
