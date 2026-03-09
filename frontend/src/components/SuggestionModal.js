import React, { useState, useEffect } from "react";
import "./Modal.css";

export default function SuggestionModal({ suggestions = [], onInsert, onClose }) {
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        document.body.classList.add("modal-open");
        return () => document.body.classList.remove("modal-open");
    }, []);

    const toggle = (text) => {
        setSelected((prev) =>
            prev.includes(text)
                ? prev.filter((t) => t !== text)
                : [...prev, text]
        );
    };

    const handleInsert = () => {
        onInsert(selected);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="modal-header">
                    <h3>Suggestions</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* BODY */}
                <div className="modal-body suggestion-body">
                    {suggestions.map((text, i) => (
                        <label key={i} className="suggestion-row">
                            <input
                                type="checkbox"
                                className="suggestion-checkbox"
                                onChange={() => toggle(text)}
                            />

                            <span className="suggestion-text">
                                {text}
                            </span>
                        </label>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>

                    <button className="save-btn" onClick={handleInsert}>
                        Insert Selected
                    </button>
                </div>
            </div>
        </div>
    );
}