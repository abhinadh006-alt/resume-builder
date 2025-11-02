import React from "react";
import "./ResumePreview.css";
import api from "../api"; // ✅ make sure this path is correct

export default function ResumePreview({ formData, template }) {
    // 🌟 Helper function: shows placeholder text if field empty
    const showText = (value, placeholder) => {
        return value && value.trim() !== "" ? (
            <span className="filled-text">{value}</span>
        ) : (
            <span className="placeholder-text">{placeholder}</span>
        );
    };

    // 🧩 NEW: Function to handle PDF generation
    const handleGeneratePDF = async () => {
        try {
            // Call backend API and get binary PDF data
            const response = await api.generateResume(formData);

            // Convert PDF binary to blob and create a URL
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            // Trigger download
            const a = document.createElement("a");
            a.href = url;
            a.download = "resume.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();

            // Optional: revoke URL to free memory
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error("Error generating resume:", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    return (
        <div className={`resume-preview ${template}`}>
            {/* ===== HEADER ===== */}
            <header className="resume-header">
                <h1>{showText(formData.name, "Your Full Name")}</h1>
                <h2>{showText(formData.title, "Your Professional Title")}</h2>

                <div className="contact-info">
                    {showText(formData.email, "Email@example.com")} &nbsp;|&nbsp;
                    {showText(formData.phone, "+91 9876543210")} &nbsp;|&nbsp;
                    {showText(formData.location, "City, Country")}
                </div>
            </header>

            {/* ===== SUMMARY ===== */}
            <section className="resume-section">
                <h2>SUMMARY</h2>
                <p>
                    {showText(
                        formData.summary,
                        "Write a short professional summary highlighting your experience and strengths..."
                    )}
                </p>
            </section>

            {/* ===== EXPERIENCE ===== */}
            <section className="resume-section">
                <h2>EXPERIENCE</h2>
                {formData.experience.length > 0 ? (
                    formData.experience.map((exp, i) => (
                        <div key={i} className="resume-item">
                            <strong>{showText(exp.title, "Job Role")}</strong> —{" "}
                            {showText(exp.company, "Company Name")}

                            {/* ✅ Fix multiline bullets */}
                            <p
                                style={{
                                    whiteSpace: "pre-line",
                                    marginTop: "4px",
                                    lineHeight: "1.5",
                                }}
                            >
                                {exp.description && exp.description.trim() !== ""
                                    ? exp.description
                                    : "Describe your work achievements..."}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="placeholder-text">Add your experience details here...</p>
                )}
            </section>


            {/* ===== EDUCATION ===== */}
            <section className="resume-section">
                <h2>EDUCATION</h2>
                {formData.education.length > 0 ? (
                    formData.education.map((edu, i) => (
                        <div key={i} className="resume-item">
                            <strong>{showText(edu.degree, "Degree")}</strong> —{" "}
                            {showText(edu.school, "University")}
                            <p>
                                {showText(edu.description, "Add GPA or key achievements...")}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="placeholder-text">Add your education details here...</p>
                )}
            </section>

            {/* ===== SKILLS ===== */}
            <section className="resume-section">
                <h2>SKILLS</h2>
                {formData.skills.length > 0 ? (
                    <ul>
                        {formData.skills.map((s, i) => (
                            <li key={i}>{showText(s.skill, "Skill Name")}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="placeholder-text">Add your key skills here...</p>
                )}
            </section>

            {/* ===== LANGUAGES ===== */}
            <section className="resume-section">
                <h2>LANGUAGES</h2>
                {formData.languages.length > 0 ? (
                    <ul>
                        {formData.languages.map((lang, i) => (
                            <li key={i}>
                                {showText(lang.language, "Language")} —{" "}
                                {showText(lang.proficiency, "Proficiency")}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="placeholder-text">Add languages you know...</p>
                )}
            </section>

            {/* 🧾 PDF Button (bottom of preview) */}
            <div className="generate-pdf-btn">
                <button onClick={handleGeneratePDF} className="btn btn-primary">
                    Generate PDF
                </button>
            </div>
        </div>
    );
}
