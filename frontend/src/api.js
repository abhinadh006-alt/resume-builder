// frontend/src/api.js
import axios from "axios";

/* ================================
   1️⃣  API Base URL (Render backend)
================================ */
const API_BASE = "https://resume-builder-jv01.onrender.com";

/* ================================
   2️⃣  Helper to get daily TG-SECRET key
================================ */
async function fetchDailyKey() {
    try {
        const res = await axios.get(`${API_BASE}/api/daily-key`);
        return res.data.key;
    } catch (err) {
        console.error("❌ Failed to fetch daily key:", err.message);
        throw new Error("Cannot get daily access key");
    }
}

/* ================================
   3️⃣  Secure Resume Generator
================================ */
export const generateResume = async (formData) => {
    try {
        // Fetch valid TG-SECRET key for today
        const authKey = await fetchDailyKey();

        // Post data with Authorization header
        const res = await axios.post(
            `${API_BASE}/api/secure/generate-cv`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${authKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ Resume generated successfully:", res.data);
        return res.data;
    } catch (err) {
        console.error("❌ Secure generateResume failed:", err.message);
        throw err;
    }
};

/* ================================
   4️⃣  Secure test endpoint
================================ */
export const testSecure = async () => {
    try {
        const key = await fetchDailyKey();
        const res = await axios.get(`${API_BASE}/api/secure/ping`, {
            headers: { Authorization: `Bearer ${key}` },
        });
        return res.data;
    } catch (err) {
        console.error("❌ Secure test failed:", err.message);
        throw err;
    }
};

/* ================================
   5️⃣  Export default for other imports
================================ */
export default {
    generateResume,
    testSecure,
};

export const api = { generateResume, testSecure };
