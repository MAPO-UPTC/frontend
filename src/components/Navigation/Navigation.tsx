import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Entity, Action, Role } from '../../constants';
// import PermissionGate from '../PermissionGate/PermissionGate';
import './Navigation.css';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  entity?: string;
  action?: string;
  requiresAuth?: boolean;
  requiredRole?: string; // Rol específico requerido (opcional)
}

const navigationItems: NavigationItem[] = [
  {
    path: '/users',
    label: 'Usuarios',
    icon: '👥',
    entity: Entity.USERS,
    action: Action.UPDATE,
    requiresAuth: true,
    requiredRole: Role.SUPERADMIN // Solo SUPERADMIN puede gestionar usuarios
  },
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
    path: '/returns',
    label: 'Devoluciones',
    icon: '↩️',
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
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  const {
    availableRoles,
    activeRole,
    actions: { hasPermission, switchRole, clearActiveRole }
  } = usePermissions();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Debug: Log cuando cambian los permisos o el rol
  useEffect(() => {
    console.log('🎯 Navigation - Estado actual:', {
      user: user?.name,
      activeRole,
      availableRoles,
      totalNavigationItems: navigationItems.length
    });
  }, [user, activeRole, availableRoles]);

  // Filtrar items del menú basado en permisos
  const filteredItems = navigationItems.filter(item => {
    // Si no requiere autenticación, mostrarlo siempre
    if (!item.requiresAuth) return true;
    
    // Si requiere autenticación pero no hay usuario, ocultarlo
    if (!user) return false;

    // Si requiere un rol específico, verificar que el usuario tenga ese rol
    if (item.requiredRole) {
      const hasRequiredRole = activeRole === item.requiredRole;
      
      // Debug log para items con rol requerido
      if (item.label === 'Usuarios') {
        console.log(`🔍 Verificando acceso a "${item.label}":`, {
          requiredRole: item.requiredRole,
          activeRole,
          hasRequiredRole
        });
      }
      
      return hasRequiredRole;
    }

    // Si no tiene entity definida, mostrarlo (es un item sin permisos específicos)
    if (!item.entity || !item.action) return true;

    // Verificar si el usuario tiene permiso para esta entity/action
    const hasAccess = hasPermission(item.entity, item.action);
    
    return hasAccess;
  });

  // Debug: Log de items filtrados
  useEffect(() => {
    console.log(`📋 Items del menú filtrados: ${filteredItems.length}/${navigationItems.length}`, 
      filteredItems.map(item => item.label)
    );
  }, [filteredItems]);

  // Verificar permisos de la ruta actual cuando cambia el rol
  useEffect(() => {
    // No hacer nada si no hay usuario
    if (!user) return;
    
    const currentRoute = navigationItems.find(item => item.path === location.pathname);
    
    // No hacer nada si no se encuentra la ruta
    if (!currentRoute) return;
    
    let shouldRedirect = false;
    let reason = '';
    
    // Verificar si requiere un rol específico
    if (currentRoute.requiredRole) {
      if (activeRole !== currentRoute.requiredRole) {
        shouldRedirect = true;
        reason = `Rol requerido: ${currentRoute.requiredRole}, rol actual: ${activeRole}`;
      }
    }
    // Si no requiere rol específico, verificar permisos entity/action
    else if (currentRoute.entity && currentRoute.action) {
      if (!hasPermission(currentRoute.entity, currentRoute.action)) {
        shouldRedirect = true;
        reason = `Sin permiso para ${currentRoute.entity}.${currentRoute.action}`;
      }
    }
    
    if (shouldRedirect) {
      console.log(`🚫 Acceso denegado a "${currentRoute.label}": ${reason}. Redirigiendo a productos...`);
      navigate('/products', { replace: true });
    }
  }, [activeRole, location.pathname, hasPermission, navigate, user]);

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
            {activeRole && (
              <span className="user-role">{getRoleDisplayName(activeRole)}</span>
            )}
          </div>
        </div>

        {/* Role Selector - Solo mostrar si hay más de un rol disponible */}
        {availableRoles.length > 1 && (
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