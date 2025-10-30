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

export const api = {
    testSecure: () => axiosInstance.get("/secure/ping"),
    generateResume: (formData) => axiosInstance.post("/secure/generate-cv", formData),
    uploadCV: (file) => {
        const form = new FormData();
        form.append("file", file);
        return axiosInstance.post("/secure/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
    },
};
export default api;
