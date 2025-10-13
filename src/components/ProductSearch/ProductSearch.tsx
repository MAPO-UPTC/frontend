import React, { useState, useEffect } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { ProductPresentation } from '../../types';
import { SalesProductCard } from './SalesProductCard';
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

  // Cargar productos al iniciar el componente
  useEffect(() => {
    const initializeProducts = async () => {
      try {
        await loadProducts();
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
      } catch (error) {
        console.error('Error searching products:', error);
      }
    } else if (term.length === 0) {
      // Si no hay término de búsqueda, mostrar todos los productos
      await loadProducts();
    }
  };

  const handleAddToCart = (presentation: ProductPresentation, quantity: number) => {
    console.log('🔄 ProductSearch - handleAddToCart clicked:', {
      presentation: presentation.presentation_name,
      quantity,
      price: presentation.price,
      stock: presentation.stock_available
    });
    
    onAddProduct(presentation, quantity);
    
    console.log('📤 ProductSearch - onAddProduct called');
  };

  // Flatten all presentations from all products
  const allPresentations = products.flatMap(product => 
    product.presentations?.map(presentation => ({
      ...presentation,
      product: product
    })) || []
  );

  return (
    <div className="product-search">
      <div className="product-search-header">
        <h3>Seleccionar Productos</h3>
        {!disabled && allPresentations.length > 0 && (
          <span className="product-count">{allPresentations.length} producto{allPresentations.length !== 1 ? 's' : ''} disponible{allPresentations.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      
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
        <>
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="🔍 Buscar productos por nombre, código de barras..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner-large"></div>
              <p>Cargando productos...</p>
            </div>
          ) : allPresentations.length > 0 ? (
            <div className="products-grid">
              {allPresentations.map(presentation => (
                <SalesProductCard
                  key={presentation.id}
                  presentation={presentation}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h4>No se encontraron productos</h4>
              <p>
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'No hay productos disponibles en el inventario'
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};