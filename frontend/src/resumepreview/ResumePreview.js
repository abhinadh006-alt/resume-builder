// src/ResumePreview.js
import React from "react";
import "./ResumePreview.css"; // keep if you have any container-level rules

// Import templates (keep these only if files exist at these paths)
import ModernTemplate from "../server-templates/ModernTemplate";
import ClassicTemplate from "../server-templates/ClassicTemplate";
import HybridTemplate from "../server-templates/HybridTemplate";

/**
 * Centralized placeholders shared across templates.
 * Edit these values to change placeholder text everywhere.
 */
const PLACEHOLDERS = {
    name: "Your Full Name",
    title: "Your Professional Title",
    email: "Email@example.com",
    phone: "+91 98765 43210",
    location: "City, Country",
    website: "yourwebsite.com",
    photoAlt: "Photo",
    summary:
        "Experienced Safety Officer with 5+ years of expertise in industrial safety, audits, and compliance management.",
    // Experience placeholders
    experience: {
        jobTitle: "Job Title",
        company: "Company Name",
        location: "City, Country",
        dateRange: "e.g., 2019 — 2023",
        description:
            "Job responsibilities and achievements. Use new lines for separate points.",
        sampleBullets: [
            "Implemented and monitored safety systems, conducted audits, and trained staff on ISO/NEBOSH standards.",
            "Performed risk assessments and led incident investigations to reduce recurrence."
        ]
    },
    // Education placeholders
    education: {
        degree: "Bachelor’s in Engineering",
        school: "Harvard University",
        location: "City, Country",
        dateRange: "e.g., 2015 — 2019",
        description: "Add GPA, specialization, or achievements..."
    },
    // Certifications placeholders
    certifications: {
        name: "Certification Title",
        organization: "Issuing Organization",
        issueDate: "e.g., Jun 2021",
        credentialId: "ID/URL: 12345",
        description: "Short note about the certificate (scope, validity, etc.)"
    },
    // Skills & Languages placeholders
    skills: ["Risk Assessment", "Fire Safety Management", "NEBOSH, IOSH Certified"],
    languages: ["English — Fluent", "Hindi — Native", "Italian — Intermediate"]
};

