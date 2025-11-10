import React, { useState } from "react";
import "./ResumeBuilder.css";

export default function ResumeBuilder() {
    const [language, setLanguage] = useState("English");

    const sections = [
        { title: "Summary", icon: "🧾", empty: "No Summary" },
        { title: "Experience", icon: "💼", empty: "No Experience" },
        { title: "Education", icon: "🎓", empty: "No Education" },
        { title: "Skills", icon: "⭐", empty: "No Skills" },
        { title: "Soft Skills", icon: "💖", empty: "No Soft Skills" },
        { title: "Languages", icon: "🌐", empty: "No Languages" },
        { title: "Projects", icon: "🧩", empty: "No Projects" },
        { title: "Certifications", icon: "🏅", empty: "No Certifications" },
        { title: "Organizations", icon: "🏢", empty: "No Organizations" },
        { title: "Custom", icon: "⚙️", empty: "No Custom" },
    ];

    return (
        <div className="resume-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                {/* Language Selector */}
                <section className="section language">
                    <h3>Language</h3>
                    <p>Change your resume language.</p>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option>English</option>
                        <option>Italian</option>
                        <option>French</option>
                        <option>German</option>
                    </select>
                </section>

                {/* Personal Details */}
                <section className="section">
                    <h3>Personal Details</h3>
                    <p>Add your contact & personal details.</p>

                    <label>Name</label>
                    <input placeholder="Enter your name" />
                    <label>Title</label>
                    <input placeholder="e.g., Safety Officer" />
                    <label>Email</label>
                    <input placeholder="Enter your email" />
                    <label>Phone</label>
                    <input placeholder="Enter your phone" />
                    <label>Location</label>
                    <input placeholder="Enter your location" />
                    <label>Website / Social Media</label>
                    <div className="input-with-button">
                        <input placeholder="Add a link" />
                        <button>＋</button>
                    </div>
                    <button className="secondary-btn">＋ Additional Information</button>
                </section>

                {/* Content Section */}
                <section className="section">
                    <h3>Content</h3>
                    <p>Add, modify, or drag to reorder your resume content.</p>

                    {sections.map((sec, i) => (
                        <div key={i} className="content-card">
                            <div className="card-title">
                                <span>{sec.icon}</span> {sec.title}
                            </div>
                            <div className="card-body">
                                <p>{sec.empty}</p>
                                <button className="plus-btn">add</button>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Import Section */}
                <section className="section">
                    <h3>Import</h3>
                    <p>Import your existing resume or your LinkedIn profile.</p>
                    <button className="import-btn">⬆ Import Resume / LinkedIn</button>
                    <small>Sign in to access these features</small>
                    <p className="issue-link">
                        Found an issue?{" "}
                        <a href="#" target="_blank" rel="noreferrer">
                            Report it here
                        </a>
                    </p>
                </section>
            </aside>

            {/* Right Panel */}
            <main className="main-panel">
                <h2>✨ Cover Letter / Summary</h2>
                <textarea
                    rows="8"
                    placeholder="Write your summary or cover letter..."
                ></textarea>
                <button className="generate-btn">Generate Resume</button>
            </main>
        </div>
    );
}
