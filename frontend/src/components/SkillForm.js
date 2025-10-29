import React, { useState, useEffect } from "react";

export default function SkillForm({ onSave, onCancel, initialData }) {
    const [form, setForm] = useState(
        initialData || {
            skill: "",
            level: "",
        }
    );

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
            <div className="form-group">
                <label>Skill</label>
                <input
                    name="skill"
                    value={form.skill}
                    onChange={handleChange}
                    placeholder="e.g., Python, React, Safety Inspection"
                />
            </div>

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

            <div className="modal-footer">
                <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                <button className="save-btn" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}
