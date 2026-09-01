import axios from "axios";

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
*/

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Prevent /api/api/... if VITE_API_URL already ends with /api
const baseURL =
  API_URL
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/, "") + "/api";

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL,
  withCredentials: true,
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("amri_admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only set JSON Content-Type for normal JSON requests.
    // Do NOT set it for FormData uploads.
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      // Let the browser/Axios automatically set:
      // multipart/form-data; boundary=...
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

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