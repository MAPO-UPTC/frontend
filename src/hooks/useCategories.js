// src/hooks/useCategories.js
import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../api';

/**
 * Hook personalizado para manejar el estado de categorías
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar categorías
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Error al cargar categorías');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener categoría por ID
   */
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(category => category.id === categoryId);
  }, [categories]);

  /**
   * Cargar categorías al montar el componente
   */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    actions: {
      fetchCategories,
      getCategoryById,
      refetch: fetchCategories
    }
  };
};

export default useCategories;