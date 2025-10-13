import React, { useState, useEffect } from 'react';
import { MAPOAPIClient } from '../../api/client';
import { BulkConversionCreate, UUID } from '../../types';
import './BulkConversionModal.css';

interface BulkConversionModalProps {
  lotDetailId?: string;              // ID del lote empaquetado (opcional si se proporciona presentationId)
  presentationId?: UUID;             // ID de la presentación origen (empaquetada)
  targetPresentationId: UUID;        // ID de la presentación destino (a granel) - REQUERIDO
  productName: string;              // Nombre del producto
  presentationName: string;         // Nombre de la presentación
  presentationQuantity: number;     // Cantidad en la presentación (ej: 500g)
  presentationUnit: string;         // Unidad (ej: "g", "ml", "kg")
  availablePackages: number;        // Cantidad de paquetes disponibles
  productId: string;                // ID del producto
  onClose: () => void;
  onSuccess: () => void;
}

const apiClient = new MAPOAPIClient();

export const BulkConversionModal: React.FC<BulkConversionModalProps> = ({
  lotDetailId: providedLotDetailId,
  presentationId,
  targetPresentationId,
  productName,
  presentationName,
  presentationQuantity,
  presentationUnit,
  availablePackages,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [convertedQuantity, setConvertedQuantity] = useState<number>(1); // Cantidad de paquetes a convertir
  const [unitConversionFactor, setUnitConversionFactor] = useState<number>(presentationQuantity); // Factor de conversión
  const [lotDetailId, setLotDetailId] = useState<string | null>(providedLotDetailId || null);
  const [loadingLotDetail, setLoadingLotDetail] = useState(false);

  const fetchLotDetailId = async () => {
    if (!presentationId || providedLotDetailId) return;
    
    setLoadingLotDetail(true);
    setError(null);
    try {
      // Obtener los detalles de lotes disponibles para esta presentación
      const lotDetails = await apiClient.getAvailableLotDetails(presentationId);
      
      // El backend ya retorna los lotes ordenados por FIFO
      // El primer elemento es el más antiguo
      if (lotDetails.length > 0) {
        setLotDetailId(lotDetails[0].id);
      } else {
        setError('No hay lotes disponibles para abrir');
      }
    } catch (err: any) {
      console.error('Error al obtener lote:', err);
      // Mostrar un mensaje más amigable
      setError('No se pudo obtener información del lote. Por favor, intenta de nuevo o contacta al administrador.');
    } finally {
      setLoadingLotDetail(false);
    }
  };

  useEffect(() => {
    // Obtener el lotDetailId automáticamente si se proporciona presentationId
    fetchLotDetailId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lotDetailId) {
      setError('No se pudo obtener el lote disponible. Por favor intenta de nuevo.');
      return;
    }

    if (convertedQuantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (convertedQuantity > availablePackages) {
      setError(`Solo hay ${availablePackages} paquete(s) disponible(s)`);
      return;
    }

    if (unitConversionFactor <= 0) {
      setError('El factor de conversión debe ser mayor a 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: BulkConversionCreate = {
        source_lot_detail_id: lotDetailId,
        target_presentation_id: targetPresentationId,
        converted_quantity: Math.floor(convertedQuantity), // Cantidad de bultos a abrir
        unit_conversion_factor: Math.floor(unitConversionFactor) // Unidades por bulto
      };

      await apiClient.openBulkConversion(data);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error al convertir a granel:', err);
      
      if (err.message) {
        setError(err.message);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al abrir bulto para granel');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const totalUnitsResulting = convertedQuantity * unitConversionFactor;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content bulk-conversion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📦➡️🌾 Abrir Bulto para Granel</h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            disabled={loading || loadingLotDetail}
            type="button"
          >
            ✕
          </button>
        </div>

        {loadingLotDetail ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Obteniendo información del lote...</p>
          </div>
        ) : (
          <>
            <div className="product-info">
              <h3>{productName}</h3>
              <p><strong>Presentación a abrir:</strong> {presentationName}</p>
              <p><strong>Contenido por paquete:</strong> {presentationQuantity}{presentationUnit}</p>
              <p><strong>Paquetes disponibles:</strong> {availablePackages}</p>
              <div className="info-text">
                <span className="info-icon">ℹ️</span>
                <span>
                  Al abrir bultos, se restarán del inventario empaquetado
                  y se habilitarán las unidades para venta a granel.
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="convertedQuantity">
                  Cantidad de Paquetes a Abrir <span className="required">*</span>
                </label>
                <input
                  id="convertedQuantity"
                  type="number"
                  value={convertedQuantity}
                  onChange={(e) => setConvertedQuantity(Number(e.target.value))}
                  disabled={loading}
                  min="1"
                  max={availablePackages}
                  step="1"
                  required
                />
                <small className="help-text">
                  ¿Cuántos paquetes deseas abrir? (Disponibles: {availablePackages})
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="unitConversionFactor">
                  Factor de Conversión <span className="required">*</span>
                </label>
                <input
                  id="unitConversionFactor"
                  type="number"
                  value={unitConversionFactor}
                  onChange={(e) => setUnitConversionFactor(Number(e.target.value))}
                  disabled={loading}
                  min="1"
                  step="1"
                  required
                />
                <small className="help-text">
                  Unidades que contiene cada paquete (ej: 100 tabletas por caja)
                </small>
              </div>

              <div className="conversion-summary">
                <h4>📊 Resumen de Conversión</h4>
                <div className="summary-content">
                  <div className="summary-item">
                    <span className="summary-label">Bultos a abrir:</span>
                    <span className="summary-value">{convertedQuantity}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Cantidad por bulto:</span>
                    <span className="summary-value">{unitConversionFactor.toLocaleString()}{presentationUnit}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-item summary-total">
                    <span className="summary-label">Total a crear:</span>
                    <span className="summary-value highlight">
                      {totalUnitsResulting.toLocaleString()}{presentationUnit}
                      {presentationUnit === 'g' && totalUnitsResulting >= 1000 && (
                        <span className="summary-subtitle">
                          ({(totalUnitsResulting / 1000).toFixed(2)}kg)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <span className="alert-icon">❌</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  <span className="alert-icon">✅</span>
                  <span>¡Bulto abierto exitosamente! Redirigiendo...</span>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading || !lotDetailId}
                >
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Abriendo...
                    </>
                  ) : (
                    <>
                      📦➡️🌾 Abrir Bulto
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// Default export
export default BulkConversionModal;
