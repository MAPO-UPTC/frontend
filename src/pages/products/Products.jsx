import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductFilters from "../../components/ProductFilters/ProductFilters";
import PermissionGate from "../../components/PermissionGate/PermissionGate";
import RoleSelector from "../../components/RoleSelector/RoleSelector";
import { useProducts, useCategories, useProductFilters, usePermissions } from "../../hooks";
import { useAuth } from "../../context/AuthContext";
import { Entity, Action } from "../../constants";
import "./Products.css";

export default function Products() {
  // Hook para autenticación
  const { user, handleLogout } = useAuth();
  
  // Hooks personalizados para manejo de estado escalable
  const { products, loading, error } = useProducts();
  const { categories } = useCategories();
  
  // Hook para manejo de permisos y roles
  const {
    availableRoles,
    activeRole,
    hasMultipleRoles,
    loading: permissionsLoading,
    actions: { switchRole, clearActiveRole, hasPermission }
  } = usePermissions();
  
  // Hook personalizado para filtros
  const { 
    filters, 
    filteredProducts, 
    filterStats,
    actions: { updateFilter, clearAllFilters }
  } = useProductFilters(products);

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
      {/* Selector de roles si tiene múltiples roles */}
      {hasMultipleRoles && (
        <RoleSelector
          availableRoles={availableRoles}
          activeRole={activeRole}
          onRoleChange={switchRole}
          onClearRole={clearActiveRole}
          loading={permissionsLoading}
        />
      )}
      
      <div className="products-nav">
                <div className="nav-buttons">
          <PermissionGate
            key={`create-product-${activeRole || 'all-roles'}`}
            entity={Entity.PRODUCTS}
            action={Action.CREATE}
            fallback={null}
          >
            <Link to="/create-product" className="create-product-btn">
              ➕ Crear Producto
            </Link>
          </PermissionGate>
          
          <Link to="/permissions-demo" className="demo-btn">
            🎭 Demo de Permisos
          </Link>
        </div>
        
        {/* Mostrar información del usuario si está autenticado, sino mostrar botón de login */}
        {user ? (
          <div className="user-info">
            <span className="user-email">👋 {user.email}</span>
            <button onClick={handleLogout} className="logout-button-nav">
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <Link to="/login" className="login-button-nav">
            Iniciar Sesión
          </Link>
        )}
      </div>
      
      <div className="products-header">
        <h1 className="products-title">Nuestra Tienda</h1>
        <p className="products-subtitle">Encuentra todo lo que tu mascota necesita</p>
        
        {/* Debug: Mostrar estado actual de permisos */}
        {user && (
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
            Puede crear productos: {(() => {
              const canCreate = hasPermission(Entity.PRODUCTS, Action.CREATE);
              return canCreate ? '✅ SÍ' : '❌ NO';
            })()}
          </div>
        )}
      </div>

      <ProductFilters
        filters={filters}
        categories={categories}
        filterStats={filterStats}
        onFilterChange={updateFilter}
        onClearFilters={clearAllFilters}
      />

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="no-products">
            No se encontraron productos que coincidan con los filtros.
          </div>
        )}
      </div>
    </div>
  );
}