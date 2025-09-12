// src/api/permissionService.js
import api from './axios';

/**
 * Servicio para manejar permisos y autorización
 */
export const permissionService = {
  /**
   * Obtener permisos del usuario actual
   * @returns {Promise<Object>} Permisos del usuario
   */
  getMyPermissions: async () => {
    const response = await api.get('/users/me/permissions');
    return response.data;
  },

  /**
   * Obtener perfil completo del usuario actual
   * @returns {Promise<Object>} Perfil del usuario
   */
  getMyProfile: async () => {
    const response = await api.get('/users/me/profile');
    return response.data;
  }
};

export default permissionService;