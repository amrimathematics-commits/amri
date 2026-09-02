import axios from "axios";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
|
| Development:
|   http://localhost:5000
|
| Production:
|   https://amri-gofn.vercel.app
|
| VITE_API_URL can override this in Vercel.
|
|--------------------------------------------------------------------------
*/

const configuredApiUrl =
  import.meta.env.VITE_API_URL;

const API_URL =
  configuredApiUrl && configuredApiUrl.trim()
    ? configuredApiUrl.trim()
    : import.meta.env.PROD
      ? "https://amri-gofn.vercel.app"
      : "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| NORMALIZE API URL
|--------------------------------------------------------------------------
|
| These all become:
|
| https://amri-gofn.vercel.app/api
|
| https://amri-gofn.vercel.app/api/
|
| https://amri-gofn.vercel.app
|
|--------------------------------------------------------------------------
*/

const baseURL =
  API_URL
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "") + "/api";

console.log("AMRI API Base URL:", baseURL);

/*
|--------------------------------------------------------------------------
| AXIOS INSTANCE
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL,
  withCredentials: true,

  headers: {
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "amri_admin_token"
      );

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    /*
    |--------------------------------------------------------------------------
    | CONTENT TYPE
    |--------------------------------------------------------------------------
    */

    if (
      config.data instanceof FormData
    ) {
      /*
      Do NOT manually set multipart/form-data.
      Axios/browser will add the correct boundary.
      */

      if (config.headers) {
        delete config.headers[
          "Content-Type"
        ];
      }
    } else {
      config.headers =
        config.headers || {};

      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    /*
    |--------------------------------------------------------------------------
    | UNAUTHORIZED
    |--------------------------------------------------------------------------
    */

    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        "amri_admin_token"
      );

      if (
        !window.location.pathname.includes(
          "/admin/login"
        )
      ) {
        window.location.href =
          "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| CONTACT EMAIL
|--------------------------------------------------------------------------
*/

export const sendContactEmail =
  async (contactData) => {
    const response =
      await api.post(
        "/contact",
        contactData
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default api;