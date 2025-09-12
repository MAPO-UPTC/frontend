import { useState } from "react";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    // Aquí iría la lógica para agregar al carrito
    console.log("Agregando al carrito:", product);
    // Ejemplo: addToCart(product);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: "Agotado", class: "out-of-stock" };
    if (stock <= 5) return { text: "Pocas unidades", class: "low-stock" };
    return { text: "Disponible", class: "in-stock" };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <div 
      className={`product-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image-container">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">
            <span>📦</span>
          </div>
        )}
        
        <div className={`stock-badge ${stockStatus.class}`}>
          {stockStatus.text}
        </div>
      </div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-footer">
          <div className="product-price">
            {formatPrice(product.price)}
          </div>
          
          <button
            className={`add-to-cart-btn ${product.stock === 0 ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Agotado' : 'Agregar'}
          </button>
        </div>

        <div className="product-stock">
          Stock: {product.stock} unidades
        </div>
      </div>
    </div>
  );
}