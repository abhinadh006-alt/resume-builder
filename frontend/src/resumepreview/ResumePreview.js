// src/ResumePreview.js
import React from "react";
import "./ResumePreview.css";

/* TEMPLATE CSS — MUST BE GLOBAL (PRINT + SCREEN) */
import "../resumepreview/modern-template.css";
import "../resumepreview/classic-template.css";
import "../resumepreview/hybrid-template.css";

/* Templates */
import ModernTemplate from "../server-templates/ModernTemplate.jsx";
import ClassicTemplate from "../server-templates/ClassicTemplate.jsx";
import HybridTemplate from "../server-templates/HybridTemplate.jsx";

/* ======================================================
   PLACEHOLDERS (BUILDER MODE ONLY)
====================================================== */

export const PLACEHOLDERS = {
    name: "STEPHEN GEORGE",
    title: "Senior HSE Officer",
    email: "Email@example.com",
    phone: "+91 98765 43210",
    location: "City, Country",
    website: "yourwebsite.com",

    summary:
        "NEBOSH-certified Safety Officer with 5+ years of experience in oil & gas and construction projects. Skilled in risk assessment, permit-to-work systems, incident investigation, and compliance with international safety standards. Proven track record of reducing workplace incidents by 40%.",

    experience: {
        jobTitle: "Safety Officer ",
        company: "L&T Construction",
        location: "Abu Dhabi, UAE",
        dateRange: "e.g., Sep 2019 — May 2023",
        project: "ADNOC Gas Processing Plant Expansion (Habshan)",
        client: "Abu Dhabi National Oil Company (ADNOC)",
        bullets: [
            "Implemented site-wide safety management system across 3 projects (500+ workers).",
            "Reduced workplace incidents by 40% through proactive hazard identification.",
            "Conducted toolbox talks and safety training for 100+ employees.",
            "Led incident investigations and ensured corrective actions.",
            "Ensured compliance with OSHA & ISO 45001 standards."
        ]
    },

    education: {
        degree: "Diploma in Fire & Safety Engineering",
        school: "Kerala Technical Institute",
        location: "Kochi, India",
        dateRange: "e.g., Jun 2016 — Apr 2018",
        bullets: [
            "Studied industrial safety, fire prevention, hazard identification, and risk assessment.",
            "Completed training in HIRA, PTW systems, and emergency response planning.",
            "Completed training in HIRA, PTW systems, and emergency response planning.",
            "Final project: Fire Risk Assessment and Safety Audit for Industrial Facility."
        ]
    },

    certifications: {
        name: "NEBOSH International General Certificate (IGC)",
        organization: "NEBOSH (National Examination Board in Occupational Safety and Health)",
        issueDate: "e.g., Jan 2019",
        credentialId: "12345",
        bullets: [
            "Internationally recognized qualification in occupational health & safety.",
            "Covered risk assessment, hazard control, and safety management systems.",
            "Covered risk assessment, hazard control, and safety management systems."
        ]
    },

    skills: [
        "Risk Assessment - Advanced",
        "Fire Safety Management - Expert",
        "Safety Audits & Inspections",
        "Hazard Identification & Control",
        "Toolbox Talks & Safety Training"
    ],

    languages: [
        "English - Fluent",
        "Hindi - Fluent",
        "Malayalam - Native",
        "Arabic - Intermediate"
    ]
};

/* ======================================================
   MAIN PREVIEW COMPONENT
====================================================== */

export default function ResumePreview({
    formData = {},
    template = "modern",
    isFinalView = false
}) {
    let TemplateComponent = ModernTemplate;

    if (template === "classic") TemplateComponent = ClassicTemplate;
    if (template === "hybrid") TemplateComponent = HybridTemplate;

    return (
        /* ===============================
           PRINT-SAFE ROOT (DO NOT REMOVE)
           =============================== */
        <div className="resume-print-root">

            <div
                id="resume-preview"
                className={`resume-preview resume-preview--${template} ${template === "hybrid" ? "resume-preview--hybrid" : ""
                    } ${isFinalView ? "final" : "builder"}`}
            >
                <TemplateComponent
                    formData={formData}
                    placeholders={isFinalView ? {} : PLACEHOLDERS}
                    isFinalView={isFinalView}
                />
            </div>

        </div>
    );

}
