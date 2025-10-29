import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import "./MonthYearPicker.css";

export default function MonthYearPicker({ value, onChange, disabled }) {
    const now = new Date();
    const [selectedDate, setSelectedDate] = useState(value || now);
    const [year, setYear] = useState(value ? value.getFullYear() : now.getFullYear());

    useEffect(() => {
        if (value instanceof Date && !isNaN(value)) {
            setSelectedDate(value);
            setYear(value.getFullYear());
        }
    }, [value]);

    const months = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    const handleMonthClick = (index) => {
        if (disabled) return;
        const newDate = new Date(year, index);
        setSelectedDate(newDate);
        onChange?.(newDate); // only triggers on month select
    };

    const handlePrevYear = () => setYear((prev) => prev - 1);
    const handleNextYear = () => setYear((prev) => prev + 1);

    return (
        <div
            className={`month-year-container ${disabled ? "disabled" : ""}`}
            style={{ opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? "none" : "auto" }}
        >
            <div className="month-year-header">
                <button type="button" onClick={handlePrevYear}>
                    &lt;
                </button>
                <span>{year}</span>
                <button type="button" onClick={handleNextYear}>
                    &gt;
                </button>
            </div>

            <div className="months-grid">
                {months.map((month, index) => {
                    const isSelected =
                        selectedDate.getMonth() === index && selectedDate.getFullYear() === year;
                    return (
                        <div
                            key={month}
                            className={`month-cell ${isSelected ? "selected" : ""}`}
                            onClick={() => handleMonthClick(index)}
                        >
                            {month}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
