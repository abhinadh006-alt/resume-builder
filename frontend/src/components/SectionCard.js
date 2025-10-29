import React from "react";
import "./SectionCard.css";

export default function SectionCard({ title, children, onAdd }) {
    return (
        <div className="section-card">
            <div className="section-header">
                <span>{title}</span>
                <button onClick={onAdd}>+</button>
            </div>
            <div className="section-content">{children}</div>
        </div>
    );
}