/* Inline fallback renderer (uses placeholders from props) */
function InlinePreviewRenderer({ formData = {}, placeholders, isFinalView }) {
    const showText = (value, placeholder) => {
        const hasValue = value !== undefined && value !== null && String(value).trim() !== "";
        if (isFinalView) return hasValue ? <span className="filled-text">{value}</span> : null;
        return hasValue ? <span className="filled-text">{value}</span> : <span className="placeholder-text">{placeholder}</span>;
    };

    const formatDateRange = (item = {}, placeholder = "") => {
        const start = (item.start || item.startDate || "").toString().trim();
        const end = (item.end || item.endDate || "").toString().trim();
        if (start || end) {
            return <span className="filled-text">{start || "Start"} — {end || "Present"}</span>;
        }
        return !isFinalView ? <span className="placeholder-text">{placeholder}</span> : null;
    };

    return (
        <div className="inline-fallback">
            {(formData.name || formData.title || !isFinalView) && (
                <header className="resume-header">
                    <h1>{showText(formData.name, placeholders.name)}</h1>
                    <h2>{showText(formData.title, placeholders.title)}</h2>
                    <div className="contact-info">
                        {showText(formData.email, placeholders.email)} &nbsp;|&nbsp;
                        {showText(formData.phone, placeholders.phone)} &nbsp;|&nbsp;
                        {showText(formData.location, placeholders.location)} &nbsp;|&nbsp;
                        {showText(formData.website, placeholders.website)}
                    </div>
                </header>
            )}

            <section className="resume-section">
                <h2>SUMMARY</h2>
                {formData.summary ? (
                    <p className="filled-text">{formData.summary}</p>
                ) : (
                    !isFinalView && <p className="placeholder-text">{placeholders.summary}</p>
                )}
            </section>

            <section className="resume-section">
                <h2>EXPERIENCE</h2>
                {Array.isArray(formData.experience) && formData.experience.length > 0 ? (
                    formData.experience.map((exp = {}, i) => (
                        <div key={i} className="resume-item">
                            <strong>{showText(exp.title, placeholders.experience.jobTitle)}</strong>,{" "}
                            {showText(exp.company, placeholders.experience.company)} — {showText(exp.location, placeholders.experience.location)}
                            <div className="date-range">{formatDateRange(exp, placeholders.experience.dateRange)}</div>
                            <p style={{ whiteSpace: "pre-line", lineHeight: "1.5" }}>
                                {exp.description && exp.description.toString().trim() !== "" ? (
                                    exp.description
                                ) : (
                                    !isFinalView ? placeholders.experience.description : null
                                )}
                            </p>
                        </div>
                    ))
                ) : (
                    !isFinalView && (
                        <div className="resume-item placeholder-text">
                            <strong>{placeholders.experience.jobTitle}</strong>, {placeholders.experience.company} — {placeholders.experience.location}
                            <div className="date-range">{placeholders.experience.dateRange}</div>
                            <p>{placeholders.experience.sampleBullets.join(" ")}</p>
                        </div>
                    )
                )}
            </section>

            <section className="resume-section">
                <h2>EDUCATION</h2>
                {Array.isArray(formData.education) && formData.education.length > 0 ? (
                    formData.education.map((edu = {}, i) => (
                        <div key={i} className="resume-item">
                            <strong>{showText(edu.degree, placeholders.education.degree)}</strong>, {showText(edu.school, placeholders.education.school)} —{" "}
                            {showText(edu.location, placeholders.education.location)}
                            <div className="date-range">{formatDateRange(edu, placeholders.education.dateRange)}</div>
                            <p style={{ whiteSpace: "pre-line", lineHeight: "1.5" }}>
                                {edu.description && edu.description.toString().trim() !== "" ? edu.description : (!isFinalView ? placeholders.education.description : null)}
                            </p>
                        </div>
                    ))
                ) : (
                    !isFinalView && (
                        <div className="resume-item placeholder-text">
                            <strong>{placeholders.education.degree}</strong>, {placeholders.education.school} — {placeholders.education.location}
                            <div className="date-range">{placeholders.education.dateRange}</div>
                            <p>{placeholders.education.description}</p>
                        </div>
                    )
                )}
            </section>

            <section className="resume-section">
                <h2>CERTIFICATIONS</h2>
                {Array.isArray(formData.certifications) && formData.certifications.length > 0 ? (
                    formData.certifications.map((c = {}, i) => (
                        <div key={i} className="resume-item">
                            <strong>{c.name || placeholders.certifications.name}</strong>
                            {c.organization ? ` — ${c.organization}` : ` — ${placeholders.certifications.organization}`}
                            <div className="date-range">{c.issueDate || placeholders.certifications.issueDate}</div>
                            {c.credentialId && <div className="filled-text">ID/URL: {c.credentialId}</div>}
                            <p style={{ whiteSpace: "pre-line", lineHeight: "1.5" }}>{c.description || (isFinalView ? null : placeholders.certifications.description)}</p>
                        </div>
                    ))
                ) : (
                    !isFinalView && (
                        <div className="resume-item placeholder-text">
                            <strong>{placeholders.certifications.name}</strong> — {placeholders.certifications.organization}
                            <div className="date-range">{placeholders.certifications.issueDate}</div>
                            <p>{placeholders.certifications.description}</p>
                        </div>
                    )
                )}
            </section>

            <section className="resume-section">
                <h2>SKILLS</h2>
                {Array.isArray(formData.skills) && formData.skills.length > 0 ? (
                    <ul>{formData.skills.map((s, i) => <li key={i}>{typeof s === "string" ? s : s.skill || s.name}</li>)}</ul>
                ) : (
                    !isFinalView && <ul className="placeholder-text">{placeholders.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
                )}
            </section>

            <section className="resume-section">
                <h2>LANGUAGES</h2>
                {Array.isArray(formData.languages) && formData.languages.length > 0 ? (
                    <ul>{formData.languages.map((l, i) => <li key={i}>{typeof l === "string" ? l : (l.language || l.name) + (l.proficiency ? ` — ${l.proficiency}` : "")}</li>)}</ul>
                ) : (
                    !isFinalView && <ul className="placeholder-text">{placeholders.languages.map((l, i) => <li key={i}>{l}</li>)}</ul>
                )}
            </section>
        </div>
    );
}

/* Main ResumePreview component */
export default function ResumePreview({ formData = {}, template = "modern", isFinalView = false }) {
    const wrapperClass = `resume-preview ${isFinalView ? "final" : "builder"}`;

    // Decide which template component to render (templates choose their own structure & fonts)
    if (template === "classic" && ClassicTemplate) {
        return (
            <div className={wrapperClass}>
                <ClassicTemplate formData={formData} isFinalView={isFinalView} placeholders={PLACEHOLDERS} />
            </div>
        );
    }

    if (template === "hybrid" && HybridTemplate) {
        return (
            <div className={wrapperClass}>
                <HybridTemplate formData={formData} isFinalView={isFinalView} placeholders={PLACEHOLDERS} />
            </div>
        );
    }

    if (template === "modern" && ModernTemplate) {
        return (
            <div className={wrapperClass}>
                <ModernTemplate formData={formData} isFinalView={isFinalView} placeholders={PLACEHOLDERS} />
            </div>
        );
    }

    // fallback: inline renderer that uses the same placeholders
    return (
        <div className={wrapperClass}>
            <InlinePreviewRenderer formData={formData} placeholders={PLACEHOLDERS} isFinalView={isFinalView} />
        </div>
    );
}
