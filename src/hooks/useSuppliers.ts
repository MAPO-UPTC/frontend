import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { Supplier, SupplierCreate, SupplierUpdate, UUID } from '../types';

interface UseSuppliersState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  selectedSupplier: Supplier | null;
}

interface UseSuppliersActions {
  loadSuppliers: () => Promise<void>;
  loadSupplierById: (supplierId: UUID) => Promise<void>;
  createSupplier: (data: SupplierCreate) => Promise<Supplier>;
  updateSupplier: (supplierId: UUID, data: SupplierUpdate) => Promise<Supplier>;
  deleteSupplier: (supplierId: UUID) => Promise<void>;
  clearError: () => void;
  setSelectedSupplier: (supplier: Supplier | null) => void;
}

export function useSuppliers(): UseSuppliersState & UseSuppliersActions {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los proveedores');
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSupplierById = useCallback(async (supplierId: UUID) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getSupplierById(supplierId);
      setSelectedSupplier(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el proveedor');
      console.error('Error loading supplier:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSupplier = useCallback(async (data: SupplierCreate): Promise<Supplier> => {
    setLoading(true);
    setError(null);
    try {
      const newSupplier = await apiClient.createSupplier(data);
      setSuppliers(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear el proveedor';
      setError(errorMessage);
      console.error('Error creating supplier:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSupplier = useCallback(async (supplierId: UUID, data: SupplierUpdate): Promise<Supplier> => {
    setLoading(true);
    setError(null);
    try {
      const updatedSupplier = await apiClient.updateSupplier(supplierId, data);
      setSuppliers(prev => 
        prev.map(s => s.id === supplierId ? updatedSupplier : s)
      );
      if (selectedSupplier?.id === supplierId) {
        setSelectedSupplier(updatedSupplier);
      }
      return updatedSupplier;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el proveedor';
      setError(errorMessage);
      console.error('Error updating supplier:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedSupplier]);

  const deleteSupplier = useCallback(async (supplierId: UUID): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.deleteSupplier(supplierId);
      setSuppliers(prev => prev.filter(s => s.id !== supplierId));
      if (selectedSupplier?.id === supplierId) {
        setSelectedSupplier(null);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar el proveedor';
      setError(errorMessage);
      console.error('Error deleting supplier:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedSupplier]);

  return {
    suppliers,
    loading,
    error,
    selectedSupplier,
    loadSuppliers,
    loadSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    clearError,
    setSelectedSupplier,
  };
}
