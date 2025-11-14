import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  entity?: string;
  action?: string;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  entity,
  action,
  requireAuth = true,
  redirectTo = '/products'
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const { actions: { hasPermission }, loading } = usePermissions();

  useEffect(() => {
    console.log('ProtectedRoute - Verificando acceso:', {
      path: location.pathname,
      entity,
      action,
      user: user?.email,
      requireAuth
    });
  }, [location.pathname, entity, action, user, requireAuth]);

  // Mostrar loading mientras se cargan permisos
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Verificando permisos...
      </div>
    );
  }

  // Si requiere autenticación y no hay usuario, redirigir al login
  if (requireAuth && !user) {
    console.log('❌ No hay usuario autenticado, redirigiendo a /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si no requiere permisos específicos, permitir acceso
  if (!entity || !action) {
    console.log('✅ Ruta sin permisos específicos, acceso permitido');
    return <>{children}</>;
  }

  // Verificar si el usuario tiene el permiso requerido
  const userHasPermission = hasPermission(entity, action);

  if (!userHasPermission) {
    console.log(`❌ Usuario sin permiso para ${entity}.${action}, redirigiendo a ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  console.log(`✅ Usuario tiene permiso para ${entity}.${action}`);
  return <>{children}</>;
};

export default ProtectedRoute;
