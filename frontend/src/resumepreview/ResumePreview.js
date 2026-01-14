// src/ResumePreview.js
import React from "react";
import "./ResumePreview.css";

/* TEMPLATE CSS — MUST BE GLOBAL */
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
    name: "Your Full Name",
    title: "Your Professional Title",
    email: "Email@example.com",
    phone: "+91 98765 43210",
    location: "City, Country",
    website: "yourwebsite.com",

    summary:
        "Experienced Safety Officer with 5+ years of expertise in industrial safety, audits, and compliance management.",

    experience: {
        jobTitle: "Job Title",
        company: "Company Name",
        location: "City, Country",
        dateRange: "e.g., Sep 2019 — May 2023",
        bullets: [
            "Implemented and monitored safety systems.",
            "Conducted audits and trained staff.",
            "Performed risk assessments and led investigations."
        ]
    },

    education: {
        degree: "Bachelor’s in Engineering",
        school: "Harvard University",
        location: "City, Country",
        dateRange: "e.g., Jan 2015 — Sep 2019",
        bullets: [
            "Key coursework and academic achievements.",
            "Graduation project and specialization."
        ]
    },

    certifications: {
        name: "Certification Title",
        organization: "Issuing Organization",
        issueDate: "e.g., Jun 2021",
        credentialId: "ID/URL: 12345",
        bullets: [
            "Credential verified and industry recognized.",
            "Relevant to occupational safety standards."
        ]
    },

    skills: [
        "Risk Assessment - Advanced",
        "Fire Safety Management - Expert"
    ],

    languages: [
        "English - Fluent",
        "Hindi - Native",
        "Italian - Intermediate"
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
           SINGLE A4 PAGE (SOURCE OF TRUTH)
           =============================== */

        <div className="resume-page">
            <div
                className={`resume-preview resume-preview--${template} ${template === "hybrid" ? "resume-preview--hybrid" : ""
                    } ${isFinalView ? "final" : "builder"}`}
            >

                <TemplateComponent
                    formData={formData}
                    /* 🔑 CRITICAL RULE:
                       - Builder → placeholders allowed
                       - Final Preview / PDF → NO placeholders
                    */
                    placeholders={isFinalView ? {} : PLACEHOLDERS}
                    isFinalView={isFinalView}
                />
            </div>
        </div>
    );
}
