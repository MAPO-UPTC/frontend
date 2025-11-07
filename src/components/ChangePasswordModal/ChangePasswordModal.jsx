import React, { useState } from 'react';
import { requestPasswordReset, resetPassword } from '../../api/authService';
import './ChangePasswordModal.css';

export const ChangePasswordModal = ({ isOpen, onClose, userEmail }) => {
  const [step, setStep] = useState(1); // 1: solicitar código, 2: ingresar código y nueva contraseña
  const [email, setEmail] = useState(userEmail || '');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccessMessage('✅ Código de verificación enviado a tu email');
      setStep(2);
    } catch (err) {
      console.error('Error al solicitar código:', err);
      console.error('Response data:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message 
        || err.message 
        || 'Error al enviar el código. Verifica tu email.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validaciones
    if (!resetCode || resetCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, resetCode, newPassword);
      setSuccessMessage('✅ Contraseña actualizada exitosamente');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Response data:', err.response?.data);
      
      let errorMessage = 'Error al cambiar la contraseña. Verifica el código.';
      
      // Manejo específico para error de Firebase
      if (err.response?.data?.detail?.includes('Firebase')) {
        errorMessage = '⚠️ Error del servidor: No se pudo actualizar la contraseña. Por favor contacta al administrador del sistema.';
      } else {
        errorMessage = err.response?.data?.detail 
          || err.response?.data?.message 
          || err.message 
          || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail(userEmail || '');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔒 Cambiar Contraseña</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <form onSubmit={handleRequestCode}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={!!userEmail}
                />
                <small className="help-text">
                  Te enviaremos un código de 6 dígitos a tu email
                </small>
              </div>

              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : '📧 Enviar Código'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="resetCode">Código de Verificación</label>
                <input
                  type="text"
                  id="resetCode"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength="6"
                  required
                  autoFocus
                />
                <small className="help-text">
                  Ingresa el código de 6 dígitos que enviamos a {email}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  minLength="6"
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Volver
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Cambiando...' : '✅ Cambiar Contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
