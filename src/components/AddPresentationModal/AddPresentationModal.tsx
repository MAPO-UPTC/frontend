import React, { useState } from 'react';
import { ProductPresentationCreate, UUID } from '../../types';
import { MeasurementUnit, UnitLabels } from '../../types';
import { productService } from '../../api/productService';
import './AddPresentationModal.css';

interface AddPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: UUID;
  onSuccess?: () => void;
}

const initialPresentationState: ProductPresentationCreate = {
  presentation_name: '',
  quantity: 0,
  unit: MeasurementUnit.KILOGRAM,
  price: 0,
  sku: '',
  active: true,
};

export const AddPresentationModal: React.FC<AddPresentationModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess
}) => {
  const [presentation, setPresentation] = useState<ProductPresentationCreate>(initialPresentationState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await productService.addPresentation(productId, presentation);

      onSuccess?.();
      onClose();
      setPresentation(initialPresentationState);
    } catch (err: any) {
      setError(err.message || 'Error al crear la presentación');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductPresentationCreate, value: string | number | boolean) => {
    setPresentation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agregar Nueva Presentación</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="presentation-form">
          <div className="form-group">
            <label htmlFor="presentation_name">
              Nombre de la Presentación <span className="required">*</span>
            </label>
            <input
              type="text"
              id="presentation_name"
              value={presentation.presentation_name}
              onChange={(e) => handleInputChange('presentation_name', e.target.value)}
              placeholder="Ej: Bolsa 1kg, Saco 20kg"
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">
                Cantidad <span className="required">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                value={presentation.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">
                Unidad <span className="required">*</span>
              </label>
              <select
                id="unit"
                value={presentation.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                required
                disabled={loading}
              >
                {Object.entries(UnitLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">
                Precio <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                value={presentation.price || ''}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU</label>
              <input
                type="text"
                id="sku"
                value={presentation.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Ej: ALM-PER-1KG"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={presentation.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                disabled={loading}
              />
              Presentación Activa
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Presentación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};