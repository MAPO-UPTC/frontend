import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Entity, Action, Role } from '../../constants';
import PermissionGate from '../PermissionGate/PermissionGate';
import './Navigation.css';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  entity?: string;
  action?: string;
  requiresAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    path: '/products',
    label: 'Productos',
    icon: '🛍️',
    entity: Entity.PRODUCTS,
    action: Action.READ,
    requiresAuth: false // Los productos pueden ser públicos
  },
  {
    path: '/sales',
    label: 'Ventas',
    icon: '💰',
    entity: Entity.SALES_ORDERS,
    action: Action.CREATE,
    requiresAuth: true
  },
  {
    path: '/sales/history',
    label: 'Historial',
    icon: '📋',
    entity: Entity.SALES_ORDERS,
    action: Action.READ,
    requiresAuth: true
  },
  {
    path: '/inventory',
    label: 'Inventario',
    icon: '📦',
    entity: Entity.INVENTORY,
    action: Action.READ,
    requiresAuth: true
  },
  {
    path: '/suppliers',
    label: 'Proveedores',
    icon: '🚚',
    entity: Entity.SUPPLIERS,
    action: Action.READ,
    requiresAuth: true
  },
  {
    path: '/reports',
    label: 'Reportes',
    icon: '📊',
    entity: Entity.SALES_ORDERS,
    action: Action.READ,
    requiresAuth: true
  }
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, handleLogout } = useAuth();
  const {
    availableRoles,
    activeRole,
    actions: { hasPermission, switchRole, clearActiveRole }
  } = usePermissions();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Filtrar items del menú basado en permisos
  const filteredItems = navigationItems.filter(item => {
    // Si no requiere autenticación, mostrarlo siempre
    if (!item.requiresAuth) return true;
    
    // Si requiere autenticación pero no hay usuario, ocultarlo
    if (!user) return false;

    // Si no tiene entity definida, mostrarlo (es un item sin permisos específicos)
    if (!item.entity || !item.action) return true;

    // Verificar si el usuario tiene permiso para esta entity/action
    return hasPermission(item.entity, item.action);
  });

  const handleRoleChange = (role: string) => {
    switchRole(role);
    setShowRoleDropdown(false);
  };

  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      [Role.USER]: 'Usuario',
      [Role.ADMIN]: 'Administrador',
      [Role.SUPERADMIN]: 'Super Admin'
    };
    return roleNames[role] || role;
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '573135321766';
    const message = encodeURIComponent('Hola, tengo una consulta sobre los productos de MAPO.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <Link to="/products" className="nav-logo">
          <img src="/mapo-logo.png" alt="MAPO" className="logo-image" />
          <span className="logo-text">MAPO</span>
        </Link>
        
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Usuario'}</span>
            <span className="user-role">{user?.role || 'Sin rol'}</span>
          </div>
        </div>

        {/* Role Selector */}
        {availableRoles.length > 0 && (
          <div className="nav-role-selector">
            <label>Rol Activo:</label>
            <div className="role-selector-wrapper">
              <button
                className="role-selector-button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                type="button"
              >
                <span className="role-badge">
                  {activeRole ? getRoleDisplayName(activeRole) : 'Seleccionar...'}
                </span>
                <span className="dropdown-arrow">{showRoleDropdown ? '▲' : '▼'}</span>
              </button>

              {showRoleDropdown && (
                <div className="role-dropdown">
                  {availableRoles.map((role: string) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`role-option ${activeRole === role ? 'active' : ''}`}
                      type="button"
                    >
                      {getRoleDisplayName(role)}
                      {activeRole === role && <span className="check-mark">✓</span>}
                    </button>
                  ))}
                  {activeRole && (
                    <>
                      <div className="role-dropdown-divider" />
                      <button
                        onClick={() => {
                          clearActiveRole();
                          setShowRoleDropdown(false);
                        }}
                        className="role-option clear-role"
                        type="button"
                      >
                        Limpiar Selección
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="nav-menu">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}

        {/* Gestión de Usuarios - Solo SUPERADMIN activo */}
        {activeRole === Role.SUPERADMIN && (
          <Link
            to="/admin/users"
            className={`nav-item ${location.pathname === '/admin/users' ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Usuarios</span>
          </Link>
        )}
      </div>

      <div className="nav-footer">
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppClick}
          className="whatsapp-button"
          type="button"
          title="Contactar por WhatsApp"
        >
          <span className="whatsapp-icon">💬</span>
          <span className="whatsapp-label">Contactar</span>
        </button>

        <button
          onClick={handleLogout}
          className="logout-button"
          type="button"
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
};