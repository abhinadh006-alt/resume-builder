import React from "react";
import { Plus, Trash2, Briefcase } from "lucide-react";
import "./SectionStyles.css";

export default function ExperienceSection({ experience = [], onAdd, onRemove, onEdit }) {
    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-left">
                    <Briefcase size={18} color="#4f46e5" />
                    <h4>Experience</h4>
                </div>
                <button className="add-btn" onClick={onAdd}>
                    <Plus size={16} /> add
                </button>
            </div>

            <div className="section-list">
                {experience.length === 0 ? (
                    <p className="placeholder">Add your experience details here.</p>
                ) : (
                    experience.map((exp, index) => (
                        <div key={index} className="section-item">
                            <span
                                onClick={() => onEdit(index)}
                                style={{
                                    cursor: "pointer",
                                    flexGrow: 1,
                                    color: "#111827",
                                    fontWeight: 500,
                                }}
                            >
                                {exp.title || "Untitled Role"}
                            </span>
                            <button
                                type="button"
                                className="icon-btn remove-btn"
                                aria-label="Remove experience"
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
