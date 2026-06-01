import axios from "axios";

// Using relative '/api' since frontend and backend are unified on the single-access port (3000).
// Fallback can be local development port if required.
const baseURL = "/api";

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
