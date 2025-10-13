import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SaleDetailFullResponse } from '../../types';
import { MAPOAPIClient } from '../../api/client';
import './SaleDetails.css';

const apiClient = new MAPOAPIClient();

const SaleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saleDetails, setSaleDetails] = useState<SaleDetailFullResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      if (!id) {
        setError('ID de venta no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getSaleDetails(id);
        setSaleDetails(data);
      } catch (err) {
        console.error('Error al cargar detalles de la venta:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los detalles de la venta');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/sales/history');
  };

  if (loading) {
    return (
      <div className="sale-details-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando detalles de la venta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sale-details-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h2>Error al cargar detalles</h2>
          <p>{error}</p>
          <button onClick={handleBack} className="btn-back">
            Volver al Historial
          </button>
        </div>
      </div>
    );
  }

  if (!saleDetails) {
    return (
      <div className="sale-details-container">
        <div className="error-state">
          <div className="error-icon">🔍</div>
          <h2>Venta no encontrada</h2>
          <p>No se encontraron detalles para esta venta.</p>
          <button onClick={handleBack} className="btn-back">
            Volver al Historial
          </button>
        </div>
      </div>
    );
  }

  // Calcular resumen financiero
  const totalCost = saleDetails.items.reduce(
    (sum, item) => sum + (item.cost_price * item.quantity),
    0
  );
  const totalProfit = saleDetails.total - totalCost;
  const profitMargin = saleDetails.total > 0 
    ? ((totalProfit / saleDetails.total) * 100).toFixed(2) 
    : '0.00';

  // Formatear fecha
  const formattedDate = new Date(saleDetails.sale_date).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Determinar color del estado
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="sale-details-container">
      {/* Header con acciones */}
      <div className="sale-details-header no-print">
        <button onClick={handleBack} className="btn-back">
          ← Volver al Historial
        </button>
        <h1>📋 Detalles de Venta</h1>
        <button onClick={handlePrint} className="btn-print">
          🖨️ Imprimir
        </button>
      </div>

      <div className="sale-details-content">
        {/* Información general de la venta */}
        <section className="info-section sale-info">
          <h2>Información General</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Código de Venta:</span>
              <span className="value code">{saleDetails.sale_code}</span>
            </div>
            <div className="info-item">
              <span className="label">Fecha:</span>
              <span className="value">{formattedDate}</span>
            </div>
            <div className="info-item">
              <span className="label">Estado:</span>
              <span className={`badge ${getStatusClass(saleDetails.status)}`}>
                {getStatusText(saleDetails.status)}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Total Venta:</span>
              <span className="value total">${saleDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Información del cliente y vendedor */}
        <div className="people-section">
          <section className="info-section customer-info">
            <h2>👤 Cliente</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Nombre:</span>
                <span className="value">{saleDetails.customer_name}</span>
              </div>
              <div className="info-item">
                <span className="label">Documento:</span>
                <span className="value">{saleDetails.customer_document}</span>
              </div>
            </div>
          </section>

          <section className="info-section seller-info">
            <h2>👨‍💼 Vendedor</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Nombre:</span>
                <span className="value">{saleDetails.seller_name}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Tabla de productos vendidos */}
        <section className="info-section items-section">
          <h2>📦 Productos Vendidos</h2>
          <div className="table-responsive">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Presentación</th>
                  <th className="text-center">Cantidad</th>
                  <th className="text-right">Precio Unit.</th>
                  <th className="text-right">Costo Unit.</th>
                  <th className="text-right">Subtotal</th>
                  <th className="text-right">Margen</th>
                </tr>
              </thead>
              <tbody>
                {saleDetails.items.map((item) => {
                  const itemProfit = (item.unit_price - item.cost_price) * item.quantity;
                  const itemMargin = item.line_total > 0 
                    ? ((itemProfit / item.line_total) * 100).toFixed(2) 
                    : '0.00';
                  const isBulkSale = item.bulk_conversion_id !== null;

                  return (
                    <tr key={item.id}>
                      <td>
                        {item.product_name}
                        {isBulkSale && (
                          <span className="bulk-badge" title="Venta a granel">
                            A Granel
                          </span>
                        )}
                      </td>
                      <td>{item.presentation_name}</td>
                      <td className="text-center font-bold">{item.quantity}</td>
                      <td className="text-right">${item.unit_price.toFixed(2)}</td>
                      <td className="text-right cost">${item.cost_price.toFixed(2)}</td>
                      <td className="text-right font-bold">${item.line_total.toFixed(2)}</td>
                      <td className={`text-right ${parseFloat(itemMargin) >= 0 ? 'profit' : 'loss'}`}>
                        {itemMargin}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Resumen financiero */}
        <section className="info-section financial-summary">
          <h2>💰 Resumen Financiero</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Costo Total:</span>
              <span className="value cost">${totalCost.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Venta:</span>
              <span className="value total">${saleDetails.total.toFixed(2)}</span>
            </div>
            <div className="summary-item highlight">
              <span className="label">Ganancia:</span>
              <span className={`value ${totalProfit >= 0 ? 'profit' : 'loss'}`}>
                ${totalProfit.toFixed(2)} ({profitMargin}%)
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SaleDetails;
