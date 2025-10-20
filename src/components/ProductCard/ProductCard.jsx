import { useState } from "react";
import "./ProductCard.css";

export default function ProductCard({ product, onAddToCart }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState(
    product.presentations?.find(p => p.active) || product.presentations?.[0] || null
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleImageError = () => {
    setImageError(true);
  };


  const handlePresentationChange = (presentation) => {
    setSelectedPresentation(presentation);
  };


  // Helper function to check if a presentation is bulk/granel
  const isBulkPresentation = (presentation) => {
    if (!presentation) return false;
    const nameIndicatesBulk = presentation.presentation_name?.toLowerCase().includes('granel');
    const hasBulkStock = presentation.bulk_stock_available !== undefined && presentation.bulk_stock_available !== null;
    return nameIndicatesBulk || hasBulkStock;
  };


  // Helper function to get max available stock
  const getMaxAvailableStock = (presentation) => {
    if (!presentation) return 0;
    const isBulk = isBulkPresentation(presentation);
    
    if (isBulk && (presentation.bulk_stock_available || 0) > 0) {
      return presentation.bulk_stock_available;
    }
    if ((presentation.stock_available || 0) > 0) {
      return presentation.stock_available;
    }
    return 0;
  };

  // Helper function to get available stock for display
  const getAvailableStockDisplay = (presentation) => {
    if (!presentation) return '0 disponibles';
    const isBulk = isBulkPresentation(presentation);
    
    if (isBulk && presentation.bulk_stock_available > 0) {
      return `${presentation.bulk_stock_available} ${presentation.unit}`;
    }
    if (!isBulk && presentation.stock_available > 0) {
      return `${presentation.stock_available} unidades`;
    }
    if (presentation.stock_available > 0) {
      return `${presentation.stock_available} unidades`;
    }
    if (presentation.bulk_stock_available > 0) {
      return `${presentation.bulk_stock_available} ${presentation.unit}`;
    }
    return '0 disponibles';
  };

  const getStockStatus = (presentation) => {
    if (!presentation) return { text: "Sin stock", class: "out-of-stock" };
    
    const totalStock = getMaxAvailableStock(presentation);
    if (totalStock === 0) return { text: "Agotado", class: "out-of-stock" };
    if (totalStock <= 5) return { text: "Pocas unidades", class: "low-stock" };
    return { text: "Disponible", class: "in-stock" };
  };

  const stockStatus = selectedPresentation ? getStockStatus(selectedPresentation) : { text: "Sin stock", class: "out-of-stock" };
  const availablePresentations = product.presentations?.filter(p => p.active) || [];
    // Pantalla informativa, no se requiere cantidad ni agregar al carrito

  return (
    <div 
      className={`product-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image-container">
        {!imageError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-image"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">
            <div className="placeholder-icon">📦</div>
            <div className="placeholder-text">Sin imagen</div>
          </div>
        )}
        
        <div className={`stock-badge ${stockStatus.class}`}>
          {stockStatus.text}
        </div>
      </div>

      <div className="product-info">
        <div className="product-header">
          <div className="product-category">{product.category?.name || 'Sin categoría'}</div>
          {product.brand && <div className="product-brand">{product.brand}</div>}
        </div>
        
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}
        
        {/* Selector de presentaciones como dropdown para tamaño uniforme */}
        {availablePresentations.length > 0 && (
          <div className="presentations-section">
            <label className="presentations-label" htmlFor={`presentation-select-${product.id}`}>Presentación:</label>
            <select
              id={`presentation-select-${product.id}`}
              className="presentation-dropdown"
              value={selectedPresentation?.id || ''}
              onChange={e => {
                const pres = availablePresentations.find(p => p.id === e.target.value);
                if (pres) handlePresentationChange(pres);
              }}
            >
              {availablePresentations.map((presentation) => (
                <option key={presentation.id} value={presentation.id}>
                  {presentation.presentation_name} - {presentation.quantity} {presentation.unit} - {formatPrice(presentation.price)}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Precio y controles */}
        {selectedPresentation && (
          <div className="product-footer">
            <div className="price-section">
              <div className="product-price">{formatPrice(selectedPresentation.price)}</div>
              <div className="product-stock">
                Stock: {getAvailableStockDisplay(selectedPresentation)}
              </div>
            </div>
            
            {/* Sección de cantidad y botón de agregar eliminados para modo informativo */}
          </div>
        )}
        
        {availablePresentations.length === 0 && (
          <div className="no-presentations">
            No hay presentaciones disponibles
          </div>
        )}
      </div>
    </div>
  );
}