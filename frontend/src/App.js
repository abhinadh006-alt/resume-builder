import React, { useState, useEffect } from "react";
import ResumeBuilder from "./ResumeBuilder";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "./api";

function App() {
  const [testMsg, setTestMsg] = useState("");

  // 🧩 Auto-fetch daily key once
  useEffect(() => {
    async function fetchAuthKey() {
      try {
        const res = await fetch("https://resume-builder-jv01.onrender.com/api/daily-key");
        const data = await res.json();
        if (data.key) {
          localStorage.setItem("RB_AUTH", data.key);
          console.log("✅ Daily key stored:", data.key);
        }
      } catch (err) {
        console.error("❌ Failed to fetch daily key:", err);
      }
    }
    fetchAuthKey();
  }, []);

  // 🧩 Test secure route button
  const testSecure = async () => {
    try {
      const res = await api.testSecure();
      setTestMsg("✅ Success: " + JSON.stringify(res));
    } catch (error) {
      const msg =
        error.response?.status === 401
          ? "❌ Unauthorized — your daily key expired."
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
