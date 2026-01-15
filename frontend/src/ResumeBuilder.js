// src/ResumeBuilder.js
import React, { useState, useRef, useEffect, useCallback } from "react";
//import ExperienceSection from "./components/ExperienceSection";
import ExperienceForm from "./components/ExperienceForm";
//import EducationSection from "./components/EducationSection";
import EducationForm from "./components/EducationForm";
//import CertificationsSection from "./components/CertificationsSection";
import CertificationsForm from "./components/CertificationsForm";
//import SkillsSection from "./components/SkillsSection";
import SkillForm from "./components/SkillForm";
//import LanguagesSection from "./components/LanguagesSection";
import LanguageForm from "./components/LanguageForm";
import Modal from "./components/Modal";
import ResumePreview from "./resumepreview/ResumePreview";
import { generateResume } from "./api";
import { toast } from "react-toastify";
import "./App.css";
import Sidebar from "./Sidebar";
import "./Sidebar.css";
import PreviewZoomControl from "./PreviewZoomControl";
import "./layout-preview.css";   // MUST be imported

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
        photo: undefined,
    });

    // single modal controller (only one open at a time)
    // possible values: null | "experience" | "education" | "cert" | "skill" | "language"
    const [openModal, setOpenModal] = useState(null);

    // editing indexes + initial data (kept as before)
    const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
    const [experienceInitialData, setExperienceInitialData] = useState(null);

    const [editingEducationIndex, setEditingEducationIndex] = useState(null);
    const [educationInitialData, setEducationInitialData] = useState(null);

    const [editingCertIndex, setEditingCertIndex] = useState(null);
    const [certInitialData, setCertInitialData] = useState(null);

    const [editingSkillIndex, setEditingSkillIndex] = useState(null);
    const [skillInitialData, setSkillInitialData] = useState(null);

    const [editingLanguageIndex, setEditingLanguageIndex] = useState(null);
    const [languageInitialData, setLanguageInitialData] = useState(null);

    const previewRef = useRef(null);

    // template + preview
    const [template, setTemplate] = useState("modern");
    const [isFinalView, setIsFinalView] = useState(false);

    const [loading, setLoading] = useState(false);

    // sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("personal");

    // mobile iconbar state - which panel to show inside the sidebar when icon clicked
    const [activePanel, setActivePanel] = useState("personal");

    // helper to open sidebar + set panel
    const openPanel = (name) => {
        setActivePanel(name);
        setSidebarOpen(true); // open the drawer on mobile
    };

    // ===== helpers =====
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
    };

    const toggleFinalView = () => {
        // close any open modal before switching view
        setOpenModal(null);
        setIsFinalView((v) => !v);
    };

    const handleSetPhoto = (base64) => {
        setFormData((prev) => ({ ...prev, photo: base64 }));
    };

    const handleImportResume = (parsed) => {
        const allowed = [
            "name",
            "title",
            "email",
            "phone",
            "location",
            "website",
            "summary",
            "experience",
            "education",
            "certifications",
            "skills",
            "languages",
            "photo",
        ];
        const sanitized = {};
        allowed.forEach((k) => {
            if (parsed[k] !== undefined) sanitized[k] = parsed[k];
        });
        setFormData((prev) => ({ ...prev, ...sanitized }));
        toast.success("Imported resume JSON successfully");
    };

    // ===== helpers for mobile panels: file -> base64, import JSON file
    const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = reject;
            fr.readAsDataURL(file);
        });

    const handlePhotoUploadFile = async (file) => {
        try {
            const b64 = await fileToBase64(file);
            handleSetPhoto(b64);
            toast.success("Photo uploaded");
        } catch (err) {
            toast.error("Failed to read photo file");
        }
    };

    const handleImportJsonFile = async (file) => {
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            handleImportResume(parsed);
        } catch (err) {
            toast.error("Invalid JSON file");
        }
    };

    // ✅ Normalize photo before sending to backend (CRITICAL for PDF)
    // ✅ BASE64-ONLY photo guard (DO NOT ALLOW URLS)
    const normalizePhoto = (photo) => {
        if (!photo) return null;

        if (typeof photo === "string" && photo.startsWith("data:image")) {
            return photo; // ✅ ONLY base64 allowed
        }

        console.warn("⚠️ Non-base64 photo dropped");
        return null;
    };


    // ===== handleSubmit (generate resume) =====
    const handleSubmit = async () => {
        try {
            setLoading(true);

            if (!formData.name?.trim() || !formData.email?.trim()) {
                toast.error("❌ Please enter your name and email before generating.");
                setLoading(false);
                return;
            }

            const chatId = localStorage.getItem("RB_CHAT");
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                title: formData.title,
                phone: formData.phone,
                location: formData.location,
                website: formData.website,
                summary: formData.summary,
                experience: formData.experience,
                education: formData.education,
                certifications: formData.certifications,
                skills: formData.skills,
                languages: formData.languages,
                template,
            };

            // call generator (secure:true calls /api/secure/generate-cv)
            const result = await generateResume(payload);



            // if server returned PDF bytes (blob)
            if (result?.fileBlob) {
                const url = URL.createObjectURL(result.fileBlob);
                window.open(url, "_blank");
                toast.success("✅ Resume generated (download opened).");
                return;
            }

            // if server returned JSON with a downloadURL or file path
            if (result?.downloadURL || result?.file) {
                const filePath = result.downloadURL || result.file;
                const base = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
                const openUrl = filePath.startsWith("http") ? filePath : `${base}${filePath}`;
                window.open(openUrl, "_blank");
                toast.success("✅ Resume generated successfully!");
                return;
            }

            // fallback: show text (for debugging)
            if (result?.text) {
                console.log("generate returned text:", result.text);
                toast.info("Server returned text response (see console).");
                return;
            }

            toast.warn("⚠️ Unexpected server response. Check console.");
            console.log("generate result:", result);
        } catch (err) {
            console.error("❌ Resume generation failed:", err);
            toast.error("❌ Failed to generate resume. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ===== edit handlers =====
    const handleEditItem = (type, index) => {
        const selected = formData[type][index];
        const setters = {
            experience: [setEditingExperienceIndex, setExperienceInitialData, () => setOpenModal("experience")],
            education: [setEditingEducationIndex, setEducationInitialData, () => setOpenModal("education")],
            certifications: [setEditingCertIndex, setCertInitialData, () => setOpenModal("cert")],
            skills: [setEditingSkillIndex, setSkillInitialData, () => setOpenModal("skill")],
            languages: [setEditingLanguageIndex, setLanguageInitialData, () => setOpenModal("language")],
        };

        const [setIndex, setInitialData, open] = setters[type];
        setIndex(index);
        setInitialData(selected);
        open();
    };

    // Small helper to remove item
    const removeItem = (type, index) => {
        const updated = [...formData[type]].filter((_, i) => i !== index);
        setFormData({ ...formData, [type]: updated });
    };

    // Mobile panel sub-contents: minimal but functional
    const PersonalPanel = (
        <div className="card">
            <h3>Personal Details</h3>
            <label>Name</label>
            <input name="name" value={formData.name} onChange={handleChange} />
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} />
            <label>Email</label>
            <input name="email" value={formData.email} onChange={handleChange} />
            <label>Phone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} />
            <label>Location</label>
            <input name="location" value={formData.location} onChange={handleChange} />
            <label>Website</label>
            <input name="website" value={formData.website} onChange={handleChange} />
        </div>
    );

    const SectionsPanel = (
        <div className="card">
            <h3>Sections</h3>

            <div style={{ marginBottom: 10 }}>
                <strong>Experience</strong>
                <div style={{ marginTop: 8 }}>
                    <button
                        onClick={() => {
                            setEditingExperienceIndex(null);
                            setExperienceInitialData(null);
                            setOpenModal("experience");
                            setActivePanel(null);
                        }}
                        className="template-btn"
                    >
                        + Add Experience
                    </button>
                </div>
                <ul className="short-list">
                    {(formData.experience || []).map((e, i) => (
                        <li key={i}>
                            <div style={{ fontSize: 13 }}>{e.title || "Untitled"}</div>
                            <div>
                                <button onClick={() => handleEditItem("experience", i)}>Edit</button>
                                <button onClick={() => removeItem("experience", i)}>Remove</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ marginBottom: 10 }}>
                <strong>Education</strong>
                <div style={{ marginTop: 8 }}>
                    <button
                        onClick={() => {
                            setEditingEducationIndex(null);
                            setEducationInitialData(null);
                            setOpenModal("education");
                            setActivePanel(null);
                        }}
                        className="template-btn"
                    >
                        + Add Education
                    </button>
                </div>
                <ul className="short-list">
                    {(formData.education || []).map((e, i) => (
                        <li key={i}>
                            <div style={{ fontSize: 13 }}>{e.school || "Untitled"}</div>
                            <div>
                                <button onClick={() => handleEditItem("education", i)}>Edit</button>
                                <button onClick={() => removeItem("education", i)}>Remove</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ marginBottom: 10 }}>
                <strong>Certifications</strong>
                <div style={{ marginTop: 8 }}>
                    <button
                        onClick={() => {
                            setEditingCertIndex(null);
                            setCertInitialData(null);
                            setOpenModal("cert");
                            setActivePanel(null);
                        }}
                        className="template-btn"
                    >
                        + Add Certification
                    </button>
                </div>
                <ul className="short-list">
                    {(formData.certifications || []).map((c, i) => (
                        <li key={i}>
                            <div style={{ fontSize: 13 }}>{c.name || "Untitled"}</div>
                            <div>
                                <button onClick={() => handleEditItem("certifications", i)}>Edit</button>
                                <button onClick={() => removeItem("certifications", i)}>Remove</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ marginBottom: 10 }}>
                <strong>Skills</strong>
                <div style={{ marginTop: 8 }}>
                    <button
                        onClick={() => {
                            setEditingSkillIndex(null);
                            setSkillInitialData(null);
                            setOpenModal("skill");
                            setActivePanel(null);
                        }}
                        className="template-btn"
                    >
                        + Add Skill
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: 10 }}>
                <strong>Languages</strong>
                <div style={{ marginTop: 8 }}>
                    <button
                        onClick={() => {
                            setEditingLanguageIndex(null);
                            setLanguageInitialData(null);
                            setOpenModal("language");
                            setActivePanel(null);
                        }}
                        className="template-btn"
                    >
                        + Add Language
                    </button>
                </div>
            </div>
        </div>
    );

    const PhotoPanel = (
        <div className="card">
            <h3>Photo & Import</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <label className="btn-upload" style={{ cursor: "pointer" }}>
                    Upload Photo
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (f) handlePhotoUploadFile(f);
                        }}
                    />
                </label>

                <label className="btn-upload" style={{ cursor: "pointer" }}>
                    Import JSON
                    <input
                        type="file"
                        accept="application/json"
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (f) handleImportJsonFile(f);
                        }}
                    />
                </label>
            </div>

            <div>
                <small className="muted">Uploaded photo will appear in preview & PDF.</small>
            </div>
        </div>
    );

    const TemplatesPanel = (
        <div className="card">
            <h3>Select Resume Style</h3>
            <button
                className={`template-btn ${template === "modern" ? "active" : ""}`}
                onClick={() => {
                    setTemplate("modern");
                    toast.info("Template set: Modern");
                }}
            >
                Modern (Experienced)
            </button>
            <button
                className={`template-btn ${template === "classic" ? "active" : ""}`}
                onClick={() => {
                    setTemplate("classic");
                    toast.info("Template set: Classic");
                }}
            >
                Classic (Serif)
            </button>
            <button
                className={`template-btn ${template === "hybrid" ? "active" : ""}`}
                onClick={() => {
                    setTemplate("hybrid");
                    toast.info("Template set: Hybrid");
                }}
            >
                Hybrid (Two column)
            </button>
        </div>
    );

    const GeneratePanel = (
        <div className="card">
            <h3>Preview & Generate</h3>
            <div style={{ marginBottom: 10 }}>
                <button
                    className="preview-toggle toggle-btn"
                    onClick={() => {
                        toggleFinalView();
                        setActivePanel(null);
                    }}
                >
                    {isFinalView ? "Switch to Edit View" : "Preview Mode"}
                </button>
            </div>

            <div>
                <button
                    className="generate-btn"
                    onClick={() => {
                        // close mobile panel and start generation
                        setActivePanel(null);
                        handleSubmit();
                    }}
                    disabled={loading}
                >
                    {loading ? "Generating..." : "Generate Resume"}
                </button>
            </div>
        </div>
    );

    // ========== Preview fit-to-container logic ==========


    // ========== edit helpers that open modals ==========
    const openExperience = () => {
        setEditingExperienceIndex(null);
        setExperienceInitialData(null);
        setOpenModal("experience");
    };
    const openEducation = () => {
        setEditingEducationIndex(null);
        setEducationInitialData(null);
        setOpenModal("education");
    };
    const openCert = () => {
        setEditingCertIndex(null);
        setCertInitialData(null);
        setOpenModal("cert");
    };
    const openSkill = () => {
        setEditingSkillIndex(null);
        setSkillInitialData(null);
        setOpenModal("skill");
    };
    const openLanguage = () => {
        setEditingLanguageIndex(null);
        setLanguageInitialData(null);
        setOpenModal("language");
    };

    return (
        <div className="builder-layout">

            {/* ===== APP HEADER (Branding only, NOT part of preview/PDF) ===== */}

            {/* Desktop sidebar (keeps existing Sidebar component) */}
            <Sidebar
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                openExperienceModal={openExperience}
                openEducationModal={openEducation}
                openCertModal={openCert}
                openSkillModal={openSkill}
                openLanguageModal={openLanguage}
                onEditItem={(type, index) => handleEditItem(type, index)}
                onRemoveItem={(type, index) => {
                    const updated = [...formData[type]].filter((_, i) => i !== index);
                    setFormData({ ...formData, [type]: updated });
                }}
                template={template}
                setTemplate={setTemplate}
                isFinalView={isFinalView}
                toggleFinalView={toggleFinalView}
                handleSubmit={handleSubmit}
                handleSetPhoto={handleSetPhoto}
                handleImportResume={handleImportResume}
                isOpen={sidebarOpen}
                onOpen={() => setSidebarOpen(true)}
                onClose={() => setSidebarOpen(false)}
                activePanel={activePanel}
                setActivePanel={setActivePanel}
            />

            <main className="main-panel">
                <div className="preview-wrapper">
                    <div className="preview-scale">
                        <ResumePreview
                            ref={previewRef}
                            formData={formData}
                            template={template}
                            isFinalView={isFinalView}
                        />
                    </div>
                </div>

            </main>

            {/* MODALS */}
            <Modal isOpen={openModal === "experience"} onClose={() => setOpenModal(null)} title="Experience">
                <ExperienceForm
                    initialData={experienceInitialData}
                    onSave={(newExp) => {
                        const updated = [...formData.experience];
                        if (editingExperienceIndex !== null) updated[editingExperienceIndex] = newExp;
                        else updated.push(newExp);
                        setFormData({ ...formData, experience: updated });
                        setOpenModal(null);
                    }}
                />
            </Modal>

            <Modal isOpen={openModal === "education"} onClose={() => setOpenModal(null)} title="Education">
                <EducationForm
                    initialData={educationInitialData}
                    onSave={(newEdu) => {
                        const updated = [...formData.education];
                        if (editingEducationIndex !== null) updated[editingEducationIndex] = newEdu;
                        else updated.push(newEdu);
                        setFormData({ ...formData, education: updated });
                        setOpenModal(null);
                    }}
                />
            </Modal>

            <Modal isOpen={openModal === "cert"} onClose={() => setOpenModal(null)} title="Certifications">
                <CertificationsForm
                    initialData={certInitialData}
                    onSave={(newCert) => {
                        const updated = [...formData.certifications];
                        if (editingCertIndex !== null) updated[editingCertIndex] = newCert;
                        else updated.push(newCert);
                        setFormData({ ...formData, certifications: updated });
                        setOpenModal(null);
                    }}
                />
            </Modal>

            <Modal isOpen={openModal === "skill"} onClose={() => setOpenModal(null)} title="Skills">
                <SkillForm
                    initialData={skillInitialData}
                    onSave={(newSkill) => {
                        const updated = [...formData.skills];
                        if (editingSkillIndex !== null) updated[editingSkillIndex] = newSkill;
                        else updated.push(newSkill);
                        setFormData({ ...formData, skills: updated });
                        setOpenModal(null);
                    }}
                />
            </Modal>

            <Modal isOpen={openModal === "language"} onClose={() => setOpenModal(null)} title="Languages">
                <LanguageForm
                    initialData={languageInitialData}
                    onSave={(newLang) => {
                        const updated = [...formData.languages];
                        if (editingLanguageIndex !== null) updated[editingLanguageIndex] = newLang;
                        else updated.push(newLang);
                        setFormData({ ...formData, languages: updated });
                        setOpenModal(null);
                    }}
                />
            </Modal>

            <PreviewZoomControl previewRef={previewRef} />
        </div>
    );
}
