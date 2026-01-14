// src/App.js
import React, { useState, useEffect, useRef } from "react";
import ResumeBuilder from "./ResumeBuilder";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "./api";
import AppHeader from "./components/AppHeader";

function App() {
  const [testMsg, setTestMsg] = useState("");
  const [validAccess, setValidAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // prevents state update after unmount
  const mountedRef = useRef(true);

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  useEffect(() => {
    mountedRef.current = true;

    // 🔐 FAILSAFE — never allow infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mountedRef.current) {
        console.warn("⏱ Auth check timeout — forcing UI");
        setValidAccess(false);
        setLoading(false);
      }
    }, 5000);

    async function fetchAuthKey() {
      try {
        const params = new URLSearchParams(window.location.search);
        const chatId = params.get("chatId");
        const urlAuth = params.get("auth");
        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

        // 🧩 Local testing bypass
        if (isLocalhost) {
          console.log("🧩 Localhost detected — skipping Telegram auth");
          if (!mountedRef.current) return;
          setValidAccess(true);
          return;
        }

        // 1️⃣ Telegram auth from URL
        if (urlAuth && chatId) {
          localStorage.setItem("RB_AUTH", urlAuth);
          localStorage.setItem("RB_CHAT", chatId);
          console.log("✅ Using auth from Telegram link");
          if (!mountedRef.current) return;
          setValidAccess(true);
          return;
        }

        // 2️⃣ Existing valid daily key
        const existingKey = localStorage.getItem("RB_AUTH");
        if (existingKey && existingKey.includes(today)) {
          console.log("✅ Using cached daily key");
          if (!mountedRef.current) return;
          setValidAccess(true);
          return;
        }

        // 3️⃣ Fetch new daily key
        if (chatId) {
          console.log("🗝 Fetching new daily key");
          const res = await fetch(
            `https://resume-builder-jv01.onrender.com/api/daily-key?chatId=${encodeURIComponent(
              chatId
            )}`,
            { cache: "no-store" }
          );

          if (!res.ok) throw new Error("Daily key request failed");

          const data = await res.json();
          if (data?.key) {
            localStorage.setItem("RB_AUTH", data.key);
            localStorage.setItem("RB_CHAT", chatId);
            console.log("✅ New daily key stored");
            if (!mountedRef.current) return;
            setValidAccess(true);
            return;
          }

          console.warn("❌ No key returned from API");
          if (!mountedRef.current) return;
          setValidAccess(false);
          return;
        }

        // 4️⃣ No auth → restricted
        console.warn("⚠️ Missing chatId/auth — restricted");
        if (!mountedRef.current) return;
        setValidAccess(false);
      } catch (err) {
        console.error("❌ Auth error:", err);
        if (!mountedRef.current) return;
        setValidAccess(false);
      } finally {
        // 🔥 THIS IS THE KEY FIX
        if (mountedRef.current) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    }

    fetchAuthKey();

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimeout);
    };
  }, [isLocalhost]);

  // 🔐 Secure route test
  const testSecure = async () => {
    try {
      const res = await api.testSecure();
      setTestMsg("✅ Success: " + JSON.stringify(res));
    } catch (error) {
      const msg =
        error.response?.status === 401
          ? "❌ Unauthorized — invalid or expired Telegram key."
          : "❌ " + (error.message || String(error));
      setTestMsg(msg);
    }
  };

  // ⏳ LOADING
  if (loading) {
    return (
      <>
        <AppHeader />
        <div style={{ textAlign: "center", marginTop: "120px" }}>
          ⏳ Loading secure session...
        </div>
      </>
    );
  }
  // 🚫 ACCESS DENIED (debug-friendly)
  if (!validAccess) {
    return (
      <div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={testSecure}>🔐 Test Secure Access</button>
          <p>{testMsg}</p>
        </div>

        <div style={{ border: "2px dashed red", margin: 20, padding: 20 }}>
          <h3>Debug: ResumeBuilder below</h3>
          <ResumeBuilder />
          <div style={{ marginTop: 10, color: "#666" }}>
            If builder does not appear, check DevTools → Console.
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  // ✅ AUTHORIZED VIEW
  return (
    <div>
      <AppHeader />
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
