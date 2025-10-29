import React from "react";
import { Plus, Trash2, Globe } from "lucide-react";
import "./SectionStyles.css";

export default function LanguagesSection({ languages = [], onAdd, onRemove, onEdit }) {
    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-left">
                    <Globe size={18} color="#4f46e5" />
                    <h4>Languages</h4>
                </div>
                <button className="add-btn" onClick={onAdd}>
                    <Plus size={16} />add
                </button>
            </div>

            <div className="section-list">
                {languages.length === 0 ? (
                    <p className="placeholder">Add languages you know.</p>
                ) : (
                    languages.map((lang, index) => (
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
                                {lang.language || "Unnamed Language"}
                                {lang.proficiency && (
                                    <span style={{ color: "#6b7280", fontSize: "12px", marginLeft: "6px" }}>
                                        ({lang.proficiency})
                                    </span>
                                )}
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
