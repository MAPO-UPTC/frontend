import React, { useEffect, useState } from 'react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { Button } from '../UI';
import { UUID } from '../../types';
import { CreateSupplierModal } from './CreateSupplierModal';
import { EditSupplierModal } from './EditSupplierModal';
import './Suppliers.css';

export const SuppliersDashboard: React.FC = () => {
  const {
    suppliers,
    loading,
    error,
    loadSuppliers,
    deleteSupplier,
    clearError,
  } = useSuppliers();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<{ isOpen: boolean; supplierId: UUID | null }>({
    isOpen: false,
    supplierId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<UUID | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleDelete = async (supplierId: UUID) => {
    try {
      await deleteSupplier(supplierId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const handleEdit = (supplierId: UUID) => {
    setEditSupplier({ isOpen: true, supplierId });
  };

  const handleCloseEditModal = () => {
    setEditSupplier({ isOpen: false, supplierId: null });
    loadSuppliers(); // Recargar lista después de editar
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadSuppliers(); // Recargar lista después de crear
  };

  // Filtrar proveedores por búsqueda
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="suppliers-dashboard">
      <div className="suppliers-header">
        <h1>📦 Gestión de Proveedores</h1>
        <p>Administra los proveedores de tu inventario</p>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={clearError}>✕</button>
        </div>
      )}

      <div className="suppliers-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar proveedor por nombre, email o contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Nuevo Proveedor
        </Button>
      </div>

      <div className="suppliers-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando proveedores...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No hay proveedores</h3>
            <p>
              {searchTerm
                ? 'No se encontraron proveedores con ese criterio de búsqueda'
                : 'Comienza agregando tu primer proveedor'}
            </p>
            {!searchTerm && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                + Crear Primer Proveedor
              </Button>
            )}
          </div>
        ) : (
          <div className="suppliers-grid">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="supplier-card">
                <div className="supplier-card-header">
                  <h3>{supplier.name}</h3>
                </div>
                <div className="supplier-card-body">
                  {supplier.contact_person && (
                    <div className="supplier-info">
                      <span className="info-label">👤 Contacto:</span>
                      <span className="info-value">{supplier.contact_person}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="supplier-info">
                      <span className="info-label">📧 Email:</span>
                      <span className="info-value">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone_number && (
                    <div className="supplier-info">
                      <span className="info-label">📞 Teléfono:</span>
                      <span className="info-value">{supplier.phone_number}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="supplier-info">
                      <span className="info-label">📍 Dirección:</span>
                      <span className="info-value">{supplier.address}</span>
                    </div>
                  )}
                </div>
                <div className="supplier-card-actions">
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => handleEdit(supplier.id)}
                  >
                    ✏️ Editar
                  </Button>
                  {deleteConfirm === supplier.id ? (
                    <div className="delete-confirm">
                      <span>¿Eliminar?</span>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        Sí
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => setDeleteConfirm(supplier.id)}
                    >
                      🗑️ Eliminar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de creación */}
      {showCreateModal && (
        <CreateSupplierModal
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal de edición */}
      {editSupplier.isOpen && editSupplier.supplierId && (
        <EditSupplierModal
          supplierId={editSupplier.supplierId}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};
