import React from "react";
import { Plus, Trash2, Star } from "lucide-react";
import "./SectionStyles.css";

export default function SkillsSection({ skills = [], onAdd, onRemove, onEdit }) {
    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-left">
                    <Star size={18} color="#4f46e5" />
                    <h4>Skills</h4>
                </div>
                <button className="add-btn" onClick={onAdd}>
                    <Plus size={16} />add
                </button>
            </div>

            <div className="section-list">
                {skills.length === 0 ? (
                    <p className="placeholder">Add your key skills here.</p>
                ) : (
                    skills.map((skill, index) => (
                        <div key={index} className="section-item">
                            <span
                                onClick={() => onEdit(index)}
                                style={{
                                    cursor: "pointer",
                                    color: "#111827",
                                    fontWeight: 500,
                                    flexGrow: 1,
                                }}
                            >
                                {skill.skill || "Unnamed Skill"}
                            </span>
                            <button
                                type="button"
                                className="icon-btn remove-btn"
                                aria-label="Remove education"
                                onClick={() => onRemove(index)}

                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
