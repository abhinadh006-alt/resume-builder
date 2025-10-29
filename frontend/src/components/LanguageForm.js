import React, { useState, useEffect } from "react";

export default function LanguageForm({ onSave, onCancel, initialData }) {

    const [form, setForm] = useState(
        initialData || {
            language: "",
            proficiency: "",
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
                <label>Language</label>
                <input
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    placeholder="e.g., English, Hindi, Italian"
                />
            </div>

            <div className="form-group">
                <label>Proficiency</label>
                <select
                    name="proficiency"
                    value={form.proficiency}
                    onChange={handleChange}
                >
                    <option value="">Select proficiency...</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Native">Native</option>
                </select>
            </div>

            <div className="modal-footer">
                <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                <button className="save-btn" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}
