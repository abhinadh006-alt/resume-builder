import React, { useState, useEffect } from "react";
import ResumeBuilder from "./ResumeBuilder";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "./api";

function App() {
  const [testMsg, setTestMsg] = useState("");
  const [validAccess, setValidAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🌱 Auto-fetch and validate Telegram daily key once
  useEffect(() => {
    async function fetchAuthKey() {
      try {
        const params = new URLSearchParams(window.location.search);
        const chatId = params.get("chatId");

        if (!chatId) {
          console.warn("⚠️ No chatId found in URL — likely opened directly");
          setValidAccess(false);
          setLoading(false);
          return;
        }

        const existingKey = localStorage.getItem("RB_AUTH");
        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

        // 🧠 If existing key already valid for today and includes this chatId
        if (existingKey && existingKey.includes(today) && existingKey.includes(chatId)) {
          console.log("✅ Using existing valid key:", existingKey);
          setValidAccess(true);
          setLoading(false);
          return;
        }

        // 🗝 Fetch a fresh daily key from backend
        console.log("🗝 Fetching new key for chatId:", chatId);
        const res = await fetch(
          `https://resume-builder-jv01.onrender.com/api/daily-key?chatId=${encodeURIComponent(chatId)}`
        );

        if (!res.ok) {
          console.error("❌ Failed to fetch daily key:", res.status);
          setValidAccess(false);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.key) {
          localStorage.setItem("RB_AUTH", data.key);
          localStorage.setItem("RB_CHAT", chatId);
          console.log("✅ Stored new key:", data.key);
          setValidAccess(true);
        } else {
          console.error("❌ No key returned:", data);
          setValidAccess(false);
        }
      } catch (err) {
        console.error("❌ Fetch daily key failed:", err);
        setValidAccess(false);
      } finally {
        setLoading(false);
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

  if (loading) return <div style={{ textAlign: "center", marginTop: "100px" }}>⏳ Loading secure session...</div>;

  if (!validAccess) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          color: "#333",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>⚠️ Access Expired or Invalid</h2>
        <p>Please access this page using your personal Telegram bot link.</p>
        <p style={{ fontSize: "0.9em", color: "#888" }}>
          (Open your Telegram bot → tap <b>Generate Resume</b>)
        </p>
      </div>
    );
  }

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
