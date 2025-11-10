// src/server-templates/ModernTemplate.jsx
import React from "react";
import "./modern-template.css";

export default function ModernTemplate({ formData = {}, isFinalView = false, placeholders = {} }) {
    // small helper that uses placeholders passed from ResumePreview
    const showText = (value, placeholder) => {
        const has = value !== undefined && value !== null && String(value).trim() !== "";
        if (isFinalView) return has ? value : null;
        return has ? value : placeholder;
    };

    const fmtDate = (it = {}) => {
        const start = (it.start || it.startDate || "").toString().trim();
        const end = (it.end || it.endDate || "").toString().trim();
        if (start || end) return `${start || "Start"} — ${end || "Present"}`;
        return "";
    };

    const ph = placeholders; // shorthand

    return (
        <article className="mt-root">
            <div className="mt-card">
                <header className="mt-header">
                    <div className="mt-header-left">
                        {formData.photoUrl ? (
                            <img src={formData.photoUrl} alt={formData.name || ph.name || "Photo"} className="mt-avatar" />
                        ) : (
                            <div className="mt-avatar mt-avatar--placeholder" aria-hidden="true" />
                        )}

                        <div className="mt-name-block">
                            <h1 className="mt-name">{showText(formData.name, ph.name)}</h1>
                            <div className="mt-title">{showText(formData.title, ph.title)}</div>
                        </div>
                    </div>

                    <div className="mt-contact">
                        {(formData.email || formData.phone || !isFinalView) && (
                            <div className="mt-contact-line">
                                <span className="mt-contact-item">{showText(formData.email, ph.email)}</span>
                                <span className="mt-divider">|</span>
                                <span className="mt-contact-item">{showText(formData.phone, ph.phone)}</span>
                            </div>
                        )}
                        <div className="mt-contact-line">
                            <span className="mt-contact-item">{showText(formData.website, ph.website)}</span>
                            <span className="mt-divider">|</span>
                            <span className="mt-contact-item">{showText(formData.location, ph.location)}</span>
                        </div>
                    </div>
                </header>

                {(formData.summary || !isFinalView) && (
                    <section className="mt-section mt-summary">
                        <h2 className="mt-section-title">Summary</h2>
                        <div className="mt-section-body">
                            <p>{showText(formData.summary, ph.summary)}</p>
                        </div>
                    </section>
                )}

                {(formData.experience?.length > 0 || !isFinalView) && (
                    <section className="mt-section">
                        <h2 className="mt-section-title">Experience</h2>

                        <div className="mt-section-body">
                            {Array.isArray(formData.experience) && formData.experience.length > 0 ? (
                                formData.experience.map((exp, idx) => (
                                    <div key={idx} className="mt-entry">
                                        <div className="mt-entry-head">
                                            <div className="mt-entry-left">
                                                <div className="mt-entry-job">{exp.title || ph.experience.jobTitle}</div>
                                                <div className="mt-entry-company">
                                                    {exp.company || ph.experience.company} {exp.location ? `| ${exp.location}` : ""}
                                                </div>
                                            </div>
                                            <div className="mt-entry-date">{fmtDate(exp) || ph.experience.dateRange}</div>
                                        </div>

                                        <ul className="mt-bullets">
                                            {exp.description && String(exp.description).trim() ? (
                                                String(exp.description).split("\n").map((line, i) => <li key={i}>{line}</li>)
                                            ) : (
                                                !isFinalView ? (
                                                    ph.experience.sampleBullets.map((b, i) => <li key={i}>{b}</li>)
                                                ) : null
                                            )}
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                !isFinalView && (
                                    <div className="mt-entry">
                                        <div className="mt-entry-head">
                                            <div className="mt-entry-left">
                                                <div className="mt-entry-job">{ph.experience.jobTitle} | {ph.experience.company}</div>
                                            </div>
                                            <div className="mt-entry-date">{ph.experience.dateRange}</div>
                                        </div>
                                        <ul className="mt-bullets">
                                            {ph.experience.sampleBullets.map((b, i) => <li key={i}>{b}</li>)}
                                        </ul>
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                )}

                {(formData.education?.length > 0 || !isFinalView) && (
                    <section className="mt-section">
                        <h2 className="mt-section-title">Education</h2>
                        <div className="mt-section-body">
                            {Array.isArray(formData.education) && formData.education.length > 0 ? (
                                formData.education.map((edu, i) => (
                                    <div className="mt-entry" key={i}>
                                        <div className="mt-entry-head">
                                            <div className="mt-entry-left">
                                                <div className="mt-entry-job">{edu.degree || ph.education.degree}</div>
                                                <div className="mt-entry-company">{edu.school || ph.education.school}{edu.location ? ` — ${edu.location}` : ""}</div>
                                            </div>
                                            <div className="mt-entry-date">{fmtDate(edu) || ph.education.dateRange}</div>
                                        </div>
                                        {edu.description ? <p className="mt-edu-desc">{edu.description}</p> : (!isFinalView && <p className="mt-edu-desc">{ph.education.description}</p>)}
                                    </div>
                                ))
                            ) : (
                                !isFinalView && (
                                    <div className="mt-entry">
                                        <div className="mt-entry-head">
                                            <div className="mt-entry-left">
                                                <div className="mt-entry-job">{ph.education.degree}</div>
                                                <div className="mt-entry-company">{ph.education.school} — {ph.education.location}</div>
                                            </div>
                                            <div className="mt-entry-date">{ph.education.dateRange}</div>
                                        </div>
                                        <p className="mt-edu-desc">{ph.education.description}</p>
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                )}

                {((formData.skills?.length > 0) || (formData.certifications?.length > 0) || (formData.languages?.length > 0) || !isFinalView) && (
                    <section className="mt-section mt-bottom">
                        {(formData.skills?.length > 0 || !isFinalView) && (
                            <>
                                <h3 className="mt-mini-title">Skills</h3>
                                <div className="mt-tag-line">
                                    {Array.isArray(formData.skills) && formData.skills.length > 0 ? formData.skills.map((s, i) => (
                                        <span key={i} className="mt-tag">{typeof s === "string" ? s : (s.skill || s.name)}</span>
                                    )) : (!isFinalView ? (ph.skills.map((t, i) => <span key={i} className="mt-tag">{t}</span>)) : null)}
                                </div>
                            </>
                        )}

                        {(formData.languages?.length > 0 || !isFinalView) && (
                            <>
                                <h3 className="mt-mini-title">Languages</h3>
                                <div className="mt-tag-line">
                                    {Array.isArray(formData.languages) && formData.languages.length > 0 ? formData.languages.map((l, i) => (
                                        <span key={i} className="mt-tag">{(l.language || l) + (l.proficiency ? ` — ${l.proficiency}` : "")}</span>
                                    )) : (!isFinalView ? (ph.languages.map((t, i) => <span key={i} className="mt-tag">{t}</span>)) : null)}
                                </div>
                            </>
                        )}
                    </section>
                )}
            </div>
        </article>
    );
}
