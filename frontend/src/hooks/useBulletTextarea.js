import { useCallback } from "react";

export default function useBulletTextarea() {
    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const { selectionStart, selectionEnd, value } = e.target;

            // Insert a new line + bullet at cursor position
            const newValue =
                value.substring(0, selectionStart) +
                "\n• " +
                value.substring(selectionEnd);

            e.target.value = newValue;

            // Move cursor after the bullet
            const newPos = selectionStart + 3;
            e.target.setSelectionRange(newPos, newPos);

            const inputEvent = new Event("input", { bubbles: true });
            e.target.dispatchEvent(inputEvent);
        }
    }, []);

    // When user first types, ensure it starts with a bullet
    const handleFocus = useCallback((e) => {
        if (!e.target.value.startsWith("• ")) {
            e.target.value = "• " + e.target.value;
            const inputEvent = new Event("input", { bubbles: true });
            e.target.dispatchEvent(inputEvent);
        }
    }, []);

    return { handleKeyDown, handleFocus };
}
