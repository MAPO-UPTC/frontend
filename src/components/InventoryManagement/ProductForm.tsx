import React, { useState, useEffect } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { Button } from '../UI';
import './ProductForm.css';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  category_id: string;
  presentations: {
    presentation_name: string;
    unit_of_measure: string;
    quantity_per_unit: number;
    price: number;
    barcode: string;
    stock_available: number;
  }[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  const { categories, loadCategoriesData } = useInventory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category_id: '',
    presentations: [{
      presentation_name: '',
      unit_of_measure: '',
      quantity_per_unit: 1,
      price: 0,
      barcode: '',
      stock_available: 0
    }]
  });

  useEffect(() => {
    if (isOpen) {
      loadCategoriesData();
    }
  }, [isOpen, loadCategoriesData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePresentationChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      presentations: prev.presentations.map((presentation, i) =>
        i === index ? { ...presentation, [field]: value } : presentation
      )
    }));
  };

  const addPresentation = () => {
    setFormData(prev => ({
      ...prev,
      presentations: [...prev.presentations, {
        presentation_name: '',
        unit_of_measure: '',
        quantity_per_unit: 1,
        price: 0,
        barcode: '',
        stock_available: 0
      }]
    }));
  };

  const removePresentation = (index: number) => {
    if (formData.presentations.length > 1) {
      setFormData(prev => ({
        ...prev,
        presentations: prev.presentations.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Aquí se integrará con el API real
      console.log('Creating product:', formData);
      
      // Simular creación de producto
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onProductCreated();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category_id: '',
        presentations: [{
          presentation_name: '',
          unit_of_measure: '',
          quantity_per_unit: 1,
          price: 0,
          barcode: '',
          stock_available: 0
        }]
      });
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="product-form-overlay" onClick={onClose}>
      <div className="product-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nuevo Producto</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h3>Información General</h3>
            
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
                <label htmlFor="category_id">Categoría *</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
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
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Descripción detallada del producto..."
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Presentaciones</h3>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={addPresentation}
              >
                + Agregar Presentación
              </Button>
            </div>

            {formData.presentations.map((presentation, index) => (
              <div key={index} className="presentation-card">
                <div className="presentation-header">
                  <h4>Presentación {index + 1}</h4>
                  {formData.presentations.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removePresentation(index)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre de la Presentación *</label>
                    <input
                      type="text"
                      value={presentation.presentation_name}
                      onChange={(e) => handlePresentationChange(index, 'presentation_name', e.target.value)}
                      required
                      placeholder="Ej: Bolsa 15kg"
                    />
                  </div>

                  <div className="form-group">
                    <label>Unidad de Medida *</label>
                    <select
                      value={presentation.unit_of_measure}
                      onChange={(e) => handlePresentationChange(index, 'unit_of_measure', e.target.value)}
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="kg">Kilogramos</option>
                      <option value="g">Gramos</option>
                      <option value="l">Litros</option>
                      <option value="ml">Mililitros</option>
                      <option value="und">Unidades</option>
                      <option value="caja">Caja</option>
                      <option value="paquete">Paquete</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cantidad por Unidad</label>
                    <input
                      type="number"
                      min="1"
                      value={presentation.quantity_per_unit}
                      onChange={(e) => handlePresentationChange(index, 'quantity_per_unit', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Precio de Venta *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={presentation.price}
                      onChange={(e) => handlePresentationChange(index, 'price', parseFloat(e.target.value) || 0)}
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Código de Barras</label>
                    <input
                      type="text"
                      value={presentation.barcode}
                      onChange={(e) => handlePresentationChange(index, 'barcode', e.target.value)}
                      placeholder="Código de barras (opcional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Inicial</label>
                    <input
                      type="number"
                      min="0"
                      value={presentation.stock_available}
                      onChange={(e) => handlePresentationChange(index, 'stock_available', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Crear Producto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};