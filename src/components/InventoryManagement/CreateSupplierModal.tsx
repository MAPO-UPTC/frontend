import React, { useState } from 'react';
import api from '../../api/axios';
import { Button } from '../UI';

interface CreateSupplierModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateSupplierModal: React.FC<CreateSupplierModalProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!name.trim()) {
        setError('El nombre es obligatorio');
        setLoading(false);
        return;
      }
      if (!email.trim()) {
        setError('El correo es obligatorio');
        setLoading(false);
        return;
      }
      await api.post('/inventory/suppliers/', {
        name: name.trim(),
        address: address.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim(),
        contact_person: contactPerson.trim(),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear el proveedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Crear Nuevo Proveedor</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={50}
              placeholder="Nombre del proveedor"
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              maxLength={100}
              placeholder="Dirección"
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              maxLength={20}
              placeholder="Teléfono"
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              maxLength={100}
              placeholder="Correo electrónico"
            />
          </div>
          <div className="form-group">
            <label>Persona de contacto</label>
            <input
              type="text"
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
              maxLength={50}
              placeholder="Persona de contacto"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Proveedor'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplierModal;
