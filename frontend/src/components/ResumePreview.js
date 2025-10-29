import React from "react";
import "./ResumePreview.css";

export default function ResumePreview({ formData, template, isFinalView }) {
    const showText = (value, placeholder) => {
        if (isFinalView) {
            return value && value.trim() !== "" ? (
                <span className="filled-text">{value}</span>
            ) : null;
        }
        return value && value.trim() !== "" ? (
            <span className="filled-text">{value}</span>
        ) : (
            <span className="placeholder-text">{placeholder}</span>
        );
    };

    const formatDateRange = (item, placeholder) => {
        const start = item.start || item.startDate || "";
        const end = item.end || item.endDate || "";
        const hasStart = start && start.trim() !== "";
        const hasEnd = end && end.trim() !== "";

        if (hasStart || hasEnd) {
            return (
                <span className="filled-text">
                    {start || "Start"} – {end || "Present"}
                </span>
            );
        }
        return !isFinalView ? (
            <span className="placeholder-text">{placeholder}</span>
        ) : null;
    };

    // ===== COMMON SECTION RENDERERS =====
    const renderSummary = () =>
        (formData.summary?.trim() || !isFinalView) && (
            <section className="resume-section">
                <h2>SUMMARY</h2>
                {formData.summary?.trim() ? (
                    <p className="filled-text">{formData.summary}</p>
                ) : (
                    !isFinalView && (
                        <p className="placeholder-text">
                            Experienced Safety Officer with 5+ years of expertise in industrial safety, audits, and compliance management.
                        </p>
                    )
                )}
            </section>
        );

    const renderExperience = () =>
        (formData.experience?.length > 0 || !isFinalView) && (
            <section className="resume-section experience-section">
                <h2>EXPERIENCE</h2>
                {formData.experience?.length > 0 ? (
                    formData.experience.map((exp, i) => (
                        <div key={i} className="resume-item">
                            <strong>{showText(exp.title, "Job Title")}</strong>,{" "}
                            {showText(exp.company, "Company Name")} —{" "}
                            {showText(exp.location, "City, Country")}
                            <div className="date-range">{formatDateRange(exp, "e.g., 2019 – 2023")}</div>
                            <p>{showText(exp.description, "Job responsibilities and achievements...")}</p>
                        </div>
                    ))
                ) : (
                    !isFinalView && (
                        <div className="resume-item placeholder-text">
                            <strong>Safety Officer</strong>, Reliance Industries Pvt. Ltd. — City, Country
                            <div className="date-range">e.g., 2018 – 2022</div>
                            <p>Implemented and monitored safety systems, conducted audits, and trained staff on ISO/NEBOSH standards.</p>
                        </div>
                    )
                )}
            </section>
        );

    const renderEducation = () =>
        (formData.education?.length > 0 || !isFinalView) && (
            <section className="resume-section education-section">
                <h2>EDUCATION</h2>
                {formData.education?.length > 0 ? (
                    formData.education.map((edu, i) => (
                        <div key={i} className="resume-item">
                            <strong>{showText(edu.degree, "Bachelor’s in Engineering")}</strong>,{" "}
                            {showText(edu.school, "Harvard University")} —{" "}
                            {showText(edu.location, "City, Country")}
                            <div className="date-range">{formatDateRange(edu, "e.g., 2015 – 2019")}</div>
                            <p>{showText(edu.description, "Add GPA, specialization, or achievements...")}</p>
                        </div>
                    ))
                ) : (
                    !isFinalView && (
                        <div className="resume-item placeholder-text">
                            <strong>Bachelor’s in Engineering</strong>, Harvard University — City, Country
                            <div className="date-range">e.g., 2018 – 2022</div>
                            <p>Specialized in Industrial Safety and graduated with distinction.</p>
                        </div>
                    )
                )}
            </section>
        );

    const renderCertifications = () =>
        (formData.certifications?.length > 0 || !isFinalView) && (
            <section className="resume-section certifications-section">
                <h2>CERTIFICATIONS</h2>
                {formData.certifications?.length > 0 ? (
                    formData.certifications.map((cert, i) => (
                        <div key={i} className="resume-item">
                            <strong>{showText(cert.name, "Certification Title")}</strong> —{" "}
                            {showText(cert.organization, "Issuing Organization")}
                            {cert.issueDate && <div className="date-range">{cert.issueDate}</div>}
                            {cert.credentialId && <p className="filled-text">ID/URL: {cert.credentialId}</p>}
                            {cert.description && <p className="filled-text">{cert.description}</p>}
                        </div>
                    ))
                ) : (
                    !isFinalView && (
                        <div className="resume-item placeholder-text">
                            <strong>NEBOSH International General Certificate</strong> — National Examination Board in Occupational Safety and Health
                            <div className="date-range">e.g., Jun 2021</div>
                            <p>ID: 12345-NEBOSH | Recognized globally for safety excellence.</p>
                        </div>
                    )
                )}
            </section>
        );

    const renderSkills = () =>
        (formData.skills?.length > 0 || !isFinalView) && (
            <section className="resume-section skills-section">
                <h2>SKILLS</h2>
                {formData.skills?.length > 0 ? (
                    <ul>
                        {formData.skills.map((s, i) => (
                            <li key={i}>
                                {showText(s.skill, "e.g., Risk Assessment")}{" "}
                                {s.proficiency || s.level ? (
                                    <span className="filled-text">— {s.proficiency || s.level}</span>
                                ) : (
                                    !isFinalView && <span className="placeholder-text">— Proficiency</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    !isFinalView && (
                        <ul className="placeholder-text">
                            <li>Risk Assessment</li>
                            <li>Fire Safety Management</li>
                            <li>NEBOSH, IOSH Certified</li>
                            <li>Workplace Hazard Prevention</li>
                        </ul>
                    )
                )}
            </section>
        );

    const renderLanguages = () =>
        (formData.languages?.length > 0 || !isFinalView) && (
            <section className="resume-section languages-section">
                <h2>LANGUAGES</h2>
                {formData.languages?.length > 0 ? (
                    <ul>
                        {formData.languages.map((lang, i) => (
                            <li key={i}>
                                {showText(lang.language, "Language")}{" "}
                                {lang.proficiency || lang.level ? (
                                    <span className="filled-text">- {lang.proficiency || lang.level}</span>
                                ) : (
                                    !isFinalView && <span className="placeholder-text">- Proficiency</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    !isFinalView && (
                        <ul className="placeholder-text">
                            <li>English - Fluent</li>
                            <li>Hindi - Native</li>
                            <li>Italian - Intermediate</li>
                        </ul>
                    )
                )}
            </section>
        );

    // ===== TEMPLATE STRUCTURE SWITCH =====
    return (
        <div className={`resume-preview ${template} ${isFinalView ? "final" : "builder"}`}>
            {/* ===== HEADER ===== */}
            {(formData.name || formData.title || !isFinalView) && (
                <header className="resume-header">
                    <h1>{showText(formData.name, "Your Full Name")}</h1>
                    <h2>{showText(formData.title, "Your Professional Title")}</h2>
                    <div className="contact-info">
                        {showText(formData.email, "Email@example.com")} &nbsp;|&nbsp;
                        {showText(formData.phone, "+91 9876543210")} &nbsp;|&nbsp;
                        {showText(formData.location, "City, Country")} &nbsp;|&nbsp;
                        {showText(formData.website, "yourwebsite.com")}
                    </div>
                </header>
            )}

            {/* ===== HYBRID TEMPLATE (2-column) ===== */}
            {template === "hybrid" ? (
                <>
                    <div className="left-column">
                        {renderSkills()}
                        {renderLanguages()}
                    </div>
                    <div className="right-column">
                        {renderSummary()}
                        {renderExperience()}
                        {renderEducation()}
                        {renderCertifications()}
                    </div>
                </>
            ) : (
                /* ===== MODERN + CLASSIC (single-column) ===== */
                <>
                    {renderSummary()}
                    {renderExperience()}
                    {renderEducation()}
                    {renderCertifications()}
                    {renderSkills()}
                    {renderLanguages()}
                </>
            )}
        </div>
    );
}
