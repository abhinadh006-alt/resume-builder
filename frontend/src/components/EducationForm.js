import React, { useState, useEffect } from "react";
import MonthYearPicker from "./MonthYearPicker";
import { format } from "date-fns";
import "./EducationForm.css";
import useBulletTextarea from "../hooks/useBulletTextarea";

export default function EducationForm({ onSave, onCancel, initialData }) {
    const [education, setEducation] = useState({
        degree: "",
        school: "",
        startDate: null,  // ✅ store as Date
        endDate: null,    // ✅ store as Date
        location: "",
        description: "",
        currentlyStudying: false,
    });

    // ✅ use bullet hook
    const { handleKeyDown, handleFocus } = useBulletTextarea();

    useEffect(() => {
        if (initialData) {
            setEducation({
                ...initialData,
                startDate: initialData.startDate
                    ? new Date(initialData.startDate)
                    : null,
                endDate:
                    initialData.endDate && initialData.endDate !== "Present"
                        ? new Date(initialData.endDate)
                        : null,
                currentlyStudying: initialData.endDate === "Present",
            });
        }
    }, [initialData]);

    const handleDateChange = (field, date) => {
        if (!date) return;
        setEducation((prev) => ({
            ...prev,
            [field]: date,
        }));
    };

    const handleCurrentlyStudying = (e) => {
        const checked = e.target.checked;
        setEducation((prev) => ({
            ...prev,
            currentlyStudying: checked,
            endDate: checked ? null : prev.endDate, // ✅ hide date when checked
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEducation({ ...education, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // ✅ Format for saving
        const formattedData = {
            ...education,
            startDate: education.startDate
                ? format(education.startDate, "MMM yyyy")
                : "",
            endDate: education.currentlyStudying
                ? "Present"
                : education.endDate
                    ? format(education.endDate, "MMM yyyy")
                    : "",
        };

        onSave(formattedData);

        // Reset after save
        setEducation({
            degree: "",
            school: "",
            startDate: null,
            endDate: null,
            location: "",
            description: "",
            currentlyStudying: false,
        });
    };

    return (
        <form className="experience-form" onSubmit={handleSubmit}>
            {/* === Degree & School === */}
            <div className="form-row">
                <div className="form-group">
                    <label>Degree</label>
                    <input
                        name="degree"
                        value={education.degree}
                        onChange={handleChange}
                        placeholder="e.g., Bachelor of Technology"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>School / University</label>
                    <input
                        name="school"
                        value={education.school}
                        onChange={handleChange}
                        placeholder="e.g., Anna University"
                        required
                    />
                </div>
            </div>

            {/* === Dates Section === */}
            <div className="form-group">
                <label>Dates</label>
                <div className="month-picker-row">
                    {/* Start Date */}
                    <div className="month-picker-col">
                        <label className="small-label">Start Date</label>
                        <MonthYearPicker
                            value={education.startDate}
                            onChange={(date) => handleDateChange("startDate", date)}
                        />
                    </div>

                    {/* End Date */}
                    <div className="month-picker-col">
                        <label className="small-label">End Date</label>
                        {!education.currentlyStudying && (
                            <MonthYearPicker
                                value={education.endDate}
                                onChange={(date) => handleDateChange("endDate", date)}
                            />
                        )}
                    </div>
                </div>

                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        checked={education.currentlyStudying}
                        onChange={handleCurrentlyStudying}
                    />
                    <label>Currently Studying Here</label>
                </div>
            </div>

            {/* === Location === */}
            <div className="form-group">
                <label>Location</label>
                <input
                    name="location"
                    value={education.location}
                    onChange={handleChange}
                    placeholder="e.g., Chennai, India"
                />
            </div>

            {/* === Description === */}
            <div className="form-group">
                <label>Description</label>
                <textarea
                    name="description"
                    value={education.description}
                    onChange={handleChange}
                    onKeyDown={(e) => handleBulletInput(e, (val) =>
                        setEducation((prev) => ({ ...prev, description: val }))
                    )}
                    rows="5"
                    placeholder="Add details like GPA, specialization, projects, etc."
                />

            </div>

            {/* === Buttons === */}
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
