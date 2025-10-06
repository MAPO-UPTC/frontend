import React, { useState } from 'react';
import { useSales } from '../../hooks/useSales';
import { Button } from '../UI';
import { Customer } from '../../types';
import { CustomerModal } from './CustomerModal';
import './CustomerSelector.css';

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  onNewCustomer: () => void;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomer,
  onCustomerSelect,
  onNewCustomer
}) => {
  const { searchCustomers, loading } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (term: string) => {
    console.log('🔍 CustomerSelector - Iniciando búsqueda con término:', term);
    setSearchTerm(term);
    if (term.length > 0) {
      try {
        console.log('📞 CustomerSelector - Llamando searchCustomers...');
        const results = await searchCustomers(term);
        console.log('✅ CustomerSelector - Resultados obtenidos:', results);
        setFilteredCustomers(results);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error('❌ CustomerSelector - Error searching customers:', error);
        setFilteredCustomers([]);
      }
    } else {
      console.log('🗑️ CustomerSelector - Término vacío, limpiando resultados');
      setFilteredCustomers([]);
      setIsDropdownOpen(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer);
    setSearchTerm('');
    setIsDropdownOpen(false);
    setFilteredCustomers([]);
  };

  const handleClearSelection = () => {
    onCustomerSelect(null as any);
    setSearchTerm('');
    setIsDropdownOpen(false);
    setFilteredCustomers([]);
  };

  return (
    <div className="customer-selector">
      <h3>Seleccionar Cliente</h3>
      
      {selectedCustomer ? (
        <div className="selected-customer">
          <div className="customer-info">
            <p><strong>{selectedCustomer.name}</strong></p>
            <p>{selectedCustomer.email}</p>
            <p>{selectedCustomer.phone}</p>
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
              placeholder="Buscar cliente por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            
            {isDropdownOpen && (
              <div className="dropdown">
                {loading ? (
                  <div className="dropdown-item loading">
                    Buscando...
                  </div>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className="dropdown-item"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="customer-preview">
                        <strong>{customer.name}</strong>
                        <p>{customer.email}</p>
                        <small>{customer.phone}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item no-results">
                    No se encontraron clientes
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="new-customer-btn"
          >
            + Nuevo Cliente
          </Button>
        </div>
      )}

      <CustomerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCustomerCreated={(customer) => {
          onCustomerSelect(customer);
          setShowModal(false);
        }}
      />
    </div>
  );
};