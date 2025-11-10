// controllers/resumeController.js
import Resume from "../models/Resume.js";
import pdfModule from "../utils/generatePDF.cjs";
const { generatePDF } = pdfModule;


export const createResume = async (req, res) => {
    try {
        const resume = new Resume(req.body);
        await resume.save();
        res.status(201).json(resume);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const getAllResumes = async (req, res) => {
    try {
        const resumes = await Resume.find().sort({ createdAt: -1 });
        res.json(resumes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getResumePDF = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) return res.status(404).send("Resume not found");

        // Generate PDF buffer
        const pdfBuffer = await generateResumePDF(resume);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${resume.name.replace(/\s+/g, "_")}_resume.pdf"`,
            "Content-Length": pdfBuffer.length,
        });

        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// ✅ Export for secure route
export async function generateResume(req, res) {
    try {
        const { name, title, email, phone, location, website, summary, experience, education, certifications, skills, languages, template = "modern" } = req.body;

        console.log("📩 Received resume data:", req.body);

        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required" });
        }

        // Import and use your existing PDF generator
        const { generatePDF } = await import("../utils/generatePDF.cjs");
        const downloadURL = await generatePDF(
            { name, title, email, phone, location, website, summary, experience, education, certifications, skills, languages },
            template
        );

        res.json({ success: true, file: downloadURL });
    } catch (err) {
        console.error("❌ generateResume error:", err.message);
        res.status(500).json({ error: err.message });
    }
}
