// src/Sidebar.js
import React, { useRef, useEffect } from "react";
import "./Sidebar.css";
import { X, Camera, UploadCloud, User, List, Image, Layout, Download } from "lucide-react";

import ExperienceSection from "./components/ExperienceSection";
import EducationSection from "./components/EducationSection";
import CertificationsSection from "./components/CertificationsSection";
import SkillsSection from "./components/SkillsSection";
import LanguagesSection from "./components/LanguagesSection";

/**
 Props expected from parent:
 - formData, setFormData, handleChange
 - openExperienceModal, openEducationModal, openCertModal, openSkillModal, openLanguageModal
 - onEditItem, onRemoveItem
 - template, setTemplate, isFinalView, toggleFinalView
 - handleSubmit, handleSetPhoto, handleImportResume
 - (optional) parent-controlled drawer props isOpen/onOpen/onClose
 - (optional) parent-controlled activePanel / setActivePanel
*/

export default function Sidebar(props) {
    const {
        formData,
        setFormData,
        handleChange,
        openExperienceModal,
        openEducationModal,
        openCertModal,
        openSkillModal,
        openLanguageModal,
        onEditItem,
        onRemoveItem,
        template,
        setTemplate,
        isFinalView,
        toggleFinalView,
        handleSubmit,
        loading,                 // ✅ ADD THIS
        handleSetPhoto,
        handleImportResume,
        isOpen: parentIsOpen,
        onOpen: parentOnOpen,
        onClose: parentOnClose,
    } = props;

    // ---------- Drawer control + active panel ----------
    // default open on desktop so the panel is visible (fixes "desktop not visible")
    const [localOpen, setLocalOpen] = React.useState(() =>
        typeof window !== "undefined" ? window.innerWidth >= 900 : true
    );
    const [localActivePanel, setLocalActivePanel] = React.useState("personal");

    // parent-controlled override if provided
    const open = typeof parentIsOpen === "boolean" ? parentIsOpen : localOpen;
    const setOpen = (v) => {
        if (typeof parentOnOpen === "function" && typeof parentOnClose === "function") {
            v ? parentOnOpen() : parentOnClose();
        } else {
            setLocalOpen(v);
        }
    };

    // active panel: prefer parent prop if provided, otherwise local state
    const activePanel = typeof props.activePanel === "string" ? props.activePanel : localActivePanel;
    const setActivePanel = typeof props.setActivePanel === "function" ? props.setActivePanel : setLocalActivePanel;

    // ---------- left offset / z-index fix ----------
    // compute left offset from CSS variables so panel always sits to the right of the icon bar
    const [panelLeftStyle, setPanelLeftStyle] = React.useState({});
    const calcLeft = () => {
        try {
            const root = getComputedStyle(document.documentElement);
            // CSS var values like "48px" or "56px"
            const iconbarW = root.getPropertyValue("--iconbar-w") || "48px";
            const panelGap = root.getPropertyValue("--panel-gap") || "12px";
            // We also account for the left spacing (12px default)
            const leftBase = 12;
            const parsePx = (v) => parseFloat(v.replace("px", "").trim()) || 0;
            const leftVal = leftBase + parsePx(iconbarW) + parsePx(panelGap);
            // Ensure the panel does not overlap icon bar by applying this left value
            setPanelLeftStyle({ left: `${leftVal}px`, zIndex: 3300, position: "fixed" });
        } catch (err) {
            // fallback: use CSS calc (will still work if CSS vars present)
            setPanelLeftStyle({ left: `calc(12px + var(--iconbar-w) + var(--panel-gap))`, zIndex: 3300, position: "fixed" });
        }
    };

    useEffect(() => {
        calcLeft();
        function onResize() {
            // on desktop, keep panel open by default; mobile closes
            if (window.innerWidth >= 900) {
                // keep open on desktop
                if (!open) setOpen(true);
            } else {
                // mobile: close by default
                if (open) setOpen(false);
            }
            calcLeft();
        }
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- file inputs ----------
    const photoRef = useRef(null);
    const jsonRef = useRef(null);

    const triggerPhoto = () => photoRef.current && photoRef.current.click();
    const triggerJson = () => jsonRef.current && jsonRef.current.click();

    const onPhotoChange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (handleSetPhoto) handleSetPhoto(reader.result);
        };
        reader.readAsDataURL(f);
        e.target.value = null;
    };

    const onJsonChange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                if (handleImportResume) handleImportResume(parsed);
            } catch (err) {
                console.error("Import JSON failed:", err);
                alert("Invalid JSON file");
            }
        };
        reader.readAsText(f, "utf8");
        e.target.value = null;
    };

    // ---------- form helpers ----------
    const onPersonalChange = (e) => {
        if (typeof handleChange === "function") return handleChange(e);
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const removeItem = (type, index) => {
        if (typeof onRemoveItem === "function") return onRemoveItem(type, index);
        const updated = [...(formData[type] || [])].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [type]: updated }));
    };

    // ---------- renderers ----------
    const renderPersonal = () => (
        <div className="panel-section">
            <h3>👤 Personal Details</h3>
            <div className="panel-card">
                {["name", "title", "email", "phone", "location", "website"].map(f => (
                    <input
                        key={f}
                        name={f}
                        placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                        value={formData[f] || ""}
                        onChange={onPersonalChange}
                    />
                ))}
                <label style={{ marginTop: 8, marginBottom: 6, display: "block", fontSize: 13, color: "#666" }}>Summary</label>
                <textarea name="summary" placeholder="Write your professional summary..." value={formData.summary || ""} onChange={onPersonalChange} />
            </div>
        </div>
    );

    const renderSections = () => (
        <div className="panel-section">
            <h3>📚 Sections</h3>
            <div className="panel-card">
                <ExperienceSection
                    experience={formData.experience || []}
                    onAdd={() => openExperienceModal()}
                    onEdit={(index) => onEditItem?.("experience", index)}
                    onRemove={(index) => removeItem("experience", index)}
                />

                <EducationSection
                    education={formData.education || []}
                    onAdd={() => openEducationModal()}
                    onEdit={(index) => onEditItem?.("education", index)}
                    onRemove={(index) => removeItem("education", index)}
                />

                <CertificationsSection
                    certifications={formData.certifications || []}
                    onAdd={() => openCertModal()}
                    onEdit={(index) => onEditItem?.("certifications", index)}
                    onRemove={(index) => removeItem("certifications", index)}
                />

                <SkillsSection
                    skills={formData.skills || []}
                    onAdd={() => openSkillModal()}
                    onEdit={(index) => onEditItem?.("skills", index)}
                    onRemove={(index) => removeItem("skills", index)}
                />

                <LanguagesSection
                    languages={formData.languages || []}
                    onAdd={() => openLanguageModal()}
                    onEdit={(index) => onEditItem?.("languages", index)}
                    onRemove={(index) => removeItem("languages", index)}
                />

            </div>
        </div>
    );

    const renderPhoto = () => (
        <div className="panel-section">
            <h3>🖼 Photo & Import</h3>
            <div className="panel-card">
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-upload" onClick={triggerPhoto}><Camera size={16} /> Upload Photo</button>
                    <button className="btn-upload" onClick={triggerJson}><UploadCloud size={16} /> Import JSON</button>
                </div>
                <input ref={photoRef} type="file" accept="image/*" onChange={onPhotoChange} style={{ display: "none" }} />
                <input ref={jsonRef} type="file" accept="application/json" onChange={onJsonChange} style={{ display: "none" }} />
                <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>Uploaded photo will appear in preview & PDF.</div>
            </div>
        </div>
    );

    const renderTemplates = () => (
        <div className="panel-section">
            <h3>🎨 Select Resume Style</h3>
            <div className="panel-card">
                <button className={`template-btn ${template === "modern" ? "active" : ""}`} onClick={() => setTemplate("modern")}>💼 Modern (Experienced)</button>
                <button className={`template-btn ${template === "classic" ? "active" : ""}`} onClick={() => setTemplate("classic")}>📘 Classic (Fresher)</button>
                <button className={`template-btn ${template === "hybrid" ? "active" : ""}`} onClick={() => setTemplate("hybrid")}>🧩 Hybrid (Two Column)</button>
            </div>
            <div className="panel-section" style={{ marginTop: 10 }}>
                <h3>🔍 Preview Mode</h3>
                <div className="panel-card">
                    <button className="toggle-btn" onClick={toggleFinalView}>
                        {isFinalView ? "Switch to Edit View" : "Preview Final Resume"}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderGenerate = () => (
        <div className="panel-section">
            <h3>⬇️ Generate</h3>
            <div className="panel-card">
                <button
                    className="generate-btn"
                    onClick={handleSubmit}
                    disabled={loading}                 // 🔒 disable during generation
                >
                    {loading ? "⏳ Generating..." : "✅ Generate Resume"}
                </button>

                <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
                    {loading
                        ? "Please wait while your resume is being generated…"
                        : "Your resume will download automatically."}
                </div>
            </div>
        </div>
    );


    const renderActivePanel = () => {
        switch (activePanel) {
            case "personal": return renderPersonal();
            case "sections": return renderSections();
            case "photo": return renderPhoto();
            case "templates": return renderTemplates();
            case "generate": return renderGenerate();
            default: return null;
        }
    };

    // When an icon is clicked open the panel (desktop and mobile)
    const showPanel = (panel) => {
        setActivePanel(panel);
        // always open the panel UI on click (desktop & mobile)
        setOpen(true);
        // ensure scroller at top when opening a different panel:
        requestAnimationFrame(() => {
            const el = document.querySelector('.panel-shell .section-list');
            if (el) el.scrollTop = 0;
        });
    };

    return (
        <>
            {/* vertical icon bar */}
            <div className="icon-bar" role="navigation" aria-label="Resume builder navigation">
                <div className="spacer" />
                <button className={`icon-btn ${activePanel === "personal" ? "active" : ""}`} onClick={() => showPanel("personal")} title="Personal">
                    <User size={18} />
                </button>

                <button className={`icon-btn ${activePanel === "sections" ? "active" : ""}`} onClick={() => showPanel("sections")} title="Sections">
                    <List size={18} />
                </button>

                <button className={`icon-btn ${activePanel === "photo" ? "active" : ""}`} onClick={() => showPanel("photo")} title="Photo & Import">
                    <Image size={18} />
                </button>

                <button className={`icon-btn ${activePanel === "templates" ? "active" : ""}`} onClick={() => showPanel("templates")} title="Templates">
                    <Layout size={18} />
                </button>

                <button className={`icon-btn ${activePanel === "generate" ? "active" : ""}`} onClick={() => showPanel("generate")} title="Generate">
                    <Download size={18} />
                </button>
            </div>

            {/* overlay for mobile small screens */}
            <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />

            {/* panel shell - desktop: appears to right of icon-bar; mobile: slide-over */}
            <aside
                className={`panel-shell ${(!activePanel && typeof window !== "undefined" && window.innerWidth >= 900) ? "hidden" : ""} ${open ? "open" : ""}`}
                aria-hidden={!activePanel && typeof window !== "undefined" && window.innerWidth < 900}
                style={panelLeftStyle}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0 }}>
                        {activePanel === "personal" && "Personal Details"}
                        {activePanel === "sections" && "Sections"}
                        {activePanel === "photo" && "Photo & Import"}
                        {activePanel === "templates" && "Templates"}
                        {activePanel === "generate" && "Generate"}
                    </h3>
                    <button className="icon-btn" onClick={() => { if (typeof window !== "undefined" && window.innerWidth < 900) setOpen(false); else setActivePanel(null); }}>
                        <X size={16} />
                    </button>
                </div>

                <div className="panel-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    {/* optional header row - kept for layout */}
                </div>

                <div className="panel-body">
                    {renderActivePanel()}
                </div>
            </aside>
        </>
    );
}
