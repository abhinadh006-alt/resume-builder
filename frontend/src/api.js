import axios from "axios";

/* ================================
   1️⃣  API Base URL
================================ */
const API_BASE =
    window.location.hostname.includes("localhost")
        ? "https://resume-builder-worker.safetycrewindiaresumebuilder.workers.dev" // ✅ use your deployed URL
        : "https://resume-builder-worker.safetycrewindiaresumebuilder.workers.dev";


/* ================================
   2️⃣  Read stored key (if present)
================================ */
function getAuthKey() {
    return localStorage.getItem("RB_AUTH");
}

/* ================================
   3️⃣  Create an Axios instance
================================ */
const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ================================
   4️⃣  Interceptor to add Authorization automatically
================================ */
axiosInstance.interceptors.request.use((config) => {
    const token = getAuthKey();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/* ================================
   5️⃣  Optional: Handle expired or invalid key
================================ */
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized — invalid or expired access key");
            // Optional: clear key and redirect to login page
            localStorage.removeItem("RB_AUTH");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

/* ================================
   6️⃣  Example endpoints
================================ */
export const api = {
    // Example: Check secure access
    testSecure: () => axiosInstance.get("/api/secure/ping"),

    // Example: Generate resume (existing)
    generateResume: (formData) =>
        axiosInstance.post("/api/secure/generate-cv", formData),

    // Example: Upload CV (coming soon)
    uploadCV: (file) => {
        const form = new FormData();
        form.append("file", file);
        return axiosInstance.post("/api/secure/upload", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};

// ✅ Add these two lines at the bottom:
export const generateResume = api.generateResume;
export default api;

