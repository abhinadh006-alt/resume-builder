import React from "react";
import { Plus, Award, Trash2 } from "lucide-react";
import "./SectionStyles.css";

export default function CertificationsSection({ certifications, onAdd, onEdit, onRemove }) {
    return (
        <div className="section-container">
            {/* === HEADER === */}
            <div className="section-header">
                <div className="header-left">
                    <h4>🏅 Certifications</h4>
                </div>
                <button className="add-btn" onClick={onAdd}>
                    <Plus size={16} />
                </button>
            </div>

            {/* === LIST === */}
            <div className="section-list">
                {certifications.length === 0 ? (
                    <p className="placeholder">Add your certifications here.</p>
                ) : (
                    certifications.map((cert, index) => (
                        <div
                            key={index}
                            className="section-item"
                            onClick={() => onEdit(index)} // ✅ whole card clickable
                            style={{
                                cursor: "pointer",
                                flexGrow: 1,
                                color: "#111827",
                                fontWeight: 500,
                            }}
                        >
                            <span className="item-title cert-title">
                                {cert.name || "Untitled Certification"}
                            </span>

                            {/* Only delete icon visible */}
                            <div
                                className="item-actions"
                                onClick={(e) => e.stopPropagation()} // prevent edit on delete click
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
