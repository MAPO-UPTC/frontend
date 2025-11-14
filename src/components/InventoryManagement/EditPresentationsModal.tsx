import React, { useState, useEffect } from 'react';
import { 
  ProductPresentation, 
  ProductPresentationCreate, 
  ProductPresentationUpdate, 
  UUID 
} from '../../types';
import { useProductEdit } from '../../hooks/useProductEdit';
import { Button } from '../UI';
import './ProductForm.css';

interface EditPresentationsModalProps {
  productId: UUID;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PresentationFormData extends Partial<ProductPresentationUpdate> {
  id?: UUID;
  isNew?: boolean;
}

export const EditPresentationsModal: React.FC<EditPresentationsModalProps> = ({
  productId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { product, loading, saving, loadProduct, createPresentation, updatePresentation } = useProductEdit();
  
  const [presentations, setPresentations] = useState<PresentationFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && productId) {
      loadProduct(productId);
    }
  }, [isOpen, productId, loadProduct]);

  useEffect(() => {
    if (product && product.presentations) {
      setPresentations(
        product.presentations.map(p => ({
          id: p.id,
          presentation_name: p.presentation_name,
          quantity: p.quantity,
          unit: p.unit,
          price: p.price,
          sku: p.sku,
          active: p.active,
          isNew: false,
        }))
      );
    }
  }, [product]);

  const handleAddNew = () => {
    setPresentations(prev => [
      ...prev,
      {
        presentation_name: '',
        quantity: 1,
        unit: 'kg',
        price: 0,
        sku: '',
        active: true,
        isNew: true,
      }
    ]);
    setEditingIndex(presentations.length);
  };

  const handleChange = (index: number, field: string, value: any) => {
    setPresentations(prev => prev.map((pres, i) => 
      i === index ? { ...pres, [field]: value } : pres
    ));
  };

  const handleSavePresentation = async (index: number) => {
    const presentation = presentations[index];
    
    try {
      if (presentation.isNew) {
        // Crear nueva presentación
        const newData: ProductPresentationCreate = {
          presentation_name: presentation.presentation_name!,
          quantity: presentation.quantity!,
          unit: presentation.unit!,
          price: presentation.price!,
          sku: presentation.sku || null,
          active: presentation.active ?? true,
        };
        
        await createPresentation(productId, newData);
      } else if (presentation.id) {
        // Actualizar presentación existente
        const updateData: ProductPresentationUpdate = {
          presentation_name: presentation.presentation_name,
          quantity: presentation.quantity,
          unit: presentation.unit,
          price: presentation.price,
          sku: presentation.sku,
          active: presentation.active,
        };
        
        await updatePresentation(productId, presentation.id, updateData);
      }
      
      setEditingIndex(null);
    } catch (error) {
      console.error('Error al guardar presentación:', error);
    }
  };

  const handleCancelEdit = (index: number) => {
    const presentation = presentations[index];
    
    if (presentation.isNew) {
      // Si es nueva y cancela, la eliminamos de la lista
      setPresentations(prev => prev.filter((_, i) => i !== index));
    } else {
      // Si es existente, recargamos del producto original
      if (product && product.presentations) {
        const original = product.presentations.find(p => p.id === presentation.id);
        if (original) {
          setPresentations(prev => prev.map((pres, i) => 
            i === index ? {
              id: original.id,
              presentation_name: original.presentation_name,
              quantity: original.quantity,
              unit: original.unit,
              price: original.price,
              sku: original.sku,
              active: original.active,
              isNew: false,
            } : pres
          ));
        }
      }
    }
    
    setEditingIndex(null);
  };

  const handleToggleActive = async (index: number) => {
    const presentation = presentations[index];
    
    if (!presentation.id || presentation.isNew) return;
    
    try {
      await updatePresentation(productId, presentation.id, {
        active: !presentation.active,
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="product-form-overlay" onClick={onClose}>
      <div className="product-form-modal presentations-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Gestión de Presentaciones</h2>
            {product && (
              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                📦 {product.name}
              </p>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Cargando presentaciones...</p>
          </div>
        ) : (
          <div className="product-form">
            <div className="form-section">
              <div className="section-header">
                <h3>
                  Presentaciones Registradas ({presentations.length})
                </h3>
                <Button
                  type="button"
                  variant="primary"
                  size="small"
                  onClick={handleAddNew}
                  disabled={editingIndex !== null}
                >
                  ➕ Nueva Presentación
                </Button>
              </div>

              {presentations.length === 0 ? (
                <p className="info-text empty-state">
                  📦 No hay presentaciones registradas.<br />
                  Haz clic en "Nueva Presentación" para agregar la primera.
                </p>
              ) : (
                <div className="presentations-list">
                  {presentations.map((presentation, index) => {
                    const isEditing = editingIndex === index;
                    const isInactive = !presentation.active && !presentation.isNew;
                    const cardClasses = `presentation-card ${isEditing ? 'editing' : ''} ${isInactive ? 'inactive-presentation' : ''}`.trim();
                    
                    return (
                      <div 
                        key={presentation.id || `new-${index}`} 
                        className={cardClasses}
                      >
                        <div className="presentation-header">
                          <h4>
                            {presentation.isNew ? '✨ Nueva Presentación' : presentation.presentation_name}
                          </h4>
                          <div className="presentation-actions-header">
                            {!presentation.isNew && !isEditing && (
                              <span 
                                className={`status-badge ${presentation.active ? 'active' : 'inactive'}`}
                              >
                                {presentation.active ? '✓ Activa' : '✕ Inactiva'}
                              </span>
                            )}
                          </div>
                        </div>

                      {editingIndex === index ? (
                        <>
                          <div className="form-group">
                            <label>📝 Nombre de la Presentación *</label>
                            <input
                              type="text"
                              value={presentation.presentation_name || ''}
                              onChange={(e) => handleChange(index, 'presentation_name', e.target.value)}
                              placeholder="Ej: Bolsa 15kg"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>💵 Precio de Venta *</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={presentation.price || 0}
                              onChange={(e) => handleChange(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              required
                            />
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>📏 Cantidad *</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={presentation.quantity || 0}
                                onChange={(e) => handleChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>📦 Unidad de Medida *</label>
                              <select
                                value={presentation.unit || 'kg'}
                                onChange={(e) => handleChange(index, 'unit', e.target.value)}
                                required
                              >
                                <option value="kg">Kilogramos (kg)</option>
                                <option value="g">Gramos (g)</option>
                                <option value="l">Litros (L)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="und">Unidades (und)</option>
                                <option value="caja">Caja</option>
                                <option value="paquete">Paquete</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>🏷️ SKU / Código de Barras (Opcional)</label>
                            <input
                              type="text"
                              value={presentation.sku || ''}
                              onChange={(e) => handleChange(index, 'sku', e.target.value)}
                              placeholder="Ingresa código SKU o de barras"
                            />
                          </div>

                          <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={presentation.active ?? true}
                                onChange={(e) => handleChange(index, 'active', e.target.checked)}
                              />
                              <span>✓ Presentación activa y disponible para la venta</span>
                            </label>
                          </div>

                          <div className="presentation-actions">
                            <Button
                              type="button"
                              variant="outline"
                              size="small"
                              onClick={() => handleCancelEdit(index)}
                            >
                              ✕ Cancelar
                            </Button>
                            <Button
                              type="button"
                              variant="primary"
                              size="small"
                              onClick={() => handleSavePresentation(index)}
                              loading={saving}
                              disabled={saving}
                            >
                              ✓ Guardar Presentación
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="presentation-details">
                            <p>
                              <strong>📏 Cantidad:</strong> 
                              <span>{presentation.quantity}{presentation.unit}</span>
                            </p>
                            <p>
                              <strong>💵 Precio:</strong> 
                              <span>${presentation.price?.toLocaleString('es-CO')}</span>
                            </p>
                            {presentation.sku && (
                              <p>
                                <strong>🏷️ SKU:</strong> 
                                <span>{presentation.sku}</span>
                              </p>
                            )}
                          </div>

                          <div className="presentation-actions">
                            <Button
                              type="button"
                              variant="outline"
                              size="small"
                              onClick={() => setEditingIndex(index)}
                              disabled={editingIndex !== null}
                            >
                              ✏️ Editar
                            </Button>
                            {!presentation.isNew && (
                              <Button
                                type="button"
                                variant={presentation.active ? 'secondary' : 'primary'}
                                size="small"
                                onClick={() => handleToggleActive(index)}
                                disabled={editingIndex !== null || saving}
                              >
                                {presentation.active ? '⏸️ Desactivar' : '▶️ Activar'}
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                disabled={editingIndex !== null}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
