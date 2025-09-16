// src/hooks/useProductFilters.js
import { useState, useMemo } from 'react';

/**
 * Hook personalizado para manejar filtros de productos
 */
export const useProductFilters = (products = []) => {
  const [filters, setFilters] = useState({
    category: "",
    priceRange: "",
    search: ""
  });

  /**
   * Actualizar un filtro específico
   */
  const updateFilter = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  /**
   * Limpiar todos los filtros
   */
  const clearAllFilters = () => {
    setFilters({
      category: "",
      priceRange: "",
      search: ""
    });
  };

  /**
   * Verificar si un precio está en el rango especificado
   */
  const checkPriceRange = (price, range) => {
    switch (range) {
      case "0-20000":
        return price <= 20000;
      case "20001-40000":
        return price > 20000 && price <= 40000;
      case "40001+":
        return price > 40000;
      default:
        return true;
    }
  };

  /**
   * Productos filtrados usando useMemo para optimización
   */
  const filteredProducts = useMemo(() => {
    console.log('[useProductFilters] products type:', typeof products);
    console.log('[useProductFilters] products isArray:', Array.isArray(products));
    console.log('[useProductFilters] products value:', products);
    
    // Validación defensiva exhaustiva: asegurar que products es un array
    if (!Array.isArray(products)) {
      console.error('[useProductFilters] ERROR: products no es un array:', products);
      return [];
    }
    
    if (products.length === 0) {
      console.log('[useProductFilters] products está vacío');
      return [];
    }
    
    const filtered = products.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesPrice = !filters.priceRange || checkPriceRange(product.price, filters.priceRange);
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
    
    console.log('[useProductFilters] filteredProducts result:', filtered);
    console.log('[useProductFilters] filteredProducts isArray:', Array.isArray(filtered));
    
    return filtered;
  }, [products, filters]);

  /**
   * Estadísticas de filtros
   */
  const filterStats = useMemo(() => {
    return {
      total: products.length,
      filtered: filteredProducts.length,
      hasActiveFilters: Boolean(filters.category || filters.priceRange || filters.search)
    };
  }, [products.length, filteredProducts.length, filters]);

  return {
    filters,
    filteredProducts,
    filterStats,
    actions: {
      updateFilter,
      clearAllFilters
    }
  };
};

export default useProductFilters;