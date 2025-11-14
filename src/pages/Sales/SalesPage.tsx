import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerSelector, ProductSearch, SalesCart } from '../../components';
import PermissionGate from '../../components/PermissionGate/PermissionGate';
import { useSales } from '../../hooks/useSales';
import { useInventory } from '../../hooks/useInventory';
import { useMAPOStore } from '../../store';
import { PersonAPIResponse, ProductPresentation } from '../../types';
import { Entity, Action } from '../../constants';
import './SalesPage.css';

export const SalesPage: React.FC = () => {
  const { cart, addProductToCart, processSale, getCartSummary } = useSales();
  const { loadProducts } = useInventory();
  const { setCustomer } = useMAPOStore();
  const [selectedCustomer, setSelectedCustomer] = useState<PersonAPIResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

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

  const handleClearSale = () => {
    setLastSale(null);
    setSelectedCustomer(null);
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
        // Guardar la venta para poder imprimirla
        setLastSale({
          ...sale,
          customerName: selectedCustomer?.full_name || `${selectedCustomer?.name} ${selectedCustomer?.last_name}`,
          customerDocument: `${selectedCustomer?.document_type}: ${selectedCustomer?.document_number}`
        });
        
        // Mostrar confirmación detallada
        const saleDate = new Date(sale.sale_date).toLocaleString('es-CO', {
          dateStyle: 'long',
          timeStyle: 'short'
        });
        
        const totalAmount = sale.total_amount || sale.total || 0;
        
        // Mostrar información de la venta en consola
        console.log('✅ Venta procesada exitosamente:', {
          id: sale.id,
          total: totalAmount,
          fecha: saleDate,
          items: sale.items?.length || sale.sale_details?.length || cart.items.length
        });
        
        // Recargar productos para actualizar stock
        console.log('🔄 Recargando productos para actualizar stock...');
        await loadProducts();
        console.log('✅ Productos actualizados');
        
        // NO limpiar el cliente aquí para poder imprimir
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      // La notificación de error ya se muestra en el store
      setLastSale(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const summary = getCartSummary();

  return (
    <PermissionGate
      entity={Entity.SALES_ORDERS}
      action={Action.CREATE}
      fallback={(
        <div className="sales-page">
          <div className="no-permission-message" style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#fff3cd',
            borderRadius: '8px',
            margin: '20px'
          }}>
            <h3>⚠️ Sin permisos para realizar ventas</h3>
            <p>No tienes permisos suficientes para acceder al módulo de ventas.</p>
            <p>Contacta con un administrador si necesitas acceso.</p>
            <Link to="/products" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block', padding: '10px 20px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
              Volver a Productos
            </Link>
          </div>
        </div>
      ) as any}
      showLoading={true}
      loadingComponent={(
        <div className="sales-page">
          <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>
            Verificando permisos...
          </div>
        </div>
      ) as any}
    >
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
              lastSale={lastSale}
              onClearSale={handleClearSale}
            />
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};