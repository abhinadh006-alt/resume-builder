import React, { useState } from "react";
import ExperienceSection from "./components/ExperienceSection";
import ExperienceForm from "./components/ExperienceForm";
import EducationSection from "./components/EducationSection";
import EducationForm from "./components/EducationForm";
import CertificationsSection from "./components/CertificationsSection";
import CertificationsForm from "./components/CertificationsForm";
import SkillsSection from "./components/SkillsSection";
import SkillForm from "./components/SkillForm";
import LanguagesSection from "./components/LanguagesSection";
import LanguageForm from "./components/LanguageForm";
import Modal from "./components/Modal";
import ResumePreview from "./components/ResumePreview";
import { generateResume } from "./api"; // ✅ adjust path if needed
import { toast } from "react-toastify";
import "./App.css";

export default function ResumeBuilder() {
    const [formData, setFormData] = useState({
        name: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        summary: "",
        experience: [],
        education: [],
        certifications: [],
        skills: [],
        languages: [],
    });

    // ===== MODAL STATES =====
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
    const [experienceInitialData, setExperienceInitialData] = useState(null);

    const [showEducationModal, setShowEducationModal] = useState(false);
    const [editingEducationIndex, setEditingEducationIndex] = useState(null);
    const [educationInitialData, setEducationInitialData] = useState(null);

    const [showCertModal, setShowCertModal] = useState(false);
    const [editingCertIndex, setEditingCertIndex] = useState(null);
    const [certInitialData, setCertInitialData] = useState(null);

    const [showSkillModal, setShowSkillModal] = useState(false);
    const [editingSkillIndex, setEditingSkillIndex] = useState(null);
    const [skillInitialData, setSkillInitialData] = useState(null);

    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [editingLanguageIndex, setEditingLanguageIndex] = useState(null);
    const [languageInitialData, setLanguageInitialData] = useState(null);

    // ===== TEMPLATE + PREVIEW =====
    const [template, setTemplate] = useState("modern");
    const [isFinalView, setIsFinalView] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const toggleFinalView = () => {
        setShowExperienceModal(false);
        setShowEducationModal(false);
        setShowCertModal(false);
        setShowSkillModal(false);
        setShowLanguageModal(false);
        setIsFinalView(!isFinalView);
    };

    const [loading, setLoading] = useState(false);

    // ✅ Handle resume generation
    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Call secure backend generator
            const result = await generateResume({ ...formData, template });

            if (result?.file) {
                toast.success("✅ Resume generated successfully!");
                window.open(`https://resume-builder-jv01.onrender.com${result.file}`, "_blank");
            } else {
                toast.error("⚠️ Unexpected server response");
            }
        } catch (err) {
            console.error("❌ Resume generation failed:", err.message);
            toast.error("❌ Failed to generate resume. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    // ===== Edit Handlers =====
    const handleEditItem = (type, index) => {
        const selected = formData[type][index];
        const setters = {
            experience: [setEditingExperienceIndex, setExperienceInitialData, setShowExperienceModal],
            education: [setEditingEducationIndex, setEducationInitialData, setShowEducationModal],
            certifications: [setEditingCertIndex, setCertInitialData, setShowCertModal],
            skills: [setEditingSkillIndex, setSkillInitialData, setShowSkillModal],
            languages: [setEditingLanguageIndex, setLanguageInitialData, setShowLanguageModal],
        };

        const [setIndex, setInitialData, setShow] = setters[type];
        setIndex(index);
        setInitialData(selected);
        setShow(true);
    };

    return (
        <div className="builder-layout">
            <aside className="sidebar">
                {/* ===== PERSONAL DETAILS ===== */}
                <h3>Personal Details</h3>
                {["name", "title", "email", "phone", "location", "website"].map((field) => (
                    <input
                        key={field}
                        name={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={handleChange}
                    />
                ))}

                {/* ===== SUMMARY ===== */}
                <h3>Summary</h3>
                <textarea
                    name="summary"
                    rows="5"
                    placeholder="Write your professional summary..."
                    value={formData.summary}
                    onChange={handleChange}
                ></textarea>

                {/* ===== EXPERIENCE ===== */}
                <ExperienceSection
                    experience={formData.experience}
                    onAdd={() => {
                        setEditingExperienceIndex(null);
                        setExperienceInitialData(null);
                        setShowExperienceModal(true);
                    }}
                    onEdit={(index) => handleEditItem("experience", index)}
                    onRemove={(index) => {
                        const updated = formData.experience.filter((_, i) => i !== index);
                        setFormData({ ...formData, experience: updated });
                    }}
                />

                {/* ===== EDUCATION ===== */}
                <EducationSection
                    education={formData.education}
                    onAdd={() => {
                        setEditingEducationIndex(null);
                        setEducationInitialData(null);
                        setShowEducationModal(true);
                    }}
                    onEdit={(index) => handleEditItem("education", index)}
                    onRemove={(index) => {
                        const updated = formData.education.filter((_, i) => i !== index);
                        setFormData({ ...formData, education: updated });
                    }}
                />

                {/* ===== CERTIFICATIONS ===== */}
                <CertificationsSection
                    certifications={formData.certifications}
                    onAdd={() => {
                        setEditingCertIndex(null);
                        setCertInitialData(null);
                        setShowCertModal(true);
                    }}
                    onEdit={(index) => handleEditItem("certifications", index)}
                    onRemove={(index) => {
                        const updated = formData.certifications.filter((_, i) => i !== index);
                        setFormData({ ...formData, certifications: updated });
                    }}
                />

                {/* ===== SKILLS ===== */}
                <SkillsSection
                    skills={formData.skills}
                    onAdd={() => {
                        setEditingSkillIndex(null);
                        setSkillInitialData(null);
                        setShowSkillModal(true);
                    }}
                    onEdit={(index) => handleEditItem("skills", index)}
                    onRemove={(index) => {
                        const updated = formData.skills.filter((_, i) => i !== index);
                        setFormData({ ...formData, skills: updated });
                    }}
                />

                {/* ===== LANGUAGES ===== */}
                <LanguagesSection
                    languages={formData.languages}
                    onAdd={() => {
                        setEditingLanguageIndex(null);
                        setLanguageInitialData(null);
                        setShowLanguageModal(true);
                    }}
                    onEdit={(index) => handleEditItem("languages", index)}
                    onRemove={(index) => {
                        const updated = formData.languages.filter((_, i) => i !== index);
                        setFormData({ ...formData, languages: updated });
                    }}
                />

                {/* ===== TEMPLATE SELECTION ===== */}
                <h3>Select Resume Style</h3>
                {["modern", "classic", "hybrid"].map((style) => (
                    <button
                        key={style}
                        type="button"
                        className={`template-btn ${template === style ? "active" : ""}`}
                        onClick={() => setTemplate(style)}
                    >
                        {style === "modern"
                            ? "💼 Modern (Experienced)"
                            : style === "classic"
                                ? "📘 Classic (Fresher)"
                                : "🧩 Hybrid (Two Column)"}
                    </button>
                ))}

                {/* ===== PREVIEW TOGGLE ===== */}
                <div className="preview-toggle">
                    <h3>Preview Mode</h3>
                    <button
                        type="button"
                        className={`toggle-btn ${isFinalView ? "active" : ""}`}
                        onClick={toggleFinalView}
                    >
                        {isFinalView ? "Switch to Edit View" : "Preview Final Resume"}
                    </button>
                </div>

                {/* ===== GENERATE BUTTON ===== */}
                <button onClick={handleSubmit} className="generate-btn" disabled={loading}>
                    {loading ? "⏳ Generating..." : "✅ Generate Resume"}
                </button>

            </aside>

            <main className="main-panel">
                <ResumePreview formData={formData} template={template} isFinalView={isFinalView} />
            </main>

            {/* ===== MODALS ===== */}
            <Modal isOpen={showExperienceModal} onClose={() => setShowExperienceModal(false)} title="Experience">
                <ExperienceForm
                    initialData={experienceInitialData}
                    onSave={(newExp) => {
                        const updated = [...formData.experience];
                        if (editingExperienceIndex !== null) updated[editingExperienceIndex] = newExp;
                        else updated.push(newExp);
                        setFormData({ ...formData, experience: updated });
                        setShowExperienceModal(false);
                    }}
                />
            </Modal>

            <Modal isOpen={showEducationModal} onClose={() => setShowEducationModal(false)} title="Education">
                <EducationForm
                    initialData={educationInitialData}
                    onSave={(newEdu) => {
                        const updated = [...formData.education];
                        if (editingEducationIndex !== null) updated[editingEducationIndex] = newEdu;
                        else updated.push(newEdu);
                        setFormData({ ...formData, education: updated });
                        setShowEducationModal(false);
                    }}
                />
            </Modal>

            <Modal isOpen={showCertModal} onClose={() => setShowCertModal(false)} title="Certifications">
                <CertificationsForm
                    initialData={certInitialData}
                    onSave={(newCert) => {
                        const updated = [...formData.certifications];
                        if (editingCertIndex !== null) updated[editingCertIndex] = newCert;
                        else updated.push(newCert);
                        setFormData({ ...formData, certifications: updated });
                        setShowCertModal(false);
                    }}
                />
            </Modal>

            <Modal isOpen={showSkillModal} onClose={() => setShowSkillModal(false)} title="Skills">
                <SkillForm
                    initialData={skillInitialData}
                    onSave={(newSkill) => {
                        const updated = [...formData.skills];
                        if (editingSkillIndex !== null) updated[editingSkillIndex] = newSkill;
                        else updated.push(newSkill);
                        setFormData({ ...formData, skills: updated });
                        setShowSkillModal(false);
                    }}
                />
            </Modal>

            <Modal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} title="Languages">
                <LanguageForm
                    initialData={languageInitialData}
                    onSave={(newLang) => {
                        const updated = [...formData.languages];
                        if (editingLanguageIndex !== null) updated[editingLanguageIndex] = newLang;
                        else updated.push(newLang);
                        setFormData({ ...formData, languages: updated });
                        setShowLanguageModal(false);
                    }}
                />
            </Modal>
        </div>
    );
}
