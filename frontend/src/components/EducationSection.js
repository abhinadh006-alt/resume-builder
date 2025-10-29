import React from "react";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import "./SectionStyles.css";

export default function EducationSection({
    education = [],
    onAdd,
    onRemove,
    onEdit, // ⬅️ NEW
}) {
    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-left">
                    <GraduationCap size={18} color="#4f46e5" />
                    <h4>Education</h4>
                </div>
                <button className="add-btn" onClick={onAdd}>
                    <Plus size={16} />
                    add
                </button>
            </div>

            <div className="section-list">
                {education.length === 0 ? (
                    <p className="placeholder">Add your education details here.</p>
                ) : (
                    education.map((edu, index) => (
                        <div
                            key={index}
                            className="section-item"
                        >
                            <span
                                onClick={() => onEdit(index)}
                                style={{
                                    cursor: "pointer",
                                    flexGrow: 1,
                                    color: "#111827",
                                    fontWeight: 500,
                                }}
                            >
                                {edu.degree || "Untitled Degree"}

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
