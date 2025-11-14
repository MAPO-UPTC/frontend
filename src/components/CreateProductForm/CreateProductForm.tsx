import React, { useState } from 'react';
import './CreateProductForm.css';
import { useCreateProduct } from '../../hooks/useCreateProduct';
import { useCategories } from '../../hooks/useCategories';
import { ProductCreate, ProductPresentationCreate, MeasurementUnit, UnitLabels, Category } from '../../types';

interface CreateProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateProductForm: React.FC<CreateProductFormProps> = ({ onSuccess, onCancel }) => {
  // Form state for product info
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [baseUnit, setBaseUnit] = useState<MeasurementUnit>(MeasurementUnit.KILOGRAM);
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // State for presentations
  const [presentations, setPresentations] = useState<ProductPresentationCreate[]>([]);

  // State for current presentation being added
  const [currentPresentation, setCurrentPresentation] = useState<ProductPresentationCreate>({
    presentation_name: '',
    quantity: 0,
    unit: MeasurementUnit.KILOGRAM,
    price: 0,
    sku: '',
    active: true,
  });

  // Success alert state
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Use the hooks
  const { createNewProduct, loading, error, validationErrors, clearErrors } = useCreateProduct();
  const { categories, loading: loadingCategories } = useCategories() as { 
    categories: Category[], 
    loading: boolean,
    error: string | null,
    actions: any
  };

