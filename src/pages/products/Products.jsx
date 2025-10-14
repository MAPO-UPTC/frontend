import ProductCard from "../../components/ProductCard/ProductCard";
import ProductFilters from "../../components/ProductFilters/ProductFilters";
import PermissionGate from "../../components/PermissionGate/PermissionGate";
import { useProducts, useCategories, useProductFilters } from "../../hooks";
import { Entity, Action } from "../../constants";
import "./Products.css";

export default function Products() {
  // Hooks personalizados para manejo de estado escalable
  const { products, loading, error } = useProducts();
  const { categories } = useCategories();
  
  // Hook personalizado para filtros
  const { 
    filters, 
    filteredProducts, 
    filterStats,
    actions: { updateFilter, clearAllFilters }
  } = useProductFilters(products);

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

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h1 className="products-title">Nuestra Tienda</h1>
        <p className="products-subtitle">Encuentra todo lo que tu mascota necesita</p>
        
        {/* Debug Info - Solo visible para usuarios autenticados (comentar en producción) */}
        {/* {user && (
          <div style={{ 
            background: '#f0f0f0', 
            padding: '10px', 
            margin: '10px 0', 
            borderRadius: '5px',
            fontSize: '12px',
            color: '#666'
          }}>
            <strong>Debug Info:</strong><br/>
            Usuario: {user.email}<br/>
            Rol activo: {activeRole || 'Todos los roles'}<br/>
            Roles disponibles: {availableRoles.join(', ')}<br/>
            Permisos en PRODUCTS:<br/>
            - Crear: {hasPermission(Entity.PRODUCTS, Action.CREATE) ? '✅ SÍ' : '❌ NO'}<br/>
            - Leer: {hasPermission(Entity.PRODUCTS, Action.READ) ? '✅ SÍ' : '❌ NO'}<br/>
            - Actualizar: {hasPermission(Entity.PRODUCTS, Action.UPDATE) ? '✅ SÍ' : '❌ NO'}<br/>
            - Eliminar: {hasPermission(Entity.PRODUCTS, Action.DELETE) ? '✅ SÍ' : '❌ NO'}
          </div>
        )} */}
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
          onFilterChange={updateFilter}
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
          {(() => {
            // Validación exhaustiva para evitar el error n.map is not a function
            console.log('[Products] filteredProducts type:', typeof filteredProducts);
            console.log('[Products] filteredProducts isArray:', Array.isArray(filteredProducts));
            console.log('[Products] filteredProducts value:', filteredProducts);
            
            if (!Array.isArray(filteredProducts)) {
              console.error('[Products] ERROR: filteredProducts no es un array:', filteredProducts);
              return (
                <div className="error">
                  Error: Los datos de productos no tienen el formato correcto.
                </div>
              );
            }
            
            return filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <div className="no-products">
                No se encontraron productos que coincidan con los filtros.
              </div>
            );
          })()}
        </div>
      </PermissionGate>
    </div>
  );
}