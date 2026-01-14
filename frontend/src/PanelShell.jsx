// src/PanelShell.jsx
import React from "react";
import "./Sidebar.css";

if (window.innerWidth > 900) return null;

export default function PanelShell({ activePanel, onClose, children }) {
    // children is an object mapping panel id => react node
    if (!activePanel || !onClose) return null;


    return (
        <>
            <div
                className="sidebar-overlay"
                onClick={onClose}
                aria-hidden
            />

            <aside className="mobile-panel open" role="dialog" aria-modal="true">
                <div className="mobile-panel-header">
                    <button className="mobile-panel-close" onClick={onClose} aria-label="Close panel">✕</button>
                    <div className="mobile-panel-title">{activePanel}</div>
                </div>

                <div
                    className="sidebar-overlay open"
                    onClick={onClose}
                    aria-hidden
                />


                <div className="mobile-panel-body">
                    {children[activePanel] || null}
                </div>
            </aside>
        </>
    );
}
