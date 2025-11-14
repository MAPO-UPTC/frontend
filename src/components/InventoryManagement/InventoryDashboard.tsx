import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { Button } from '../UI';
import { Product, ProductPresentation, UUID } from '../../types';
import BulkConversionModal from '../BulkConversionModal';
import CreateProductForm from '../CreateProductForm/CreateProductForm';
import InventoryReception from '../InventoryReception/InventoryReception';
import CreateCategoryModal from './CreateCategoryModal';
import { EditProductModal } from './EditProductModal';
import { EditPresentationsModal } from './EditPresentationsModal';
import { ProductReturnsModal } from '../ProductReturns';
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
    hasMore,
    loadCategoriesData,
    loadProducts,
    loadProductsForCategory,
    loadMore
  } = useInventory();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  
  // Estado para el modal de creación de producto
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  // Estado para el modal de creación de categoría
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  
  // Estado para el modal de recepción de mercancía
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  
  // Estado para el modal de devoluciones
  const [showReturnsModal, setShowReturnsModal] = useState(false);
  
  // Estados para edición de productos
  const [editProductModal, setEditProductModal] = useState<{
    isOpen: boolean;
    productId: UUID | null;
  }>({
    isOpen: false,
    productId: null,
  });

  const [editPresentationsModal, setEditPresentationsModal] = useState<{
    isOpen: boolean;
    productId: UUID | null;
  }>({
    isOpen: false,
    productId: null,
  });
  
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

  // Debug: Log para ver el estado de products
  useEffect(() => {
    console.log('📦 InventoryDashboard - products:', {
      isArray: Array.isArray(products),
      length: Array.isArray(products) ? products.length : 'N/A',
      products: products
    });
  }, [products]);

  // Intersection Observer para infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('📜 Cargando más productos en inventario...');
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  const handleCategorySelect = async (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      await loadProductsForCategory(categoryId);
    } else {
      await loadProducts(true); // Reset page
    }
  };

  const handleEditProduct = (productId: UUID) => {
    setEditProductModal({
      isOpen: true,
      productId,
    });
  };

  const handleCloseEditProduct = () => {
    setEditProductModal({
      isOpen: false,
      productId: null,
    });
  };

  const handleEditProductSuccess = () => {
    // Recargar productos después de editar
    if (selectedCategory) {
      loadProductsForCategory(selectedCategory);
    } else {
      loadProducts();
    }
  };

  const handleOpenEditPresentations = () => {
    // Copiar el productId del modal de edición al modal de presentaciones
    if (editProductModal.productId) {
      setEditPresentationsModal({
        isOpen: true,
        productId: editProductModal.productId,
      });
    }
  };

  const handleCloseEditPresentations = () => {
    setEditPresentationsModal({
      isOpen: false,
      productId: null,
    });
  };

  const handleEditPresentationsSuccess = () => {
    // Recargar productos después de editar presentaciones
    if (selectedCategory) {
      loadProductsForCategory(selectedCategory);
    } else {
      loadProducts();
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

  const handleReceptionSuccess = () => {
    // Recargar productos después de recibir mercancía
    if (selectedCategory) {
      loadProductsForCategory(selectedCategory);
    } else {
      loadProducts();
    }
    setShowReceptionModal(false);
  };

  const handleReturnsSuccess = () => {
    // Recargar productos después de procesar devoluciones
    if (selectedCategory) {
      loadProductsForCategory(selectedCategory);
    } else {
      loadProducts();
    }
    setShowReturnsModal(false);
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Debug: Log de productos filtrados
  console.log('🔍 Filtered products:', {
    total: Array.isArray(products) ? products.length : 'N/A',
    filtered: filteredProducts.length,
    searchTerm
  });

  const stats = {
    totalProducts: Array.isArray(products) ? products.length : 0,
    availableCount: Array.isArray(products) ? products.filter(p => p.presentations.some(pr => (pr.stock_available || 0) > 0)).length : 0,
    lowStockCount: Array.isArray(products) ? products.filter(p => p.presentations.some(pr => (pr.stock_available || 0) < 5 && (pr.stock_available || 0) > 0)).length : 0,
    outOfStockCount: Array.isArray(products) ? products.filter(p => p.presentations.every(pr => (pr.stock_available || 0) === 0)).length : 0
  };

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h2>Gestión de Inventario</h2>
        <div className="header-actions">
          <Button variant="primary" onClick={() => setShowCreateProductModal(true)}>
            + Nuevo Producto
          </Button>
          <Button variant="secondary" onClick={() => setShowReceptionModal(true)}>
            📦 Recepción de Mercancía
          </Button>
          <Button variant="danger" onClick={() => setShowReturnsModal(true)}>
            ↩️ Devoluciones
          </Button>
          <Button variant="outline" onClick={() => setShowCreateCategoryModal(true)}>
            + Nueva Categoría
          </Button>
        </div>

      </div>
      {/* Modal de creación de categoría */}
      {showCreateCategoryModal && (
        <CreateCategoryModal
          onSuccess={() => {
            loadCategoriesData();
            setShowCreateCategoryModal(false);
          }}
          onCancel={() => setShowCreateCategoryModal(false)}
        />
      )}

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
          {loading && filteredProducts.length === 0 ? (
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
            <>
              {filteredProducts.map((product, index) => {
                const isLastProduct = filteredProducts.length === index + 1;
                return (
                  <div
                    key={product.id}
                    ref={isLastProduct ? lastProductRef : null}
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
                    <div key={presentation.id} className="presentation-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div className="presentation-info-row">
                        <span className="presentation-name">
                          {presentation.presentation_name}
                        </span>
                      </div>
                      <div className="presentation-stock-text" style={{ fontSize: '13px', color: '#555', marginLeft: 0, marginTop: '2px', textAlign: 'left', width: '100%' }}>
                        {presentation.presentation_name.toLowerCase().includes('granel')
                          ? `Stock: ${presentation.bulk_stock_available || 0}${presentation.unit || ''}`
                          : `Stock: ${presentation.stock_available || 0}`}
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
                  <Button 
                    size="small" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProduct(product.id);
                    }}
                  >
                    Editar
                  </Button>
                </div>
              </div>
                );
              })}
              
              {/* Mensaje de fin de productos */}
              {!hasMore && filteredProducts.length > 0 && (
                <div className="end-of-products">
                  <p>✓ Todos los productos cargados</p>
                </div>
              )}
            </>
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

      {/* Modal de recepción de mercancía */}
      {showReceptionModal && (
        <div className="modal-overlay" onClick={() => setShowReceptionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <InventoryReception
              onSuccess={handleReceptionSuccess}
              onCancel={() => setShowReceptionModal(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de edición de producto */}
      {editProductModal.isOpen && editProductModal.productId && (
        <EditProductModal
          productId={editProductModal.productId}
          isOpen={editProductModal.isOpen}
          onClose={handleCloseEditProduct}
          onSuccess={handleEditProductSuccess}
          onEditPresentations={handleOpenEditPresentations}
        />
      )}

      {/* Modal de edición de presentaciones */}
      {editPresentationsModal.isOpen && editPresentationsModal.productId && (
        <EditPresentationsModal
          productId={editPresentationsModal.productId}
          isOpen={editPresentationsModal.isOpen}
          onClose={handleCloseEditPresentations}
          onSuccess={handleEditPresentationsSuccess}
        />
      )}

      {/* Modal de devoluciones */}
      {showReturnsModal && (
        <ProductReturnsModal
          onClose={() => setShowReturnsModal(false)}
          onSuccess={handleReturnsSuccess}
        />
      )}
    </div>
  );
};