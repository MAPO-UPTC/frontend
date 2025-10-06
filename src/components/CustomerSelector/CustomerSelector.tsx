import React, { useState, useEffect } from 'react';
import { usePersons } from '../../hooks/usePersons';
import { Button } from '../UI';
import { PersonAPIResponse } from '../../types';
import './CustomerSelector.css';

interface CustomerSelectorProps {
  selectedCustomer: PersonAPIResponse | null;
  onCustomerSelect: (customer: PersonAPIResponse | null) => void;
  disabled?: boolean;
}

interface PersonFormData {
  name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email?: string;
  phone?: string;
  address?: string;
}

const INITIAL_FORM_DATA: PersonFormData = {
  name: '',
  last_name: '',
  document_type: 'CC',
  document_number: '',
  email: '',
  phone: '',
  address: ''
};

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
    filteredTotal,
    createPerson
  } = usePersons();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<PersonFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Partial<PersonFormData>>({});
  const [isCreating, setIsCreating] = useState(false);

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
    onCustomerSelect(null);
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

  // Manejo del formulario de creación
  const handleFormChange = (field: keyof PersonFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<PersonFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'El apellido es requerido';
    }
    
    if (!formData.document_number.trim()) {
      errors.document_number = 'El número de documento es requerido';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      console.log('➕ CustomerSelector - Creando nueva persona:', formData);
      
      const newPerson = await createPerson(formData);
      
      console.log('✅ CustomerSelector - Persona creada:', newPerson);
      
      // Seleccionar automáticamente la persona creada
      onCustomerSelect(newPerson as PersonAPIResponse);
      
      // Resetear formulario
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
      setShowCreateForm(false);
      setSearchTerm('');
      
    } catch (error) {
      console.error('❌ CustomerSelector - Error al crear persona:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setIsDropdownOpen(false);
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

          {/* Botón para mostrar/ocultar formulario */}
          <div className="create-person-toggle">
            <button 
              className="toggle-form-btn"
              onClick={toggleCreateForm}
              type="button"
            >
              {showCreateForm ? '❌ Cancelar' : '➕ Crear Nueva Persona'}
            </button>
          </div>

          {/* Formulario de creación de persona */}
          {showCreateForm && (
            <form className="create-person-form" onSubmit={handleCreatePerson}>
              <h4>➕ Crear Nueva Persona</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Nombre <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className={formErrors.name ? 'error' : ''}
                    placeholder="Juan"
                    disabled={isCreating}
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label>
                    Apellido <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleFormChange('last_name', e.target.value)}
                    className={formErrors.last_name ? 'error' : ''}
                    placeholder="Pérez"
                    disabled={isCreating}
                  />
                  {formErrors.last_name && <span className="error-message">{formErrors.last_name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Tipo de Documento <span className="required">*</span>
                  </label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => handleFormChange('document_type', e.target.value)}
                    disabled={isCreating}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PAS">Pasaporte</option>
                    <option value="NIT">NIT</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Número de Documento <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => handleFormChange('document_number', e.target.value)}
                    className={formErrors.document_number ? 'error' : ''}
                    placeholder="1234567890"
                    disabled={isCreating}
                  />
                  {formErrors.document_number && <span className="error-message">{formErrors.document_number}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email (Opcional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className={formErrors.email ? 'error' : ''}
                    placeholder="correo@ejemplo.com"
                    disabled={isCreating}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Teléfono (Opcional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="3001234567"
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Dirección (Opcional)</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    placeholder="Calle 123 # 45-67"
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleCreateForm}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isCreating}
                >
                  {isCreating ? '⏳ Creando...' : '✅ Crear Persona'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};