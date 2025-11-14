import React, { useState, useEffect } from 'react';
import { Button } from '../UI';
import { Sale } from '../../types';
import axios from '../../api/axios';
import './ProductReturnsModal.css';

interface ReturnItem {
  sale_detail_id: string;
  quantity_returned: number;
  condition: 'good' | 'damaged' | 'expired';
  product_name?: string;
  presentation_name?: string;
  original_quantity?: number;
  already_returned?: number;
  max_quantity?: number;
}

interface ProductReturnsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductReturnsModal: React.FC<ProductReturnsModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      setLoadingSales(true);
      try {
        const response = await axios.get('/sales/');
        setSales(response.data || []);
      } catch (err) {
        console.error('Error al cargar ventas:', err);
        setError('Error al cargar las ventas');
      } finally {
        setLoadingSales(false);
      }
    };

    fetchSales();
  }, []);

  const handleSaleSelect = async (saleId: string) => {
    if (!saleId) {
      setSelectedSale(null);
      setReturnItems([]);
      return;
    }

    setError(null);
    setLoadingSales(true);
    
    try {
      // El endpoint /sales/{id}/details ya devuelve toda la información completa
      const detailsResponse = await axios.get(`/sales/${saleId}/details`);
      const saleData = detailsResponse.data;
      
      console.log('Detalles completos de la venta:', saleData);
      
      // Los items ya vienen con toda la información incluyendo quantity_net y nombres
      const items = saleData.items || [];
      
      console.log('Items de la venta:', items);
      
      const allItems = items.map((item: any) => {
        // Usar quantity_net para saber cuánto queda disponible para devolver
        const availableQuantity = item.quantity_net !== undefined ? item.quantity_net : item.quantity;
        
        console.log(`Item ${item.id} - ${item.product_name}:`, {
          quantity: item.quantity,
          quantity_returned: item.quantity_returned,
          quantity_net: item.quantity_net,
          availableQuantity
        });
        
        return {
          sale_detail_id: item.id,
          quantity_returned: 0,
          condition: 'good' as const,
          product_name: item.product_name || 'Producto',
          presentation_name: item.presentation_name || 'Presentación',
          original_quantity: item.quantity || 0,
          already_returned: item.quantity_returned || 0,
          max_quantity: availableQuantity || 0
        };
      });
      
      console.log('Todos los items de la venta:', allItems);
      
      const availableItems = allItems.filter((item: any) => item.max_quantity && item.max_quantity > 0);
      
      if (availableItems.length === 0 && allItems.length > 0) {
        setError('Esta venta no tiene productos disponibles para devolver (todos los productos ya fueron devueltos)');
      }
      
      setReturnItems(allItems);
      setSelectedSale(saleData);
    } catch (err) {
      console.error('Error al cargar detalles de la venta:', err);
      setError('Error al cargar los detalles de la venta');
    } finally {
      setLoadingSales(false);
    }
  };

  const handleQuantityChange = (saleDetailId: string, quantity: number) => {
    setReturnItems(prev =>
      prev.map(item =>
        item.sale_detail_id === saleDetailId
          ? { ...item, quantity_returned: Math.max(0, Math.min(quantity, item.max_quantity || 0)) }
          : item
      )
    );
  };

  const handleConditionChange = (saleDetailId: string, condition: ReturnItem['condition']) => {
    setReturnItems(prev =>
      prev.map(item =>
        item.sale_detail_id === saleDetailId
          ? { ...item, condition }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSale) {
      setError('Por favor selecciona una venta');
      return;
    }

    // Filtrar solo los items que tienen cantidad mayor a 0
    const itemsToReturn = returnItems.filter(item => item.quantity_returned > 0);

    if (itemsToReturn.length === 0) {
      setError('Debes especificar al menos un producto para devolver');
      return;
    }

    if (!reason.trim()) {
      setError('Por favor ingresa el motivo de la devolución');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Preparar el payload según el formato del endpoint
      const payload = {
        sale_id: selectedSale.id,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        items: itemsToReturn.map(item => ({
          sale_detail_id: item.sale_detail_id,
          quantity_returned: item.quantity_returned,
          condition: item.condition
        }))
      };

      await axios.post('/returns/', payload);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al procesar la devolución:', err);
      
      // Manejar diferentes tipos de respuestas de error
      let errorMessage = 'Error al procesar la devolución. Por favor intenta nuevamente.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Si es un string, usarlo directamente
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        // Si tiene un campo message
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Si tiene un campo detail (string o array)
        else if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // Si es un array de errores de validación, mostrar el primero
            errorMessage = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content returns-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Devolución de Productos</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="returns-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Selector de venta */}
          <div className="form-group">
            <label htmlFor="sale-select">Seleccionar Venta *</label>
            <select
              id="sale-select"
              value={selectedSale?.id || ''}
              onChange={(e) => handleSaleSelect(e.target.value)}
              required
              disabled={loadingSales}
              className="form-control"
            >
              <option value="">-- Selecciona una venta --</option>
              {sales.map(sale => {
                // Si total_net es 0 o undefined, usar total como fallback
                // Esto es un workaround mientras el backend calcula correctamente total_net
                const totalToShow = (sale.total_net && sale.total_net > 0) 
                  ? sale.total_net 
                  : (sale.total || sale.total_amount || 0);
                return (
                  <option key={sale.id} value={sale.id}>
                    {sale.sale_code || 'Venta'} - {new Date(sale.sale_date).toLocaleDateString()} - ${totalToShow.toFixed(2)}
                    {sale.has_returns ? ' (con devoluciones)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Lista de productos de la venta seleccionada */}
          {selectedSale && (
            <>
              <div className="sale-summary">
                <div className="summary-item">
                  <strong>Código:</strong> {selectedSale.sale_code}
                </div>
                <div className="summary-item">
                  <strong>Total Original:</strong> ${selectedSale.total?.toFixed(2) || '0.00'}
                </div>
                {selectedSale.total_refunded !== undefined && selectedSale.total_refunded > 0 && (
                  <div className="summary-item">
                    <strong>Total Reembolsado:</strong> ${selectedSale.total_refunded.toFixed(2)}
                  </div>
                )}
                {selectedSale.total_net !== undefined && (
                  <div className="summary-item">
                    <strong>Total Neto:</strong> <span className="total-net">${selectedSale.total_net.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="sale-details-section">
                <h3>Productos de la venta</h3>
                <div className="return-items-list">
                  {returnItems.map((item, index) => {
                    const isFullyReturned = item.max_quantity === 0;
                    const hasPartialReturns = item.already_returned && item.already_returned > 0;
                    
                    return (
                      <div 
                        key={item.sale_detail_id} 
                        className={`return-item-card ${isFullyReturned ? 'fully-returned' : ''}`}
                      >
                        <div className="item-info">
                          <div className="product-header">
                            <strong>{item.product_name}</strong>
                            {isFullyReturned && (
                              <span className="returned-badge">Totalmente devuelto</span>
                            )}
                          </div>
                          <span className="presentation-badge">{item.presentation_name}</span>
                          
                          <div className="quantity-info">
                            <span className="quantity-detail">
                              Cantidad original: <strong>{item.original_quantity}</strong>
                            </span>
                            {hasPartialReturns && (
                              <span className="quantity-detail returned-info">
                                Ya devuelto: <strong>{item.already_returned}</strong>
                              </span>
                            )}
                            <span className={`quantity-detail ${isFullyReturned ? 'no-stock' : 'available-stock'}`}>
                              Disponible para devolver: <strong>{item.max_quantity}</strong>
                            </span>
                          </div>
                        </div>

                        {!isFullyReturned && (
                          <div className="item-controls">
                            <div className="form-group-inline">
                              <label>Cantidad a devolver</label>
                              <input
                                type="number"
                                min="0"
                                max={item.max_quantity}
                                value={item.quantity_returned}
                                onChange={(e) =>
                                  handleQuantityChange(item.sale_detail_id, parseInt(e.target.value) || 0)
                                }
                                className="form-control-small"
                              />
                            </div>

                            <div className="form-group-inline">
                              <label>Estado</label>
                              <select
                                value={item.condition}
                                onChange={(e) =>
                                  handleConditionChange(item.sale_detail_id, e.target.value as ReturnItem['condition'])
                                }
                                className="form-control-small"
                                disabled={item.quantity_returned === 0}
                              >
                                <option value="good">Bueno</option>
                                <option value="damaged">Dañado</option>
                                <option value="expired">Vencido</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Motivo y notas */}
              <div className="form-group">
                <label htmlFor="reason">Motivo de la devolución *</label>
                <input
                  id="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Producto defectuoso, error en pedido, etc."
                  required
                  className="form-control"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notas adicionales (opcional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles adicionales sobre la devolución..."
                  rows={3}
                  className="form-control"
                  maxLength={500}
                />
              </div>
            </>
          )}

          <div className="modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !selectedSale || returnItems.filter(i => i.quantity_returned > 0).length === 0}
            >
              {submitting ? 'Procesando...' : 'Procesar Devolución'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
