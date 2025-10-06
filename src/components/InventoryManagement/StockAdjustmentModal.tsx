import React, { useState } from 'react';
import { Button } from '../UI';
import { ProductPresentation } from '../../types';
import './StockAdjustmentModal.css';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  presentation: ProductPresentation | null;
  onClose: () => void;
  onAdjust: (presentationId: string, newStock: number, reason: string) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  presentation,
  onClose,
  onAdjust
}) => {
  const [newStock, setNewStock] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract'>('set');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (presentation) {
      setNewStock(presentation.stock_available || 0);
    }
  }, [presentation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presentation) return;

    setIsSubmitting(true);
    try {
      let finalStock = newStock;
      
      if (adjustmentType === 'add') {
        finalStock = (presentation.stock_available || 0) + newStock;
      } else if (adjustmentType === 'subtract') {
        finalStock = Math.max(0, (presentation.stock_available || 0) - newStock);
      }

      await onAdjust(presentation.id, finalStock, reason);
      onClose();
      setReason('');
      setNewStock(0);
    } catch (error) {
      console.error('Error adjusting stock:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateFinalStock = () => {
    if (!presentation) return 0;
    
    const currentStock = presentation.stock_available || 0;
    
    switch (adjustmentType) {
      case 'add':
        return currentStock + newStock;
      case 'subtract':
        return Math.max(0, currentStock - newStock);
      default:
        return newStock;
    }
  };

  if (!isOpen || !presentation) return null;

  return (
    <div className="stock-modal-overlay" onClick={onClose}>
      <div className="stock-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ajustar Stock</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="product-info">
          <h3>{presentation.product?.name}</h3>
          <p className="presentation-name">{presentation.presentation_name}</p>
          <div className="current-stock">
            <span>Stock actual: <strong>{presentation.stock_available || 0}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="adjustment-form">
          <div className="adjustment-type">
            <label>Tipo de ajuste:</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  value="set"
                  checked={adjustmentType === 'set'}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                />
                Establecer cantidad
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="add"
                  checked={adjustmentType === 'add'}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                />
                Agregar
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="subtract"
                  checked={adjustmentType === 'subtract'}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                />
                Restar
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="stock-value">
              {adjustmentType === 'set' ? 'Nueva cantidad:' : 
               adjustmentType === 'add' ? 'Cantidad a agregar:' : 'Cantidad a restar:'}
            </label>
            <input
              type="number"
              id="stock-value"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              required
              className="stock-input"
            />
          </div>

          <div className="stock-preview">
            <span>Stock resultante: <strong>{calculateFinalStock()}</strong></span>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Motivo del ajuste:</label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="reason-select"
            >
              <option value="">Seleccionar motivo</option>
              <option value="inventory_count">Conteo de inventario</option>
              <option value="damaged_goods">Mercancía dañada</option>
              <option value="expired_goods">Mercancía vencida</option>
              <option value="theft_loss">Pérdida/Robo</option>
              <option value="supplier_return">Devolución a proveedor</option>
              <option value="customer_return">Devolución de cliente</option>
              <option value="correction">Corrección de error</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Ajustar Stock
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};