import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navigation.css';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  permission?: string;
}

const navigationItems: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '🏠',
  },
  {
    path: '/sales',
    label: 'Ventas',
    icon: '💰',
    permission: 'sales:read'
  },
  {
    path: '/sales/history',
    label: 'Historial',
    icon: '📋',
    permission: 'sales:read'
  },
  {
    path: '/inventory',
    label: 'Inventario',
    icon: '📦',
    permission: 'inventory:read'
  },
  {
    path: '/reports',
    label: 'Reportes',
    icon: '📊',
    permission: 'reports:read'
  },
  {
    path: '/products',
    label: 'Productos',
    icon: '🛍️',
    permission: 'products:read'
  }
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, handleLogout } = useAuth();

  // Función temporal para permisos - por ahora permite todo
  const hasPermission = (permission?: string) => {
    // Por ahora retorna true para todos los permisos
    // TODO: Implementar lógica de permisos real
    return true;
  };

  const filteredItems = navigationItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="nav-logo">
          <img src="/logo192.png" alt="MAPO" className="logo-image" />
          <span className="logo-text">MAPO</span>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'Usuario'}</span>
            <span className="user-role">{user?.role || 'Sin rol'}</span>
          </div>
        </div>
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