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
import "./App.css";

export default function ResumeBuilder({ loading, handleSubmit }) {
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

    // ===== EXPERIENCE =====
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
    const [experienceInitialData, setExperienceInitialData] = useState(null);

    // ===== EDUCATION =====
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [editingEducationIndex, setEditingEducationIndex] = useState(null);
    const [educationInitialData, setEducationInitialData] = useState(null);

    // ===== CERTIFICATIONS =====
    const [showCertModal, setShowCertModal] = useState(false);
    const [editingCertIndex, setEditingCertIndex] = useState(null);
    const [certInitialData, setCertInitialData] = useState(null);

    // ===== SKILLS =====
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [editingSkillIndex, setEditingSkillIndex] = useState(null);
    const [skillInitialData, setSkillInitialData] = useState(null);

    // ===== LANGUAGES =====
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

    // ===== Edit Handlers =====
    const handleEditExperience = (index) => {
        const selected = formData.experience[index];
        setEditingExperienceIndex(index);
        setExperienceInitialData(selected);
        setShowExperienceModal(true);
    };

    const handleEditEducation = (index) => {
        const selected = formData.education[index];
        setEditingEducationIndex(index);
        setEducationInitialData(selected);
        setShowEducationModal(true);
    };

    const handleEditCert = (index) => {
        const selected = formData.certifications[index];
        setEditingCertIndex(index);
        setCertInitialData(selected);
        setShowCertModal(true);
    };

    const handleEditSkill = (index) => {
        const selected = formData.skills[index];
        setEditingSkillIndex(index);
        setSkillInitialData(selected);
        setShowSkillModal(true);
    };

    const handleEditLanguage = (index) => {
        const selected = formData.languages[index];
        setEditingLanguageIndex(index);
        setLanguageInitialData(selected);
        setShowLanguageModal(true);
    };

    return (
        <div className="builder-layout">
            <aside className="sidebar">
                {/* ===== PERSONAL DETAILS ===== */}
                <h3>Personal Details</h3>
                <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
                <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
                <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
                <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
                <input name="website" placeholder="Website / Social Media" value={formData.website} onChange={handleChange} />

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
                    onEdit={handleEditExperience}
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
                    onEdit={handleEditEducation}
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
                    onEdit={handleEditCert}
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
                    onEdit={handleEditSkill}
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
                    onEdit={handleEditLanguage}
                    onRemove={(index) => {
                        const updated = formData.languages.filter((_, i) => i !== index);
                        setFormData({ ...formData, languages: updated });
                    }}
                />

                {/* ===== TEMPLATE SELECTION ===== */}
                <h3>Select Resume Style</h3>
                <button
                    type="button"
                    className={`template-btn ${template === "modern" ? "active" : ""}`}
                    onClick={() => setTemplate("modern")}
                >
                    💼 Modern (Experienced)
                </button>
                <button
                    type="button"
                    className={`template-btn ${template === "classic" ? "active" : ""}`}
                    onClick={() => setTemplate("classic")}
                >
                    📘 Classic (Fresher)
                </button>
                <button
                    type="button"
                    className={`template-btn ${template === "hybrid" ? "active" : ""}`}
                    onClick={() => setTemplate("hybrid")}
                >
                    🧩 Hybrid (Two Column)
                </button>

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

            {/* ====== MAIN PREVIEW PANEL ====== */}
            <main className="main-panel">
                <ResumePreview formData={formData} template={template} isFinalView={isFinalView} />
            </main>

            {/* ====== MODALS ====== */}
            <Modal
                isOpen={showExperienceModal}
                onClose={() => setShowExperienceModal(false)}
                title="Experience"
            >
                <ExperienceForm
                    initialData={experienceInitialData}
                    onSave={(newExp) => {
                        const updated = [...formData.experience];
                        if (editingExperienceIndex !== null)
                            updated[editingExperienceIndex] = newExp;
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
                        if (editingEducationIndex !== null)
                            updated[editingEducationIndex] = newEdu;
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
                        if (editingCertIndex !== null)
                            updated[editingCertIndex] = newCert;
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
                        if (editingSkillIndex !== null)
                            updated[editingSkillIndex] = newSkill;
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
                        if (editingLanguageIndex !== null)
                            updated[editingLanguageIndex] = newLang;
                        else updated.push(newLang);
                        setFormData({ ...formData, languages: updated });
                        setShowLanguageModal(false);
                    }}
                />
            </Modal>
        </div>
    );
}
