import api from "./api";

const uploadImage = async (file) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post(
    "/upload/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

const createContentService = (resource) => ({
  getPublished: (params = {}) =>
    api.get(`/${resource}`, { params }).then((r) => r.data),

  getAll: (params = {}) =>
    api.get(`/${resource}/admin/all`, { params }).then((r) => r.data),

  getOne: (idOrSlug) =>
    api.get(`/${resource}/${idOrSlug}`).then((r) => r.data),

  create: (payload) =>
    api.post(`/${resource}`, payload).then((r) => r.data),

  update: (id, payload) =>
    api.put(`/${resource}/${id}`, payload).then((r) => r.data),

  remove: (id) =>
    api.delete(`/${resource}/${id}`).then((r) => r.data),

  togglePublish: (id) =>
    api.patch(`/${resource}/${id}/publish`).then((r) => r.data),

  toggleFeatured: (id) =>
    api.patch(`/${resource}/${id}/feature`).then((r) => r.data),

  uploadImage,
});

export const researchService =
  createContentService("research");

export const eventService =
  createContentService("events");

export const innovationService =
  createContentService("innovations");

export const programService =
  createContentService("programs");

export const fetchDashboardStats = () =>
  api.get("/dashboard/stats").then((r) => r.data);