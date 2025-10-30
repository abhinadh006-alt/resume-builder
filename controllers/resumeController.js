// controllers/resumeController.js
import Resume from "../models/Resume.js";
import { generatePDF } from "../utils/generatePDF.js";

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
