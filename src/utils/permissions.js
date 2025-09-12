// src/utils/permissions.js
import { Action, Entity, PermissionLevel } from '../constants/permissions';

/**
 * Utilidades para verificar permisos en el frontend
 */

/**
 * Verificar si el usuario puede realizar una acción en una entidad
 * @param {Object} permissions - Permisos del usuario
 * @param {string} entity - Entidad (Entity)
 * @param {string} action - Acción (Action)
 * @returns {boolean} - True si puede realizar la acción
 */
export const canPerformAction = (permissions, entity, action) => {
  if (!permissions || !permissions[entity] || !permissions[entity][action]) {
    return false;
  }
  
  const permissionLevel = permissions[entity][action];
  return permissionLevel !== PermissionLevel.NONE;
};

/**
 * Obtener el nivel de permiso para una acción específica
 * @param {Object} permissions - Permisos del usuario
 * @param {string} entity - Entidad
 * @param {string} action - Acción
 * @returns {string} - Nivel de permiso
 */
export const getPermissionLevel = (permissions, entity, action) => {
  if (!permissions || !permissions[entity] || !permissions[entity][action]) {
    return PermissionLevel.NONE;
  }
  
  return permissions[entity][action];
};

/**
 * Verificar si puede crear productos
 * @param {Object} permissions - Permisos del usuario
 * @returns {boolean}
 */
export const canCreateProducts = (permissions) => {
  return canPerformAction(permissions, Entity.PRODUCTS, Action.CREATE);
};

/**
 * Verificar si puede editar productos
 * @param {Object} permissions - Permisos del usuario
 * @returns {boolean}
 */
export const canEditProducts = (permissions) => {
  return canPerformAction(permissions, Entity.PRODUCTS, Action.UPDATE);
};

/**
 * Verificar si puede eliminar productos
 * @param {Object} permissions - Permisos del usuario
 * @returns {boolean}
 */
export const canDeleteProducts = (permissions) => {
  return canPerformAction(permissions, Entity.PRODUCTS, Action.DELETE);
};

/**
 * Verificar si puede ver productos
 * @param {Object} permissions - Permisos del usuario
 * @returns {boolean}
 */
export const canViewProducts = (permissions) => {
  return canPerformAction(permissions, Entity.PRODUCTS, Action.READ);
};

/**
 * Verificar si puede gestionar usuarios
 * @param {Object} permissions - Permisos del usuario
 * @returns {boolean}
 */
export const canManageUsers = (permissions) => {
  return canPerformAction(permissions, Entity.USERS, Action.CREATE) ||
         canPerformAction(permissions, Entity.USERS, Action.UPDATE) ||
         canPerformAction(permissions, Entity.USERS, Action.DELETE);
};

/**
 * Verificar si puede gestionar proveedores
 * @param {Object} permissions - Permisos del usuario
 * @returns {boolean}
 */
export const canManageSuppliers = (permissions) => {
  return canPerformAction(permissions, Entity.SUPPLIERS, Action.CREATE) ||
         canPerformAction(permissions, Entity.SUPPLIERS, Action.UPDATE);
};

/**
 * Verificar si es administrador (tiene permisos avanzados)
 * @param {Array} roles - Roles del usuario
 * @returns {boolean}
 */
export const isAdmin = (roles = []) => {
  return roles.includes('ADMIN') || roles.includes('SUPERADMIN');
};

/**
 * Verificar si es superadministrador
 * @param {Array} roles - Roles del usuario
 * @returns {boolean}
 */
export const isSuperAdmin = (roles = []) => {
  return roles.includes('SUPERADMIN');
};

/**
 * Obtener acciones permitidas para una entidad
 * @param {Object} permissions - Permisos del usuario
 * @param {string} entity - Entidad
 * @returns {Array} - Array de acciones permitidas
 */
export const getAllowedActions = (permissions, entity) => {
  const allowedActions = [];
  
  Object.values(Action).forEach(action => {
    if (canPerformAction(permissions, entity, action)) {
      allowedActions.push(action);
    }
  });
  
  return allowedActions;
};