import React, { useState, useEffect } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { Button } from '../UI';
import { ProductPresentation } from '../../types';
import './ProductSearch.css';

interface ProductSearchProps {
  onAddProduct: (presentation: ProductPresentation, quantity: number) => void;
  disabled?: boolean;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onAddProduct,
  disabled = false
}) => {
  const { products, searchForProducts, loadProducts, loading } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // DEBUG: Verificar origen de los datos
  console.log('🔍 ProductSearch INICIADO:', {
    productsLength: products.length,
    loading,
    disabled,
    timestamp: new Date().toISOString()
  });

  // Cargar productos al iniciar el componente
  useEffect(() => {
    const initializeProducts = async () => {
      try {
        await loadProducts();
        setIsDropdownOpen(true); // Mostrar productos por defecto
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    if (!disabled) {
      initializeProducts();
    }
  }, [loadProducts, disabled]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      try {
        await searchForProducts(term);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error('Error searching products:', error);
      }
    } else if (term.length === 0) {
      // Si no hay término de búsqueda, mostrar todos los productos
      await loadProducts();
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleQuantityChange = (presentationId: string, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [presentationId]: quantity
    }));
  };

  const handleAddToCart = (presentation: ProductPresentation) => {
    const quantity = selectedQuantities[presentation.id] || 1;
    
    console.log('🔄 ProductSearch - handleAddToCart clicked:', {
      presentation: presentation.presentation_name,
      quantity,
      price: presentation.price,
      stock: presentation.stock_available
    });
    
    onAddProduct(presentation, quantity);
    
    console.log('📤 ProductSearch - onAddProduct called');
    
    // Clear quantity and close dropdown
    setSelectedQuantities(prev => ({
      ...prev,
      [presentation.id]: 1
    }));
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Flatten all presentations from all products
  const allPresentations = products.flatMap(product => 
    product.presentations?.map(presentation => ({
      ...presentation,
      product: product
    })) || []
  );

  // DEBUG CRÍTICO: Comparar con datos esperados
  console.log('🚨 DATOS RAW DEL STORE:', {
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      presentations: p.presentations?.map(pres => ({
        id: pres.id,
        presentation_name: pres.presentation_name,
        stock_available: pres.stock_available,
        bulk_stock_available: pres.bulk_stock_available,
        RAW_DATA: JSON.stringify(pres)
      })) || []
    }))
  });

  // Debug: Log products and presentations
  console.log('🔍 ProductSearch Debug:', {
    totalProducts: products.length,
    totalPresentations: allPresentations.length,
    products: products.map(p => ({
      name: p.name,
      presentations: p.presentations?.length || 0
    })),
    presentations: allPresentations.map(p => ({
      id: p.id,
      name: p.presentation_name,
      stock_available: p.stock_available,
      bulk_stock_available: p.bulk_stock_available,
      isBulk: p.presentation_name.toLowerCase().includes('granel'),
      hasStock: (p.stock_available || 0) > 0 || (p.bulk_stock_available || 0) > 0
    }))
  });

  // DEBUG ESPECÍFICO PARA PRODUCTOS GRANEL
  console.log('🔍 PRODUCTOS GRANEL ESPECÍFICO:', allPresentations
    .filter(p => p.presentation_name.toLowerCase().includes('granel'))
    .map(p => ({
      productName: p.product?.name,
      presentationName: p.presentation_name,
      stock_available: p.stock_available,
      bulk_stock_available: p.bulk_stock_available,
      typeOfBulkStock: typeof p.bulk_stock_available,
      hasStock: (p.stock_available || 0) > 0 || (p.bulk_stock_available || 0) > 0,
      allFields: Object.keys(p)
    }))
  );

  // Helper function to check if a presentation is bulk/granel
  const isBulkPresentation = (presentation: ProductPresentation) => {
    // Check if it's a bulk presentation by name or has bulk_stock_available defined
    const nameIndicatesBulk = presentation.presentation_name.toLowerCase().includes('granel');
    const hasBulkStock = presentation.bulk_stock_available !== undefined && presentation.bulk_stock_available !== null;
    return nameIndicatesBulk || hasBulkStock;
  };

  // Helper function to get available stock for display
  const getAvailableStock = (presentation: ProductPresentation) => {
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

  // Helper function to check if stock is available
  const hasStock = (presentation: ProductPresentation) => {
    // Un producto tiene stock si tiene stock_available O bulk_stock_available
    return (presentation.stock_available || 0) > 0 || (presentation.bulk_stock_available || 0) > 0;
  };

  // Helper function to get max quantity that can be sold
  const getMaxQuantity = (presentation: ProductPresentation) => {
    const isBulk = isBulkPresentation(presentation);
    
    // Para productos a granel, usar bulk_stock_available si está disponible
    if (isBulk && (presentation.bulk_stock_available || 0) > 0) {
      return presentation.bulk_stock_available;
    }
    // Para productos regulares o cuando no hay bulk stock, usar stock_available
    if ((presentation.stock_available || 0) > 0) {
      return presentation.stock_available;
    }
    // Si no hay stock de ningún tipo, devolver 0
    return 0;
  };

  return (
    <div className="product-search">
      <h3>Seleccionar Productos</h3>
      
      {disabled ? (
        <div className="disabled-state">
          <div className="disabled-icon">➕</div>
          <p className="disabled-message">
            <strong>Selecciona un cliente para continuar</strong>
          </p>
          <p className="disabled-submessage">
            Una vez selecciones un cliente, podrás buscar y agregar productos al carrito
          </p>
        </div>
      ) : (
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar productos por nombre, código de barras..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          
          <div className="search-hint">
            💡 Deja el campo vacío para ver todos los productos disponibles
          </div>

          {isDropdownOpen && (
            <div className="dropdown">
              {loading ? (
                <div className="dropdown-item loading">
                  <div className="loading-spinner"></div>
                  Cargando productos...
                </div>
              ) : allPresentations.length > 0 ? (
                <>
                  <div className="dropdown-header">
                    <span>Productos disponibles ({allPresentations.length})</span>
                  </div>
                  {allPresentations.map(presentation => {
                    const availableStock = getAvailableStock(presentation);
                    const isInStock = hasStock(presentation);
                    const maxQuantity = getMaxQuantity(presentation);
                    const isBulk = isBulkPresentation(presentation);
                    
                    // Debug específico para cada presentación
                    console.log(`📦 Presentación ${presentation.presentation_name}:`, {
                      id: presentation.id,
                      productName: presentation.product?.name,
                      stock_available: presentation.stock_available,
                      bulk_stock_available: presentation.bulk_stock_available,
                      isBulk,
                      isInStock,
                      availableStock,
                      maxQuantity
                    });

                    // DEBUG ESPECÍFICO PARA CHUNKY GRANEL
                    if (presentation.product?.name?.includes('Chunky') && 
                        presentation.presentation_name?.includes('Granel')) {
                      console.log('🚨 CHUNKY GRANEL DETECTADO:', {
                        PRODUCTO: presentation.product?.name,
                        PRESENTACION: presentation.presentation_name,
                        STOCK_AVAILABLE: presentation.stock_available,
                        BULK_STOCK_AVAILABLE: presentation.bulk_stock_available,
                        TIPO_BULK_STOCK: typeof presentation.bulk_stock_available,
                        IS_BULK: isBulk,
                        HAS_STOCK: isInStock,
                        AVAILABLE_STOCK_DISPLAY: availableStock,
                        MAX_QUANTITY: maxQuantity,
                        RAW_PRESENTATION: JSON.stringify(presentation, null, 2)
                      });
                    }
                    
                    return (
                      <div key={presentation.id} className="dropdown-item product-item">
                        <div className="product-info">
                          <h4>{presentation.product?.name}</h4>
                          <p className="presentation-name">
                            {presentation.presentation_name}
                            {isBulk && <span className="bulk-indicator"> 📦 A granel</span>}
                          </p>
                          <div className="product-details">
                            <span className="price">{formatCurrency(presentation.price)}</span>
                            <span className={`stock ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
                              Stock: {availableStock}
                            </span>
                          </div>
                        </div>
                        
                        <div className="add-controls">
                          <div className="quantity-control">
                            <label>Cantidad:</label>
                            <input
                              type="number"
                              min="1"
                              max={maxQuantity}
                              value={selectedQuantities[presentation.id] || 1}
                              onChange={(e) => handleQuantityChange(presentation.id, parseInt(e.target.value) || 1)}
                              className="quantity-input"
                            />
                          </div>
                          
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleAddToCart(presentation)}
                            disabled={!isInStock}
                          >
                            Agregar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="dropdown-item no-results">
                  <div className="no-results-icon">🔍</div>
                  <p>No se encontraron productos</p>
                  <small>Intenta con otros términos de búsqueda</small>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};