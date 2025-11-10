// models/Resume.js
import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    startDate: String,   // "MMM yyyy" or ISO string (we just store as string)
    endDate: String,     // "Present" or "MMM yyyy"
    description: String,
}, { _id: false });

const EducationSchema = new mongoose.Schema({
    degree: String,
    school: String,
    location: String,
    startDate: String,
    endDate: String,     // "Present" ok
    description: String,
}, { _id: false });

const CertificationSchema = new mongoose.Schema({
    name: String,
    organization: String,
    issueDate: String,   // "MMM yyyy"
    credentialId: String,
    description: String,
}, { _id: false });

const SkillSchema = new mongoose.Schema({
    skill: String,
    proficiency: String, // or level
    level: String,       // keep both to match UI
}, { _id: false });

const LanguageSchema = new mongoose.Schema({
    language: String,
    proficiency: String, // or level
    level: String,
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: String,
    email: String,
    phone: String,
    location: String,
    website: String,
    summary: String,

    experience: { type: [ExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
    skills: { type: [SkillSchema], default: [] },
    languages: { type: [LanguageSchema], default: [] },


    template: { type: String, default: "modern" },
    createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.model("Resume", ResumeSchema);
