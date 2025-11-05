// server-templates/ModernTemplate.jsx
import React from "react";

export default function ModernTemplate({ resume }) {
    const {
        name,
        title,
        email,
        phone,
        location,
        website,
        summary,
        experience = [],
        education = [],
        certifications = [],
        skills = [],
        languages = [],
    } = resume || {};

    return (
        <div className="page">
            {/* ===== HEADER ===== */}
            <header className="header">
                <div className="name-title">
                    <h1 className="name">{name || "Your Full Name"}</h1>
                    {title && <h2 className="title">{title}</h2>}
                </div>
                <div className="contacts">
                    {email && <div>{email}</div>}
                    {phone && <div>{phone}</div>}
                    {location && <div>{location}</div>}
                    {website && <div>{website}</div>}
                </div>
            </header>

            {/* ===== SUMMARY ===== */}
            {summary && (
                <section className="section">
                    <h2>SUMMARY</h2>
                    <p>{summary}</p>
                </section>
            )}

            {/* ===== EXPERIENCE ===== */}
            {experience.length > 0 && (
                <section className="section">
                    <h2>EXPERIENCE</h2>
                    {experience.map((exp, i) => (
                        <div key={i} className="resume-item">
                            <strong>{exp.title || "Job Title"}</strong>
                            {exp.company ? `, ${exp.company}` : ""}
                            {exp.location ? ` — ${exp.location}` : ""}
                            {(exp.start || exp.end) && (
                                <div className="date-range">
                                    {exp.start || "Start"} – {exp.end || "Present"}
                                </div>
                            )}
                            {exp.description && (
                                <p style={{ whiteSpace: "pre-line", lineHeight: "1.5" }}>
                                    {exp.description}
                                </p>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* ===== EDUCATION ===== */}
            {education.length > 0 && (
                <section className="section">
                    <h2>EDUCATION</h2>
                    {education.map((ed, i) => (
                        <div key={i} className="resume-item">
                            <strong>{ed.degree || "Degree"}</strong>
                            {ed.school ? `, ${ed.school}` : ""}
                            {ed.location ? ` — ${ed.location}` : ""}
                            {(ed.start || ed.end) && (
                                <div className="date-range">
                                    {ed.start || "Start"} – {ed.end || "Present"}
                                </div>
                            )}
                            {ed.description && (
                                <p style={{ whiteSpace: "pre-line", lineHeight: "1.5" }}>
                                    {ed.description}
                                </p>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* ===== CERTIFICATIONS ===== */}
            {certifications.length > 0 && (
                <section className="section">
                    <h2>CERTIFICATIONS</h2>
                    {certifications.map((cert, i) => (
                        <div key={i} className="resume-item">
                            <strong>{cert.name || "Certificate"}</strong>
                            {cert.organization ? ` — ${cert.organization}` : ""}
                            {cert.issueDate && (
                                <div className="date-range">{cert.issueDate}</div>
                            )}
                            {cert.credentialId && (
                                <div>ID/URL: {cert.credentialId}</div>
                            )}
                            {cert.description && (
                                <p style={{ whiteSpace: "pre-line", lineHeight: "1.5" }}>
                                    {cert.description}
                                </p>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* ===== SKILLS ===== */}
            {skills.length > 0 && (
                <section className="section">
                    <h2>SKILLS</h2>
                    <ul className="skills-list">
                        {skills.map((s, i) => (
                            <li key={i}>
                                {s.skill || s.name || s}
                                {s.proficiency || s.level
                                    ? ` — ${s.proficiency || s.level}`
                                    : ""}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* ===== LANGUAGES ===== */}
            {languages.length > 0 && (
                <section className="section">
                    <h2>LANGUAGES</h2>
                    <ul>
                        {languages.map((lang, i) => (
                            <li key={i}>
                                {lang.language || lang}
                                {lang.proficiency || lang.level
                                    ? ` — ${lang.proficiency || lang.level}`
                                    : ""}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
