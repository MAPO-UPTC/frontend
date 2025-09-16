import api from "./axios";

// Login con email y password
export const login = async (email, password) => {
  const loginData = { email, password };
  console.log("🚀 login: Datos que se envían al backend:", loginData);
  
  try {
    const { data } = await api.post("/users/login", loginData);
    console.log("✅ login: Respuesta del backend:", data);
    
    // El backend puede devolver 'idToken' o 'token' - ser flexible
    const token = data.idToken || data.token;
    const { user } = data;
    
    if (token) {
      localStorage.setItem("token", token);
      console.log("✅ login: Token guardado en localStorage:", token);
      
      // Guardar información del usuario
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        console.log("✅ login: Usuario guardado:", user);
      }
    } else {
      console.error("❌ login: No se recibió token del backend. Respuesta completa:", data);
    }
    
    return data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};

// Autenticación con Google
export const authGoogle = async (token) => {
  console.log("authGoogle token:", token);
  try {
    const response = await api.post("/users/auth/google", { token });
    
    // El backend puede devolver 'idToken' o 'token' - ser flexible
    const authToken = response.data.idToken || response.data.token;
    const { user } = response.data;
    if (authToken) {
      localStorage.setItem("token", authToken);
      console.log("Token de Google guardado:", authToken);
      
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error("Error en authGoogle:", error);
    throw error;
  }
};

// Registro de usuario
export const signup = async (userData) => {
  console.log("🚀 signup: Datos que se envían al backend:", userData);
  
  try {
    const { data } = await api.post("/users/signup", userData);
    console.log("✅ signup: Respuesta del backend:", data);
    
    return data;
  } catch (error) {
    console.error("❌ signup: Error completo:", error);
    console.error("❌ signup: Error response:", error.response?.data);
    console.error("❌ signup: Error status:", error.response?.status);
    throw error;
  }
};

// Validar token
export const ping = async () => {
  try {
    const { data } = await api.post("/users/ping");
    return data;
  } catch (error) {
    console.error("Error validando token:", error);
    throw error;
  }
};

// Obtener permisos actuales del usuario
export const getPermissions = async () => {
  try {
    const { data } = await api.get("/users/me/permissions");
    console.log("Permisos obtenidos:", data);
    return data;
  } catch (error) {
    console.error("Error obteniendo permisos:", error);
    throw error;
  }
};

// Obtener perfil completo del usuario
export const getProfile = async () => {
  try {
    const { data } = await api.get("/users/me/profile");
    return data;
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    throw error;
  }
};

// Cambiar rol activo
export const switchRole = async (role) => {
  try {
    const { data } = await api.post("/users/me/switch-role", { role });
    console.log(`Cambiado a rol ${role}:`, data);
    return data;
  } catch (error) {
    console.error("Error cambiando rol:", error);
    throw error;
  }
};

// Limpiar rol activo (usar todos los roles)
export const clearActiveRole = async () => {
  try {
    const { data } = await api.post("/users/me/clear-active-role");
    console.log("Rol activo limpiado:", data);
    return data;
  } catch (error) {
    console.error("Error limpiando rol activo:", error);
    throw error;
  }
};

// Obtener rol activo actual
export const getActiveRole = async () => {
  try {
    const { data } = await api.get("/users/me/active-role");
    return data;
  } catch (error) {
    console.error("Error obteniendo rol activo:", error);
    throw error;
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("Usuario deslogueado, localStorage limpiado");
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Obtener token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Obtener usuario guardado
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Export default con todas las funciones
const authService = {
  login,
  authGoogle,
  signup,
  ping,
  getPermissions,
  getProfile,
  switchRole,
  clearActiveRole,
  getActiveRole,
  logout,
  isAuthenticated,
  getToken,
  getUser
};

export default authService;
