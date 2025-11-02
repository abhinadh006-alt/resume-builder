import React, { useState, useEffect } from "react";
import MonthYearPicker from "./MonthYearPicker";
import { format } from "date-fns";
import "./CertificationsForm.css";

export default function CertificationsForm({ onSave, onCancel, initialData }) {
    const [cert, setCert] = useState({
        name: "",
        organization: "",
        issueDate: null,
        credentialId: "",
        description: "",
    });

    // ✅ use bullet hook
    const { handleKeyDown, handleFocus } = useBulletTextarea();

    useEffect(() => {
        if (initialData) {
            setCert({
                ...initialData,
                issueDate: initialData.issueDate ? new Date(initialData.issueDate) : null,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCert({ ...cert, [name]: value });
    };

    const handleDateChange = (date) => {
        setCert((prev) => ({ ...prev, issueDate: date }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formatted = {
            ...cert,
            issueDate: cert.issueDate ? format(cert.issueDate, "MMM yyyy") : "",
        };

        onSave(formatted);

        setCert({
            name: "",
            organization: "",
            issueDate: null,
            credentialId: "",
            description: "",
        });
    };

    return (
        <form className="experience-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Certification Name</label>
                <input
                    name="name"
                    value={cert.name}
                    onChange={handleChange}
                    placeholder="e.g., NEBOSH International General Certificate"
                    required
                />
            </div>

            <div className="form-group">
                <label>Issuing Organization</label>
                <input
                    name="organization"
                    value={cert.organization}
                    onChange={handleChange}
                    placeholder="e.g., National Examination Board in Occupational Safety and Health"
                />
            </div>

            <div className="form-group">
                <label>Issued Date</label>
                <MonthYearPicker value={cert.issueDate} onChange={handleDateChange} />
            </div>

            <div className="form-group">
                <label>Credential ID / URL (optional)</label>
                <input
                    name="credentialId"
                    value={cert.credentialId}
                    onChange={handleChange}
                    placeholder="e.g., Certificate ID or verification link"
                />
            </div>

            <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                    name="description"
                    value={cert.description}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    rows="5"
                    placeholder="Add notes like validity, specialization, or key topics..."
                    style={{
                        whiteSpace: "pre-wrap",
                        fontFamily: "Arial, sans-serif",
                        lineHeight: "1.6",
                    }}
                />

            </div>

            <div className="form-buttons">
                <button type="button" className="cancel-btn" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="submit-btn">
                    Save
                </button>
            </div>
        </form>
    );
}
