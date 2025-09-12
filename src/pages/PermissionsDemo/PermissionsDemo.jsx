import React from 'react';
import { usePermissions } from '../../hooks';
import { RoleSelector, PermissionGate } from '../../components';
import { Entity, Action, Role } from '../../constants';
import './PermissionsDemo.css';

export default function PermissionsDemo() {
  const {
    availableRoles,
    activeRole,
    effectiveRoles,
    permissions,
    hasMultipleRoles,
    isUsingAllRoles,
    loading,
    error,
    actions: { 
      switchRole, 
      clearActiveRole, 
      hasPermission, 
      canCreate, 
      canRead, 
      canUpdate, 
      canDelete 
    }
  } = usePermissions();

  if (loading) {
    return (
      <div className="permissions-demo">
        <div className="loading">Cargando permisos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="permissions-demo">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="permissions-demo">
      <h1>🎭 Demostración del Sistema de Permisos y Roles</h1>

      {/* Selector de roles */}
      <section className="demo-section">
        <h2>Selector de Roles</h2>
        {hasMultipleRoles ? (
          <RoleSelector
            availableRoles={availableRoles}
            activeRole={activeRole}
            onRoleChange={switchRole}
            onClearRole={clearActiveRole}
            loading={loading}
          />
        ) : (
          <p>Solo tienes un rol disponible: <strong>{availableRoles[0]}</strong></p>
        )}
      </section>

      {/* Información actual */}
      <section className="demo-section">
        <h2>Estado Actual</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>Roles Disponibles</h3>
            <ul>
              {availableRoles.map(role => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
          
          <div className="info-card">
            <h3>Rol Activo</h3>
            <p>{activeRole || 'Ninguno (usando todos los roles)'}</p>
          </div>
          
          <div className="info-card">
            <h3>Roles Efectivos</h3>
            <ul>
              {effectiveRoles.map(role => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pruebas de permisos por entidad */}
      <section className="demo-section">
        <h2>Matriz de Permisos</h2>
        <div className="permissions-matrix">
          <table>
            <thead>
              <tr>
                <th>Entidad</th>
                <th>Crear</th>
                <th>Leer</th>
                <th>Actualizar</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(Entity).map(entity => (
                <tr key={entity}>
                  <td><strong>{entity}</strong></td>
                  <td className={canCreate(entity) ? 'allowed' : 'denied'}>
                    {canCreate(entity) ? '✅' : '❌'}
                  </td>
                  <td className={canRead(entity) ? 'allowed' : 'denied'}>
                    {canRead(entity) ? '✅' : '❌'}
                  </td>
                  <td className={canUpdate(entity) ? 'allowed' : 'denied'}>
                    {canUpdate(entity) ? '✅' : '❌'}
                  </td>
                  <td className={canDelete(entity) ? 'allowed' : 'denied'}>
                    {canDelete(entity) ? '✅' : '❌'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Componentes protegidos de ejemplo */}
      <section className="demo-section">
        <h2>Componentes Protegidos</h2>
        <div className="protected-components">
          
          <PermissionGate
            entity={Entity.PRODUCTS}
            action={Action.CREATE}
            fallback={
              <div className="permission-denied">
                ❌ No puedes crear productos
              </div>
            }
          >
            <button className="demo-button create">
              ➕ Crear Producto
            </button>
          </PermissionGate>

          <PermissionGate
            entity={Entity.USERS}
            action={Action.UPDATE}
            fallback={
              <div className="permission-denied">
                ❌ No puedes actualizar usuarios
              </div>
            }
          >
            <button className="demo-button update">
              ✏️ Actualizar Usuario
            </button>
          </PermissionGate>

          <PermissionGate
            entity={Entity.USERS}
            action={Action.DELETE}
            fallback={
              <div className="permission-denied">
                ❌ No puedes eliminar usuarios
              </div>
            }
          >
            <button className="demo-button delete">
              🗑️ Eliminar Usuario
            </button>
          </PermissionGate>

          <PermissionGate
            roles={[Role.ADMIN, Role.SUPERADMIN]}
            fallback={
              <div className="permission-denied">
                ❌ Solo administradores pueden ver esto
              </div>
            }
          >
            <div className="admin-panel">
              🛡️ Panel de Administrador
            </div>
          </PermissionGate>

          <PermissionGate
            roles={[Role.SUPERADMIN]}
            fallback={
              <div className="permission-denied">
                ❌ Solo super administradores pueden ver esto
              </div>
            }
          >
            <div className="superadmin-panel">
              👑 Panel de Super Administrador
            </div>
          </PermissionGate>

        </div>
      </section>

      {/* Debug: Datos raw */}
      <section className="demo-section">
        <details className="debug-section">
          <summary>🔍 Debug: Datos Raw de Permisos</summary>
          <pre className="debug-json">
            {JSON.stringify({
              availableRoles,
              activeRole,
              effectiveRoles,
              permissions,
              hasMultipleRoles,
              isUsingAllRoles
            }, null, 2)}
          </pre>
        </details>
      </section>
    </div>
  );
}