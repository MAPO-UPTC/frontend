import React, { useEffect, useState } from 'react';
import { useReports } from '../../hooks/useReports';
import { Button } from '../UI';
import './ReportsDashboard.css';

export const ReportsDashboard: React.FC = () => {
  const {
    bestSelling,
    loading,
    loadBestSellers,
    loadDailyReport,
    getSalesStats,
    getTopCustomers
  } = useReports();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const salesStats = getSalesStats();
  const topCustomers = getTopCustomers(5);

  useEffect(() => {
    loadBestSellers(10);
    loadDailyReport(selectedDate);
  }, [loadBestSellers, loadDailyReport, selectedDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleGenerateReport = async (type: 'sales' | 'inventory') => {
    try {
      // Simular generación de reporte
      const reportData = {
        type,
        date: selectedDate,
        reportType,
        salesStats,
        bestSelling,
        topCustomers,
        generated: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${type}-${reportType}-${selectedDate}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <div className="reports-dashboard">
      <div className="dashboard-header">
        <h2>Reportes y Métricas</h2>
        <div className="header-controls">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="report-type-select"
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card sales">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Ventas del Día</h3>
            <span className="amount">{formatCurrency(salesStats.todayRevenue || 0)}</span>
            <p className="subtitle">{salesStats.todaySalesCount || 0} transacciones</p>
          </div>
        </div>

        <div className="summary-card profit">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Ganancia Estimada</h3>
            <span className="amount">{formatCurrency((salesStats.todayRevenue || 0) * 0.25)}</span>
            <p className="subtitle">Margen aprox. 25%</p>
          </div>
        </div>

        <div className="summary-card products">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Total Ventas</h3>
            <span className="amount">{salesStats.totalSales || 0}</span>
            <p className="subtitle">Transacciones</p>
          </div>
        </div>

        <div className="summary-card avg">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>Venta Promedio</h3>
            <span className="amount">
              {formatCurrency(salesStats.averageSaleValue || 0)}
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
              onClick={() => handleGenerateReport('sales')}
              loading={loading}
            >
              Exportar Reporte
            </Button>
          </div>

          <div className="products-list">
            {loading ? (
              <div className="loading-state">
                <p>Cargando productos...</p>
              </div>
            ) : bestSelling.length === 0 ? (
              <div className="empty-state">
                <p>No hay datos de ventas para mostrar</p>
              </div>
            ) : (
              bestSelling.map((item: any, index: number) => (
                <div key={item.presentation_id || index} className="product-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="product-info">
                    <h4>{item.product_name || 'Producto'}</h4>
                    <p className="presentation">{item.presentation_name || 'Presentación'}</p>
                  </div>
                  <div className="sales-stats">
                    <span className="quantity">{item.quantity_sold || 0} vendidos</span>
                    <span className="revenue">{formatCurrency(item.total_revenue || 0)}</span>
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
              topCustomers.map((customer: any, index: number) => (
                <div key={customer.customer?.id || index} className="customer-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="customer-info">
                    <h4>{customer.customer?.name || 'Cliente'}</h4>
                    <p className="stats">{customer.salesCount} compras</p>
                  </div>
                  <div className="customer-total">
                    <span className="amount">{formatCurrency(customer.totalAmount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="actions-section">
          <h3>Generar Reportes</h3>
          <div className="action-buttons">
            <Button
              variant="primary"
              onClick={() => handleGenerateReport('sales')}
              loading={loading}
            >
              📊 Reporte de Ventas
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleGenerateReport('inventory')}
              loading={loading}
            >
              📦 Reporte de Inventario
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
    </div>
  );
};