// src/api/axios.js
import axios from "axios";

// Configuración inteligente de URL base
const getApiBaseUrl = () => {
  // En desarrollo local: usar backend directo
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_BASE_URL || "https://142.93.187.32.nip.io";
  }
  
  // En producción (Netlify): usar proxy relativo con prefijo /api/
  return "/api";
};

const API_BASE_URL = getApiBaseUrl();

console.log("🔗 API Configuration:", {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL,
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL
});

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
  
  // Debug logging
  console.log("📡 API Request:", {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    headers: config.headers,
    data: config.data
  });
  
  return config;
});

// ✅ Interceptor RESPONSE -> Maneja token expirado (401)
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
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
