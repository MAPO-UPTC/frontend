// src/hooks/useRoleManagement.js
import { useState, useCallback } from 'react';
import { usePermissions } from './usePermissions';
import { authService } from '../api';

/**
 * Hook especializado para manejo de roles dinámicos
 */
export const useRoleManagement = () => {
  const {
    availableRoles,
    activeRole,
    effectiveRoles,
    hasMultipleRoles,
    isUsingAllRoles,
    loading,
    error,
    actions: { switchRole: switchRoleBase, clearActiveRole: clearActiveRoleBase }
  } = usePermissions();

  const [switching, setSwitching] = useState(false);

  /**
   * Cambiar rol con manejo de estados de carga
   */
  const switchRole = useCallback(async (role) => {
    try {
      setSwitching(true);
      const result = await switchRoleBase(role);
      console.log(`✅ Cambiado a rol: ${role}`);
      return result;
    } catch (error) {
      console.error(`❌ Error cambiando a rol ${role}:`, error);
      throw error;
    } finally {
      setSwitching(false);
    }
  }, [switchRoleBase]);

  /**
   * Limpiar rol activo con manejo de estados
   */
  const clearActiveRole = useCallback(async () => {
    try {
      setSwitching(true);
      const result = await clearActiveRoleBase();
      console.log('✅ Rol activo limpiado - usando todos los roles');
      return result;
    } catch (error) {
      console.error('❌ Error limpiando rol activo:', error);
      throw error;
    } finally {
      setSwitching(false);
    }
  }, [clearActiveRoleBase]);

  /**
   * Obtener información del rol activo actual
   */
  const getActiveRoleInfo = useCallback(async () => {
    try {
      const roleInfo = await authService.getActiveRole();
      return roleInfo;
    } catch (error) {
      console.error('Error obteniendo información del rol activo:', error);
      throw error;
    }
  }, []);

  /**
   * Verificar si puede cambiar a un rol específico
   */
  const canSwitchToRole = useCallback((role) => {
    return availableRoles.includes(role);
  }, [availableRoles]);

  /**
   * Obtener el nombre amigable del rol
   */
  const getRoleDisplayName = useCallback((role) => {
    const roleNames = {
      'USER': 'Usuario',
      'ADMIN': 'Administrador',
      'SUPERADMIN': 'Super Administrador'
    };
    return roleNames[role] || role;
  }, []);

  /**
   * Obtener descripción del estado actual
   */
  const getCurrentRoleDescription = useCallback(() => {
    if (isUsingAllRoles) {
      return `Usando todos los roles disponibles: ${availableRoles.map(getRoleDisplayName).join(', ')}`;
    } else {
      return `Usando rol específico: ${getRoleDisplayName(activeRole)}`;
    }
  }, [isUsingAllRoles, availableRoles, activeRole, getRoleDisplayName]);

  return {
    // Estados
    availableRoles,
    activeRole,
    effectiveRoles,
    hasMultipleRoles,
    isUsingAllRoles,
    loading: loading || switching,
    error,
    switching,

    // Acciones
    switchRole,
    clearActiveRole,
    getActiveRoleInfo,
    canSwitchToRole,
    getRoleDisplayName,
    getCurrentRoleDescription,

    // Utilidades
    roleCount: availableRoles.length,
    hasAdminRole: availableRoles.includes('ADMIN') || availableRoles.includes('SUPERADMIN'),
    hasSuperAdminRole: availableRoles.includes('SUPERADMIN')
  };
};