  // Handler for adding a presentation to the list
  const handleAddPresentation = () => {
    // Basic validation before adding
    if (!currentPresentation.presentation_name.trim()) {
      alert('El nombre de la presentación es requerido');
      return;
    }
    if (currentPresentation.quantity <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    if (currentPresentation.price < 0) {
      alert('El precio no puede ser negativo');
      return;
    }

    // Add to presentations array
    setPresentations([...presentations, { ...currentPresentation }]);

    // Reset current presentation form
    setCurrentPresentation({
      presentation_name: '',
      quantity: 0,
      unit: MeasurementUnit.KILOGRAM,
      price: 0,
      sku: '',
      active: true,
    });
  };

  // Handler for removing a presentation
  const handleRemovePresentation = (index: number) => {
    const newPresentations = presentations.filter((_, i) => i !== index);
    setPresentations(newPresentations);
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Build product data
    const productData: ProductCreate = {
      name: productName.trim(),
      description: description.trim(),
      brand: brand.trim() || null,
      base_unit: baseUnit,
      category_id: categoryId.trim() || null,
      image_url: imageUrl.trim() || null,
      presentations: presentations,
    };

    // Call hook to create product
    const result = await createNewProduct(productData);

    if (result) {
      // Show success alert
      setShowSuccessAlert(true);

      // Clear form
      setProductName('');
      setDescription('');
      setBrand('');
      setBaseUnit(MeasurementUnit.KILOGRAM);
      setImageUrl('');
      setCategoryId('');
      setPresentations([]);
      setCurrentPresentation({
        presentation_name: '',
        quantity: 0,
        unit: MeasurementUnit.KILOGRAM,
        price: 0,
        sku: '',
        active: true,
      });

      // Hide alert after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 3000);
    }
  };

  return (
    <div className="create-product-form-container">
      <form onSubmit={handleSubmit} className="create-product-form">
        <div className="form-header">
          <h2>Crear Nuevo Producto</h2>
          {onCancel && (
            <button type="button" className="btn-close" onClick={onCancel}>
              ×
            </button>
          )}
        </div>

        {/* Success Alert */}
        {showSuccessAlert && (
          <div className="alert alert-success">
            ✓ Producto creado exitosamente
          </div>
        )}

        {/* API Error Alert */}
        {error && (
          <div className="alert alert-error">
            ✗ {error}
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="alert alert-warning">
            <strong>Errores de validación:</strong>
            <ul>
              {validationErrors.map((err, idx) => (
                <li key={idx}>
                  <strong>{err.field}:</strong> {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Product Information Section */}
        <div className="form-section">
          <h3>Información del Producto</h3>

          <div className="form-group">
            <label htmlFor="productName">
              Nombre del Producto <span className="required">*</span>
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej: Alimento para perros"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Descripción <span className="required">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción detallada del producto (mínimo 10 caracteres)"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">Marca</label>
              <input
                type="text"
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej: Pedigree"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="baseUnit">Unidad Base</label>
              <select
                id="baseUnit"
                value={baseUnit}
                onChange={(e) => setBaseUnit(e.target.value as MeasurementUnit)}
                disabled={loading}
              >
                {Object.entries(UnitLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">URL de Imagen</label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">
              Categoría <span className="required">*</span>
            </label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loading || loadingCategories}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {loadingCategories && <small className="text-muted">Cargando categorías...</small>}
          </div>
        </div>

        {/* Presentations Section */}
        <div className="form-section">
          <h3>Presentaciones del Producto</h3>

          {/* List of added presentations */}
          {presentations.length > 0 && (
            <div className="presentations-list">
              <h4>Presentaciones Agregadas ({presentations.length})</h4>
              {presentations.map((pres, index) => (
                <div key={index} className="presentation-card">
                  <div className="presentation-info">
                    <div className="presentation-name">
                      <strong>{pres.presentation_name}</strong>
                      {pres.sku && <span className="sku-badge">SKU: {pres.sku}</span>}
                    </div>
                    <div className="presentation-details">
                      <span>Cantidad: {pres.quantity} {UnitLabels[pres.unit as MeasurementUnit]}</span>
                      <span>Precio: ${pres.price.toFixed(2)}</span>
                      <span className={pres.active ? 'status-active' : 'status-inactive'}>
                        {pres.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemovePresentation(index)}
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add presentation form */}
          <div className="add-presentation-form">
            <h4>Agregar {presentations.length > 0 ? 'Otra' : 'Nueva'} Presentación</h4>

            <div className="form-group">
              <label htmlFor="presentationName">
                Nombre de la Presentación
              </label>
              <input
                type="text"
                id="presentationName"
                value={currentPresentation.presentation_name}
                onChange={(e) =>
                  setCurrentPresentation({ ...currentPresentation, presentation_name: e.target.value })
                }
                placeholder="Ej: Bolsa 1kg, Saco 20kg, Lata 500g"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">
                  Cantidad
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={currentPresentation.quantity || ''}
                  onChange={(e) =>
                    setCurrentPresentation({ ...currentPresentation, quantity: parseFloat(e.target.value) || 0 })
                  }
                  step="0.01"
                  placeholder="Ej: 1, 20, 0.5"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">
                  Unidad
                </label>
                <select
                  id="unit"
                  value={currentPresentation.unit}
                  onChange={(e) =>
                    setCurrentPresentation({ ...currentPresentation, unit: e.target.value as MeasurementUnit })
                  }
                  disabled={loading}
                >
                  {Object.entries(UnitLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="price">
                  Precio
                </label>
                <input
                  type="number"
                  id="price"
                  value={currentPresentation.price || ''}
                  onChange={(e) =>
                    setCurrentPresentation({ ...currentPresentation, price: parseFloat(e.target.value) || 0 })
                  }
                  step="0.01"
                  placeholder="Ej: 25.99"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sku">SKU (Código)</label>
                <input
                  type="text"
                  id="sku"
                  value={currentPresentation.sku || ''}
                  onChange={(e) => setCurrentPresentation({ ...currentPresentation, sku: e.target.value })}
                  placeholder="Ej: ALM-PER-1KG"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="active">Estado</label>
                <select
                  id="active"
                  value={currentPresentation.active ? 'true' : 'false'}
                  onChange={(e) =>
                    setCurrentPresentation({ ...currentPresentation, active: e.target.value === 'true' })
                  }
                  disabled={loading}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="btn-add-presentation"
              onClick={handleAddPresentation}
              disabled={loading}
            >
              + Agregar Presentación
            </button>
          </div>

          {presentations.length === 0 ? (
            <div className="alert alert-info">
              ℹ Debes agregar al menos una presentación para poder crear el producto.
            </div>
          ) : (
            <div className="alert alert-success">
              ✓ Has agregado {presentations.length} presentación{presentations.length > 1 ? 'es' : ''}. Puedes crear el producto o agregar más presentaciones.
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn-submit"
            disabled={loading || presentations.length === 0}
          >
            {loading ? 'Creando...' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;
