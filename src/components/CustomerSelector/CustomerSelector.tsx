import React, { useState, useEffect } from 'react';
import { usePersons } from '../../hooks/usePersons';
import { Button } from '../UI';
import { PersonAPIResponse } from '../../types';
import './CustomerSelector.css';

interface CustomerSelectorProps {
  selectedCustomer: PersonAPIResponse | null;
  onCustomerSelect: (customer: PersonAPIResponse) => void;
  disabled?: boolean;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomer,
  onCustomerSelect,
  disabled = false
}) => {
  const { 
    persons,  
    loading, 
    error, 
    searchPersons, 
    clearSearch, 
    formatPerson,
    isSearching,
    filteredTotal
  } = usePersons();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔍 CustomerSelector - Estado actualizado:', {
      personsCount: persons.length,
      loading,
      error,
      searchTerm,
      isDropdownOpen,
      selectedCustomer: selectedCustomer?.id
    });
  }, [persons, loading, error, searchTerm, isDropdownOpen, selectedCustomer]);

  const handleSearch = async (term: string) => {
    console.log('🔍 CustomerSelector - Iniciando búsqueda con término:', term);
    setSearchTerm(term);
    
    if (term.trim().length > 0) {
      try {
        await searchPersons(term);
        setIsDropdownOpen(true);
        console.log('✅ CustomerSelector - Búsqueda completada, resultados:', filteredTotal);
      } catch (error) {
        console.error('❌ CustomerSelector - Error en búsqueda:', error);
      }
    } else {
      clearSearch();
      setIsDropdownOpen(persons.length > 0); // Mostrar todos si hay personas cargadas
    }
  };

  const handleCustomerSelect = (customer: PersonAPIResponse) => {
    console.log('� CustomerSelector - Cliente seleccionado:', {
      id: customer.id,
      name: formatPerson(customer)
    });
    
    onCustomerSelect(customer);
    setSearchTerm('');
    setIsDropdownOpen(false);
    clearSearch();
  };

  const handleClearSelection = () => {
    console.log('🗑️ CustomerSelector - Limpiando selección');
    onCustomerSelect(null as any);
    setSearchTerm('');
    setIsDropdownOpen(false);
    clearSearch();
  };

  const handleFocus = () => {
    if (!selectedCustomer && persons.length > 0 && !searchTerm) {
      setIsDropdownOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay para permitir clicks en dropdown
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  if (disabled) {
    return (
      <div className="customer-selector disabled">
        <h3>Seleccionar Cliente</h3>
        <div className="disabled-state">
          <p>Funcionalidad deshabilitada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-selector">
      <h3>👥 Seleccionar Cliente</h3>
      
      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={clearSearch} className="retry-btn">
            Reintentar
          </button>
        </div>
      )}
      
      {selectedCustomer ? (
        <div className="selected-customer">
          <div className="customer-info">
            <div className="customer-header">
              <strong>✅ Cliente Seleccionado</strong>
            </div>
            <div className="customer-details">
              <p className="customer-name">
                <strong>{selectedCustomer.full_name || `${selectedCustomer.name} ${selectedCustomer.last_name}`}</strong>
              </p>
              {selectedCustomer.document_type && selectedCustomer.document_number && (
                <p className="customer-document">
                  🆔 {selectedCustomer.document_type}: {selectedCustomer.document_number}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="small"
            onClick={handleClearSelection}
          >
            Cambiar Cliente
          </Button>
        </div>
      ) : (
        <div className="customer-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar cliente por nombre, documento, email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="search-input"
              disabled={loading}
            />
            
            <div className="search-hint">
              💡 {isSearching 
                ? `${filteredTotal} resultado${filteredTotal !== 1 ? 's' : ''} encontrado${filteredTotal !== 1 ? 's' : ''}` 
                : 'Escribe para buscar o deja vacío para ver todos'
              }
            </div>
            
            {isDropdownOpen && (
              <div className="dropdown">
                {loading ? (
                  <div className="dropdown-item loading">
                    <div className="loading-spinner"></div>
                    Cargando personas...
                  </div>
                ) : persons.length > 0 ? (
                  <>
                    <div className="dropdown-header">
                      <span>Clientes disponibles ({persons.length})</span>
                    </div>
                    {persons.map(person => (
                      <div
                        key={person.id}
                        className="dropdown-item person-item"
                        onClick={() => handleCustomerSelect(person)}
                      >
                        <div className="person-info">
                          <h4>{person.full_name || `${person.name} ${person.last_name}`}</h4>
                          {person.document_type && person.document_number && (
                            <p className="person-document">
                              🆔 {person.document_type}: {person.document_number}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="dropdown-item no-results">
                    <div className="no-results-icon">🔍</div>
                    <p>No se encontraron personas</p>
                    <small>
                      {isSearching 
                        ? 'Intenta con otros términos de búsqueda'
                        : 'No hay personas registradas en el sistema'
                      }
                    </small>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="customer-stats">
            <small>
              {loading ? (
                '⏳ Cargando personas...'
              ) : error ? (
                '❌ Error al cargar personas'
              ) : (
                `📊 ${persons.length} persona${persons.length !== 1 ? 's' : ''} disponible${persons.length !== 1 ? 's' : ''}`
              )}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};