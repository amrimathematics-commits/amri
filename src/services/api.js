import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const baseURL =
  API_URL
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/, "") + "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("amri_admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

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

// =====================================================
// CONTACT EMAIL
// =====================================================

export const sendContactEmail = async (contactData) => {
  const response = await api.post("/contact", contactData);
  return response.data;
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default api;