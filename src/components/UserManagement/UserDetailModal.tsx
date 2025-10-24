import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../hooks/useUserManagement';
import { UserWithRoles, RoleName } from '../../types';
import { Button } from '../UI';
import './UserDetailModal.css';

interface UserDetailModalProps {
  user: UserWithRoles;
  onClose: () => void;
  onUpdate: () => void;
}

const AVAILABLE_ROLES: { name: RoleName; label: string; description: string }[] = [
  {
    name: 'USER',
    label: 'Usuario',
    description: 'Usuario básico con permisos limitados',
  },
  {
    name: 'ADMIN',
    label: 'Administrador',
    description: 'Administrador con permisos amplios',
  },
  {
    name: 'SUPERADMIN',
    label: 'Super Administrador',
    description: 'Acceso total al sistema',
  },
];

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onUpdate,
}) => {
  const { updateRoles, loading } = useUserManagement();
  const [selectedRoles, setSelectedRoles] = useState<RoleName[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Inicializar con los roles actuales del usuario
    setSelectedRoles(user.roles);
  }, [user]);

  useEffect(() => {
    // Detectar si hay cambios
    const currentRoleNames = [...user.roles].sort();
    const newRoleNames = [...selectedRoles].sort();
    const changed =
      currentRoleNames.length !== newRoleNames.length ||
      !currentRoleNames.every((role, index) => role === newRoleNames[index]);
    setHasChanges(changed);
  }, [selectedRoles, user.roles]);

  const handleRoleToggle = (roleName: RoleName) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleName)) {
        // Remover rol
        if (prev.length === 1) {
          setErrorMessage('El usuario debe tener al menos un rol');
          return prev;
        }
        return prev.filter((r) => r !== roleName);
      } else {
        // Agregar rol
        return [...prev, roleName];
      }
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    if (selectedRoles.length === 0) {
      setErrorMessage('El usuario debe tener al menos un rol');
      return;
    }

    try {
      await updateRoles(user.user_id, selectedRoles);
      setSuccessMessage('Roles actualizados correctamente');
      setHasChanges(false);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error.detail || 'Error al actualizar roles');
    }
  };

  const getRoleBadgeClass = (roleName: string) => {
    switch (roleName) {
      case 'SUPERADMIN':
        return 'role-badge superadmin';
      case 'ADMIN':
        return 'role-badge admin';
      case 'USER':
        return 'role-badge user';
      default:
        return 'role-badge';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gestionar Roles de Usuario</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="user-info-section">
            <div className="user-avatar-large">
              {user.name.charAt(0).toUpperCase()}
              {user.last_name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h3>
                {user.name} {user.last_name}
              </h3>
              <p className="user-email">{user.email}</p>
              {user.document_number && (
                <p className="user-document">
                  {user.document_type}: {user.document_number}
                </p>
              )}
            </div>
          </div>

          <div className="current-roles-section">
            <h4>Roles Actuales</h4>
            <div className="roles-display">
              {user.roles.map((role, index) => (
                <span key={index} className={getRoleBadgeClass(role)}>
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="roles-management-section">
            <h4>Gestionar Roles</h4>
            <p className="section-description">
              Selecciona los roles que deseas asignar a este usuario
            </p>

            <div className="roles-options">
              {AVAILABLE_ROLES.map((roleOption) => (
                <div key={roleOption.name} className="role-option">
                  <label className="role-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(roleOption.name)}
                      onChange={() => handleRoleToggle(roleOption.name)}
                      className="role-checkbox"
                    />
                    <div className="role-option-content">
                      <span className={getRoleBadgeClass(roleOption.name)}>
                        {roleOption.label}
                      </span>
                      <p className="role-description">{roleOption.description}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {successMessage && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={loading}
            disabled={!hasChanges || selectedRoles.length === 0}
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
};
