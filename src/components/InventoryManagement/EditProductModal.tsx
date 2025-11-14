import React, { useState, useEffect } from 'react';
import { Product, ProductUpdate, UUID } from '../../types';
import { useProductEdit } from '../../hooks/useProductEdit';
import { useInventory } from '../../hooks/useInventory';
import { Button } from '../UI';
import './ProductForm.css';

interface EditProductModalProps {
  productId: UUID;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onEditPresentations: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  productId,
  isOpen,
  onClose,
  onSuccess,
  onEditPresentations,
}) => {
  const { product, loading, saving, loadProduct, updateProduct } = useProductEdit();
  const { categories, loadCategoriesData } = useInventory();
  
  const [formData, setFormData] = useState<ProductUpdate>({
    name: '',
    description: '',
    brand: '',
    base_unit: 'kg',
    category_id: '',
    image_url: '',
  });

  useEffect(() => {
    if (isOpen && productId) {
      loadProduct(productId);
      loadCategoriesData();
    }
  }, [isOpen, productId, loadProduct, loadCategoriesData]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
        base_unit: product.base_unit || 'kg',
        category_id: product.category_id || '',
        image_url: product.image_url || '',
      });
    }
  }, [product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProduct(productId, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="product-form-overlay" onClick={onClose}>
      <div className="product-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Producto</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Cargando producto...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-section">
              <h3>📝 Información General</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre del Producto *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Alimento para perros adultos"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="brand">🏷️ Marca</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleInputChange}
                    placeholder="Ej: Purina"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category_id">📂 Categoría *</label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="base_unit">📦 Unidad Base</label>
                  <select
                    id="base_unit"
                    name="base_unit"
                    value={formData.base_unit}
                    onChange={handleInputChange}
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="g">Gramos (g)</option>
                    <option value="l">Litros (L)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="und">Unidades</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">📄 Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descripción detallada del producto..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="image_url">🖼️ URL de Imagen</label>
                <input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url || ''}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3>📦 Presentaciones del Producto</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={onEditPresentations}
                >
                  ✏️ Gestionar Presentaciones
                </Button>
              </div>
              
              {product && product.presentations && product.presentations.length > 0 ? (
                <div className="presentations-summary">
                  <p className="info-text">
                    Este producto tiene <strong>{product.presentations.length}</strong> presentación(es) registrada(s). 
                    Haz clic en "Gestionar Presentaciones" para editarlas o agregar nuevas.
                  </p>
                  <div className="presentations-list-preview">
                    {product.presentations.map(pres => (
                      <div key={pres.id} className="presentation-preview-item">
                        <span className="presentation-name">📦 {pres.presentation_name}</span>
                        <span className="presentation-detail">
                          {pres.quantity}{pres.unit} • ${pres.price?.toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="info-text" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  📦 No hay presentaciones registradas.<br />
                  Usa "Gestionar Presentaciones" para agregar.
                </p>
              )}
            </div>

            <div className="modal-actions">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                ✕ Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                disabled={saving}
              >
                ✓ Guardar Cambios
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
