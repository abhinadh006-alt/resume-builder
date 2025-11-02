import React from "react";

export default function AccessDenied() {
    const params = new URLSearchParams(window.location.search);
    const hasAuth = params.get("auth");
    const hasChat = params.get("chatId");
    const localAuth = localStorage.getItem("RB_AUTH");

    // If valid data already present, don’t block
    if ((hasAuth && hasChat) || localAuth) return null;

    return (
        <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#222",
            fontFamily: "Arial, sans-serif"
        }}>
            <h2>⚠️ Access Expired or Invalid</h2>
            <p>
                Please access this app using your personal Telegram bot link.
                <br />
                This ensures secure and private resume generation.
            </p>
            <p style={{ marginTop: "20px", fontSize: "0.9em", color: "#777" }}>
                (Tip: Open Telegram → your bot → tap “Generate Resume”)
            </p>
        </div>
    );
}
