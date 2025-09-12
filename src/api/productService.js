// src/api/productService.js
import api from './axios';

/**
 * Servicio para manejar todas las operaciones relacionadas con productos
 */
export const productService = {
  /**
   * Obtener todos los productos
   * @param {Object} filters - Filtros opcionales (category, search, etc.)
   * @returns {Promise} Lista de productos
   */
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Obtener un producto por ID
   * @param {string} productId - ID del producto
   * @returns {Promise} Producto específico
   */
  getProductById: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  /**
   * Crear un nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise} Producto creado
   */
  createProduct: async (productData) => {
    // Validar datos antes de enviar
    const requiredFields = ['name', 'description', 'category_id'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    }

    // Limpiar y formatear datos
    const cleanData = {
      name: productData.name.trim(),
      description: productData.description.trim(),
      category_id: null/* productData.category_id */
    };
    console.log("createProduct: Datos a enviar al backend:", cleanData);
    const response = await api.post('/products', cleanData);
    return response.data;
  },

  /**
   * Actualizar un producto existente
   * @param {string} productId - ID del producto
   * @param {Object} productData - Datos actualizados
   * @returns {Promise} Producto actualizado
   */
  updateProduct: async (productId, productData) => {
    const cleanData = {
      name: productData.name?.trim(),
      description: productData.description?.trim(),
      category_id: productData.category_id
    };

    // Eliminar campos undefined
    Object.keys(cleanData).forEach(key => 
      cleanData[key] === undefined && delete cleanData[key]
    );

    const response = await api.put(`/products/${productId}`, cleanData);
    return response.data;
  },

  /**
   * Eliminar un producto
   * @param {string} productId - ID del producto
   * @returns {Promise} Confirmación de eliminación
   */
  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  }
};

export default productService;