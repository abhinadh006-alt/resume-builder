import React, { useState, useEffect, useRef } from "react";
import "./PreviewZoomControl.css";

export default function PreviewZoomControl({ previewRef }) {
    const [scale, setScale] = useState(1);
    const initialized = useRef(false);

    const clamp = (v, a = 0.4, b = 1.4) => Math.max(a, Math.min(b, v));

    const setZoom = (value) => {
        document.documentElement.style.setProperty(
            "--preview-zoom",
            value / 100
        );
    };


    useEffect(() => {
        document.documentElement.style.setProperty("--preview-scale", clamp(scale).toFixed(3));
    }, [scale]);

    useEffect(() => {
        function fitToViewport() {
            try {
                if (!previewRef || !previewRef.current) return;
                const el = previewRef.current;
                // natural width of the sheet (the width we target in CSS; fallback to offsetWidth)
                const naturalWidth = el.offsetWidth || el.scrollWidth || el.clientWidth || 794;
                // available area for preview: window width minus iconbar + sidebar + gaps
                const available = Math.max(window.innerWidth - (56 + 320) - 48 /* extra gutters */, 320);
                // compute scale so preview fits inside viewport area, clamp to sensible range
                const desired = available / Math.max(naturalWidth, 1);
                setScale(clamp(Math.min(desired, 1)));
            } catch (err) {
                // ignore
            }
        }


        fitToViewport();
        window.addEventListener("resize", fitToViewport);
        return () => window.removeEventListener("resize", fitToViewport);
    }, [previewRef]);

    const zoomIn = () => setScale(s => clamp(s + 0.1));
    const zoomOut = () => setScale(s => clamp(s - 0.1));
    const reset = () => setScale(1);

    return (
        <div className="preview-zoom-controls" aria-hidden={false}>
            <button title="Zoom out" className="pz-btn" onClick={zoomOut}>−</button>
            <button title="Reset zoom" className="pz-btn pz-reset" onClick={reset}>100%</button>
            <button title="Zoom in" className="pz-btn" onClick={zoomIn}>+</button>
        </div>
    );
}
