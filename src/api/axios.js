// src/api/axios.js
import axios from "axios";

// Configuración de URL base - Producción MAPO Backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://142.93.187.32:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Timeout de 10 segundos para el backend remoto
  withCredentials: false, // Cambiar a false para backend remoto
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
