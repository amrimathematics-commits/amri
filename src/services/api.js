import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Prevent /api/api/... if VITE_API_URL already ends with /api
const baseURL = API_URL.replace(/\/+$/, "").replace(/\/api$/, "") + "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("amri_admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("amri_admin_token");

      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;