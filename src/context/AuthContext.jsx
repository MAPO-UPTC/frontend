import { createContext, useContext, useState, useEffect } from "react";
import { login, logout, authGoogle, signup, ping, getUser, getToken } from "../api/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = async (email, password) => {
    try {
      console.log("Intentando login con:", email);
      setLoading(true);
      
      const data = await login(email, password);
      console.log("Respuesta del login:", data);
      
      // Almacenar información del usuario del response
      const userData = data.user || { email };
      setUser(userData);
      
      return data;
    } catch (error) {
      console.error("Error en handleLogin:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (userData) => {
    try {
      setLoading(true);
      const data = await signup(userData);
      console.log("Respuesta del signup:", data);
      return data;
    } catch (error) {
      console.error("Error en handleSignup:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAuthGoogle = async (token) => {
    try {
      setLoading(true);
      const data = await authGoogle(token);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Error en handleAuthGoogle:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        const savedUser = getUser();
        
        if (token && savedUser) {
          console.log("Token y usuario encontrados:", { token: token.slice(0, 20) + '...', user: savedUser.email });
          setUser(savedUser);
          
          // Validar token con el backend
          try {
            await ping();
            console.log("Token válido");
          } catch (error) {
            console.error("Token inválido:", error);
            logout();
            setUser(null);
          }
        } else {
          console.log("No hay token o usuario en localStorage");
          setUser(null);
        }
      } catch (err) {
        console.error("Error al inicializar autenticación:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      isAuthenticated: !!user,
      handleLogin, 
      handleLogout, 
      handleAuthGoogle, 
      handleSignup 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
