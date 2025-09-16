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
      
      console.log('[useCategories] API response type:', typeof data);
      console.log('[useCategories] API response isArray:', Array.isArray(data));
      console.log('[useCategories] API response:', data);
      
      // Validar si la respuesta es HTML (error disfrazado)
      if (typeof data === 'string' && data.includes('<html>')) {
        console.error('[useCategories] ERROR: API devolvió HTML en lugar de JSON');
        setCategories([]);
        setError('Error: El servidor devolvió una respuesta inválida para categorías');
        return;
      }
      
      // Validar que sea un array
      if (!Array.isArray(data)) {
        console.error('[useCategories] ERROR: API no devolvió un array:', data);
        setCategories([]);
        setError('Error: Formato de datos inválido para categorías');
        return;
      }
      
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Error al cargar categorías');
      console.error('Error fetching categories:', err);
      setCategories([]); // Asegurar que siempre sea array
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