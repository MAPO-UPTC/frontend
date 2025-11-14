// src/hooks/useProducts.js
import { useState, useCallback, useRef } from 'react';
import { productService } from '../api';
import api from '../api/axios';

/**
 * Hook personalizado para manejar el estado de productos con paginación infinita
 * Proporciona funcionalidades completas de CRUD, filtrado y paginación
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  
  // Estado de paginación
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState(null);
  const loadingMoreRef = useRef(false);

  /**
   * Cargar productos con filtros opcionales y paginación
   */
  const fetchProducts = useCallback(async (newFilters = {}, resetPage = false) => {
    // Evitar llamadas duplicadas
    if (loadingMoreRef.current) return;
    
    const currentPage = resetPage ? 1 : page;
    
    setLoading(currentPage === 1);
    loadingMoreRef.current = true;
    setError(null);
    
    try {
      let data;
      const categoryId = newFilters.category || filters.category;
      
      // Construir parámetros de paginación
      const params = {
        page: currentPage,
        page_size: 20,
        ...(newFilters.search && { search: newFilters.search }),
        ...(categoryId && { category_id: categoryId })
      };
      
      if (categoryId) {
        // Usar endpoint /categories/:id/products (sin paginación por ahora)
        const response = await api.get(`/categories/${categoryId}/products`);
        data = response.data;
      } else {
        // Usar endpoint general con paginación
        const response = await api.get('/products/', { params });
        data = response.data;
      }
      // Validación defensiva exhaustiva: asegurar que data es un array
      let productsArray = [];
      let paginationData = null;
      
      console.log('📦 Respuesta del API:', data);
      
      // Verificar si la respuesta tiene el formato de paginación
      if (data && data.products && Array.isArray(data.products)) {
        productsArray = data.products;
        paginationData = data.pagination;
        console.log('✅ Formato de paginación detectado:', {
          productos: productsArray.length,
          pagina: paginationData?.page,
          total: paginationData?.total_products,
          hasNext: paginationData?.has_next
        });
      } else if (Array.isArray(data)) {
        productsArray = data;
        console.log('⚠️ Formato sin paginación (array directo):', productsArray.length);
      } else if (data && data.data && Array.isArray(data.data)) {
        productsArray = data.data;
        console.log('⚠️ Formato sin paginación (data.data):', productsArray.length);
      } else {
        console.error('[useProducts] ERROR: Respuesta de API no tiene formato esperado:', data);
        productsArray = [];
      }
      
      // Actualizar estado de paginación
      if (paginationData) {
        setPagination(paginationData);
        setHasMore(paginationData.has_next);
      } else {
        // Sin paginación, no hay más páginas
        setHasMore(false);
      }
      
      // Si es la primera página o reset, reemplazar productos
      // Si es carga de más, agregar a los existentes
      if (resetPage || currentPage === 1) {
        setProducts(productsArray);
        setPage(2); // Próxima página será la 2
      } else {
        setProducts(prev => [...prev, ...productsArray]);
        setPage(prev => prev + 1);
      }
      
    } catch (err) {
      console.error('Error fetching products from API:', err);
      setError(err.message || 'Error al cargar productos');
      
      // Solo usar mock data en la primera carga
      if (currentPage === 1) {
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
      setHasMore(false);
      }
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  }, [filters, page]);

  /**
   * Cargar más productos (para infinite scroll)
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore && !loadingMoreRef.current) {
      fetchProducts(filters, false);
    }
  }, [loading, hasMore, filters, fetchProducts]);

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
    setPage(1);
    setProducts([]);
  }, []);

  // NO cargar automáticamente, dejar que el componente lo controle
  // useEffect(() => {
  //   fetchProducts();
  // }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    filters,
    hasMore,
    pagination,
    actions: {
      fetchProducts,
      createProduct,
      updateFilters,
      clearFilters,
      loadMore,
      refetch: () => fetchProducts(filters, true)
    }
  };
};

export default useProducts;