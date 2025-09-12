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
      console.log('🔄 Obteniendo categorías del backend...');
      const response = await api.get('/categories');
      console.log('✅ Categorías obtenidas del backend:', response.data);
      return response.data;
    } catch (error) {
      console.warn('❌ Error al obtener categorías del backend, usando categorías por defecto:', error);
      
      // Categorías por defecto como fallback con UUIDs simulados
      const fallbackCategories = [
        { id: "550e8400-e29b-41d4-a716-446655440001", name: "Alimento" },
        { id: "550e8400-e29b-41d4-a716-446655440002", name: "Juguetes" },
        { id: "550e8400-e29b-41d4-a716-446655440003", name: "Accesorios" },
        { id: "550e8400-e29b-41d4-a716-446655440004", name: "Higiene" },
        { id: "550e8400-e29b-41d4-a716-446655440005", name: "Medicina" }
      ];
      console.log('📋 Usando categorías por defecto:', fallbackCategories);
      return fallbackCategories;
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