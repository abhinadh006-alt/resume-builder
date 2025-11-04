// src/hooks/useBulletTextarea.js
import { useCallback } from "react";

export default function useBulletTextarea() {
    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const { selectionStart, selectionEnd, value } = e.target;
            const before = value.substring(0, selectionStart);
            const after = value.substring(selectionEnd);
            const newValue = `${before}\n• ${after}`;
            e.target.value = newValue;

            // trigger input event for React to update state
            const inputEvent = new Event("input", { bubbles: true });
            e.target.dispatchEvent(inputEvent);

            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = selectionStart + 3;
            }, 0);
        }
    }, []);

    const handleFocus = useCallback((e) => {
        if (e.target.value.trim() === "") {
            e.target.value = "• ";
            const inputEvent = new Event("input", { bubbles: true });
            e.target.dispatchEvent(inputEvent);
        }
    }, []);

    return { handleKeyDown, handleFocus };
}
