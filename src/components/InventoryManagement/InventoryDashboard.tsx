import React, { useEffect, useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { Button } from '../UI';
import { Product, ProductPresentation, UUID } from '../../types';
import BulkConversionModal from '../BulkConversionModal';
import CreateProductForm from '../CreateProductForm/CreateProductForm';
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
  
  // Estado para el modal de creación de producto
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  
  // Estado para el modal de conversión a granel
  const [bulkConversionModal, setBulkConversionModal] = useState<{
    isOpen: boolean;
    presentationId: UUID | null;
    targetPresentationId: UUID | null;  // ID de la presentación a granel destino
    productName: string;
    presentationName: string;
    presentationQuantity: number;
    presentationUnit: string;
    availablePackages: number;
    productId: UUID | null;
  }>({
    isOpen: false,
    presentationId: null,
    targetPresentationId: null,
    productName: '',
    presentationName: '',
    presentationQuantity: 0,
    presentationUnit: '',
    availablePackages: 0,
    productId: null
  });

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

  const handleOpenBulkConversion = (
    product: Product,
    presentation: ProductPresentation
  ) => {
    // Buscar la presentación a granel del mismo producto
    const bulkPresentation = product.presentations?.find(
      p => p.presentation_name.toLowerCase().includes('granel')
    );

    if (!bulkPresentation) {
      console.error('No se encontró presentación a granel para este producto');
      return;
    }

    setBulkConversionModal({
      isOpen: true,
      presentationId: presentation.id,
      targetPresentationId: bulkPresentation.id,
      productName: product.name,
      presentationName: presentation.presentation_name,
      presentationQuantity: presentation.quantity,
      presentationUnit: presentation.unit,
      availablePackages: presentation.stock_available || 0,
      productId: product.id
    });
  };

  const handleCloseBulkConversion = () => {
    setBulkConversionModal({
      isOpen: false,
      presentationId: null,
      targetPresentationId: null,
      productName: '',
      presentationName: '',
      presentationQuantity: 0,
      presentationUnit: '',
      availablePackages: 0,
      productId: null
    });
  };

  const handleBulkConversionSuccess = () => {
    // Recargar los productos para reflejar el cambio en el stock
    if (selectedCategory) {
      loadProductsForCategory(selectedCategory);
    } else {
      loadProducts();
    }
    handleCloseBulkConversion();
  };

  const handleCreateProductSuccess = () => {
    // Recargar los productos después de crear uno nuevo
    if (selectedCategory) {
      loadProductsForCategory(selectedCategory);
    } else {
      loadProducts();
    }
    setShowCreateProductModal(false);
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
          <Button variant="primary" onClick={() => setShowCreateProductModal(true)}>
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
                      <div className="presentation-info-row">
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
                          {presentation.bulk_stock_available > 0 && (
                            <span className="stock-badge bulk-badge">
                              Granel: {presentation.bulk_stock_available}{presentation.unit}
                            </span>
                          )}
                          <span className="price">
                            ${presentation.price?.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                      <div className="presentation-actions">
                        {(presentation.stock_available || 0) > 0 && (
                          <Button 
                            size="small" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBulkConversion(product, presentation);
                            }}
                          >
                            📦➡️🌾 Abrir a Granel
                          </Button>
                        )}
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

      {/* Modal de conversión a granel */}
      {bulkConversionModal.isOpen && bulkConversionModal.presentationId && bulkConversionModal.targetPresentationId && bulkConversionModal.productId && (
        <BulkConversionModal
          presentationId={bulkConversionModal.presentationId}
          targetPresentationId={bulkConversionModal.targetPresentationId}
          productName={bulkConversionModal.productName}
          presentationName={bulkConversionModal.presentationName}
          presentationQuantity={bulkConversionModal.presentationQuantity}
          presentationUnit={bulkConversionModal.presentationUnit}
          availablePackages={bulkConversionModal.availablePackages}
          productId={bulkConversionModal.productId}
          onClose={handleCloseBulkConversion}
          onSuccess={handleBulkConversionSuccess}
        />
      )}

      {/* Modal de creación de producto */}
      {showCreateProductModal && (
        <div className="modal-overlay" onClick={() => setShowCreateProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CreateProductForm
              onSuccess={handleCreateProductSuccess}
              onCancel={() => setShowCreateProductModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};