import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { Sale } from '../../types';
import { getSaleItemsCount, calculateSaleTotal } from '../../utils/salesHelpers';
import './SalesHistory.css';

type FilterType = 'all' | 'today' | 'week' | 'month' | 'custom';

export const SalesHistory: React.FC = () => {
  const {
    sales,
    loadSalesHistory,
    loadMoreSales,
    filterSalesByLastDays,
    filterSalesByDateRange,
    clearSalesFilters
  } = useStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Cargar ventas al montar el componente
    loadSalesHistory();
  }, [loadSalesHistory]);

  const handleFilterChange = async (newFilter: FilterType) => {
    setFilter(newFilter);
    setShowDatePicker(false);

    switch (newFilter) {
      case 'all':
        await clearSalesFilters();
        break;
      case 'today':
        await filterSalesByLastDays(1);
        break;
      case 'week':
        await filterSalesByLastDays(7);
        break;
      case 'month':
        await filterSalesByLastDays(30);
        break;
      case 'custom':
        setShowDatePicker(true);
        break;
    }
  };

  const handleCustomDateFilter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    await filterSalesByDateRange(start, end);
  };

  const handleLoadMore = () => {
    loadMoreSales();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      completed: { label: 'Completada', className: 'status-completed' },
      pending: { label: 'Pendiente', className: 'status-pending' },
      cancelled: { label: 'Cancelada', className: 'status-cancelled' }
    };

    const statusInfo = statusMap[status] || { label: status, className: 'status-unknown' };

    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const calculateTotal = (): number => {
    return sales.sales.reduce((sum: number, sale: Sale) => sum + calculateSaleTotal(sale), 0);
  };

  if (sales.loading && sales.sales.length === 0) {
    return (
      <div className="sales-history">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando historial de ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-history">
      <div className="sales-history-header">
        <h1>📊 Historial de Ventas</h1>
        <p className="subtitle">Consulta y filtra todas las ventas registradas</p>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filter-buttons">
          <button
            onClick={() => handleFilterChange('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            📋 Todas
          </button>
          <button
            onClick={() => handleFilterChange('today')}
            className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
          >
            📅 Hoy
          </button>
          <button
            onClick={() => handleFilterChange('week')}
            className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
          >
            📆 Última Semana
          </button>
          <button
            onClick={() => handleFilterChange('month')}
            className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
          >
            🗓️ Último Mes
          </button>
          <button
            onClick={() => handleFilterChange('custom')}
            className={`filter-btn ${filter === 'custom' ? 'active' : ''}`}
          >
            🔍 Personalizado
          </button>
        </div>

        {/* Selector de fechas personalizado */}
        {showDatePicker && (
          <form onSubmit={handleCustomDateFilter} className="date-filter-form">
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor="start-date">Desde:</label>
                <input
                  type="datetime-local"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="date-input-group">
                <label htmlFor="end-date">Hasta:</label>
                <input
                  type="datetime-local"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="date-filter-actions">
              <button type="submit" className="apply-filter-btn" disabled={sales.loading}>
                {sales.loading ? 'Filtrando...' : 'Aplicar Filtro'}
              </button>
              <button
                type="button"
                className="clear-filter-btn"
                onClick={() => setShowDatePicker(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Resumen */}
      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <span className="summary-label">Total de Ventas</span>
            <span className="summary-value">{sales.sales.length}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <span className="summary-label">Monto Total</span>
            <span className="summary-value">
              ${calculateTotal().toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {sales.sales.length > 0 && (
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <span className="summary-label">Promedio por Venta</span>
              <span className="summary-value">
                ${(calculateTotal() / sales.sales.length).toLocaleString('es-CO', { 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0 
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de ventas */}
      {sales.sales.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No se encontraron ventas</h3>
          <p>No hay ventas registradas para el filtro seleccionado.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Usuario</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Items</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.sales.map((sale: Sale) => (
                  <tr key={sale.id}>
                    <td className="sale-code">{sale.sale_code || 'N/A'}</td>
                    <td className="sale-date">{formatDate(sale.sale_date)}</td>
                    <td className="customer-cell">
                      {sale.customer ? 
                        `${sale.customer.first_name} ${sale.customer.last_name}` : 
                        sale.customer_id.substring(0, 8) + '...'
                      }
                    </td>
                    <td className="user-cell">
                      {sale.user_id ? sale.user_id.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td className="total-cell">
                      ${calculateSaleTotal(sale).toLocaleString('es-CO', { 
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      })}
                    </td>
                    <td className="status-cell">{getStatusBadge(sale.status)}</td>
                    <td className="items-count">
                      {getSaleItemsCount(sale)}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="view-details-btn"
                        onClick={() => console.log('Ver detalles:', sale.id)}
                        title="Ver detalles de la venta"
                      >
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botón Cargar Más */}
          {sales.hasMore && (
            <div className="load-more-section">
              <button
                onClick={handleLoadMore}
                disabled={sales.loading}
                className="load-more-btn"
              >
                {sales.loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Cargando...
                  </>
                ) : (
                  <>
                    ⬇️ Cargar Más
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesHistory;
