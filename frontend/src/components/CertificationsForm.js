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
                .trim();

        const formatted = {
            name: stripParens(cert.name),
            organization: stripParens(cert.organization),
            issueDate: cert.issueDate
                ? format(cert.issueDate, "MMM yyyy")
                : "",
            credentialId: stripParens(cert.credentialId),
            description: (cert.description || "")
                .toString()
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
                        placeholder="e.g., NEBOSH, IOSH, OSHA"
                        list="certificationOptions"
                        required
                    />
                    <datalist id="certificationOptions">
                        <option value="NEBOSH International General Certificate (IGC)" />
                        <option value="NEBOSH Diploma" />
                        <option value="IOSH Managing Safely" />
                        <option value="IOSH Working Safely" />
                        <option value="OSHA 30-Hour Construction Safety" />
                        <option value="OSHA 30-Hour General Industry" />
                        <option value="OSHA 10-Hour Safety" />
                        <option value="First Aid Certification" />
                        <option value="Fire Fighting Training" />
                        <option value="Confined Space Entry Training" />
                        <option value="Work at Height Training" />
                        <option value="Scaffolding Safety Training" />
                        <option value="H2S Safety Training" />
                    </datalist>
                </div>

                <div className="form-group">
                    <label>Issuing Organization</label>

                    <input
                        name="organization"
                        value={cert.organization}
                        onChange={handleChange}
                        placeholder="e.g., National Examination Board in Occupational Safety and Health"
                        list="organizationOptions"
                    />

                    <datalist id="organizationOptions">
                        <option value="NEBOSH (National Examination Board in Occupational Safety and Health)" />
                        <option value="IOSH (Institution of Occupational Safety and Health)" />
                        <option value="OSHA (Occupational Safety and Health Administration)" />
                        <option value="IADC (International Association of Drilling Contractors)" />
                        <option value="OPITO" />
                        <option value="British Safety Council" />
                        <option value="NSDC (National Skill Development Corporation)" />
                        <option value="NCVT / SCVT" />
                        <option value="State Technical Board" />
                        <option value="Directorate General of Training (DGT)" />
                        <option value="Red Cross Society" />
                        <option value="Fire and Safety Training Institute" />
                    </datalist>
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