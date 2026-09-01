import api from "./api";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
*/

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const BACKEND_URL = API_URL
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

/*
|--------------------------------------------------------------------------
| IMAGE UPLOAD
|--------------------------------------------------------------------------
*/

const uploadImage = async (file) => {
  if (!file) {
    throw new Error("Please select an image.");
  }

  const token = localStorage.getItem("amri_admin_token");

  if (!token) {
    throw new Error("Admin session expired. Please login again.");
  }

  const formData = new FormData();

  formData.append("image", file);

  const response = await fetch(
    `${BACKEND_URL}/api/upload/image`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    }
  );

  let data = null;

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    throw new Error(
      `Upload server returned ${response.status}: ${
        text.slice(0, 200) || "Unknown response"
      }`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Upload failed (${response.status}).`
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| GENERIC CONTENT SERVICE
|--------------------------------------------------------------------------
*/

const createContentService = (resource) => ({
  getPublished: (params = {}) =>
    api
      .get(`/${resource}`, { params })
      .then((response) => response.data),

  getAll: (params = {}) =>
    api
      .get(`/${resource}/admin/all`, { params })
      .then((response) => response.data),

  getOne: (idOrSlug) =>
    api
      .get(`/${resource}/${idOrSlug}`)
      .then((response) => response.data),

  create: (payload) =>
    api
      .post(`/${resource}`, payload)
      .then((response) => response.data),

  update: (id, payload) =>
    api
      .put(`/${resource}/${id}`, payload)
      .then((response) => response.data),

  remove: (id) =>
    api
      .delete(`/${resource}/${id}`)
      .then((response) => response.data),

  togglePublish: (id) =>
    api
      .patch(`/${resource}/${id}/publish`)
      .then((response) => response.data),

  toggleFeatured: (id) =>
    api
      .patch(`/${resource}/${id}/feature`)
      .then((response) => response.data),

  uploadImage,
});

/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/

export const researchService =
  createContentService("research");

export const eventService =
  createContentService("events");

export const innovationService =
  createContentService("innovations");

export const programService =
  createContentService("programs");

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

export const fetchDashboardStats = () =>
  api
    .get("/dashboard/stats")
    .then((response) => response.data);