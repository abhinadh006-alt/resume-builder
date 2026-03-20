import React, { useState, useEffect } from "react";
import SuggestionModal from "./SuggestionModal";

const SKILL_SUGGESTIONS = [
    "Risk Assessment",
    "Permit to Work (PTW)",
    "HAZOP",
    "Job Safety Analysis (JSA)",
    "Incident Investigation",
    "Toolbox Talk (TBT)",
    "Fire Safety Management",
    "Confined Space Entry",
    "Work at Height Safety",
    "LOTO (Lockout Tagout)",
    "Safety Audit",
    "ISO 45001",
    "OSHA Standards",
    "Emergency Response Planning",
    "PPE Compliance"
];

export default function SkillForm({ onSave, onCancel, initialData }) {

    const [form, setForm] = useState(
        initialData || {
            skill: "",
            level: "",
        }
    );

    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSave = () => {
        onSave(form);
    };

    return (
        <div className="form-container">

            {/* SKILL INPUT */}
            <div className="form-group">
                <label>Skill</label>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                        name="skill"
                        value={form.skill}
                        onChange={handleChange}
                        placeholder="e.g., Risk Assessment, PTW, HAZOP, Fire Safety"
                        style={{ flex: 1 }}
                    />

                    <button
                        type="button"
                        className="suggest-btn"
                        onClick={() => setShowSuggestions(true)}
                    >
                        💡 Suggestions
                    </button>
                </div>
            </div>

            {/* LEVEL */}
            <div className="form-group">
                <label>Proficiency Level</label>
                <select name="level" value={form.level} onChange={handleChange}>
                    <option value="">Select level...</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                </select>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
                <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                <button className="save-btn" onClick={handleSave}>Save</button>
            </div>

            {/* ✅ SUGGESTION MODAL (FIXED) */}
            {showSuggestions && (
                <SuggestionModal
                    suggestions={SKILL_SUGGESTIONS}
                    onInsert={(selectedSkills) => {
                        setForm({
                            ...form,
                            skill: selectedSkills.join(", ")
                        });
                        setShowSuggestions(false);
                    }}
                    onClose={() => setShowSuggestions(false)}
                />
            )}
        </div>
    );
}