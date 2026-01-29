import React from "react";

/* ===============================
   Helpers
================================ */

function textToBullets(text, fallback = []) {
    if (typeof text === "string" && text.trim()) {
        return text
            .split("\n")
            .map(l => l.replace(/^•\s*/, "").trim())
            .filter(Boolean);
    }
    return Array.isArray(fallback) ? fallback : [];
}

function formatDateRange(start, end) {
    if (!start && !end) return "";
    if (start && end) return `${start} — ${end}`;
    if (start) return `${start} — Present`;
    return "";
}

function normalizePhoto(photo) {
    if (!photo || typeof photo !== "string") return null;
    if (photo.startsWith("data:image")) return photo;
    if (photo.startsWith("http")) return photo;
    return null;
}

/* ===============================
   TEMPLATE
================================ */

export default function ModernTemplate({
    formData = {},
    placeholders,
    isFinalView = false
}) {

    /* ======================================================
       PERSONAL DETAILS — HARD FIX (DO NOT CHANGE)
       ====================================================== */

    const pd = {
        ...(formData.personalDetails || {}),
        ...(formData || {})
    };

    const photo = normalizePhoto(formData.photo);
    const name = pd.name?.trim() || (!isFinalView ? placeholders.name : "");
    const title = pd.title?.trim() || (!isFinalView ? placeholders.title : "");
    const email = pd.email?.trim() || (!isFinalView ? placeholders.email : "");
    const phone = pd.phone?.trim() || (!isFinalView ? placeholders.phone : "");
    const location = pd.location?.trim() || (!isFinalView ? placeholders.location : "");
    const website = pd.website?.trim() || (!isFinalView ? placeholders.website : "");
    const summary = pd.summary?.trim() || (!isFinalView ? placeholders.summary : "");

    const experiences = Array.isArray(formData.experience) && formData.experience.length
        ? formData.experience
        : (!isFinalView ? [placeholders.experience] : []);

    const educations = Array.isArray(formData.education) && formData.education.length
        ? formData.education
        : (!isFinalView ? [placeholders.education] : []);

    const certifications = Array.isArray(formData.certifications) && formData.certifications.length
        ? formData.certifications
        : (!isFinalView ? [placeholders.certifications] : []);

    const skills = Array.isArray(formData.skills) && formData.skills.length
        ? formData.skills
        : (!isFinalView ? placeholders.skills : []);

    const languages = Array.isArray(formData.languages) && formData.languages.length
        ? formData.languages
        : (!isFinalView ? placeholders.languages : []);

    return (
        <div className="mt-root">

            {/* ✅ NEW INNER MARGIN WRAPPER */}
            <div className="mt-content-inner">

                {/* ================= HEADER ================= */}
                {(name || title || email || phone || location || website) && (
                    <div className="mt-header">
                        {(photo || !isFinalView) && (
                            <div className="mt-photo-wrapper">
                                {photo ? (
                                    photo.startsWith("data:image") ? (
                                        <img
                                            className="mt-photo"
                                            src={photo}
                                            alt="Profile"
                                        />
                                    ) : (
                                        <div
                                            className="mt-photo-bg"
                                            style={{ backgroundImage: `url("${photo}")` }}
                                        />
                                    )
                                ) : (
                                    <div className="mt-photo-placeholder">PHOTO</div>
                                )}
                            </div>
                        )}


                        <div className="mt-header-main">
                            <div>
                                {name && <h1 className="mt-name">{name}</h1>}
                                {title && <div className="mt-title">{title}</div>}
                            </div>

                            <div className="mt-contact">
                                {email && <div>{email}</div>}
                                {phone && <div>{phone}</div>}
                                {location && <div>{location}</div>}
                                {website && <div>{website}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= SUMMARY ================= */}
                {summary && (
                    <section className="mt-section">
                        <div className="mt-section-title">SUMMARY</div>
                        <p className="mt-text">{summary}</p>
                    </section>
                )}

                {/* ================= EXPERIENCE ================= */}
                {experiences.length > 0 && (
                    <section className="mt-section">
                        <div className="mt-section-title">EXPERIENCE</div>

                        {experiences.map((exp, i) => {
                            if (!exp) return null;

                            const bullets = textToBullets(
                                exp.description,
                                placeholders.experience?.bullets
                            );

                            return (
                                <div className="mt-item" key={i}>
                                    <div className="mt-item-header">
                                        <div>
                                            <div className="mt-role">
                                                {exp.title || placeholders.experience.jobTitle}
                                            </div>
                                            <div className="mt-company">
                                                {(exp.company || placeholders.experience.company)},{" "}
                                                {(exp.location || placeholders.experience.location)}
                                            </div>
                                        </div>
                                        <div className="mt-date">
                                            {formatDateRange(exp.startDate, exp.endDate) ||
                                                placeholders.experience.dateRange}
                                        </div>
                                    </div>

                                    {bullets.length > 0 && (
                                        <ul className="mt-bullets">
                                            {bullets.map((b, idx) => (
                                                <li key={idx}>{b}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </section>
                )}

                {/* ================= EDUCATION ================= */}
                {educations.length > 0 && (
                    <section className="mt-section">
                        <div className="mt-section-title">EDUCATION</div>

                        {educations.map((edu, i) => {
                            if (!edu) return null;

                            const bullets = textToBullets(
                                edu.description,
                                placeholders.education?.bullets
                            );

                            return (
                                <div className="mt-item" key={i}>
                                    <div className="mt-item-header">
                                        <div>
                                            <div className="mt-role">
                                                {edu.degree || placeholders.education.degree}
                                            </div>
                                            <div className="mt-company">
                                                {(edu.school || placeholders.education.school)},{" "}
                                                {(edu.location || placeholders.education.location)}
                                            </div>
                                        </div>
                                        <div className="mt-date">
                                            {formatDateRange(edu.startDate, edu.endDate) ||
                                                placeholders.education.dateRange}
                                        </div>
                                    </div>

                                    {bullets.length > 0 && (
                                        <ul className="mt-bullets">
                                            {bullets.map((b, idx) => (
                                                <li key={idx}>{b}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </section>
                )}

                {/* ================= CERTIFICATIONS ================= */}
                {certifications.length > 0 && (
                    <section className="mt-section">
                        <div className="mt-section-title">CERTIFICATIONS</div>

                        {certifications.map((c, i) => {
                            if (!c) return null;

                            const bullets = textToBullets(
                                c.description,
                                placeholders.certifications?.bullets
                            );

                            return (
                                <div className="mt-item" key={i}>
                                    <div className="mt-item-header">
                                        <div>
                                            <div className="mt-role">
                                                {c.name || placeholders.certifications.name}
                                            </div>
                                            <div className="mt-company">
                                                {c.organization || placeholders.certifications.organization}
                                            </div>
                                            {(c.credentialId || placeholders.certifications.credentialId) && (
                                                <div className="mt-text">
                                                    Credential ID: {c.credentialId || placeholders.certifications.credentialId}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-date">
                                            {c.issueDate || placeholders.certifications.issueDate}
                                        </div>
                                    </div>

                                    {bullets.length > 0 && (
                                        <ul className="mt-bullets">
                                            {bullets.map((b, idx) => (
                                                <li key={idx}>{b}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </section>
                )}

                {/* ================= SKILLS ================= */}
                {skills.length > 0 && (
                    <section className="mt-section">
                        <div className="mt-section-title">SKILLS</div>
                        {skills.map((s, i) => (
                            <div key={i} className="mt-skill">
                                • {typeof s === "string" ? s : `${s.skill} - ${s.level}`}
                            </div>
                        ))}
                    </section>
                )}

                {/* ================= LANGUAGES ================= */}
                {languages.length > 0 && (
                    <section className="mt-section">
                        <div className="mt-section-title">LANGUAGES</div>
                        {languages.map((l, i) => (
                            <div key={i}>
                                • {typeof l === "string" ? l : `${l.language} - ${l.proficiency}`}
                            </div>
                        ))}
                    </section>
                )}

            </div>
        </div>
    );
}
