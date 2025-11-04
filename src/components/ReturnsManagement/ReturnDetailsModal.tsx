import React, { useState, useEffect } from 'react';
import { Button } from '../UI';
import axios from '../../api/axios';
import './ReturnDetailsModal.css';

interface ReturnDetail {
  id: string;
  return_code: string;
  sale_id: string;
  sale_code?: string;
  customer_id: string;
  customer_name?: string;
  reason: string;
  notes?: string;
  status: string;
  created_at: string;
  processed_at?: string;
  items: ReturnItemDetail[];
}

interface ReturnItemDetail {
  id: string;
  sale_detail_id: string;
  product_name?: string;
  presentation_name?: string;
  quantity_returned: number;
  condition: string;
  refund_amount?: number;
}

interface ReturnDetailsModalProps {
  returnId: string;
  onClose: () => void;
}

export const ReturnDetailsModal: React.FC<ReturnDetailsModalProps> = ({
  returnId,
  onClose
}) => {
  const [returnData, setReturnData] = useState<ReturnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReturnDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/returns/${returnId}`);
      setReturnData(response.data);
    } catch (err: any) {
      console.error('Error al cargar detalles:', err);
      setError('Error al cargar los detalles de la devolución');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturnDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!returnData) return;

    setProcessing(true);
    setError(null);

    try {
      await axios.put(`/returns/${returnId}/status`, { status: newStatus });
      await loadReturnDetails(); // Recargar detalles
    } catch (err: any) {
      console.error('Error al actualizar estado:', err);
      setError('Error al actualizar el estado de la devolución');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessReturn = async () => {
    if (!returnData) return;

    setProcessing(true);
    setError(null);

    try {
      console.log('=== Procesando Devolución ===');
      console.log('Return ID:', returnId);
      console.log('Endpoint:', `/returns/${returnId}/status`);
      
      const response = await axios.put(`/returns/${returnId}/status`, {
        status: 'approved'
      });
      console.log('✅ Respuesta exitosa:', response.data);
      
      await loadReturnDetails(); // Recargar detalles
    } catch (err: any) {
      console.error('❌ Error al procesar devolución');
      console.error('Status:', err.response?.status);
      console.error('Error completo:', err.response?.data);
      
      // Mostrar error más detallado
      let errorMessage = 'Error al procesar la devolución';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        console.log('Tipo de error data:', typeof errorData);
        console.log('Error data:', errorData);
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((e: any) => {
              if (typeof e === 'string') return e;
              return e.msg || e.message || JSON.stringify(e);
            }).join(', ');
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      }
      
      console.log('Mensaje de error final:', errorMessage);
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processed':
        return 'status-processed';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-unknown';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'processed':
        return 'Procesada';
      case 'rejected':
        return 'Rechazada';
      default:
        return status;
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'good':
        return 'Bueno';
      case 'damaged':
        return 'Dañado';
      case 'expired':
        return 'Vencido';
      default:
        return condition;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content return-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalles de la Devolución</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Cargando detalles...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : returnData ? (
          <div className="return-details-content">
            {/* Información general */}
            <div className="detail-section">
              <h3>Información General</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Código de Devolución:</label>
                  <span className="detail-value">{returnData.return_code}</span>
                </div>
                <div className="detail-item">
                  <label>Código de Venta:</label>
                  <span className="detail-value">{returnData.sale_code || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Cliente:</label>
                  <span className="detail-value">{returnData.customer_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Estado:</label>
                  <span className={`status-badge ${getStatusBadgeClass(returnData.status)}`}>
                    {getStatusLabel(returnData.status)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Fecha de Creación:</label>
                  <span className="detail-value">
                    {new Date(returnData.created_at).toLocaleString()}
                  </span>
                </div>
                {returnData.processed_at && (
                  <div className="detail-item">
                    <label>Fecha de Procesamiento:</label>
                    <span className="detail-value">
                      {new Date(returnData.processed_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Motivo y notas */}
            <div className="detail-section">
              <h3>Motivo</h3>
              <p className="detail-text">{returnData.reason}</p>
              {returnData.notes && (
                <>
                  <h3>Notas Adicionales</h3>
                  <p className="detail-text">{returnData.notes}</p>
                </>
              )}
            </div>

            {/* Items devueltos */}
            <div className="detail-section">
              <h3>Productos Devueltos</h3>
              <div className="items-list">
                {returnData.items.map((item) => (
                  <div key={item.id} className="item-card">
                    <div className="item-header">
                      <strong>{item.product_name || 'Producto'}</strong>
                      <span className="item-quantity">Cantidad: {item.quantity_returned}</span>
                    </div>
                    <div className="item-details">
                      <span className="presentation-badge">
                        {item.presentation_name || 'Presentación'}
                      </span>
                      <span className="condition-badge">
                        Estado: {getConditionLabel(item.condition)}
                      </span>
                      {item.refund_amount && (
                        <span className="refund-amount">
                          Reembolso: ${item.refund_amount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            {returnData.status.toLowerCase() === 'pending' && (
              <div className="detail-section">
                <h3>Acciones</h3>
                <div className="action-buttons">
                  <Button
                    variant="success"
                    onClick={handleProcessReturn}
                    disabled={processing}
                  >
                    {processing ? 'Procesando...' : 'Procesar Devolución'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={processing}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p>No se encontraron detalles</p>
          </div>
        )}

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
