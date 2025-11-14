import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../UI';
import axios from '../../api/axios';
import { ProductReturnsModal } from '../ProductReturns';
import { ReturnDetailsModal } from './ReturnDetailsModal';
import './ReturnsDashboard.css';

interface ReturnItem {
  id: string;
  return_code: string;
  sale_id: string;
  sale_code?: string;
  customer_name?: string;
  reason: string;
  notes?: string;
  status: string;
  total_items: number;
  created_at: string;
  processed_at?: string;
}

interface ReturnStatistics {
  total_returns: number;
  pending_returns: number;
  processed_returns: number;
  rejected_returns: number;
  total_items_returned: number;
}

export const ReturnsDashboard: React.FC = () => {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [statistics, setStatistics] = useState<ReturnStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadReturns();
    loadStatistics();
  }, []);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/returns/');
      setReturns(response.data || []);
      
      // Debug: Ver qué estados están llegando
      if (response.data && response.data.length > 0) {
        console.log('📊 Estados de devoluciones:', response.data.map((r: any) => r.status));
      }
    } catch (err) {
      console.error('Error al cargar devoluciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await axios.get('/returns/statistics/summary');
      setStatistics(response.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // Calcular estadísticas localmente usando useMemo para optimizar
  const displayStatistics = useMemo((): ReturnStatistics => {
    // Si hay estadísticas de la API, transformarlas al formato correcto
    if (statistics) {
      console.log('📊 Usando estadísticas de la API:', statistics);
      
      // La API devuelve una estructura diferente, necesitamos transformarla
      const apiStats = statistics as any;
      
      return {
        total_returns: apiStats.total_returns || 0,
        pending_returns: apiStats.returns_by_status?.pending || 0,
        processed_returns: (apiStats.returns_by_status?.approved || 0) + (apiStats.returns_by_status?.processed || 0),
        rejected_returns: apiStats.returns_by_status?.rejected || 0,
        total_items_returned: apiStats.total_items_returned || 0
      };
    }

    // Calcular desde los datos locales
    // Los estados pueden venir como: PENDING, PENDIENTE, PROCESSED, APPROVED, REJECTED, etc.
    const normalizeStatus = (status: string): string => {
      const statusLower = status.toLowerCase();
      if (statusLower === 'pendiente' || statusLower === 'pending') return 'pending';
      if (statusLower === 'procesada' || statusLower === 'processed' || statusLower === 'approved') return 'processed';
      if (statusLower === 'rechazada' || statusLower === 'rejected') return 'rejected';
      return statusLower;
    };

    const calculatedStats = {
      total_returns: returns.length || 0,
      pending_returns: returns.filter(r => normalizeStatus(r.status) === 'pending').length || 0,
      processed_returns: returns.filter(r => normalizeStatus(r.status) === 'processed').length || 0,
      rejected_returns: returns.filter(r => normalizeStatus(r.status) === 'rejected').length || 0,
      total_items_returned: returns.reduce((sum, r) => sum + (r.total_items || 0), 0) || 0
    };

    console.log('📊 Estadísticas calculadas localmente:', calculatedStats);
    console.log('📦 Returns data:', returns.map(r => ({ status: r.status, items: r.total_items })));
    
    return calculatedStats;
  }, [returns, statistics]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadReturns();
    loadStatistics();
  };

  const handleViewDetails = (returnId: string) => {
    setSelectedReturn(returnId);
  };

  const handleCloseDetails = () => {
    setSelectedReturn(null);
    loadReturns();
    loadStatistics();
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pendiente' || statusLower === 'pending') {
      return 'status-pending';
    }
    if (statusLower === 'procesada' || statusLower === 'processed' || statusLower === 'approved') {
      return 'status-processed';
    }
    if (statusLower === 'rechazada' || statusLower === 'rejected') {
      return 'status-rejected';
    }
    return 'status-unknown';
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pendiente' || statusLower === 'pending') {
      return 'Pendiente';
    }
    if (statusLower === 'procesada' || statusLower === 'processed' || statusLower === 'approved') {
      return 'Procesada';
    }
    if (statusLower === 'rechazada' || statusLower === 'rejected') {
      return 'Rechazada';
    }
    return status;
  };

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = 
      ret.return_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.sale_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.reason.toLowerCase().includes(searchTerm.toLowerCase());

    // Normalizar estado para comparación
    const normalizeStatusForFilter = (status: string): string => {
      const statusLower = status.toLowerCase();
      if (statusLower === 'pendiente') return 'pending';
      if (statusLower === 'approved') return 'processed';
      return statusLower;
    };

    const normalizedStatus = normalizeStatusForFilter(ret.status);
    const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="returns-dashboard">
      <div className="dashboard-header">
        <h2>Devoluciones</h2>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Nueva Devolución
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="returns-stats">
        <div className="stat-card">
          <h3>Total Devoluciones</h3>
          <span className="stat-value">{displayStatistics.total_returns}</span>
        </div>
        <div className="stat-card">
          <h3>Pendientes</h3>
          <span className="stat-value warning">{displayStatistics.pending_returns}</span>
        </div>
        <div className="stat-card">
          <h3>Procesadas</h3>
          <span className="stat-value success">{displayStatistics.processed_returns}</span>
        </div>
        <div className="stat-card">
          <h3>Rechazadas</h3>
          <span className="stat-value danger">{displayStatistics.rejected_returns}</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="returns-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por código, venta, cliente o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Todas
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pendientes
          </button>
          <button
            className={`filter-btn ${statusFilter === 'processed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('processed')}
          >
            Procesadas
          </button>
          <button
            className={`filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Rechazadas
          </button>
        </div>
      </div>

      {/* Lista de devoluciones */}
      <div className="returns-list">
        {loading ? (
          <div className="loading-state">
            <p>Cargando devoluciones...</p>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron devoluciones</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Crear Primera Devolución
            </Button>
          </div>
        ) : (
          <div className="returns-table">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Venta</th>
                  <th>Cliente</th>
                  <th>Motivo</th>
                  <th>Items</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map(ret => (
                  <tr key={ret.id}>
                    <td className="return-code">{ret.return_code}</td>
                    <td>{ret.sale_code || '-'}</td>
                    <td>{ret.customer_name || '-'}</td>
                    <td className="return-reason">{ret.reason}</td>
                    <td className="text-center">{ret.total_items}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(ret.status)}`}>
                        {getStatusLabel(ret.status)}
                      </span>
                    </td>
                    <td>{new Date(ret.created_at).toLocaleDateString()}</td>
                    <td>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleViewDetails(ret.id)}
                      >
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de creación */}
      {showCreateModal && (
        <ProductReturnsModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Modal de detalles */}
      {selectedReturn && (
        <ReturnDetailsModal
          returnId={selectedReturn}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};
