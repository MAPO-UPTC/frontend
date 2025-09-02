// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // si usas cookies
});

// ✅ Interceptor REQUEST -> Adjunta el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interceptor RESPONSE -> Maneja token expirado (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // El backend dice: "token inválido o expirado"
      localStorage.removeItem("token");

      // Redirigir a login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
