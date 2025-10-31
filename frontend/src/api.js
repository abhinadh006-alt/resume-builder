// frontend/src/api.js  (or frontend/src/apis/api.js)
import axios from "axios";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL
    || "https://resume-builder-jv01.onrender.com/api/resume"; // <<— important

function getAuthKey() {
    return localStorage.getItem("RB_AUTH");
}

const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = getAuthKey();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ✅ Automatically fetch daily key, then send secure request
export const generateResume = async (formData) => {
    try {
        // Step 1: Get today's TG-SECRET key from backend
        const keyRes = await axios.get("https://resume-builder-jv01.onrender.com/api/daily-key");
        const authKey = keyRes.data.key;

        // Step 2: Call secure generate endpoint with Authorization header
        const response = await axios.post(
            "https://resume-builder-jv01.onrender.com/api/secure/generate-cv",
            formData,
            { headers: { Authorization: `Bearer ${authKey}` } }
        );

        return response;
    } catch (err) {
        console.error("❌ Secure generateResume failed:", err.message);
        throw err;
    }
};

