import { useState } from 'react';
import { MAPOAPIClient } from '../api/client';
import { ProductCreate, ProductCreateResponse, ValidationError } from '../types';

interface UseCreateProductReturn {
  createNewProduct: (productData: ProductCreate) => Promise<ProductCreateResponse | null>;
  loading: boolean;
  error: string | null;
  validationErrors: ValidationError[];
  clearErrors: () => void;
}

/**
 * Validar datos del producto antes de enviar
 * @param productData - Datos a validar
 * @returns Array de errores de validación (vacío si es válido)
 */
const validateProductData = (productData: ProductCreate): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validar nombre
  if (!productData.name || productData.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'El nombre del producto es requerido'
    });
  } else if (productData.name.length < 3) {
    errors.push({
      field: 'name',
      message: 'El nombre debe tener al menos 3 caracteres'
    });
  } else if (productData.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'El nombre no puede exceder 100 caracteres'
    });
  }

  // Validar descripción
  if (!productData.description || productData.description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'La descripción es requerida'
    });
  } else if (productData.description.length < 10) {
    errors.push({
      field: 'description',
      message: 'La descripción debe tener al menos 10 caracteres'
    });
  }

  // Validar presentaciones
  if (!productData.presentations || productData.presentations.length === 0) {
    errors.push({
      field: 'presentations',
      message: 'Debe agregar al menos una presentación'
    });
  } else {
    productData.presentations.forEach((pres, index) => {
      // Validar nombre de presentación
      if (!pres.presentation_name || pres.presentation_name.trim().length === 0) {
        errors.push({
          field: `presentations[${index}].presentation_name`,
          message: `Presentación ${index + 1}: El nombre es requerido`
        });
      }

      // Validar cantidad
      if (!pres.quantity || pres.quantity <= 0) {
        errors.push({
          field: `presentations[${index}].quantity`,
          message: `Presentación ${index + 1}: La cantidad debe ser mayor a 0`
        });
      }

      // Validar unidad
      if (!pres.unit || pres.unit.trim().length === 0) {
        errors.push({
          field: `presentations[${index}].unit`,
          message: `Presentación ${index + 1}: La unidad es requerida`
        });
      }

      // Validar precio
      if (pres.price === undefined || pres.price < 0) {
        errors.push({
          field: `presentations[${index}].price`,
          message: `Presentación ${index + 1}: El precio debe ser mayor o igual a 0`
        });
      }
    });

    // Validar presentaciones duplicadas
    const presentationNames = productData.presentations.map(p => p.presentation_name.toLowerCase());
    const duplicates = presentationNames.filter((name, index) => 
      presentationNames.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      errors.push({
        field: 'presentations',
        message: 'Hay presentaciones con nombres duplicados'
      });
    }

    // Validar SKUs duplicados
    const skus = productData.presentations
      .filter(p => p.sku)
      .map(p => p.sku!.toLowerCase());
    const duplicateSKUs = skus.filter((sku, index) => 
      skus.indexOf(sku) !== index
    );
    if (duplicateSKUs.length > 0) {
      errors.push({
        field: 'presentations',
        message: 'Hay SKUs duplicados'
      });
    }
  }

  // Validar URL de imagen
  if (productData.image_url && productData.image_url.trim().length > 0) {
    try {
      new URL(productData.image_url);
    } catch {
      errors.push({
        field: 'image_url',
        message: 'La URL de imagen no es válida'
      });
    }
  }

  return errors;
};

/**
 * Hook para manejar la creación de productos
 * @returns Funciones y estado para crear productos
 */
export const useCreateProduct = (): UseCreateProductReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const apiClient = new MAPOAPIClient();

  const clearErrors = () => {
    setError(null);
    setValidationErrors([]);
  };

  const createNewProduct = async (
    productData: ProductCreate
  ): Promise<ProductCreateResponse | null> => {
    // Limpiar errores previos
    clearErrors();
    setLoading(true);

    try {
      // Validar datos antes de enviar
      const errors = validateProductData(productData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setLoading(false);
        return null;
      }

      // Crear producto
      const response = await apiClient.createProduct(productData);
      setLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error desconocido al crear producto';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  return {
    createNewProduct,
    loading,
    error,
    validationErrors,
    clearErrors,
  };
};
