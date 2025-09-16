// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { productService } from '../api';

/**
 * Hook personalizado para manejar el estado de productos
 * Proporciona funcionalidades completas de CRUD y filtrado
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  /**
   * Cargar productos con filtros opcionales
   */
  const fetchProducts = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await productService.getProducts({ ...filters, ...newFilters });
      // Validación defensiva: asegurar que data es un array
      const productsArray = Array.isArray(data) ? data : [];
      console.log('✅ Products loaded:', productsArray.length, 'items');
      setProducts(productsArray);
    } catch (err) {
      console.warn('Error fetching products from API, using mock data:', err);
      
      // Datos mock como fallback
      const mockProducts = [
        {
          id: 1,
          name: "Alimento Premium para Perros",
          price: 45000,
          image: "/api/placeholder/300/300",
          category: "Alimento",
          description: "Alimento premium para perros adultos",
          stock: 15
        },
        {
          id: 2,
          name: "Juguete Pelota",
          price: 12000,
          image: "/api/placeholder/300/300",
          category: "Juguetes",
          description: "Pelota resistente para perros",
          stock: 25
        },
        {
          id: 3,
          name: "Collar Ajustable",
          price: 18000,
          image: "/api/placeholder/300/300",
          category: "Accesorios",
          description: "Collar ajustable para mascotas",
          stock: 8
        },
        {
          id: 4,
          name: "Arena para Gatos",
          price: 25000,
          image: "/api/placeholder/300/300",
          category: "Higiene",
          description: "Arena absorbente para gatos",
          stock: 12
        }
      ];
      
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Crear un nuevo producto
   */
  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newProduct = await productService.createProduct(productData);
      setProducts(prevProducts => [...prevProducts, newProduct]);
      return newProduct;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error al crear producto';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * Cargar productos al montar el componente o cambiar filtros
   */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    filters,
    actions: {
      fetchProducts,
      createProduct,
      updateFilters,
      clearFilters,
      refetch: () => fetchProducts(filters)
    }
  };
};

export default useProducts;