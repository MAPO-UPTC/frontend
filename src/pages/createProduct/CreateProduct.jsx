import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories, useProducts, usePermissions } from "../../hooks";
import { Entity, Action } from "../../constants";
import "./CreateProduct.css";

export default function CreateProduct() {
  const navigate = useNavigate();
  
  // Hooks personalizados para manejo de estado escalable
  const { categories } = useCategories();
  const { actions: { createProduct } } = useProducts();
  const { actions: { hasPermission }, loading: permissionsLoading } = usePermissions();

  // Estado del formulario - SIN precio ni stock
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Verificar permisos al cargar el componente
  useEffect(() => {
    const checkPermissions = async () => {
      if (!permissionsLoading) {
        const canCreate = await hasPermission(Entity.PRODUCTS, Action.CREATE);
        if (!canCreate) {
          console.log("Usuario no tiene permisos para crear productos");
          navigate("/products", { replace: true });
        }
      }
    };

    checkPermissions();
  }, [permissionsLoading, hasPermission, navigate]);

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validación del formulario - SIN precio ni stock
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = "La categoría es requerida";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Preparar datos del producto - SIN precio ni stock
      const productData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
      };

      await createProduct(productData);
      navigate("/products");
    } catch (error) {
      console.error("Error al crear producto:", error);
      setErrors({ 
        submit: "Error al crear el producto. Por favor, intente nuevamente." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/products");
  };

  // Mostrar loading mientras se cargan los permisos
  if (permissionsLoading) {
    return (
      <div className="create-product-container">
        <div className="loading">Verificando permisos...</div>
      </div>
    );
  }

  return (
    <div className="create-product-container">
      <div className="create-product-header">
        <h1 className="create-product-title">Crear Nuevo Producto</h1>
        <p className="create-product-subtitle">Completa los siguientes campos para agregar un producto a la tienda</p>
      </div>

      <div className="create-product-form-container">
        <form onSubmit={handleSubmit} className="create-product-form">
          {errors.submit && (
            <div className="form-error">
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">Nombre del Producto *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="Ingresa el nombre del producto"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Descripción *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea ${errors.description ? "error" : ""}`}
              placeholder="Describe el producto..."
              rows="4"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="categoryId" className="form-label">Categoría *</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className={`form-select ${errors.categoryId ? "error" : ""}`}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl" className="form-label">URL de la Imagen</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://example.com/imagen.jpg"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}