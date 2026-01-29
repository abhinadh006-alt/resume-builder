import React, { useState, useEffect, useRef } from "react";
import "./PreviewZoomControl.css";

export default function PreviewZoomControl({ previewRef }) {
    const isMobile = window.innerWidth <= 768;

    // 🔥 Default zoom: mobile 40%, desktop 100%
    const [scale, setScale] = useState(isMobile ? 0.4 : 1);
    const initialized = useRef(false);

    const clamp = (v, a = 0.4, b = 1.4) => Math.max(a, Math.min(b, v));

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--preview-scale",
            clamp(scale).toFixed(3)
        );
    }, [scale]);

    useEffect(() => {
        function fitToViewport() {
            try {
                if (!previewRef?.current) return;

                // ⛔ Do NOT override user/default zoom after first run
                if (initialized.current) return;
                initialized.current = true;

                // Keep default zoom as-is (mobile 40%, desktop 100%)
                setScale(s => clamp(s));
            } catch {
                /* no-op */
            }
        }

        fitToViewport();
    }, [previewRef]);

    const zoomIn = () => setScale(s => clamp(s + 0.125));
    const zoomOut = () => setScale(s => clamp(s - 0.125));
    const reset = () => setScale(1);

    return (
        <div className="preview-zoom-controls" aria-hidden={false}>
            <button title="Zoom out" className="pz-btn" onClick={zoomOut}>−</button>
            <button title="Reset zoom" className="pz-btn pz-reset" onClick={reset}>
                {Math.round(scale * 100)}%
            </button>
            <button title="Zoom in" className="pz-btn" onClick={zoomIn}>+</button>
        </div>
    );
}
