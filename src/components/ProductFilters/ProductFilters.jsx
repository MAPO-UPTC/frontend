// src/components/ProductFilters/ProductFilters.jsx
import "./ProductFilters.css";

/**
 * Componente reutilizable para filtros de productos
 * Encapsula la lógica de filtrado en un componente independiente
 */
export default function ProductFilters({ 
  filters, 
  categories, 
  filterStats, 
  onFilterChange, 
  onClearFilters 
}) {
  return (
    <div className="product-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="search-input"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onFilterChange("search", e.target.value, e);
          }}
        />
      </div>

      <div className="filter-group">
        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {Array.isArray(categories) ? categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          )) : (
            <option value="" disabled>Error cargando categorías</option>
          )}
        </select>
      </div>

      {/* Filtro de precio eliminado */}

      {filterStats.hasActiveFilters && (
        <div className="filter-group">
          <button
            className="clear-filters-btn"
            onClick={onClearFilters}
          >
            Limpiar filtros ({filterStats.filtered}/{filterStats.total})
          </button>
        </div>
      )}
    </div>
  );
}