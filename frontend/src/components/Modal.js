import React from "react";
import "./Modal.css";

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* 🟢 Added wrapper class here */}
                <div className="modal-body modal-form-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
