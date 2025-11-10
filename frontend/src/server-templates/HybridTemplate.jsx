// src/components/templates/HybridTemplate.jsx
import React from "react";
import "./hybrid-template.css";

export default function HybridTemplate({ formData = {}, isFinalView = false, placeholders = {} }) {
    const ph = placeholders;

    const show = (val, placeholder = "") => {
        const has = val !== undefined && val !== null && String(val).trim() !== "";
        return isFinalView ? (has ? val : null) : (has ? val : placeholder);
    };

    const formatDates = (item = {}) => {
        const start = item.startDate || item.start || "";
        const end = item.endDate || item.end || "";
        if (start || end) return `${start}${start && end ? " — " : ""}${end}`;
        return !isFinalView ? ph.experience?.dateRange || "e.g., August 2018 — March 2022" : null;
    };

    const renderBullets = (text = "") => {
        const parts = String(text).split(/\n|•/).map(p => p.trim()).filter(Boolean);
        if (!parts.length) return null;
        return <ul className="ct-bullets">{parts.map((p, i) => <li key={i}>{p}</li>)}</ul>;
    };

    const skills = formData.skills || [];
    const languages = formData.languages || [];

    return (
        <div className="ct-wrapper">
            <aside className="ct-sidebar" role="complementary">
                <div className="ct-photo-wrap">
                    {formData.photo ? (
                        <img className="ct-photo" src={formData.photo} alt={formData.name || ph.name} />
                    ) : (
                        <div className="ct-photo ct-photo--placeholder" aria-hidden />
                    )}
                </div>

                <div className="ct-name">{show(formData.name, ph.name)}</div>
                <div className="ct-title">{show(formData.title, ph.title)}</div>

                <hr className="ct-sep" />

                <div className="ct-block">
                    <h4 className="ct-block__title">Details</h4>
                    <div className="ct-contact">
                        {show(formData.location, ph.location) && <div className="ct-contact__row">{show(formData.location, ph.location)}</div>}
                        {show(formData.phone, ph.phone) && <div className="ct-contact__row">{show(formData.phone, ph.phone)}</div>}
                        {show(formData.email, ph.email) && <div className="ct-contact__row">{show(formData.email, ph.email)}</div>}
                        {show(formData.website, ph.website) && <div className="ct-contact__row">{show(formData.website, ph.website)}</div>}
                    </div>
                </div>

                <div className="ct-block">
                    <h4 className="ct-block__title">Skills</h4>
                    <div className="ct-skill-list">
                        {skills.length > 0 ? skills.map((s, i) => {
                            const label = s.skill || s.name || `Skill ${i + 1}`;
                            const pct = (s.proficiency && parseInt(s.proficiency, 10)) || (s.level && parseInt(s.level, 10)) || 65;
                            return (
                                <div className="ct-skill" key={i}>
                                    <div className="ct-skill__label">{label}</div>
                                    <div className="ct-skill__bar">
                                        <div className="ct-skill__fill" style={{ width: `${Math.min(100, Math.max(6, pct))}%` }} />
                                    </div>
                                </div>
                            );
                        }) : (
                            !isFinalView && ph.skills.map((t, i) => (
                                <div className="ct-skill" key={i}>
                                    <div className="ct-skill__label placeholder">{t}</div>
                                    <div className="ct-skill__bar">
                                        <div className="ct-skill__fill" style={{ width: `${50 + i * 10}%` }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="ct-block">
                    <h4 className="ct-block__title">Languages</h4>
                    <ul className="ct-lang-list">
                        {languages.length > 0 ? languages.map((l, i) => (
                            <li key={i}>{l.language || l.name}{l.proficiency ? ` — ${l.proficiency}` : ""}</li>
                        )) : (!isFinalView && ph.languages.map((t, i) => <li key={i} className="placeholder">{t}</li>))}
                    </ul>
                </div>
            </aside>

            <main className="ct-main" role="main">
                {(formData.summary || !isFinalView) && (
                    <section className="ct-section">
                        <h3 className="ct-section__title">Summary</h3>
                        <p className="ct-section__text">{show(formData.summary, ph.summary)}</p>
                    </section>
                )}

                {(formData.experience?.length > 0 || !isFinalView) && (
                    <section className="ct-section">
                        <h3 className="ct-section__title">Experience</h3>
                        <div className="ct-list">
                            {(formData.experience && formData.experience.length > 0) ? formData.experience.map((e, idx) => (
                                <article key={idx} className="ct-item">
                                    <div className="ct-item__head">
                                        <div className="ct-item__role">
                                            <strong>{show(e.title, ph.experience.jobTitle)}</strong>
                                            <div className="ct-item__company">{show(e.company, ph.experience.company)}</div>
                                        </div>
                                        <div className="ct-item__meta">
                                            <div className="ct-item__loc">{show(e.location, ph.experience.location)}</div>
                                            <div className="ct-item__date">{formatDates(e)}</div>
                                        </div>
                                    </div>
                                    {e.description ? renderBullets(e.description) : (!isFinalView && <p className="ct-section__text">{ph.experience.sampleBullets[0]}</p>)}
                                </article>
                            )) : (!isFinalView && (
                                <article className="ct-item">
                                    <div className="ct-item__head">
                                        <div className="ct-item__role">
                                            <strong>{ph.experience.jobTitle}</strong>
                                            <div className="ct-item__company">{ph.experience.company}</div>
                                        </div>
                                        <div className="ct-item__meta">
                                            <div className="ct-item__loc">{ph.experience.location}</div>
                                            <div className="ct-item__date">{ph.experience.dateRange}</div>
                                        </div>
                                    </div>
                                    <p className="ct-section__text">{ph.experience.sampleBullets[0]}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {(formData.education?.length > 0 || !isFinalView) && (
                    <section className="ct-section">
                        <h3 className="ct-section__title">Education</h3>
                        <div className="ct-list">
                            {(formData.education && formData.education.length > 0) ? formData.education.map((ed, i) => (
                                <article key={i} className="ct-item">
                                    <div className="ct-item__head">
                                        <div className="ct-item__role">
                                            <strong>{show(ed.degree, ph.education.degree)}</strong>
                                            <div className="ct-item__company">{show(ed.school, ph.education.school)}</div>
                                        </div>
                                        <div className="ct-item__meta">
                                            <div className="ct-item__loc">{show(ed.location, ph.education.location)}</div>
                                            <div className="ct-item__date">{formatDates(ed)}</div>
                                        </div>
                                    </div>
                                    {ed.description && <p className="ct-section__text">{ed.description}</p>}
                                </article>
                            )) : (!isFinalView && (
                                <article className="ct-item">
                                    <div className="ct-item__head">
                                        <div className="ct-item__role">
                                            <strong>{ph.education.degree}</strong>
                                            <div className="ct-item__company">{ph.education.school}</div>
                                        </div>
                                        <div className="ct-item__meta">
                                            <div className="ct-item__loc">{ph.education.location}</div>
                                            <div className="ct-item__date">{ph.education.dateRange}</div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
