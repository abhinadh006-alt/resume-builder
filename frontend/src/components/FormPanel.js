import React from "react";
import SectionCard from "./SectionCard";


export default function FormPanel({ formData, onChange }) {
    const handleInput = (e) => onChange(e.target.name, e.target.value);

    return (
        <div className="form-panel">
            <h3 className="form-title">Personal Details</h3>
            <input placeholder="Name" name="name" value={formData.name} onChange={handleInput} />
            <input placeholder="Title" name="title" value={formData.title} onChange={handleInput} />
            <input placeholder="Email" name="email" value={formData.email} onChange={handleInput} />
            <input placeholder="Phone" name="phone" value={formData.phone} onChange={handleInput} />
            <input placeholder="Location" name="Location" value={formData.Location} onChange={handleInput} />
            <input placeholder="Website / Social Media" name="website" value={formData.website} onChange={handleInput} />

            <SectionCard title="Summary" field="summary" value={formData.summary} onChange={onChange} />
            <SectionCard title="Experience" field="experience" value={formData.experience} onChange={onChange} />
            <SectionCard title="Education" field="education" value={formData.education} onChange={onChange} />
            {/* ✅ New Certifications Section */}
            <SectionCard
                icon="🎓"
                title="Certifications"
                field="certifications"
                value={formData.certifications}
                onChange={onChange}
            />
            <SectionCard title="Skills" field="skills" value={formData.skills} onChange={onChange} />
            <SectionCard title="Languages" field="languages" value={formData.languages} onChange={onChange} />
        </div>
    );
}
