import api from "./api";

export const loginAdmin = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

export const fetchMe = () => api.get("/auth/me").then((r) => r.data);

export const logoutAdmin = () => api.post("/auth/logout").then((r) => r.data);