import { useState } from "react";
import "./ProductCard.css";

export default function ProductCard({ product, onAddToCart }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState(
    product.presentations?.find(p => p.active) || product.presentations?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);

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

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedPresentation || !hasStock(selectedPresentation)) return;
    
    const cartItem = {
      presentation: selectedPresentation,
      quantity: quantity,
      unit_price: selectedPresentation.price,
      line_total: selectedPresentation.price * quantity,
      max_available: getMaxAvailableStock(selectedPresentation)
    };
    
    onAddToCart?.(cartItem);
    console.log("Agregando al carrito:", cartItem);
  };

  const handlePresentationChange = (presentation) => {
    setSelectedPresentation(presentation);
    setQuantity(1); // Reset quantity when changing presentation
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    const maxAvailable = getMaxAvailableStock(selectedPresentation);
    setQuantity(Math.min(Math.max(1, newQuantity), maxAvailable));
  };

  // Helper function to check if a presentation is bulk/granel
  const isBulkPresentation = (presentation) => {
    if (!presentation) return false;
    const nameIndicatesBulk = presentation.presentation_name?.toLowerCase().includes('granel');
    const hasBulkStock = presentation.bulk_stock_available !== undefined && presentation.bulk_stock_available !== null;
    return nameIndicatesBulk || hasBulkStock;
  };

  // Helper function to check if stock is available (either regular or bulk)
  const hasStock = (presentation) => {
    if (!presentation) return false;
    return (presentation.stock_available || 0) > 0 || (presentation.bulk_stock_available || 0) > 0;
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
  const isOutOfStock = !selectedPresentation || !hasStock(selectedPresentation);

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
        
        {/* Selector de presentaciones */}
        {availablePresentations.length > 0 && (
          <div className="presentations-section">
            <label className="presentations-label">Presentación:</label>
            <div className="presentations-grid">
              {availablePresentations.map((presentation) => (
                <button
                  key={presentation.id}
                  className={`presentation-option ${selectedPresentation?.id === presentation.id ? 'selected' : ''} ${!hasStock(presentation) ? 'disabled' : ''}`}
                  onClick={() => handlePresentationChange(presentation)}
                  disabled={!hasStock(presentation)}
                >
                  <div className="presentation-name">{presentation.presentation_name}
                    {isBulkPresentation(presentation) && <span className="bulk-indicator"> 📦 A granel</span>}
                  </div>
                  <div className="presentation-details">
                    {presentation.quantity} {presentation.unit}
                  </div>
                  <div className="presentation-price">{formatPrice(presentation.price)}</div>
                  {!hasStock(presentation) && (
                    <div className="presentation-stock-badge">Agotado</div>
                  )}
                </button>
              ))}
            </div>
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
            
            <div className="quantity-section">
              <label htmlFor={`quantity-${product.id}`} className="quantity-label">
                Cantidad:
              </label>
              <input
                id={`quantity-${product.id}`}
                type="number"
                min="1"
                max={getMaxAvailableStock(selectedPresentation)}
                value={quantity}
                onChange={handleQuantityChange}
                className="quantity-input"
                disabled={isOutOfStock}
              />
            </div>
            
            <button
              className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Agotado' : `Agregar (${formatPrice(selectedPresentation.price * quantity)})`}
            </button>
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