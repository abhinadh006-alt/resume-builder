// IconBar.jsx
import React from "react";
import "./IconBar.css";
import { User, List, Camera, LayoutGrid, Download } from "lucide-react";

/**
 * Props:
 * - active (string) current active panel name
 * - onOpenPanel(name) called when user clicks an icon
 * - openSidebar() optional: open the full sidebar (for mobile)
 * - sidebarOpen boolean (optional)
 */
export default function IconBar({ active, onOpenPanel, openSidebar, sidebarOpen }) {
    const handleClick = (name) => {
        if (typeof onOpenPanel === "function") onOpenPanel(name);

        // on mobile, also open the drawer if provided
        if (typeof openSidebar === "function" && window.innerWidth < 900) {
            openSidebar(true);
        }
    };

    return (
        <div className="iconbar" role="toolbar" aria-orientation="vertical">
            <button
                className={`icon-btn ${active === "personal" ? "active" : ""}`}
                title="Personal details"
                onClick={() => handleClick("personal")}
            >
                <User />
            </button>

            <button
                className={`icon-btn ${active === "sections" ? "active" : ""}`}
                title="Sections"
                onClick={() => handleClick("sections")}
            >
                <List />
            </button>

            <button
                className={`icon-btn ${active === "photo" ? "active" : ""}`}
                title="Photo & Import"
                onClick={() => handleClick("photo")}
            >
                <Camera />
            </button>

            <button
                className={`icon-btn ${active === "templates" ? "active" : ""}`}
                title="Templates"
                onClick={() => handleClick("templates")}
            >
                <LayoutGrid />
            </button>

            <button
                className={`icon-btn ${active === "generate" ? "active" : ""}`}
                title="Generate / Download"
                onClick={() => handleClick("generate")}
            >
                <Download />
            </button>
        </div>
    );
}
