// src/hooks/usePermissions.js
import { useState, useEffect, useCallback } from 'react';
import { authService } from '../api';
import { PermissionLevel } from '../constants';

/**
 * Hook personalizado para manejar permisos y roles dinámicos del usuario
 */
export const usePermissions = () => {
  const [permissionData, setPermissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar permisos del usuario actual
   */
  const loadPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      if (!token) {
        console.log('🚫 No hay token disponible, no se pueden cargar permisos');
        setPermissionData(null);
        setLoading(false);
        return;
      }

      console.log('🔄 Cargando permisos del usuario...');
      const permissions = await authService.getPermissions();
      console.log('✅ Permisos cargados exitosamente:', permissions);
      setPermissionData(permissions);
    } catch (err) {
      console.error('❌ Error al obtener permisos:', err);
      
      // Si hay error de autenticación, limpiar datos y disparar logout
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('🔐 Error de autenticación, limpiando sesión...');
        authService.logout();
        setPermissionData(null);
        
        // Disparar evento de logout si no se ha disparado ya
        const logoutEvent = new CustomEvent('userLogout');
        window.dispatchEvent(logoutEvent);
      } else {
        setError(err.message || 'Error al cargar permisos');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  const hasPermission = useCallback((entity, action, requiredLevel = PermissionLevel.ALL) => {
    console.log(`🔍 Verificando permiso: ${entity}.${action} (requiere: ${requiredLevel})`);
    
    // Si no hay token, no hay permisos
    const token = authService.getToken();
    if (!token) {
      console.log('🚫 No hay token, permiso denegado');
      return false;
    }
    
    if (!permissionData?.permissions) {
      console.log('❌ No hay datos de permisos cargados');
      return false;
    }
    
    console.log('📊 Datos de permisos actuales:', permissionData);
    
    try {
      const entityPerms = permissionData.permissions[entity];
      if (!entityPerms) {
        console.log(`❌ No hay permisos para entidad: ${entity}`);
        return false;
      }

      const userLevel = entityPerms[action];
      console.log(`👤 Nivel del usuario para ${entity}.${action}: ${userLevel}`);
      
      if (!userLevel || userLevel === PermissionLevel.NONE) {
        console.log('❌ Permiso denegado: nivel NONE o no definido');
        return false;
      }

      // Jerarquía de permisos: ALL > CONDITIONAL > OWN > NONE
      const hierarchy = {
        [PermissionLevel.ALL]: 4,
        [PermissionLevel.CONDITIONAL]: 3,
        [PermissionLevel.OWN]: 2,
        [PermissionLevel.NONE]: 1
      };

      const hasAccess = hierarchy[userLevel] >= hierarchy[requiredLevel];
      console.log(`${hasAccess ? '✅' : '❌'} Resultado: ${userLevel} ${hasAccess ? '>=' : '<'} ${requiredLevel}`);
      
      return hasAccess;
    } catch (error) {
      console.error('Error verificando permiso:', error);
      return false;
    }
  }, [permissionData]);

  /**
   * Cambiar rol activo
   */
  const switchRole = useCallback(async (role) => {
    try {
      console.log(`🎭 Cambiando a rol: ${role}`);
      setLoading(true);
      setError(null);
      
      const result = await authService.switchRole(role);
      console.log('✅ Rol cambiado exitosamente:', result);
      
      // Recargar permisos después del cambio
      console.log('🔄 Recargando permisos después del cambio de rol...');
      await loadPermissions();
      
      return result;
    } catch (err) {
      console.error('❌ Error cambiando rol:', err);
      setError(err.message || 'Error cambiando rol');
      throw err;
    }
  }, [loadPermissions]);

  /**
   * Limpiar rol activo (usar todos los roles)
   */
  const clearActiveRole = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.clearActiveRole();
      console.log('Rol activo limpiado:', result);
      
      // Recargar permisos después de limpiar
      await loadPermissions();
      
      return result;
    } catch (err) {
      console.error('Error limpiando rol activo:', err);
      setError(err.message || 'Error limpiando rol activo');
      throw err;
    }
  }, [loadPermissions]);

  /**
   * Métodos de conveniencia para verificar acciones específicas
   */
  const canCreate = useCallback((entity) => hasPermission(entity, 'CREATE'), [hasPermission]);
  const canRead = useCallback((entity) => hasPermission(entity, 'READ'), [hasPermission]);
  const canUpdate = useCallback((entity) => hasPermission(entity, 'UPDATE'), [hasPermission]);
  const canDelete = useCallback((entity) => hasPermission(entity, 'DELETE'), [hasPermission]);

  /**
   * Verificar si es administrador
   */
  const isAdmin = useCallback(() => {
    if (!permissionData?.available_roles) return false;
    return permissionData.available_roles.includes('ADMIN') || permissionData.available_roles.includes('SUPERADMIN');
  }, [permissionData]);

  /**
   * Verificar si es superadministrador
   */
  const isSuperAdmin = useCallback(() => {
    if (!permissionData?.available_roles) return false;
    return permissionData.available_roles.includes('SUPERADMIN');
  }, [permissionData]);

  /**
   * Limpiar todos los datos de permisos (útil para logout)
   */
  const clearPermissions = useCallback(() => {
    console.log('🧹 Limpiando todos los datos de permisos...');
    setPermissionData(null);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * Cargar permisos al montar el componente y cuando cambie el token
   */
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      loadPermissions();
    } else {
      // Si no hay token, limpiar todos los datos de permisos
      console.log('🧹 No hay token, limpiando permisos...');
      setPermissionData(null);
      setError(null);
      setLoading(false);
    }
  }, [loadPermissions]);

  /**
   * Efecto para limpiar permisos cuando se hace logout
   * Escucha cambios en localStorage y eventos de logout
   */
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Si se eliminó el token, limpiar permisos
      if (e.key === 'token' && !e.newValue) {
        console.log('🔓 Token eliminado por localStorage, limpiando permisos...');
        clearPermissions();
      }
    };

    const handleLogoutEvent = () => {
      console.log('🔓 Evento de logout recibido, limpiando permisos...');
      clearPermissions();
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar evento personalizado de logout
    window.addEventListener('userLogout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogout', handleLogoutEvent);
    };
  }, [clearPermissions]);

  return {
    // Datos de permisos
    permissions: permissionData?.permissions || {},
    availableRoles: permissionData?.available_roles || [],
    activeRole: permissionData?.active_role || null,
    effectiveRoles: permissionData?.effective_roles || [],
    userId: permissionData?.user_id || null,
    
    // Estados
    loading,
    error,
    
    // Propiedades de conveniencia
    hasMultipleRoles: (permissionData?.available_roles?.length || 0) > 1,
    isUsingAllRoles: !permissionData?.active_role,

    // Acciones
    actions: {
      loadPermissions,
      hasPermission,
      switchRole,
      clearActiveRole,
      clearPermissions,
      canCreate,
      canRead,
      canUpdate,
      canDelete,
      isAdmin,
      isSuperAdmin
    }
  };
};

export default usePermissions;