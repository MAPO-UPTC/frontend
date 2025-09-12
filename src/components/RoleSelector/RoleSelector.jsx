import React from 'react';
import { Role } from '../../constants';
import './RoleSelector.css';

/**
 * Componente para seleccionar y cambiar roles dinámicamente
 */
const RoleSelector = ({
  availableRoles = [],
  activeRole = null,
  onRoleChange,
  onClearRole,
  loading = false,
  className = ''
}) => {
  // No mostrar el selector si solo tiene un rol
  if (availableRoles.length <= 1) {
    return null;
  }

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;
    
    if (selectedRole === '') {
      onClearRole?.();
    } else {
      onRoleChange?.(selectedRole);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      [Role.USER]: 'Usuario',
      [Role.ADMIN]: 'Administrador',
      [Role.SUPERADMIN]: 'Super Administrador'
    };
    return roleNames[role] || role;
  };

  return (
    <div className={`role-selector ${className}`}>
      <div className="role-selector-container">
        <label htmlFor="role-select" className="role-selector-label">
          🎭 Rol Activo:
        </label>
        
        <select
          id="role-select"
          value={activeRole || ''}
          onChange={handleRoleChange}
          disabled={loading}
          className="role-selector-dropdown"
        >
          <option value="">
            Todos los roles (permisos máximos)
          </option>
          {availableRoles.map(role => (
            <option key={role} value={role}>
              {getRoleDisplayName(role)}
            </option>
          ))}
        </select>

        {loading && (
          <div className="role-selector-loading">
            Cambiando rol...
          </div>
        )}
      </div>

      {activeRole && (
        <div className="active-role-indicator">
          <span className="role-badge">
            Usando rol: <strong>{getRoleDisplayName(activeRole)}</strong>
          </span>
          <small className="role-description">
            Los permisos están limitados a este rol específico
          </small>
        </div>
      )}

      {!activeRole && availableRoles.length > 1 && (
        <div className="all-roles-indicator">
          <span className="role-badge all-roles">
            Usando todos los roles disponibles
          </span>
          <small className="role-description">
            Tienes permisos combinados de: {availableRoles.map(getRoleDisplayName).join(', ')}
          </small>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;