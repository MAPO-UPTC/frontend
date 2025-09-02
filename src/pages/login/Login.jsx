import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import logo from "../../assets/logo-pets-mapo.png";
import { Link } from "react-router-dom";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";

export default function Login() {
  const { handleLogin, handleAuthGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await handleLogin(email, password);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Credenciales incorrectas");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await handleAuthGoogle(token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Error al iniciar sesión con Google");
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
          <button
            type="button"
            className="login-button google"
            onClick={handleGoogleLogin}
          >
            Iniciar sesión con Google
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