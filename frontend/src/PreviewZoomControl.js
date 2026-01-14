// src/PreviewZoomControl.js
import React, { useEffect, useState } from "react";
import "./PreviewZoomControl.css";

export default function PreviewZoomControl({ previewRef }) {
    // defaultScale: 1 (100%) on desktop, 0.5 (50%) on mobile
    const getDefaultScale = () => (window.innerWidth < 900 ? 0.4 : 1);

    const [defaultScale] = useState(getDefaultScale());
    const [scale, setScale] = useState(defaultScale);

    // apply scale to .resume-page element via CSS variable
    const applyScale = (s) => {
        const clamped = Math.max(0.4, Math.min(1.8, s)); // clamp to safe range
        setScale(clamped);
        // prefer provided previewRef if available
        const target = (previewRef && previewRef.current) || document.querySelector(".resume-page") || document.documentElement;
        if (target) target.style.setProperty("--preview-scale", clamped.toString());
    };

    const setZoom = (value) => {
        const scale = Math.min(2, Math.max(0.5, value));
        document.documentElement.style.setProperty(
            "--preview-scale",
            scale
        );
    };


    useEffect(() => {
        // set initial scale (use defaultScale computed at mount)
        applyScale(defaultScale);

        // update default scale on orientation/resize and keep current scale unchanged
        const handleResize = () => {
            const newDefault = window.innerWidth < 900 ? 0.5 : 1;
            // if user hasn't modified scale (scale === previous default), update to new default
            // otherwise keep user's custom scale
            if (Math.abs(scale - defaultScale) < 0.0001) {
                applyScale(newDefault);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once

    const increase = () => applyScale(scale + 0.1);
    const decrease = () => applyScale(scale - 0.1);
    const center = () => applyScale(defaultScale);

    return (
        <div className="preview-zoom-control" aria-hidden="false">
            <button className="zoom-btn minus" onClick={decrease} aria-label="Decrease zoom">–</button>
            <button className="zoom-btn center" onClick={center} aria-label="Reset to default">
                {Math.round(scale * 100)}%
            </button>
            <button className="zoom-btn plus" onClick={increase} aria-label="Increase zoom">+</button>
        </div>
    );
}
