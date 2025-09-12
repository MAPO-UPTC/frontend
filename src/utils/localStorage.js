// src/utils/localStorage.js
/**
 * Utilidades para manejar localStorage con debugging
 */

export const setTokenWithDebug = (token) => {
  try {
    localStorage.setItem("token", token);
    console.log("✅ Token guardado exitosamente:", token);
    
    // Verificar inmediatamente que se guardó
    const savedToken = localStorage.getItem("token");
    if (savedToken === token) {
      console.log("✅ Token verificado en localStorage");
      return true;
    } else {
      console.error("❌ Error: Token no se guardó correctamente");
      console.error("Token enviado:", token);
      console.error("Token guardado:", savedToken);
      return false;
    }
  } catch (error) {
    console.error("❌ Error al guardar token:", error);
    return false;
  }
};

export const getTokenWithDebug = () => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token obtenido de localStorage:", token);
    return token;
  } catch (error) {
    console.error("Error al obtener token:", error);
    return null;
  }
};

export const removeTokenWithDebug = () => {
  try {
    localStorage.removeItem("token");
    console.log("✅ Token eliminado de localStorage");
    
    // Verificar que se eliminó
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("✅ Token eliminado correctamente");
      return true;
    } else {
      console.error("❌ Error: Token no se eliminó correctamente");
      return false;
    }
  } catch (error) {
    console.error("❌ Error al eliminar token:", error);
    return false;
  }
};

export const debugLocalStorage = () => {
  console.log("=== DEBUG LOCALSTORAGE ===");
  console.log("localStorage disponible:", typeof Storage !== "undefined");
  console.log("Token actual:", localStorage.getItem("token"));
  console.log("Todas las claves:", Object.keys(localStorage));
  console.log("========================");
};