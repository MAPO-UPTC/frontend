import React, { useState } from 'react';
import { categoryService } from '../../api/categoryService';
import { Button } from '../UI';

interface CreateCategoryModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
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
      await categoryService.createCategory({ name, description, active });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Crear Nueva Categoría</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={50}
              placeholder="Nombre de la categoría"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={200}
              placeholder="Descripción de la categoría"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Categoría'}
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

export default CreateCategoryModal;
