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
        />
      </div>

      <div className="filter-group">
        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <select
          className="filter-select"
          value={filters.priceRange}
          onChange={(e) => onFilterChange("priceRange", e.target.value)}
        >
          <option value="">Todos los precios</option>
          <option value="0-20000">$0 - $20,000</option>
          <option value="20001-40000">$20,001 - $40,000</option>
          <option value="40001+">$40,001+</option>
        </select>
      </div>

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