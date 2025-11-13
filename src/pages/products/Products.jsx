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
  const { products, actions: { fetchProducts } } = useProducts();
  // Hook de filtros frontend (solo búsqueda)
  const { filterStats } = useProductFilters(products, filters);

  // Enriquecer productos con información de categoría
  const enrichedProducts = products.map(product => {
    if (product.category) {
      return product; // Ya tiene la categoría completa
    }
    // Buscar la categoría por category_id
    const category = categories.find(cat => cat.id === product.category_id);
    return {
      ...product,
      category: category || { id: product.category_id, name: 'Sin categoría' }
    };
  });

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
            let productsToShow = enrichedProducts;
            if (filters.search) {
              productsToShow = enrichedProducts.filter(product =>
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

      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/573135321766?text=Hola,%20estoy%20interesado%20en%20sus%20productos"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        title="Contáctanos por WhatsApp"
      >
        <svg viewBox="0 0 32 32" className="whatsapp-icon">
          <path fill="currentColor" d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-5.247 1.408 1.408-5.247-0.292-0.507c-1.224-2.162-1.87-4.588-1.87-7.07 0-7.51 6.11-13.62 13.62-13.62s13.62 6.11 13.62 13.62c0 7.51-6.11 13.62-13.62 13.62zM21.305 19.26c-0.346-0.174-2.049-1.007-2.366-1.123-0.316-0.116-0.547-0.174-0.776 0.174s-0.893 1.123-1.094 1.347c-0.201 0.224-0.402 0.251-0.748 0.076-0.346-0.174-1.461-0.539-2.785-1.722-1.031-0.922-1.727-2.059-1.929-2.406-0.201-0.346-0.022-0.535 0.152-0.707 0.156-0.155 0.346-0.402 0.518-0.603 0.174-0.201 0.231-0.346 0.346-0.571 0.116-0.224 0.058-0.424-0.028-0.595-0.087-0.174-0.776-1.87-1.063-2.565-0.28-0.672-0.56-0.58-0.776-0.591-0.2-0.010-0.429-0.012-0.659-0.012s-0.603 0.087-0.918 0.424c-0.316 0.346-1.206 1.179-1.206 2.873s1.235 3.333 1.406 3.561c0.174 0.224 2.425 3.732 5.872 5.234 0.821 0.354 1.462 0.566 1.962 0.724 0.825 0.262 1.577 0.225 2.168 0.137 0.661-0.099 2.049-0.835 2.335-1.642 0.288-0.807 0.288-1.501 0.201-1.642-0.086-0.14-0.315-0.227-0.659-0.401z"/>
        </svg>
      </a>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userEmail={user?.email}
      />
    </div>
  );
}