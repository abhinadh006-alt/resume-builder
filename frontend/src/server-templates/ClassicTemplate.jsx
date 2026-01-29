// src/components/templates/ClassicTemplate.jsx
import React from "react";
import "../resumepreview/classic-template.css";

export default function ClassicTemplate({
    formData = {},
    isFinalView = false,
    placeholders = {}
}) {
    const ph = placeholders || {};

    const safePH = {
        name: ph.name || "Your Full Name",
        title: ph.title || "Your Professional Title",
        email: ph.email || "email@example.com",
        phone: ph.phone || "+91 98765 43210",
        location: ph.location || "City, Country",
        website: ph.website || "yourwebsite.com",
        summary: ph.summary || "Brief professional summary goes here.",

        experience: ph.experience || {
            jobTitle: "Job Title",
            company: "Company Name",
            location: "City, Country",
            dateRange: "e.g., Jan 2020 - Dec 2022",
            sampleBullets: [
                "Key responsibility or achievement",
                "Another measurable achievement"
            ]
        },

        education: ph.education || {
            degree: "Degree Name",
            school: "Institution Name",
            location: "City, Country",
            dateRange: "e.g., Jan 2016 - Dec 2019",
            description:
                "• Key coursework or academic achievement\n• Relevant project or distinction"
        },

        certifications: ph.certifications || {
            name: "Certification Name",
            organization: "Issuing Organization",
            credentialId: "Credential ID / URL",
            issueDate: "e.g., Jun 2021",
            description:
                "• Credential verified\n• Industry recognized"
        },

        skills: Array.isArray(ph.skills)
            ? ph.skills
            : [
                { skill: "Risk Assessment", level: "Advanced" },
                { skill: "Fire Safety Management", level: "Expert" }
            ],

        languages: Array.isArray(ph.languages)
            ? ph.languages
            : [
                { language: "English", proficiency: "Fluent" },
                { language: "Hindi", proficiency: "Native" }
            ]
    };


    /* ======================================================
       🔑 PLACEHOLDER NORMALIZATION (CRITICAL FIX)
       ====================================================== */

    const experienceData =
        Array.isArray(formData.experience) && formData.experience.length
            ? formData.experience
            : (!isFinalView ? [safePH.experience] : []);

    const educationData =
        Array.isArray(formData.education) && formData.education.length
            ? formData.education
            : (!isFinalView ? [safePH.education] : []);

    const certificationsData =
        Array.isArray(formData.certifications) && formData.certifications.length
            ? formData.certifications
            : (!isFinalView ? [safePH.certifications] : []);

    const skillsData =
        Array.isArray(formData.skills) && formData.skills.length
            ? formData.skills
            : (!isFinalView ? safePH.skills : []);

    const languagesData =
        Array.isArray(formData.languages) && formData.languages.length
            ? formData.languages
            : (!isFinalView ? safePH.languages : []);

    /* ---------- helpers ---------- */

    const show = (value, placeholder) => {
        const has = value !== undefined && value !== null && String(value).trim() !== "";
        if (isFinalView) return has ? value : null;
        return has ? value : placeholder;
    };

    const hasValue = (value) => {
        const v = value !== undefined && value !== null && String(value).trim() !== "";
        return isFinalView ? v : true;
    };

    const formatDates = (item = {}) => {
        const start = item.startDate || item.start || "";
        const end = item.endDate || item.end || "";
        if (start || end) return `${start}${start && end ? " - " : ""}${end}`;
        return !isFinalView
            ? safePH.education?.dateRange ||
            safePH.experience?.dateRange ||
            "e.g., Jan 2020 - Dec 2022"
            : null;
    };

    /* ---------- BULLET RENDERER ---------- */

    const normalizeLine = (line) =>
        String(line || "").replace(/^[\s]*[•\-*·]\s*/, "").trim();

    const descriptionToBullets = (desc) =>
        String(desc || "")
            .split("\n")
            .map(normalizeLine)
            .filter(Boolean);

    const renderBullets = (
        description = "",
        placeholderBullets = []
    ) => {
        // 1️⃣ real description (user-entered)
        if (description && String(description).trim()) {
            return (
                <ul className="classic-bullets">
                    {String(description)
                        .split("\n")
                        .map(normalizeLine)
                        .filter(Boolean)
                        .map((l, i) => (
                            <li key={i}>{l}</li>
                        ))}
                </ul>
            );
        }

        // 2️⃣ placeholder bullets (builder mode only)
        if (!isFinalView && Array.isArray(placeholderBullets) && placeholderBullets.length) {
            return (
                <ul className="classic-bullets">
                    {placeholderBullets.map((b, i) => (
                        <li key={i}>{normalizeLine(b)}</li>
                    ))}
                </ul>
            );
        }

        return null;
    };



    /* ---------- SKILLS ---------- */

    const buildSkillText = (s) => {
        if (typeof s === "string") return s;
        const name = s.skill || s.name || "";
        const level = s.proficiency || s.level || s.levelName || "";
        return level ? `${name} - ${level}` : name;
    };

    /* ---------- PHOTO / CONTACT FLAGS ---------- */

    const hasPhoto = Boolean(formData.photo);
    const collapsePhotoColumn = isFinalView && !hasPhoto;

    const contactItems = [
        { value: formData.email, ph: safePH.email },
        { value: formData.phone, ph: safePH.phone },
        { value: formData.location, ph: safePH.location },
        { value: formData.website, ph: safePH.website }
    ];

    const contactHasAny = contactItems.some((c) => hasValue(c.value));


    /* ---------- RENDER ---------- */

    return (
        <div className="classic-template">
            <div className="classic-content-inner">

                {/* HEADER */}
                <div className="classic-top">
                    <div
                        className={`classic-header-grid ${collapsePhotoColumn ? "classic-header--no-photo" : ""
                            }`}
                    >
                        <div className="classic-photo-cell">
                            {formData.photo ? (
                                formData.photo.startsWith("data:image") ? (
                                    <img
                                        className="classic-photo"
                                        src={formData.photo}
                                        alt={formData.name || safePH.name}
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : formData.photo.startsWith("http") ? (
                                    <div
                                        className="classic-photo"
                                        style={{
                                            backgroundImage: `url("${formData.photo}")`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center"
                                        }}
                                    />
                                ) : null
                            ) : (
                                !isFinalView && (
                                    <div className="classic-photo classic-photo--placeholder">PHOTO</div>
                                )
                            )}
                        </div>

                        <div className="classic-name-block">
                            <h1 className="classic-name">
                                {show(formData.name, safePH.name)}
                            </h1>
                            <div className="classic-title">
                                {show(formData.title, safePH.title)}
                            </div>
                        </div>

                        {contactHasAny && (
                            <div className="classic-contact-block">
                                {show(formData.email, safePH.email) && <div>{show(formData.email, safePH.email)}</div>}
                                {show(formData.phone, safePH.phone) && <div>{show(formData.phone, safePH.phone)}</div>}
                                {show(formData.location, safePH.location) && <div>{show(formData.location, safePH.location)}</div>}
                                {show(formData.website, safePH.website) && <div>{show(formData.website, safePH.website)}</div>}
                            </div>
                        )}
                    </div>
                </div>

                <hr className="classic-divider" />

                {/* SUMMARY */}
                {(formData.summary || !isFinalView) && (
                    <section className="classic-section">
                        <h2 className="classic-section__title">SUMMARY</h2>
                        {show(formData.summary, safePH.summary) && (
                            <p className="classic-section__text">
                                {show(formData.summary, safePH.summary)}
                            </p>
                        )}
                    </section>
                )}

                {/* EXPERIENCE */}
                {experienceData.length > 0 && (
                    <section className="classic-section">
                        <h2 className="classic-section__title">EXPERIENCE</h2>
                        {experienceData.map((exp = {}, i) => (
                            <div className="classic-item" key={i}>
                                <div className="classic-item__header">
                                    <div className="classic-item__role">
                                        <strong>{show(exp.title, safePH.experience.jobTitle)}</strong>
                                        <div className="classic-item__company">
                                            {show(exp.company, safePH.experience.company)}
                                        </div>
                                    </div>
                                    <div className="classic-item__meta">
                                        {show(exp.location, safePH.experience.location) && (
                                            <div>{show(exp.location, safePH.experience.location)}</div>
                                        )}
                                        <div className="classic-item__date">
                                            {formatDates(exp)}
                                        </div>
                                    </div>
                                </div>
                                {renderBullets(
                                    exp.description,
                                    safePH.experience.bullets || safePH.experience.sampleBullets
                                )}


                            </div>
                        ))}
                    </section>
                )}

                {/* EDUCATION */}
                {educationData.length > 0 && (
                    <section className="classic-section">
                        <h2 className="classic-section__title">EDUCATION</h2>
                        {educationData.map((edu = {}, i) => (
                            <div className="classic-item" key={i}>
                                <div className="classic-item__header">
                                    <div className="classic-item__role">
                                        <strong>{show(edu.degree, safePH.education.degree)}</strong>
                                        <div className="classic-item__company">
                                            {show(edu.school, safePH.education.school)}
                                        </div>
                                    </div>
                                    <div className="classic-item__meta">
                                        {show(edu.location, safePH.education.location) && (
                                            <div>{show(edu.location, safePH.education.location)}</div>
                                        )}
                                        <div className="classic-item__date">
                                            {formatDates(edu)}
                                        </div>
                                    </div>
                                </div>
                                {renderBullets(
                                    edu.description,
                                    safePH.education.bullets
                                )}



                            </div>
                        ))}
                    </section>
                )}

                {/* CERTIFICATIONS */}
                {certificationsData.length > 0 && (
                    <section className="classic-section">
                        <h2 className="classic-section__title">CERTIFICATIONS</h2>
                        {certificationsData.map((cert = {}, i) => (
                            <div className="classic-item" key={i}>
                                <div className="classic-item__header">
                                    <div className="classic-item__role">
                                        <strong>{show(cert.name, safePH.certifications.name)}</strong>
                                        <div className="classic-item__company">
                                            {show(cert.organization, safePH.certifications.organization)}
                                            {show(cert.credentialId, safePH.certifications.credentialId) && (
                                                <span> — {show(cert.credentialId, safePH.certifications.credentialId)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="classic-item__meta">
                                        {cert.issueDate && (
                                            <div className="classic-item__date">{cert.issueDate}</div>
                                        )}
                                    </div>
                                </div>
                                {renderBullets(
                                    cert.description,
                                    safePH.certifications.bullets
                                )}



                            </div>
                        ))}
                    </section>
                )}

                {/* SKILLS */}
                {skillsData.length > 0 && (
                    <section className="classic-section">
                        <h2 className="classic-section__title">SKILLS</h2>
                        <ul className="classic-side__list">
                            {skillsData.map((s, i) => (
                                <li key={i}>{buildSkillText(s)}</li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* LANGUAGES */}
                {languagesData.length > 0 && (
                    <section className="classic-section">
                        <h2 className="classic-section__title">LANGUAGES</h2>
                        <ul className="classic-side__list">
                            {languagesData.map((l, i) => (
                                <li key={i}>
                                    {typeof l === "string"
                                        ? l
                                        : `${l.language || l.name} - ${l.proficiency || ""}`}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

            </div>
        </div>
    );
}
