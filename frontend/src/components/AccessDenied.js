import React from "react";

export default function AccessDenied() {
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
