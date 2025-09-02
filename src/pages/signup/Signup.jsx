import { useState } from "react";
import "../login/Login.css";
import logo from "../../assets/logo-pets-mapo.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
    const navigate = useNavigate();
    const { handleSignup } = useAuth();
    const [form, setForm] = useState({
        firstName: "",
        secondFirstName: "",
        lastName: "",
        secondLastName: "",
        email: "",
        password: "",
        phoneNumber: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.firstName || !form.secondFirstName 
            || !form.lastName || !form.secondLastName 
            || !form.email || !form.password || !form.phoneNumber
        ) {
        setError("Todos los campos son obligatorios");
        return;
        }
        const payload = {
            email: form.email,
            password: form.password,
            first_name: form.firstName,
            second_first_name: form.secondFirstName,
            last_name: form.lastName,
            second_last_name: form.secondLastName,
            phone_number: form.phoneNumber
        };
        handleSignup(payload);
        navigate("/login");
    };

    return (
        <div className="login-container">
        <div className="login-horizontal">
            <img src={logo} alt="MAPO logo" className="login-logo" />
            <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-title">Crear cuenta</h2>
            {error && <div className="login-error">{error}</div>}
            <div className="signup-row">
                <input
                type="text"
                name="firstName"
                placeholder="Nombre"
                className="login-input"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                />
                <input
                type="text"
                name="secondFirstName"
                placeholder="Segundo nombre"
                className="login-input"
                value={form.secondFirstName}
                onChange={handleChange}
                autoComplete="additional-name"
                />
            </div>
            <div className="signup-row">
                <input
                type="text"
                name="lastName"
                placeholder="Apellido"
                className="login-input"
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                />
                <input
                type="text"
                name="secondLastName"
                placeholder="Segundo apellido"
                className="login-input"
                value={form.secondLastName}
                onChange={handleChange}
                autoComplete="additional-family-name"
                />
            </div>
            <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                className="login-input"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
            />
            <input
                type="password"
                name="password"
                placeholder="Contraseña"
                className="login-input"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
            />
            <input
                type="tel"
                name="phoneNumber"
                placeholder="Número de teléfono"
                className="login-input"
                value={form.phoneNumber}
                onChange={handleChange}
                autoComplete="tel"
            />
            <button type="submit" className="login-button">
                Registrarse
            </button>
            <div style={{ textAlign: "center", marginTop: "12px" }}>
                ¿Ya tienes una cuenta? <Link to="/login" style={{ color: "var(--mapo-blue-dark)", fontWeight: "bold" }}>Inicia sesión aquí</Link>
            </div>
            </form>
        </div>
        </div>
    );
}
