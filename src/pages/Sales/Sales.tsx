import React, { useState } from 'react';
import { SalesCart } from '../../components/SalesCart/SalesCart';
import { CartItem, Customer } from '../../types';
import './Sales.css';

export const Sales: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.line_total, 0);
  const canProcess = cartItems.length > 0 && customer !== null;

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        cartItem => cartItem.presentation.id === item.presentation.id
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        updated[existingIndex].line_total = updated[existingIndex].quantity * updated[existingIndex].unit_price;
        return updated;
      }
      
      return [...prev, item];
    });
  };

  const handleProcessSale = async () => {
    if (!canProcess) return;
    
    setIsProcessing(true);
    try {
      // Simular procesamiento de venta
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpiar carrito y customer después de la venta
      setCartItems([]);
      setCustomer(null);
      
      console.log('Sale processed successfully!', {
        customer,
        items: cartItems,
        total
      });
    } catch (error) {
      console.error('Error processing sale:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simular productos para demo
  const handleAddDemoProduct = () => {
    const demoItem: CartItem = {
      presentation: {
        id: `demo-${Date.now()}`,
        presentation_name: 'Alimento Premium Perro - 15kg',
        quantity: 15,
        unit: 'kg',
        sku: 'ALI-PREM-15KG',
        price: 45000,
        stock_available: 10,
        bulk_stock_available: 0,
        total_stock: 10,
        active: true
      },
      quantity: 1,
      unit_price: 45000,
      line_total: 45000,
      max_available: 10
    };
    
    handleAddToCart(demoItem);
  };

  const handleSetDemoCustomer = () => {
    const demoCustomer: Customer = {
      id: 'demo-customer',
      name: 'Cliente de Prueba',
      email: 'demo@example.com',
      phone: '123-456-7890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setCustomer(demoCustomer);
  };

  return (
    <div className="sales-page">
      <div className="sales-header">
        <h1>Punto de Venta</h1>
        <p>Gestiona las ventas y el carrito de compras</p>
      </div>
      
      <div className="sales-content">
        <div className="sales-left">
          <div className="demo-controls">
            <h3>Controles de Demostración</h3>
            <button onClick={handleAddDemoProduct} className="demo-button">
              ➕ Agregar Producto Demo
            </button>
            <button onClick={handleSetDemoCustomer} className="demo-button">
              👤 Seleccionar Cliente Demo
            </button>
          </div>
        </div>
        
        <div className="sales-right">
          <SalesCart
            items={cartItems}
            total={total}
            customer={customer}
            onProcessSale={handleProcessSale}
            isProcessing={isProcessing}
            canProcess={canProcess}
          />
        </div>
      </div>
    </div>
  );
};