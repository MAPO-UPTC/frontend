import React, { useEffect, useState } from 'react';
import { useReports } from '../../hooks/useReports';
import { Button } from '../UI';
import { ReportPeriod } from '../../types';
import { generateReportPDF } from '../../utils/pdfReportGenerator';
import './ReportsDashboard.css';

export const ReportsDashboard: React.FC = () => {
  const {
    periodReport,
    loading,
    loadPeriodReport,
  } = useReports();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<ReportPeriod>('daily');
  
  useEffect(() => {
    // Cargar el reporte inicial
    loadPeriodReport(reportType, selectedDate, 10);
  }, [reportType, selectedDate, loadPeriodReport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPeriodLabel = () => {
    if (!periodReport) return '';
    
    const { period, start_date, end_date } = periodReport;
    
    if (period === 'daily') {
      return formatDate(start_date);
    } else if (period === 'weekly') {
      return `${formatDate(start_date)} - ${formatDate(end_date)}`;
    } else {
      return new Date(start_date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
      });
    }
  };

  const handleExportReport = () => {
    if (!periodReport) return;

    try {
      generateReportPDF(periodReport, reportType, selectedDate);
    } catch (error) {
      console.error('Error al generar PDF del reporte:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    }
  };

  const topProducts = periodReport?.top_products || [];
  const topCustomers = periodReport?.top_customers || [];

  return (
    <div className="reports-dashboard">
      <div className="dashboard-header">
        <h2>Reportes de Ventas</h2>
        <div className="header-controls">
          <div className="period-buttons">
            <button
              className={`period-btn ${reportType === 'daily' ? 'active' : ''}`}
              onClick={() => setReportType('daily')}
            >
              Diario
            </button>
            <button
              className={`period-btn ${reportType === 'weekly' ? 'active' : ''}`}
              onClick={() => setReportType('weekly')}
            >
              Semanal
            </button>
            <button
              className={`period-btn ${reportType === 'monthly' ? 'active' : ''}`}
              onClick={() => setReportType('monthly')}
            >
              Mensual
            </button>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {periodReport && (
        <div className="period-label">
          <span className="period-icon">📅</span>
          <span className="period-text">{getPeriodLabel()}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando reporte...</p>
        </div>
      ) : !periodReport ? (
        <div className="empty-state">
          <p>No hay datos disponibles para este periodo</p>
        </div>
      ) : (
        <>
          <div className="summary-cards">
            <div className="summary-card sales">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3>Ventas Totales</h3>
                <span className="amount">{formatCurrency(periodReport.total_revenue || 0)}</span>
                <p className="subtitle">{periodReport.total_sales || 0} transacciones</p>
              </div>
            </div>

            <div className="summary-card profit">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Ganancia Estimada</h3>
                <span className="amount">{formatCurrency(periodReport.estimated_profit || 0)}</span>
                <p className="subtitle">Margen: {periodReport.profit_margin?.toFixed(1) || 0}%</p>
              </div>
            </div>

            <div className="summary-card products">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <h3>Items Vendidos</h3>
                <span className="amount">{periodReport.total_items_sold || 0}</span>
                <p className="subtitle">Productos</p>
              </div>
            </div>

            <div className="summary-card avg">
              <div className="card-icon">🎯</div>
              <div className="card-content">
                <h3>Venta Promedio</h3>
                <span className="amount">
                  {formatCurrency(periodReport.average_sale_value || 0)}
                </span>
                <p className="subtitle">Por transacción</p>
              </div>
            </div>
          </div>

          <div className="reports-content">
            <div className="best-selling-section">
              <div className="section-header">
                <h3>Productos Más Vendidos</h3>
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleExportReport}
                  loading={loading}
                >
                  📥 Exportar
                </Button>
              </div>

              <div className="products-list">
                {topProducts.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay datos de ventas para mostrar</p>
                  </div>
                ) : (
                  topProducts.map((item, index) => (
                    <div key={item.presentation_id} className="product-item">
                      <div className="rank">#{index + 1}</div>
                      <div className="product-info">
                        <h4>{item.product_name}</h4>
                        <p className="presentation">{item.presentation_name}</p>
                      </div>
                      <div className="sales-stats">
                        <span className="quantity">{item.quantity_sold} vendidos</span>
                        <span className="revenue">{formatCurrency(item.total_revenue)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="top-customers-section">
              <h3>Mejores Clientes</h3>
              <div className="customers-list">
                {topCustomers.length === 0 ? (
                  <div className="empty-state">
                    <p>No hay datos de clientes para mostrar</p>
                  </div>
                ) : (
                  topCustomers.map((customer, index) => (
                    <div key={customer.customer_id} className="customer-item">
                      <div className="rank">#{index + 1}</div>
                      <div className="customer-info">
                        <h4>{customer.customer_name}</h4>
                        <p className="stats">
                          {customer.total_purchases} compras
                          {customer.customer_document && ` • ${customer.customer_document}`}
                        </p>
                      </div>
                      <div className="customer-total">
                        <span className="amount">{formatCurrency(customer.total_spent)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="actions-section">
              <h3>Acciones</h3>
              <div className="action-buttons">
                <Button
                  variant="primary"
                  onClick={handleExportReport}
                  loading={loading}
                  disabled={!periodReport}
                >
                  📄 Descargar Reporte PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                >
                  🖨️ Imprimir Dashboard
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};