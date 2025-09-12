import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import logo from "../../assets/logo-pets-mapo.png";
import { Link } from "react-router-dom";

export default function Login() {
  const { handleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      console.log("Login.jsx: Iniciando login");
      const result = await handleLogin(email, password);
      console.log("Login.jsx: Login exitoso", result);
      
      // Verificar que el token se guardó antes de redirigir
      const token = localStorage.getItem("token");
      console.log("Login.jsx: Token en localStorage después del login:", token);
      
      if (token) {
        window.location.href = "/";
      } else {
        console.error("Login.jsx: No se encontró token después del login");
        setError("Error al guardar sesión");
      }
    } catch (err) {
      console.error("Login.jsx: Error en login:", err);
      setError("Credenciales incorrectas");
    }
  };



  return (
    <div className="login-container">
      <div className="login-horizontal">
        <form onSubmit={onSubmit} className="login-form">
          <h2 className="login-title">Iniciar sesión</h2>
          {error && <div className="login-error">{error}</div>}
          <input
            type="email"
            placeholder="Correo electrónico"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button type="submit" className="login-button">
            Entrar
          </button>
          

          
          <div style={{ textAlign: "center", marginTop: "12px" }}>
            ¿No tienes cuenta? <Link to="/signup" style={{ color: "var(--mapo-blue-dark)", fontWeight: "bold" }}>Regístrate aquí</Link>
          </div>
        </form>
        <img src={logo} alt="MAPO logo" className="login-logo" />
      </div>
    </div>
  );
}