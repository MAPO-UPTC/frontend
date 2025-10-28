import { useState, useCallback } from 'react';
import { 
  Product, 
  ProductUpdate, 
  ProductPresentationCreate,
  ProductPresentationUpdate,
  UUID 
} from '../types';
import { apiClient } from '../api/client';

interface UseProductEditState {
  product: Product | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
}

export const useProductEdit = () => {
  const [state, setState] = useState<UseProductEditState>({
    product: null,
    loading: false,
    error: null,
    saving: false,
  });

  /**
   * Cargar un producto por su ID
   * @param includeInactive - Si true, incluye presentaciones inactivas
   */
  const loadProduct = useCallback(async (productId: UUID, includeInactive: boolean = true) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const product = await apiClient.getProductById(productId, includeInactive);
      setState(prev => ({ ...prev, product, loading: false }));
      return product;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el producto';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, []);

  /**
   * Actualizar los datos generales del producto
   */
  const updateProduct = useCallback(async (productId: UUID, data: ProductUpdate) => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    try {
      const response = await apiClient.updateProduct(productId, data);
      setState(prev => ({ 
        ...prev, 
        product: response.product, 
        saving: false 
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el producto';
      setState(prev => ({ ...prev, error: errorMessage, saving: false }));
      throw error;
    }
  }, []);

  /**
   * Crear una nueva presentación para el producto
   */
  const createPresentation = useCallback(async (
    productId: UUID, 
    data: ProductPresentationCreate
  ) => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    try {
      const response = await apiClient.createPresentation(productId, data);
      
      // Recargar el producto completo para obtener la lista actualizada
      await loadProduct(productId);
      
      setState(prev => ({ ...prev, saving: false }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la presentación';
      setState(prev => ({ ...prev, error: errorMessage, saving: false }));
      throw error;
    }
  }, [loadProduct]);

  /**
   * Actualizar una presentación existente
   */
  const updatePresentation = useCallback(async (
    productId: UUID,
    presentationId: UUID,
    data: ProductPresentationUpdate
  ) => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    try {
      const response = await apiClient.updatePresentation(productId, presentationId, data);
      
      // Recargar el producto completo para obtener la lista actualizada
      await loadProduct(productId);
      
      setState(prev => ({ ...prev, saving: false }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la presentación';
      setState(prev => ({ ...prev, error: errorMessage, saving: false }));
      throw error;
    }
  }, [loadProduct]);

  /**
   * Limpiar el estado
   */
  const clearProduct = useCallback(() => {
    setState({
      product: null,
      loading: false,
      error: null,
      saving: false,
    });
  }, []);

  return {
    product: state.product,
    loading: state.loading,
    error: state.error,
    saving: state.saving,
    loadProduct,
    updateProduct,
    createPresentation,
    updatePresentation,
    clearProduct,
  };
};
