// src/api/categoryService.js
import api from './axios';

/**
 * Servicio para manejar todas las operaciones relacionadas con categorías
 */
export const categoryService = {
  /**
   * Obtener todas las categorías
   * @returns {Promise} Lista de categorías
   */
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.warn('Error al obtener categorías del backend, usando categorías por defecto:', error);
      
      // Categorías por defecto como fallback
      return [
        { id: "1", name: "Alimento" },
        { id: "2", name: "Juguetes" },
        { id: "3", name: "Accesorios" },
        { id: "4", name: "Higiene" },
        { id: "5", name: "Medicina" }
      ];
    }
  },

  /**
   * Obtener una categoría por ID
   * @param {string} categoryId - ID de la categoría
   * @returns {Promise} Categoría específica
   */
  getCategoryById: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Crear una nueva categoría
   * @param {Object} categoryData - Datos de la categoría
   * @returns {Promise} Categoría creada
   */
  createCategory: async (categoryData) => {
    const cleanData = {
      name: categoryData.name.trim(),
      description: categoryData.description?.trim()
    };

    const response = await api.post('/categories', cleanData);
    return response.data;
  }
};

export default categoryService;