// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { productService } from '../api';
import api from '../api/axios';

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
      let data;
      const categoryId = newFilters.category || filters.category;
      if (categoryId) {
        // Usar endpoint /categories/:id/products
        const response = await api.get(`/categories/${categoryId}/products`);
        data = response.data;
      } else {
        // Usar endpoint general
        data = await productService.getProducts({ ...filters, ...newFilters });
      }
      // Validación defensiva exhaustiva: asegurar que data es un array
      let productsArray = [];
      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        productsArray = data.data;
      } else if (data && data.products && Array.isArray(data.products)) {
        productsArray = data.products;
      } else {
        console.error('[useProducts] ERROR: Respuesta de API no tiene formato de array:', data);
        productsArray = [];
      }
      setProducts(productsArray);
    } catch (err) {
      console.warn('Error fetching products from API, using mock data:', err);
      // Datos mock como fallback con nueva estructura
      const mockProducts = [
        {
          id: "1",
          name: "Alimento Premium para Perros",
          description: "Alimento premium para perros adultos de todas las razas",
          brand: "Premium Pet",
          base_unit: "kg",
          category_id: "cat-1",
          image_url: "/api/placeholder/300/300",
          category: { id: "cat-1", name: "Alimentos", description: "Alimentos para mascotas" },
          presentations: [
            {
              id: "pres-1-1",
              presentation_name: "Saco 2kg",
              quantity: 2,
              unit: "kg",
              sku: "ALI-PREM-2KG",
              price: 25000,
              stock_available: 15,
              active: true
            },
            {
              id: "pres-1-2",
              presentation_name: "Saco 15kg",
              quantity: 15,
              unit: "kg",
              sku: "ALI-PREM-15KG",
              price: 150000,
              stock_available: 8,
              active: true
            }
          ]
        },
        {
          id: "2",
          name: "Juguete Kong Clásico",
          description: "Juguete resistente para perros de todas las edades",
          brand: "Kong",
          base_unit: "unidad",
          category_id: "cat-2",
          image_url: "/api/placeholder/300/300",
          category: { id: "cat-2", name: "Juguetes", description: "Juguetes para mascotas" },
          presentations: [
            {
              id: "pres-2-1",
              presentation_name: "Pequeño",
              quantity: 1,
              unit: "unidad",
              sku: "KONG-PEQ",
              price: 22000,
              stock_available: 25,
              active: true
            },
            {
              id: "pres-2-2",
              presentation_name: "Mediano",
              quantity: 1,
              unit: "unidad",
              sku: "KONG-MED",
              price: 32000,
              stock_available: 18,
              active: true
            },
            {
              id: "pres-2-3",
              presentation_name: "Grande",
              quantity: 1,
              unit: "unidad",
              sku: "KONG-GRA",
              price: 45000,
              stock_available: 12,
              active: true
            }
          ]
        },
        {
          id: "3",
          name: "Collar Ajustable Premium",
          description: "Collar ajustable con diseño ergonómico",
          brand: "PetComfort",
          base_unit: "unidad",
          category_id: "cat-3",
          image_url: "/api/placeholder/300/300",
          category: { id: "cat-3", name: "Accesorios", description: "Accesorios para mascotas" },
          presentations: [
            {
              id: "pres-3-1",
              presentation_name: "Talla S (20-30cm)",
              quantity: 1,
              unit: "unidad",
              sku: "COL-PREM-S",
              price: 18000,
              stock_available: 8,
              active: true
            },
            {
              id: "pres-3-2",
              presentation_name: "Talla M (30-45cm)",
              quantity: 1,
              unit: "unidad",
              sku: "COL-PREM-M",
              price: 22000,
              stock_available: 5,
              active: true
            },
            {
              id: "pres-3-3",
              presentation_name: "Talla L (45-60cm)",
              quantity: 1,
              unit: "unidad",
              sku: "COL-PREM-L",
              price: 28000,
              stock_available: 3,
              active: true
            }
          ]
        },
        {
          id: "4", 
          name: "Arena Sanitaria Premium",
          description: "Arena absorbente con control de olores",
          brand: "CleanCat",
          base_unit: "kg",
          category_id: "cat-4",
          image_url: "/api/placeholder/300/300", 
          category: { id: "cat-4", name: "Higiene", description: "Productos de higiene" },
          presentations: [
            {
              id: "pres-4-1",
              presentation_name: "Bolsa 5kg",
              quantity: 5,
              unit: "kg",
              sku: "ARENA-5KG",
              price: 25000,
              stock_available: 12,
              active: true
            },
            {
              id: "pres-4-2", 
              presentation_name: "Bolsa 10kg",
              quantity: 10,
              unit: "kg",
              sku: "ARENA-10KG",
              price: 45000,
              stock_available: 7,
              active: true
            }
          ]
        }
      ];
      
      console.log('[useProducts] Using mock data fallback');
      console.log('[useProducts] mockProducts isArray:', Array.isArray(mockProducts));
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