import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css";
import logo from "../../assets/logo-pets-mapo.png";

export default function Login() {
  const { handleLogin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Por favor ingresa email y contraseña");
      return;
    }

    const success = await handleLogin(email, password);
    if (success) {
      console.log("Login exitoso, navegando a:", from);
      navigate(from, { replace: true });
    } else {
      setError("Error al iniciar sesión. Verifica tus credenciales.");
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
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Entrar"}
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