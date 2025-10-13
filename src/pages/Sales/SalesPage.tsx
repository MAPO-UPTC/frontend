import React, { useState } from 'react';
import { CustomerSelector, ProductSearch, SalesCart } from '../../components';
import { useSales } from '../../hooks/useSales';
import { useInventory } from '../../hooks/useInventory';
import { useMAPOStore } from '../../store';
import { PersonAPIResponse, ProductPresentation } from '../../types';
import './SalesPage.css';

export const SalesPage: React.FC = () => {
  const { cart, addProductToCart, processSale, getCartSummary } = useSales();
  const { loadProducts } = useInventory();
  const { setCustomer } = useMAPOStore();
  const [selectedCustomer, setSelectedCustomer] = useState<PersonAPIResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCustomerSelect = (customer: PersonAPIResponse | null) => {
    setSelectedCustomer(customer);
    
    if (!customer) {
      // Si no hay cliente, limpiar el customer del store
      setCustomer(null as any);
      return;
    }
    
    // Convert PersonAPIResponse to Person for cart compatibility
    const person = {
      id: customer.id,
      first_name: customer.name || '',
      last_name: customer.last_name || '',
      phone: '', // No disponible en PersonAPIResponse
      email: '', // No disponible en PersonAPIResponse
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
      selectedCustomer: selectedCustomer?.name || selectedCustomer?.full_name || 'Sin nombre'
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
        // Limpiar el cliente seleccionado
        setSelectedCustomer(null);
        
        // Mostrar confirmación detallada
        const saleDate = new Date(sale.sale_date).toLocaleString('es-CO', {
          dateStyle: 'long',
          timeStyle: 'short'
        });
        
        alert(
          `✅ ¡Venta Exitosa!\n\n` +
          `ID: ${sale.id}\n` +  // ✅ Usar sale.id en lugar de sale_code
          `Total: ${sale.total_amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}\n` +  // ✅ total_amount
          `Fecha: ${saleDate}\n` +
          `Items: ${sale.sale_details?.length || cart.items.length}`  // ✅ sale_details
        );
        
        // Recargar productos para actualizar stock
        console.log('🔄 Recargando productos para actualizar stock...');
        await loadProducts();
        console.log('✅ Productos actualizados');
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('❌ Error al procesar la venta. Por favor intenta de nuevo.');
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
            customer={selectedCustomer ? {
              id: selectedCustomer.id,
              name: selectedCustomer.full_name || `${selectedCustomer.name} ${selectedCustomer.last_name}`,
              email: '', // No disponible en PersonAPIResponse
              phone: '', // No disponible en PersonAPIResponse  
              document_type: selectedCustomer.document_type,
              document_number: selectedCustomer.document_number,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } : null}
            onProcessSale={handleProcessSale}
            isProcessing={isProcessing}
            canProcess={summary.canProcess}
          />
        </div>
      </div>
    </div>
  );
};