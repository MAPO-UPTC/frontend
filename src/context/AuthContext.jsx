import { createContext, useContext, useState, useEffect } from "react";
import { login, logout, authGoogle, signup } from "../api/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const handleLogin = async (email, password) => {
    const data = await login(email, password);
    setUser(data.user);
  };

  const handleSignup = async (userData) => {
    const data = await signup(userData);
    setUser(data.user);
  };

  const handleAuthGoogle = async (token) => {
    const data = await authGoogle(token);
    setUser(data.user);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  useEffect(() => {
    (async () => {
      try {
        // const data = await getProfile();
        // setUser(data);
        console.log("Error al obtener el perfil");
      } catch (err) {
        setUser(null);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout, handleAuthGoogle, handleSignup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
