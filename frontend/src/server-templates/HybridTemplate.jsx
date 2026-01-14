import React from "react";
import "../resumepreview/hybrid-template.css";

export default function HybridTemplate({
    formData = {},
    placeholders = {},
    isFinalView = false,
}) {
    const ph = placeholders || {};

    /* ===============================
       PLACEHOLDERS
    =============================== */

    const safePH = {
        name: ph.name || "Your Full Name",
        title: ph.title || "Your Professional Title",
        email: ph.email || "email@example.com",
        phone: ph.phone || "+91 98765 43210",
        website: ph.website || "yourwebsite.com",
        location: ph.location || "City, Country",
        summary: ph.summary || "Brief professional summary goes here.",

        experience: {
            title: "Job Title",
            company: "Company Name",
            location: "City, Country",
            startDate: "Jan 2020",
            endDate: "Dec 2023",
            description:
                "• Implemented and monitored safety systems.\n• Conducted audits and trained staff.\n• Performed risk assessments and led investigations.",
            ...(ph.experience || {})
        },

        education: {
            degree: "Degree Name",
            school: "Institution Name",
            location: "City, Country",
            startDate: "Jan 2016",
            endDate: "Dec 2019",
            description: "• Key coursework and academic achievements.\n• Graduation project and specialization.",
            ...(ph.education || {})
        },

        certifications: {
            name: "Certification Name",
            organization: "Issuing Organization",
            credentialId: "Credential ID / URL",
            issueDate: "Jun 2021",
            description: "• Credential verified and industry recognized.\n• Relevant to occupational safety standards.",
            ...(ph.certifications || {})
        },

        skills: Array.isArray(ph.skills) && ph.skills.length
            ? ph.skills
            : [
                { skill: "Risk Assessment", level: "Advanced" },
                { skill: "Fire Safety", level: "Expert" }
            ],

        languages: Array.isArray(ph.languages) && ph.languages.length
            ? ph.languages
            : [
                { language: "English", proficiency: "Fluent" },
                { language: "Hindi", proficiency: "Native" }
            ]
    };

    /* ===============================
       DATA SOURCES
    =============================== */

    const summary =
        formData.summary || (!isFinalView ? safePH.summary : null);

    const experience =
        Array.isArray(formData.experience) && formData.experience.length
            ? formData.experience
            : (!isFinalView ? [{}] : []);

    const education =
        Array.isArray(formData.education) && formData.education.length
            ? formData.education
            : (!isFinalView ? [{}] : []);

    const certifications =
        Array.isArray(formData.certifications) && formData.certifications.length
            ? formData.certifications
            : (!isFinalView ? [{}] : []);

    const skills =
        Array.isArray(formData.skills) && formData.skills.length
            ? formData.skills
            : (!isFinalView ? safePH.skills : []);

    const languages =
        Array.isArray(formData.languages) && formData.languages.length
            ? formData.languages
            : (!isFinalView ? safePH.languages : []);

    /* ===============================
       HELPERS
    =============================== */

    const renderBullets = (text) =>
        String(text || "")
            .split("\n")
            .map(l => l.replace(/^•\s*/, "").trim())
            .filter(Boolean)
            .map((l, i) => <li key={i}>{l}</li>);

    const renderSkill = (s) => {
        if (!s) return null;
        if (typeof s === "string") return s;
        const name = s.skill || s.name || "";
        const level = s.level || s.proficiency || "";
        return level ? `${name} - ${level}` : name;
    };

    const renderLanguage = (l) => {
        if (!l) return null;
        if (typeof l === "string") return l;
        const name = l.language || l.name || "";
        const prof = l.proficiency || "";
        return prof ? `${name} - ${prof}` : name;
    };

    /* ===============================
       RENDER
    =============================== */

    return (
        <div className="hybrid-template">

            {/* HEADER */}
            <div className="hybrid-header">
                <div className="hybrid-header-inner">
                    <div className="hybrid-header-left">
                        <h1 className="hybrid-name">{formData.name || safePH.name}</h1>
                        <div className="hybrid-title">{formData.title || safePH.title}</div>

                        <div className="hybrid-contacts">
                            <span>✉ {formData.email || safePH.email}</span>
                            <span>☎ {formData.phone || safePH.phone}</span>
                            <span>🔗 {formData.website || safePH.website}</span>
                            <span>📍 {formData.location || safePH.location}</span>
                        </div>
                    </div>

                    <div className="hybrid-photo">
                        {formData.photo
                            ? <img src={formData.photo} alt="Profile" />
                            : !isFinalView && <div className="hybrid-photo-placeholder" />
                        }
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="hybrid-content">
                <div className="hybrid-content-inner">

                    {summary && (
                        <section>
                            <h2>Summary</h2>
                            <p>{summary}</p>
                        </section>
                    )}

                    <section>
                        <h2>Experience</h2>
                        {experience.map((e, i) => {
                            const exp = { ...safePH.experience, ...e };
                            return (
                                <div key={i} className="hybrid-item">
                                    <strong>{exp.title} | {exp.company}</strong>
                                    <div className="hybrid-meta">
                                        {exp.location} • {exp.startDate} – {exp.endDate}
                                    </div>
                                    <ul>{renderBullets(exp.description)}</ul>
                                </div>
                            );
                        })}
                    </section>

                    <section>
                        <h2>Education</h2>
                        {education.map((e, i) => {
                            const edu = { ...safePH.education, ...e };
                            return (
                                <div key={i} className="hybrid-item">
                                    <strong>{edu.degree} | {edu.school}</strong>
                                    <div className="hybrid-meta">
                                        {edu.location} • {edu.startDate} – {edu.endDate}
                                    </div>
                                    <ul>{renderBullets(edu.description)}</ul>
                                </div>
                            );
                        })}
                    </section>

                    <section>
                        <h2>Certifications</h2>
                        {certifications.map((c, i) => {
                            const cert = { ...safePH.certifications, ...c };
                            return (
                                <div key={i} className="hybrid-item">
                                    <strong>{cert.name}</strong>
                                    <div className="hybrid-meta">
                                        {cert.organization} • {cert.issueDate}
                                    </div>
                                    <div className="hybrid-meta">
                                        Credential ID: {cert.credentialId}
                                    </div>
                                    <ul>{renderBullets(cert.description)}</ul>
                                </div>
                            );
                        })}
                    </section>

                    <section>
                        <h2>Skills</h2>
                        <p className="hybrid-inline">
                            {skills.map((s, i) => {
                                const v = renderSkill(s);
                                return v ? <span key={i}>{v}</span> : null;
                            })}
                        </p>
                    </section>

                    <section>
                        <h2>Languages</h2>
                        <p className="hybrid-inline">
                            {languages.map((l, i) => {
                                const v = renderLanguage(l);
                                return v ? <span key={i}>{v}</span> : null;
                            })}
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
