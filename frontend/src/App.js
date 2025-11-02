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
  // 🌱 Auto-fetch and validate Telegram daily key once
  useEffect(() => {
    async function fetchAuthKey() {
      try {
        const params = new URLSearchParams(window.location.search);
        const chatId = params.get("chatId");
        const urlAuth = params.get("auth"); // 👈 New: Telegram-provided key
        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

        // ✅ 1. If Telegram URL includes auth, trust and store it
        if (urlAuth && chatId) {
          localStorage.setItem("RB_AUTH", urlAuth);
          localStorage.setItem("RB_CHAT", chatId);
          console.log("✅ Using auth from Telegram link:", urlAuth);
          setValidAccess(true);
          setLoading(false);
          return;
        }

        // ✅ 2. If existing stored key is still valid for today
        const existingKey = localStorage.getItem("RB_AUTH");
        if (existingKey && existingKey.includes(today)) {
          console.log("✅ Using existing valid key:", existingKey);
          setValidAccess(true);
          setLoading(false);
          return;
        }

        // ✅ 3. If no auth in URL, fetch a new one if chatId available
        if (chatId) {
          console.log("🗝 Fetching new key for chatId:", chatId);
          const res = await fetch(
            `https://resume-builder-jv01.onrender.com/api/daily-key?chatId=${encodeURIComponent(chatId)}`
          );

          if (!res.ok) throw new Error("Failed to fetch daily key");

          const data = await res.json();
          if (data.key) {
            localStorage.setItem("RB_AUTH", data.key);
            localStorage.setItem("RB_CHAT", chatId);
            console.log("✅ Stored new key:", data.key);
            setValidAccess(true);
          } else {
            console.error("❌ No key returned from API");
            setValidAccess(false);
          }
          setLoading(false);
          return;
        }

        // ❌ 4. No auth or chatId → show access denied
        console.warn("⚠️ No chatId or auth in URL — restricted access");
        setValidAccess(false);
        setLoading(false);
      } catch (err) {
        console.error("❌ Fetch daily key failed:", err);
        setValidAccess(false);
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
