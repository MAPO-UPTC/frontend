import ProductCard from "../../components/ProductCard/ProductCard";
import ProductFilters from "../../components/ProductFilters/ProductFilters";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useProducts, useCategories, useProductFilters } from "../../hooks";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Products.css";

export default function Products() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
        <div className="header-content">
          <div className="header-text">
            <h1 className="products-title">🐾 Nuestra Tienda</h1>
            <p className="products-subtitle">Encuentra todo lo que tu mascota necesita</p>
          </div>
          
          <div className="header-actions">
            {user ? (
              <div className="user-header-info">
                <span className="welcome-text">Hola, {user.name || 'Usuario'}</span>
                <button 
                  className="btn-settings"
                  onClick={() => setShowPasswordModal(true)}
                  title="Cambiar Contraseña"
                >
                  ⚙️
                </button>
                <button 
                  className="btn-logout"
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            ) : (
              <button 
                className="btn-login"
                onClick={() => navigate('/login')}
                title="Iniciar Sesión"
              >
                🔐 Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>

      <ProductFilters
        filters={filters}
        categories={categories}
        filterStats={filterStats}
        onFilterChange={(name, value, event) => updateFilter(name, value, event)}
        onClearFilters={clearAllFilters}
      />

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

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userEmail={user?.email}
      />
    </div>
  );
}