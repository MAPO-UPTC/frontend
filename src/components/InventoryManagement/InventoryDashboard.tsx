import React, { useEffect, useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { Button } from '../UI';
import { Product } from '../../types';
import './InventoryDashboard.css';

interface InventoryDashboardProps {
  onProductSelect?: (product: Product) => void;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  onProductSelect
}) => {
  const {
    categories,
    products,
    loading,
    loadCategoriesData,
    loadProducts,
    loadProductsForCategory
  } = useInventory();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategoriesData();
    loadProducts();
  }, [loadCategoriesData, loadProducts]);

  const handleCategorySelect = async (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      await loadProductsForCategory(categoryId);
    } else {
      await loadProducts();
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalProducts: products.length,
    availableCount: products.filter(p => p.presentations.some(pr => (pr.stock_available || 0) > 0)).length,
    lowStockCount: products.filter(p => p.presentations.some(pr => (pr.stock_available || 0) < 5 && (pr.stock_available || 0) > 0)).length,
    outOfStockCount: products.filter(p => p.presentations.every(pr => (pr.stock_available || 0) === 0)).length
  };

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h2>Gestión de Inventario</h2>
        <div className="header-actions">
          <Button variant="primary">
            + Nuevo Producto
          </Button>
          <Button variant="secondary">
            Recepción de Mercancía
          </Button>
        </div>
      </div>

      <div className="inventory-stats">
        <div className="stat-card">
          <h3>Total Productos</h3>
          <span className="stat-value">{stats.totalProducts}</span>
        </div>
        <div className="stat-card">
          <h3>Productos con Stock</h3>
          <span className="stat-value">{stats.availableCount}</span>
        </div>
        <div className="stat-card">
          <h3>Stock Bajo</h3>
          <span className="stat-value warning">{stats.lowStockCount}</span>
        </div>
        <div className="stat-card">
          <h3>Sin Stock</h3>
          <span className="stat-value danger">{stats.outOfStockCount}</span>
        </div>
      </div>

      <div className="inventory-content">
        <div className="filters-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filters">
            <button
              className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => handleCategorySelect(null)}
            >
              Todas las Categorías
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {loading ? (
            <div className="loading-state">
              <p>Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron productos</p>
              <Button variant="primary">
                Crear Primer Producto
              </Button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => onProductSelect?.(product)}
              >
                <div className="product-header">
                  <h4>{product.name}</h4>
                  <span className="category-badge">
                    {product.category?.name}
                  </span>
                </div>
                
                <p className="product-description">{product.description}</p>
                
                <div className="presentations-list">
                  {product.presentations.map(presentation => (
                    <div key={presentation.id} className="presentation-item">
                      <span className="presentation-name">
                        {presentation.presentation_name}
                      </span>
                      <div className="stock-info">
                        <span className={`stock-badge ${
                          (presentation.stock_available || 0) === 0 ? 'out-of-stock' :
                          (presentation.stock_available || 0) < 10 ? 'low-stock' : 'in-stock'
                        }`}>
                          Stock: {presentation.stock_available || 0}
                        </span>
                        <span className="price">
                          ${presentation.price?.toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="product-actions">
                  <Button size="small" variant="outline">
                    Editar
                  </Button>
                  <Button size="small" variant="secondary">
                    Ajustar Stock
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};