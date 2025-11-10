import React from "react";
import { Plus, Trash2, Star } from "lucide-react";
import "./SectionStyles.css";

export default function SkillsSection({
    skills = [],
    onAdd = () => { },
    onRemove = () => { },
    onEdit = () => { },
}) {
    return (
        <div className="section-container">
            {/* Header */}
            <div className="section-header">
                <div className="header-left">
                    <h4>⭐ Skills</h4>
                </div>

                <button
                    className="add-btn"
                    onClick={onAdd}
                    aria-label="Add skill"
                    title="Add skill"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* List */}
            <div className="section-list">
                {skills.length === 0 ? (
                    <p className="placeholder">Add your key skills here.</p>
                ) : (
                    skills.map((skill, index) => (
                        <div
                            key={skill.id ?? index}
                            className="section-item"
                            role="button"
                            tabIndex={0}
                            onClick={() => onEdit(index)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") onEdit(index);
                            }}
                        >
                            {/* Title (truncation-friendly) */}
                            <span
                                className="item-title"
                                title={skill.skill || "Unnamed Skill"}
                            >
                                {skill.skill || "Unnamed Skill"}
                            </span>

                            {/* Delete: stop propagation to avoid triggering edit */}
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
