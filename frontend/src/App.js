import React, { useState, useEffect } from "react";
import ResumeBuilder from "./ResumeBuilder";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "./api";

function App() {
  const [testMsg, setTestMsg] = useState("");

  // 🌱 Auto-fetch Telegram daily key once

  useEffect(() => {
    async function fetchAuthKey() {
      try {
        const params = new URLSearchParams(window.location.search);
        const chatId = params.get("chatId");

        if (!chatId) {
          console.warn("⚠️ No chatId found in URL");
          return;
        }

        const existingKey = localStorage.getItem("RB_AUTH");
        if (existingKey && existingKey.includes(chatId)) {
          console.log("✅ Using existing key:", existingKey);
          return;
        }

        // ✅ Corrected line — now includes chatId
        const res = await fetch(
          `https://resume-builder-jv01.onrender.com/api/daily-key?chatId=${encodeURIComponent(chatId)}`
        );

        if (!res.ok) {
          console.error("❌ Failed to fetch daily key:", res.status);
          return;
        }

        const data = await res.json();
        if (data.key) {
          localStorage.setItem("RB_AUTH", data.key);
          localStorage.setItem("RB_CHAT", chatId);
          console.log("✅ Daily key stored:", data.key);
        } else {
          console.error("❌ No key returned:", data);
        }
      } catch (err) {
        console.error("❌ Fetch daily key failed:", err);
      }
    }

    fetchAuthKey();
  }, []);


  // 🔐 Test secure route button
  const testSecure = async () => {
    try {
      const res = await api.testSecure();
      setTestMsg("✅ Success: " + JSON.stringify(res));
    } catch (error) {
      const msg =
        error.response?.status === 401
          ? "❌ Unauthorized — invalid or expired Telegram key."
          : "❌ " + error.message;
      setTestMsg(msg);
    }
  };

  return (
    <div>
      <ResumeBuilder />
      <ToastContainer position="top-right" autoClose={3000} />
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={testSecure}>🔐 Test Secure Access</button>
        <p>{testMsg}</p>
      </div>
    </div>
  );
}

export default App;
