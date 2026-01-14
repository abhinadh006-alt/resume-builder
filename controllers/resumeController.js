// controllers/resumeController.js
import Resume from "../models/Resume.js";
import path from "path";

/**
 * This controller expects utils/generatePDF.cjs to export:
 *  - renderPdfBuffer (preferred) -> returns Buffer
 *  - generatePDF (legacy)
 */

/* Create resume (save JSON to DB) */
export const createResume = async (req, res) => {
    try {
        const resume = new Resume(req.body);
        await resume.save();
        res.status(201).json(resume);
    } catch (err) {
        console.error("createResume error:", err);
        res.status(400).json({ message: err.message || String(err) });
    }
};

/* Get all resumes */
export const getAllResumes = async (_req, res) => {
    try {
        const resumes = await Resume.find().sort({ createdAt: -1 });
        res.json(resumes);
    } catch (err) {
        console.error("getAllResumes error:", err);
        res.status(500).json({ message: err.message || String(err) });
    }
};

/* Download PDF for stored resume */
export const getResumePDF = async (req, res) => {
    try {
        // 🔥 keep connection alive
        req.setTimeout(0);
        res.setTimeout(0);

        const resume = await Resume.findById(req.params.id);
        if (!resume) return res.status(404).send("Resume not found");

        const formData = resume.toObject ? resume.toObject() : resume;

        // 🔒 SAFETY GUARD: prevent invalid photo format
        // 🔒 PHOTO NORMALIZATION (DB SAFETY)
        let photo = formData.photo || "";

        if (typeof photo === "string") {
            if (photo.startsWith("data:image")) {
                // ✅ base64 OK
            } else if (photo.startsWith("http")) {
                // ✅ hosted OK
            } else {
                console.warn("❌ Invalid photo format (DB). Dropping photo.");
                photo = "";
            }
        } else {
            photo = "";
        }

        formData.photo = photo;


        const template = (req.query.template || formData.template || "modern")
            .toString()
            .toLowerCase();

        const mod = await import("../utils/generatePDF.cjs");
        const pdfUtils = mod.default || mod;

        const renderPdfBuffer =
            pdfUtils.renderPdfBuffer || pdfUtils.render || pdfUtils.renderBuffer;

        if (typeof renderPdfBuffer === "function") {
            const pdfBuffer = await renderPdfBuffer({ formData, template });

            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${(formData.name || "resume")
                    .replace(/\s+/g, "_")}_resume.pdf"`,
                "Content-Length": pdfBuffer.length,
            });

            return res.end(pdfBuffer); // ✅ IMPORTANT
        }

        throw new Error("renderPdfBuffer not found");
    } catch (err) {
        console.error("getResumePDF error:", err);
        res.status(500).json({ message: err.message || String(err) });
    }
};

/* Secure route: generate resume from posted form data */
export async function generateResume(req, res) {
    try {
        req.setTimeout(0);
        res.setTimeout(0);

        const {
            name,
            email,
            template = "modern",
            ...rest
        } = req.body || {};

        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required" });
        }

        // 🔒 PHOTO NORMALIZATION (FINAL & SAFE)
        let photo = rest.photo || rest.photoUrl || "";

        if (typeof photo === "string") {
            if (photo.startsWith("data:image")) {
                // ✅ base64 OK
            } else if (photo.startsWith("http")) {
                // ✅ hosted image OK
            } else {
                console.warn("❌ Invalid photo format (request). Dropping photo.");
                photo = "";
            }
        } else {
            photo = "";
        }

        // ✅ BUILD formData ONCE (CORRECT)
        const formData = {
            name,
            email,
            title: rest.title || "",
            phone: rest.phone || "",
            location: rest.location || "",
            website: rest.website || "",
            summary: rest.summary || "",

            experience: Array.isArray(rest.experience)
                ? rest.experience.map(e => ({
                    title: e.title || e.jobTitle || "",
                    jobTitle: e.jobTitle || e.title || "",
                    company: e.company || "",
                    location: e.location || "",
                    startDate: e.startDate || "",
                    endDate: e.endDate || "",
                    description: e.description || ""
                }))
                : [],

            education: Array.isArray(rest.education)
                ? rest.education.map(e => ({
                    degree: e.degree || "",
                    school: e.school || "",
                    location: e.location || "",
                    startDate: e.startDate || "",
                    endDate: e.endDate || "",
                    description: e.description || ""
                }))
                : [],

            certifications: Array.isArray(rest.certifications)
                ? rest.certifications.map(c => ({
                    name: c.name || "",
                    organization: c.organization || "",
                    credentialId: c.credentialId || "",
                    issueDate: c.issueDate || "",
                    description: c.description || ""
                }))
                : [],

            skills: Array.isArray(rest.skills) ? rest.skills : [],
            languages: Array.isArray(rest.languages) ? rest.languages : [],
            photo,
        };


        const mod = await import("../utils/generatePDF.cjs");
        const pdfUtils = mod.default || mod;

        const renderPdfBuffer =
            pdfUtils.renderPdfBuffer || pdfUtils.render || pdfUtils.renderBuffer;

        if (typeof renderPdfBuffer === "function") {
            const pdfBuffer = await renderPdfBuffer({
                formData,
                template: template.toLowerCase(),
            });

            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${(formData.name || "resume")
                    .replace(/\s+/g, "_")}_resume.pdf"`,
                "Content-Length": pdfBuffer.length,
            });

            return res.end(pdfBuffer);
        }

        throw new Error("renderPdfBuffer not available");
    } catch (err) {
        console.error("generateResume error:", err);
        res.status(500).json({ error: err.message || String(err) });
    }
}
