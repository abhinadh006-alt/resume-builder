import React from "react";
import { User, List, Type, Settings, Download } from "lucide-react";

export default function Sidebar() {
    const icons = [
        { icon: <User />, title: "Profile" },
        { icon: <List />, title: "Sections" },
        { icon: <Type />, title: "Style" },
        { icon: <Settings />, title: "Settings" },
        { icon: <Download />, title: "Download" },
    ];

    return (
        <div className="sidebar">
            {icons.map((item, idx) => (
                <button key={idx} className="sidebar-btn" title={item.title}>
                    {item.icon}
                </button>
            ))}
        </div>
    );
}
