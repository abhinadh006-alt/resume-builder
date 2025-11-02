import React, { useState, useEffect } from "react";
import MonthYearPicker from "./MonthYearPicker";
import { format } from "date-fns";
import "./ExperienceForm.css";
import useBulletTextarea from "../hooks/useBulletTextarea"; // ✅ NEW import

export default function ExperienceForm({ onSave, onCancel, initialData }) {
    const [experience, setExperience] = useState({
        title: "",
        company: "",
        startDate: null,
        endDate: null,
        location: "",
        description: "",
        currentlyWorking: false,
    });

    // ✅ use bullet hook
    const { handleKeyDown, handleFocus } = useBulletTextarea();

    useEffect(() => {
        if (initialData) {
            setExperience({
                ...initialData,
                startDate: initialData.startDate
                    ? new Date(initialData.startDate)
                    : null,
                endDate:
                    initialData.endDate && initialData.endDate !== "Present"
                        ? new Date(initialData.endDate)
                        : null,
                currentlyWorking: initialData.endDate === "Present",
            });
        }
    }, [initialData]);

    const handleDateChange = (field, date) => {
        if (!date) return;
        setExperience((prev) => ({
            ...prev,
            [field]: date,
        }));
    };

    const handleCurrentlyWorking = (e) => {
        const checked = e.target.checked;
        setExperience((prev) => ({
            ...prev,
            currentlyWorking: checked,
            endDate: checked ? null : prev.endDate,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExperience({ ...experience, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedData = {
            ...experience,
            startDate: experience.startDate
                ? format(experience.startDate, "MMM yyyy")
                : "",
            endDate: experience.currentlyWorking
                ? "Present"
                : experience.endDate
                    ? format(experience.endDate, "MMM yyyy")
                    : "",
        };

        onSave(formattedData);

        // reset
        setExperience({
            title: "",
            company: "",
            startDate: null,
            endDate: null,
            location: "",
            description: "",
            currentlyWorking: false,
        });
    };

    return (
        <form className="experience-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label>Job Title</label>
                    <input
                        name="title"
                        value={experience.title}
                        onChange={handleChange}
                        placeholder="e.g., Safety Officer"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Company</label>
                    <input
                        name="company"
                        value={experience.company}
                        onChange={handleChange}
                        placeholder="e.g., Reliance Industries Ltd."
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Dates</label>
                <div className="month-picker-row">
                    <div className="month-picker-col">
                        <label className="small-label">Start Date</label>
                        <MonthYearPicker
                            value={experience.startDate}
                            onChange={(date) => handleDateChange("startDate", date)}
                        />
                    </div>

                    <div className="month-picker-col">
                        <label className="small-label">End Date</label>
                        {!experience.currentlyWorking && (
                            <MonthYearPicker
                                value={experience.endDate}
                                onChange={(date) => handleDateChange("endDate", date)}
                            />
                        )}
                    </div>
                </div>

                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        checked={experience.currentlyWorking}
                        onChange={handleCurrentlyWorking}
                    />
                    <label>Currently Working Here</label>
                </div>
            </div>

            <div className="form-group">
                <label>Location</label>
                <input
                    name="location"
                    value={experience.location}
                    onChange={handleChange}
                    placeholder="e.g., Mumbai, India"
                />
            </div>

            {/* ✅ BULLETED DESCRIPTION FIELD */}
            <div className="form-group">
                <label>Description</label>
                <textarea
                    name="description"
                    value={experience.description}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    rows="5"
                    placeholder="• Describe your responsibilities or achievements..."
                    style={{
                        whiteSpace: "pre-wrap",
                        fontFamily: "Arial, sans-serif",
                        lineHeight: "1.6",
                    }}
                />
            </div>

            <div className="form-buttons">
                <button type="button" className="cancel-btn" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="submit-btn">
                    Save
                </button>
            </div>
        </form>
    );
}
