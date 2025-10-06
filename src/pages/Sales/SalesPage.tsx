import React, { useState } from 'react';
import { CustomerSelector, ProductSearch, SalesCart } from '../../components';
import { useSales } from '../../hooks/useSales';
import { useMAPOStore } from '../../store';
import { Customer, ProductPresentation } from '../../types';
import './SalesPage.css';

export const SalesPage: React.FC = () => {
  const { cart, addProductToCart, processSale, getCartSummary } = useSales();
  const { setCustomer } = useMAPOStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Convert Customer to Person for cart compatibility
    const person = {
      id: customer.id,
      first_name: customer.name.split(' ')[0] || '',
      last_name: customer.name.split(' ').slice(1).join(' ') || '',
      phone: customer.phone,
      email: customer.email,
      document_type: customer.document_type,
      document_number: customer.document_number,
    };
    setCustomer(person);
  };

  const handleAddProduct = async (presentation: ProductPresentation, quantity: number) => {
    console.log('🛒 Intentando agregar producto:', {
      presentation: presentation.presentation_name,
      quantity,
      price: presentation.price,
      selectedCustomer: selectedCustomer?.name
    });

    if (!selectedCustomer) {
      alert('Debe seleccionar un cliente primero');
      return;
    }

    try {
      const result = await addProductToCart(presentation, quantity, presentation.price || 0);
      console.log('✅ Resultado de agregar producto:', result);
      
      if (result) {
        console.log('🎉 Producto agregado exitosamente al carrito');
      } else {
        console.log('❌ No se pudo agregar el producto');
      }
    } catch (error) {
      console.error('💥 Error adding product to cart:', error);
      alert('Error al agregar producto al carrito');
    }
  };

  const handleProcessSale = async () => {
    if (!selectedCustomer) {
      alert('Debe seleccionar un cliente');
      return;
    }

    const summary = getCartSummary();
    if (!summary.canProcess) {
      alert('No se puede procesar la venta');
      return;
    }

    setIsProcessing(true);
    try {
      const sale = await processSale();
      if (sale) {
        setSelectedCustomer(null);
        alert(`Venta ${sale.sale_code} procesada exitosamente`);
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  const summary = getCartSummary();

  return (
    <div className="sales-page">
      <div className="sales-header">
        <h1>Punto de Venta</h1>
        <p>Gestiona las ventas de tu tienda</p>
      </div>

      <div className="sales-content">
        <div className="sales-main">
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onCustomerSelect={handleCustomerSelect}
            onNewCustomer={() => {}}
          />

          <ProductSearch
            onAddProduct={handleAddProduct}
            disabled={!selectedCustomer}
          />
        </div>

        <div className="sales-sidebar">
          <SalesCart
            items={cart.items}
            total={cart.total}
            customer={selectedCustomer}
            onProcessSale={handleProcessSale}
            isProcessing={isProcessing}
            canProcess={summary.canProcess}
          />
        </div>
      </div>
    </div>
  );
};