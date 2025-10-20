import ProductCard from "../../components/ProductCard/ProductCard";
import ProductFilters from "../../components/ProductFilters/ProductFilters";
import PermissionGate from "../../components/PermissionGate/PermissionGate";
import { useProducts, useCategories, useProductFilters } from "../../hooks";
import { useState, useEffect } from "react";
import { Entity, Action } from "../../constants";
import "./Products.css";

export default function Products() {
  // Hooks personalizados para manejo de estado escalable
  // Estado de filtros
  const [filters, setFilters] = useState({
    category: "",
    search: ""
  });
  const { categories } = useCategories();
  // useProducts hook con recarga por categoría
  const { products, loading, error, actions: { fetchProducts } } = useProducts();
  // Hook de filtros frontend (solo búsqueda)
  const { filterStats } = useProductFilters(products, filters);

  // Cuando cambia la categoría, recargar productos desde backend
  useEffect(() => {
    // Solo filtrar por categoría en el backend
    const backendFilters = {};
    if (filters.category) backendFilters.category = filters.category;
    fetchProducts(backendFilters);
  }, [filters.category, fetchProducts]);

  // Handlers para filtros
  // Solo actualiza el filtro de búsqueda al presionar Enter
  const updateFilter = (name, value, event) => {
    if (name === "search" && event && event.key !== "Enter") return;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  const clearAllFilters = () => {
    setFilters({ category: "", search: "" });
  };

  // Función para manejar agregar al carrito
  const handleAddToCart = (cartItem) => {
    console.log('Producto agregado al carrito desde Products:', cartItem);
    // Aquí podrías integrar con un estado global de carrito
    // o redirigir a la página de ventas
    // Por ahora solo mostramos un mensaje
    alert(`✅ ${cartItem.presentation.presentation_name} agregado al carrito\nCantidad: ${cartItem.quantity}\nTotal: ${new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(cartItem.line_total)}`);
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1 className="products-title">Nuestra Tienda</h1>
        <p className="products-subtitle">Encuentra todo lo que tu mascota necesita</p>
        {/* Debug Info - Solo visible para usuarios autenticados (comentar en producción) */}
      </div>

      <PermissionGate
        entity={Entity.PRODUCTS}
        action={Action.READ}
        fallback={
          <div className="no-permission-message" style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#fff3cd',
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <h3>⚠️ Sin permisos para ver productos</h3>
            <p>No tienes permisos suficientes para visualizar el catálogo de productos.</p>
          </div>
        }
        showLoading={true}
        loadingComponent={<div className="loading">Verificando permisos...</div>}
      >
        <ProductFilters
          filters={filters}
          categories={categories}
          filterStats={filterStats}
          onFilterChange={(name, value, event) => updateFilter(name, value, event)}
          onClearFilters={clearAllFilters}
        />
      </PermissionGate>

      <PermissionGate
        entity={Entity.PRODUCTS}
        action={Action.READ}
        fallback={null}
        showLoading={false}
      >
        <div className="products-grid">
          {/* Filtrar productos por nombre solo al presionar Enter */}
          {(() => {
            let productsToShow = products;
            if (filters.search) {
              productsToShow = products.filter(product =>
                product.name?.toLowerCase().includes(filters.search.toLowerCase())
              );
            }
            if (!Array.isArray(productsToShow)) {
              console.error('[Products] ERROR: productsToShow no es un array:', productsToShow);
              return <div className="error">Error: Los datos de productos no tienen el formato correcto.</div>;
            }
            if (productsToShow.length > 0) {
              return productsToShow.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              ));
            } else {
              return <div className="no-products">No se encontraron productos que coincidan con los filtros.</div>;
            }
          })()}
        </div>
      </PermissionGate>
    </div>
  );
}