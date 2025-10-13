import React, { useState } from 'react';
import { Button } from '../UI';
import { ProductPresentation } from '../../types';
import './SalesProductCard.css';

interface SalesProductCardProps {
  presentation: ProductPresentation;
  onAddToCart: (presentation: ProductPresentation, quantity: number) => void;
}

export const SalesProductCard: React.FC<SalesProductCardProps> = ({
  presentation,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Helper functions
  const isBulkPresentation = (pres: ProductPresentation) => {
    if (!pres) return false;
    const nameIndicatesBulk = pres.presentation_name?.toLowerCase().includes('granel');
    const hasBulkStock = pres.bulk_stock_available !== undefined && pres.bulk_stock_available !== null;
    return nameIndicatesBulk || hasBulkStock;
  };

  const hasStock = (pres: ProductPresentation) => {
    if (!pres) return false;
    return (pres.stock_available || 0) > 0 || (pres.bulk_stock_available || 0) > 0;
  };

  const getMaxAvailableStock = (pres: ProductPresentation) => {
    if (!pres) return 0;
    const isBulk = isBulkPresentation(pres);
    
    if (isBulk && (pres.bulk_stock_available || 0) > 0) {
      return pres.bulk_stock_available;
    }
    if ((pres.stock_available || 0) > 0) {
      return pres.stock_available;
    }
    return 0;
  };

  const getAvailableStockDisplay = (pres: ProductPresentation) => {
    if (!pres) return '0 disponibles';
    const isBulk = isBulkPresentation(pres);
    
    if (isBulk && pres.bulk_stock_available > 0) {
      return `${pres.bulk_stock_available} ${pres.unit || 'unidades'}`;
    }
    if (!isBulk && pres.stock_available > 0) {
      return `${pres.stock_available} unidades`;
    }
    if (pres.stock_available > 0) {
      return `${pres.stock_available} unidades`;
    }
    if (pres.bulk_stock_available > 0) {
      return `${pres.bulk_stock_available} ${pres.unit || 'unidades'}`;
    }
    return '0 disponibles';
  };

  const getStockStatus = (pres: ProductPresentation) => {
    if (!pres) return { text: "Sin stock", class: "out-of-stock" };
    
    const totalStock = getMaxAvailableStock(pres);
    if (totalStock === 0) return { text: "Agotado", class: "out-of-stock" };
    if (totalStock <= 5) return { text: "Pocas unidades", class: "low-stock" };
    return { text: "Disponible", class: "in-stock" };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxAvailable = getMaxAvailableStock(presentation);
    setQuantity(Math.min(Math.max(1, newQuantity), maxAvailable));
  };

  const handleAddToCart = () => {
    onAddToCart(presentation, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  const stockStatus = getStockStatus(presentation);
  const maxQuantity = getMaxAvailableStock(presentation);
  const isOutOfStock = !hasStock(presentation);
  const isBulk = isBulkPresentation(presentation);

  return (
    <div className="sales-product-card">
      <div className="sales-product-image-container">
        {!imageError && presentation.product?.image_url ? (
          <img
            src={presentation.product.image_url}
            alt={presentation.product.name}
            className="sales-product-image"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="sales-product-image-placeholder">
            <div className="placeholder-icon">📦</div>
          </div>
        )}
        
        <div className={`sales-stock-badge ${stockStatus.class}`}>
          {stockStatus.text}
        </div>

        {isBulk && (
          <div className="bulk-badge">
            📦 Granel
          </div>
        )}
      </div>

      <div className="sales-product-info">
        <div className="sales-product-header">
          <div className="sales-product-category">
            {presentation.product?.category?.name || 'Sin categoría'}
          </div>
        </div>
        
        <h3 className="sales-product-name">{presentation.product?.name}</h3>
        <p className="sales-presentation-name">{presentation.presentation_name}</p>
        
        <div className="sales-product-details">
          <div className="sales-price">
            {formatCurrency(presentation.price || 0)}
          </div>
          <div className="sales-stock-info">
            Stock: {getAvailableStockDisplay(presentation)}
          </div>
        </div>

        <div className="sales-add-controls">
          <div className="sales-quantity-control">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isOutOfStock}
              className="quantity-btn"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="quantity-input"
              disabled={isOutOfStock}
            />
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity || isOutOfStock}
              className="quantity-btn"
            >
              +
            </button>
          </div>
          
          <Button
            variant="primary"
            size="medium"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="add-to-cart-btn"
          >
            {isOutOfStock ? 'Agotado' : '🛒 Agregar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
