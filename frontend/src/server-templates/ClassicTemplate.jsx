// src/components/templates/ClassicTemplate.jsx
import React from "react";
import "./classic-template.css";

export default function ClassicTemplate({ formData = {}, isFinalView = false, placeholders = {} }) {
    const ph = placeholders;
    const show = (value, placeholder) => {
        const has = value !== undefined && value !== null && String(value).trim() !== "";
        if (isFinalView) return has ? value : null;
        return has ? value : placeholder;
    };

    const formatDates = (item = {}) => {
        const start = item.startDate || item.start || "";
        const end = item.endDate || item.end || "";
        if (start || end) return `${start || ""}${start && end ? " - " : ""}${end || ""}`;
        return !isFinalView ? ph.education?.dateRange || ph.experience?.dateRange || "e.g., August 2018 - March 2022" : null;
    };

    const renderList = (arr = []) =>
        arr.map((it, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: (it || "").replace(/\n/g, "<br/>") }} />
        ));

    return (
        <div className="classic-template">
            <div className="classic-top">
                <div className="classic-left">
                    {formData.photo ? (
                        <img className="classic-photo" src={formData.photo} alt={formData.name || ph.name} />
                    ) : (
                        <div className="classic-photo classic-photo--placeholder" aria-hidden />
                    )}
                    <div className="classic-name-block">
                        <h1 className="classic-name">{show(formData.name, ph.name)}</h1>
                        <div className="classic-title">{show(formData.title, ph.title)}</div>
                    </div>
                </div>

                <div className="classic-right">
                    <div className="contact-item">{show(formData.email, ph.email)}</div>
                    <div className="contact-item">{show(formData.phone, ph.phone)}</div>
                    <div className="contact-item">{show(formData.location, ph.location)}</div>
                    <div className="contact-item">{show(formData.website, ph.website)}</div>
                </div>
            </div>

            <hr className="classic-divider" />

            {(formData.summary || !isFinalView) && (
                <section className="classic-section">
                    <h2 className="classic-section__title">SUMMARY</h2>
                    <p className="classic-section__text">
                        {show(formData.summary, ph.summary)}
                    </p>
                </section>
            )}

            {(formData.experience?.length > 0 || !isFinalView) && (
                <section className="classic-section">
                    <h2 className="classic-section__title">EXPERIENCE</h2>
                    <div className="classic-list">
                        {(formData.experience && formData.experience.length > 0) ? formData.experience.map((exp, i) => (
                            <div key={i} className="classic-item">
                                <div className="classic-item__header">
                                    <div className="classic-item__role">
                                        <strong>{show(exp.title, ph.experience.jobTitle)}</strong>
                                        <div className="classic-item__company">{show(exp.company, ph.experience.company)}</div>
                                    </div>
                                    <div className="classic-item__meta">
                                        <div className="classic-item__loc">{show(exp.location, ph.experience.location)}</div>
                                        <div className="classic-item__date">{formatDates(exp)}</div>
                                    </div>
                                </div>

                                {exp.description ? (
                                    <ul className="classic-bullets">{renderList(exp.description.split(/\n|•/).filter(Boolean))}</ul>
                                ) : (
                                    !isFinalView && <p className="classic-section__text">{ph.experience.sampleBullets[0]}</p>
                                )}
                            </div>
                        )) : (
                            !isFinalView && (
                                <div className="classic-item placeholder">
                                    <div className="classic-item__header">
                                        <div className="classic-item__role">
                                            <strong>{ph.experience.jobTitle}</strong>
                                            <div className="classic-item__company">{ph.experience.company}</div>
                                        </div>
                                        <div className="classic-item__meta">
                                            <div className="classic-item__loc">{ph.experience.location}</div>
                                            <div className="classic-item__date">{ph.experience.dateRange}</div>
                                        </div>
                                    </div>
                                    <p className="classic-section__text">{ph.experience.sampleBullets[0]}</p>
                                </div>
                            )
                        )}
                    </div>
                </section>
            )}

            {(formData.education?.length > 0 || !isFinalView) && (
                <section className="classic-section">
                    <h2 className="classic-section__title">EDUCATION</h2>
                    <div className="classic-list">
                        {(formData.education && formData.education.length > 0) ? formData.education.map((edu, i) => (
                            <div key={i} className="classic-item">
                                <div className="classic-item__header">
                                    <div className="classic-item__role">
                                        <strong>{show(edu.degree, ph.education.degree)}</strong>
                                        <div className="classic-item__company">{show(edu.school, ph.education.school)}</div>
                                    </div>
                                    <div className="classic-item__meta">
                                        <div className="classic-item__loc">{show(edu.location, ph.education.location)}</div>
                                        <div className="classic-item__date">{formatDates(edu)}</div>
                                    </div>
                                </div>
                                {edu.description ? <p className="classic-section__text">{edu.description}</p> : null}
                            </div>
                        )) : (
                            !isFinalView && (
                                <div className="classic-item placeholder">
                                    <div className="classic-item__header">
                                        <div className="classic-item__role">
                                            <strong>{ph.education.degree}</strong>
                                            <div className="classic-item__company">{ph.education.school}</div>
                                        </div>
                                        <div className="classic-item__meta">
                                            <div className="classic-item__loc">{ph.education.location}</div>
                                            <div className="classic-item__date">{ph.education.dateRange}</div>
                                        </div>
                                    </div>
                                    <p className="classic-section__text">{ph.education.description}</p>
                                </div>
                            )
                        )}
                    </div>
                </section>
            )}

            {(formData.certifications?.length > 0 || !isFinalView) && (
                <section className="classic-section">
                    <h2 className="classic-section__title">CERTIFICATIONS</h2>
                    <div className="classic-list">
                        {(formData.certifications && formData.certifications.length > 0) ? formData.certifications.map((c, i) => (
                            <div key={i} className="classic-item">
                                <div className="classic-item__header">
                                    <div className="classic-item__role">
                                        <strong>{show(c.name, ph.certifications.name)}</strong>
                                        <div className="classic-item__company">{show(c.organization, ph.certifications.organization)}</div>
                                    </div>
                                    <div className="classic-item__meta">
                                        <div className="classic-item__date">{show(c.issueDate, ph.certifications.issueDate)}</div>
                                    </div>
                                </div>
                                {c.description ? <p className="classic-section__text">{c.description}</p> : null}
                            </div>
                        )) : (
                            !isFinalView && <p className="classic-section__text placeholder">{ph.certifications.name} — {ph.certifications.organization}</p>
                        )}
                    </div>
                </section>
            )}

            <div className="classic-two-col">
                {(formData.skills?.length > 0 || !isFinalView) && (
                    <aside className="classic-side">
                        <h3 className="classic-side__title">SKILLS</h3>
                        <ul className="classic-side__list">
                            {(formData.skills && formData.skills.length > 0) ? formData.skills.map((s, i) => (
                                <li key={i}>{typeof s === "string" ? s : (s.skill || s.name)}{s.proficiency ? ` — ${s.proficiency}` : ""}</li>
                            )) : (!isFinalView && ph.skills.map((t, i) => <li key={i} className="placeholder">{t}</li>))}
                        </ul>
                    </aside>
                )}

                {(formData.languages?.length > 0 || !isFinalView) && (
                    <aside className="classic-side">
                        <h3 className="classic-side__title">LANGUAGES</h3>
                        <ul className="classic-side__list">
                            {(formData.languages && formData.languages.length > 0) ? formData.languages.map((l, i) => (
                                <li key={i}>{typeof l === "string" ? l : (l.language || l.name)}{l.proficiency ? ` — ${l.proficiency}` : ""}</li>
                            )) : (!isFinalView && ph.languages.map((t, i) => <li key={i} className="placeholder">{t}</li>))}
                        </ul>
                    </aside>
                )}
            </div>
        </div>
    );
}
