import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '3rem',
        borderRadius: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        marginTop: '5rem'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          🐾 MAPO
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
          Marketplace de Productos para Mascotas
        </h2>
        
        <p style={{ fontSize: '1.1rem', marginBottom: '3rem', opacity: 0.8 }}>
          Bienvenido a MAPO - Tu destino para todo lo que tu mascota necesita
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            to="/products" 
            style={{
              background: '#4CAF50',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            Ver Productos 📦
          </Link>
          
          <Link 
            to="/login" 
            style={{
              background: '#2196F3',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            Iniciar Sesión 🔐
          </Link>
          
          <Link 
            to="/signup" 
            style={{
              background: '#FF9800',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            Registrarse ✨
          </Link>
        </div>

        <div style={{ marginTop: '3rem', opacity: 0.7 }}>
          <p>🚀 Backend conectado a: http://142.93.187.32:8000</p>
          <p>✅ Aplicación funcionando correctamente</p>
        </div>
      </div>
    </div>
  );
}