// src/components/PermissionGate/PermissionGate.jsx
import React, { useMemo } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionLevel } from '../../constants';

/**
 * Componente que condiciona la renderización basada en permisos
 * Solo muestra el contenido si el usuario tiene los permisos necesarios
 */
export default function PermissionGate({ 
  entity, 
  action, 
  level = PermissionLevel.ALL,
  roles = [], 
  fallback = null, 
  children,
  showLoading = true,
  loadingComponent = <div>Verificando permisos...</div>
}) {
  const { 
    availableRoles, 
    activeRole,
    permissions,
    loading, 
    actions: { hasPermission } 
  } = usePermissions();

  console.log(`🚪 PermissionGate: ${entity}.${action}`);
  console.log(`   - activeRole: ${activeRole}`);
  console.log(`   - loading: ${loading}`);
  console.log(`   - permissions:`, permissions);

  // Memoizar el resultado de la verificación de permisos para evitar cálculos innecesarios
  const hasAccess = useMemo(() => {
    // Mientras carga, retornar false
    if (loading) {
      return false;
    }

    // Verificar por rol si se especifica
    if (roles.length > 0) {
      const hasRequiredRole = roles.some(role => availableRoles.includes(role));
      if (!hasRequiredRole) {
        return false;
      }
    }

    // Verificar por entidad y acción si se especifica
    if (entity && action) {
      const permission = hasPermission(entity, action, level);
      console.log(`🎯 Resultado final para ${entity}.${action}: ${permission}`);
      return permission;
    }

    // Si no se especifican restricciones, permitir acceso
    return true;
  }, [loading, roles, availableRoles, entity, action, level, hasPermission]);

  // Mientras carga, mostrar loading o fallback
  if (loading && showLoading) {
    return loadingComponent;
  }

  if (loading) {
    return fallback || null;
  }

  // Si no tiene acceso, mostrar fallback
  if (!hasAccess) {
    return fallback || null;
  }

  // Si pasa todas las verificaciones, renderizar el contenido
  return children;
}