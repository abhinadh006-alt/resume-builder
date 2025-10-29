import React from "react";
import "./CertificationsCard.css";

export default function CertificationsCard({ data, onEdit, onDelete }) {
    return (
        <div className="cert-card">
            <div className="cert-info">
                <strong className="cert-title">{data.name || "Certification Title"}</strong>
                <div className="cert-details">
                    <span>{data.organization || "Organization"}</span>
                    {data.issueDate && <span> • {data.issueDate}</span>}
                </div>
                {data.credentialId && (
                    <div className="cert-id">ID/URL: {data.credentialId}</div>
                )}
                {data.description && (
                    <p className="cert-desc">{data.description}</p>
                )}
            </div>

            <div className="cert-actions">
                <button className="edit-btn" onClick={onEdit}>✏️</button>
                <button className="delete-btn" onClick={onDelete}>🗑️</button>
            </div>
        </div>
    );
}
