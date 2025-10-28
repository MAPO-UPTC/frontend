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
    
    console.log('🔍 Fetching products from:', url);
    const response = await api.get(url);
    console.log('📦 Products API response:', response.data);
    console.log('📦 Response type:', typeof response.data, 'isArray:', Array.isArray(response.data));
    
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
    // Validar datos antes de enviar (sin categoryId por ahora)
    const requiredFields = ['name', 'description'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    }

    // Limpiar y formatear datos
    const cleanData = {
      name: productData.name.trim(),
      description: productData.description.trim(),
      category_id: null // Temporalmente enviamos null hasta tener categorías con UUID válidos
    };

    console.log("🔧 Enviando category_id como null temporalmente");

    // Incluir image_url si está presente
    if (productData.image_url && productData.image_url.trim()) {
      cleanData.image_url = productData.image_url.trim();
    }

    console.log("createProduct: FormData original:", productData);
    console.log("createProduct: CategoryId type:", typeof productData.categoryId);
    console.log("createProduct: Image URL:", productData.image_url);

    console.log("createProduct: Datos a enviar al backend:", cleanData);
    
    try {
      const response = await api.post('/products', cleanData);
      console.log("✅ Producto creado exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al crear producto:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Full error:", error);
      throw error;
    }
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
  },

  /**
   * Agregar una nueva presentación a un producto existente
   * @param {string} productId - ID del producto
   * @param {Object} presentationData - Datos de la presentación
   * @returns {Promise} Presentación creada
   */
  addPresentation: async (productId, presentationData) => {
    try {
      const response = await api.post(`/products/${productId}/presentations`, presentationData);
      console.log("✅ Presentación creada exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al crear presentación:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Full error:", error);
      throw error;
    }
  }
};

export default productService;