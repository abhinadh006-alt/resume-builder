// src/components/Modal.js
import React, { useEffect, useRef } from "react";
import "./Modal.css";

/**
 * Modal component
 *
 * Props:
 *  - isOpen (bool)
 *  - onClose (func) : called when modal should close (backdrop click, ESC, or other modal opened)
 *  - title (string)
 *  - children
 *
 * Behavior:
 *  - Adds body.modal-open while mounted to prevent background scroll
 *  - Closes on backdrop click (click outside modal content)
 *  - Closes on ESC key
 *  - Dispatches a global 'modal-open' custom event with an id when mounted; other modals will auto-close
 *  - Focuses the close button for accessibility
 */
export default function Modal({ isOpen, onClose, title, children }) {
    const overlayRef = useRef(null);
    const closeBtnRef = useRef(null);
    // stable id for this modal instance
    const idRef = useRef(`modal-${Math.random().toString(36).slice(2, 9)}`);

    useEffect(() => {
        if (!isOpen) return;

        // 1) mark body as modal-open to prevent scrolling
        document.body.classList.add("modal-open");

        // 2) focus close button (keyboard accessibility)
        if (closeBtnRef.current) {
            // small timeout to ensure element is mounted
            setTimeout(() => {
                try {
                    closeBtnRef.current.focus({ preventScroll: true });
                } catch (e) { }
            }, 10);
        }

        // 3) ESC key handler
        const onKey = (ev) => {
            if (ev.key === "Escape" || ev.key === "Esc") {
                ev.preventDefault();
                onClose?.();
            }
        };
        window.addEventListener("keydown", onKey);

        // 4) Listen for other modals opening: auto-close if another modal opens
        const onOtherModalOpen = (ev) => {
            try {
                const otherId = ev?.detail?.id;
                if (!otherId) return;
                // if some other modal opened (different id), close this modal
                if (otherId !== idRef.current) {
                    onClose?.();
                }
            } catch (err) {
                // ignore
            }
        };
        window.addEventListener("modal-open", onOtherModalOpen);

        // 5) announce this modal to others
        const evt = new CustomEvent("modal-open", { detail: { id: idRef.current } });
        window.dispatchEvent(evt);

        return () => {
            // cleanup
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("modal-open", onOtherModalOpen);
            document.body.classList.remove("modal-open");
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // click on backdrop closes modal, but clicks inside content do not
    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) {
            onClose?.();
        }
    };

    return (
        <div
            ref={overlayRef}
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={title || "Dialog"}
            onMouseDown={handleOverlayClick} // mouseDown so mobile taps close quickly
        >
            <div
                className="modal-content"
                // stop propagation of mouse events from content so overlay click doesn't trigger
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button
                        ref={closeBtnRef}
                        aria-label="Close modal"
                        className="close-btn"
                        onClick={() => onClose?.()}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body modal-form-body">{children}</div>

                {/* Optional footer slot: if consumers want footer they can include it as a child */}
            </div>
        </div>
    );
}
