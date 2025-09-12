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
        name: "",
        last_name: "",
        document_type: "",
        document_number: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.name || !form.last_name || !form.document_type 
            || !form.document_number || !form.email || !form.password
        ) {
            setError("Todos los campos son obligatorios");
            return;
        }
        
        try {
            await handleSignup(form);
            alert("Registro exitoso!");
            navigate("/login");
        } catch (err) {
            setError("Error en el registro");
        }
    };

    return (
        <div className="login-container">
            <div className="login-horizontal">
                <img src={logo} alt="MAPO logo" className="login-logo" />
                <form onSubmit={handleSubmit} className="login-form">
                    <h2 className="login-title">Crear cuenta</h2>
                    {error && <div className="login-error">{error}</div>}
                    
                    <input
                        type="text"
                        name="name"
                        placeholder="Nombre(s)"
                        className="login-input"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                    />
                    
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Apellido(s)"
                        className="login-input"
                        value={form.last_name}
                        onChange={handleChange}
                        autoComplete="family-name"
                    />
                    
                    <div className="signup-row">
                        <select
                            name="document_type"
                            className="login-input"
                            value={form.document_type}
                            onChange={handleChange}
                        >
                            <option value="">Tipo de documento</option>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="PA">Pasaporte</option>
                        </select>
                        
                        <input
                            type="text"
                            name="document_number"
                            placeholder="Número de documento"
                            className="login-input"
                            value={form.document_number}
                            onChange={handleChange}
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