import { useState, useEffect } from "react";
import { api } from "./api";
import ResumeBuilder from "./ResumeBuilder";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [template, setTemplate] = useState("modern");
  const [chatId, setChatId] = useState(null);
  const [auth, setAuth] = useState(null);
  const [formData, setFormData] = useState({});
  const [downloadLink, setDownloadLink] = useState("");
  const [testMsg, setTestMsg] = useState("");
  const [loading, setLoading] = useState(false);

  /* ==============================
     1️⃣ Auto-fetch daily key
  ============================== */
  useEffect(() => {
    async function fetchAuthKey() {
      try {
        const res = await fetch(
          "https://resume-builder-worker.safetycrewindiaresumebuilder.workers.dev/api/daily-key"
        );
        const data = await res.json();
        if (data.key) {
          localStorage.setItem("RB_AUTH", data.key);
          setAuth(data.key);
          console.log("✅ Daily access key stored:", data.key);
        }
      } catch (err) {
        console.error("❌ Failed to fetch daily key:", err);
      }
    }
    fetchAuthKey();
  }, []);

  /* ==============================
     2️⃣ Extract Telegram query params
  ============================== */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateParam = params.get("template");
    const chatParam = params.get("chatId");
    const authParam = params.get("auth");

    if (templateParam) setTemplate(templateParam);
    if (chatParam) setChatId(chatParam);
    if (authParam) {
      setAuth(authParam);
      localStorage.setItem("RB_AUTH", authParam);
    }
  }, []);

  /* ==============================
     3️⃣ Handle form data changes
  ============================== */
  const handleFormChange = (updatedData) => {
    setFormData(updatedData);
  };

  /* ==============================
     4️⃣ Generate Resume (PDF)
  ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const toastId = toast.loading(`Generating ${template} resume...`);

    try {
      const token = localStorage.getItem("RB_AUTH");
      if (!token) {
        toast.error("Authorization key missing. Please refresh and retry.", {
          id: toastId,
        });
        return;
      }

      console.log("🧾 Sending to Worker:", formData);

      const res = await fetch(
        "https://resume-builder-worker.safetycrewindiaresumebuilder.workers.dev/api/secure/generate-cv",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            template,
            chatId,
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Server Error:", errText);
        toast.error(`Server error (${res.status})`, { id: toastId });
        return;
      }

      const blob = await res.blob();
      const pdfUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `${formData.name || "resume"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadLink(pdfUrl);
      toast.success("✅ Resume downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("❌ Error generating resume:", error);
      toast.error("Something went wrong. Try again.", { id: toastId });
    } finally {
      setTimeout(() => toast.dismiss(toastId), 3000);
      setLoading(false);
    }
  };

  /* ==============================
     5️⃣ Secure Test Button
  ============================== */
  const testSecure = async () => {
    try {
      const res = await api.testSecure();
      setTestMsg("✅ Success: " + JSON.stringify(res.data));
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
      <ResumeBuilder
        formData={formData}
        setFormData={handleFormChange}
        handleSubmit={handleSubmit}
        loading={loading}
      />
      <Toaster position="top-center" reverseOrder={false} />
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={testSecure}>🔐 Test Secure Access</button>
        <p>{testMsg}</p>
      </div>
    </div>
  );
}

export default App;
