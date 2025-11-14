import React, { useState, useEffect } from 'react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { Button } from '../UI';
import { SupplierUpdate, UUID } from '../../types';

interface EditSupplierModalProps {
  supplierId: UUID;
  onClose: () => void;
}

export const EditSupplierModal: React.FC<EditSupplierModalProps> = ({ supplierId, onClose }) => {
  const { selectedSupplier, loadSupplierById, updateSupplier } = useSuppliers();
  
  const [formData, setFormData] = useState<SupplierUpdate>({
    name: '',
    address: '',
    phone_number: '',
    email: '',
    contact_person: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      await loadSupplierById(supplierId);
      setInitialLoading(false);
    };
    loadData();
  }, [supplierId, loadSupplierById]);

  useEffect(() => {
    if (selectedSupplier) {
      setFormData({
        name: selectedSupplier.name,
        address: selectedSupplier.address || '',
        phone_number: selectedSupplier.phone_number || '',
        email: selectedSupplier.email || '',
        contact_person: selectedSupplier.contact_person || '',
      });
    }
  }, [selectedSupplier]);

  const handleChange = (field: keyof SupplierUpdate, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones
      if (!formData.name?.trim()) {
        setError('El nombre es obligatorio');
        setLoading(false);
        return;
      }
      if (formData.email && formData.email.trim()) {
        // Validar formato de email solo si se proporciona
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          setError('El formato del correo no es válido');
          setLoading(false);
          return;
        }
      }

      await updateSupplier(supplierId, {
        name: formData.name.trim(),
        address: formData.address?.trim() || null,
        phone_number: formData.phone_number?.trim() || null,
        email: formData.email?.trim() || null,
        contact_person: formData.contact_person?.trim() || null,
      });
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content supplier-modal">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando proveedor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content supplier-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Editar Proveedor</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="supplier-form">
          <div className="form-group">
            <label htmlFor="name">
              <span className="required">*</span> Nombre del Proveedor
            </label>
            <input
              id="name"
              type="text"
              value={formData.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              required
              maxLength={100}
              placeholder="Ej: Distribuidora ABC"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={e => handleChange('email', e.target.value)}
              maxLength={100}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact_person">Persona de Contacto</label>
            <input
              id="contact_person"
              type="text"
              value={formData.contact_person || ''}
              onChange={e => handleChange('contact_person', e.target.value)}
              maxLength={100}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Teléfono</label>
            <input
              id="phone_number"
              type="tel"
              value={formData.phone_number || ''}
              onChange={e => handleChange('phone_number', e.target.value)}
              maxLength={20}
              placeholder="Ej: +57 300 123 4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <textarea
              id="address"
              value={formData.address || ''}
              onChange={e => handleChange('address', e.target.value)}
              maxLength={200}
              placeholder="Dirección completa del proveedor"
              rows={3}
            />
          </div>

          {error && <div className="form-error">{error}</div>}
          
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
