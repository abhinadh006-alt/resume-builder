import axios from "axios";

/* ================================
   1️⃣ API Base URL (Render only)
================================ */
const API_BASE =
    window.location.hostname.includes("localhost")
        ? "http://localhost:5000/api/resume"
        : "https://resume-builder-jv01.onrender.com/api/resume";

/* ================================
   2️⃣ Read stored key
================================ */
function getAuthKey() {
    return localStorage.getItem("RB_AUTH");
}

/* ================================
   3️⃣ Axios instance
================================ */
const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ================================
   4️⃣ Add Authorization automatically
================================ */
axiosInstance.interceptors.request.use((config) => {
    const token = getAuthKey();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/* ================================
   5️⃣ Handle expired key
================================ */
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized — invalid or expired access key");
            localStorage.removeItem("RB_AUTH");
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

/* ================================
   6️⃣ API Methods
================================ */
export const api = {
    testSecure: () => axiosInstance.get("/api/secure/ping"),
    generateResume: (formData) =>
        axiosInstance.post("/secure/generate-cv", formData),
};

export default api;
