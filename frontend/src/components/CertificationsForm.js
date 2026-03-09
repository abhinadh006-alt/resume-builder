import React, { useState, useEffect } from "react";
import MonthYearPicker from "./MonthYearPicker";
import { format } from "date-fns";
import "./CertificationsForm.css";
import useBulletTextarea from "../hooks/useBulletTextarea";
import SuggestionModal from "./SuggestionModal";
import { certificationSuggestions } from "../data/suggestions";

export default function CertificationsForm({ onSave, onCancel, initialData }) {

    const [cert, setCert] = useState({
        name: "",
        organization: "",
        issueDate: null,
        credentialId: "",
        description: "",
    });

    const { handleKeyDown, handleFocus } = useBulletTextarea();

    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (initialData) {
            setCert({
                ...initialData,
                issueDate: initialData.issueDate
                    ? new Date(initialData.issueDate)
                    : null,
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

    const insertSuggestions = (selected) => {
        setCert(prev => ({
            ...prev,
            description: selected.map(text => "• " + text).join("\n")
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const stripParens = (s) =>
            (s || "")
                .toString()
                .trim()
                .replace(/^[\s()]+|[\s()]+$/g, "")
                .replace(/\)+$/, "");

        const formatted = {
            name: stripParens(cert.name),
            organization: stripParens(cert.organization),
            issueDate: cert.issueDate
                ? format(cert.issueDate, "MMM yyyy")
                : "",
            credentialId: stripParens(cert.credentialId),
            description: (cert.description || "")
                .toString()
                .replace(/\)+$/, "")
                .trim(),
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
        <>
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
                    <MonthYearPicker
                        value={cert.issueDate}
                        onChange={handleDateChange}
                    />
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

                {/* DESCRIPTION WITH SUGGESTIONS */}

                <div className="form-group">

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label>Description (optional)</label>

                        <button
                            type="button"
                            className="suggest-btn"
                            onClick={() => setShowSuggestions(true)}
                        >
                            💡 Suggestions
                        </button>
                    </div>

                    <textarea
                        name="description"
                        value={cert.description}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onKeyDown={handleKeyDown}
                        rows="5"
                        placeholder="• Add notes like validity, specialization, or key topics..."
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

            {showSuggestions && (
                <SuggestionModal
                    suggestions={certificationSuggestions}
                    onInsert={insertSuggestions}
                    onClose={() => setShowSuggestions(false)}
                />
            )}

        </>
    );
}