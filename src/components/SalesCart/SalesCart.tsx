import React from 'react';
import { Button } from '../UI';
import { CartItem, Customer } from '../../types';
import './SalesCart.css';

interface SalesCartProps {
  items: CartItem[];
  total: number;
  customer: Customer | null;
  onProcessSale: () => void;
  isProcessing: boolean;
  canProcess: boolean;
}

export const SalesCart: React.FC<SalesCartProps> = ({
  items,
  total,
  customer,
  onProcessSale,
  isProcessing,
  canProcess
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="sales-cart">
      <div className="cart-header">
        <h3>Carrito de Compras</h3>
        <span className="item-count">{items.length} artículos</span>
      </div>

      {customer && (
        <div className="cart-customer">
          <h4>Cliente:</h4>
          <p><strong>{customer.name}</strong></p>
          <p>{customer.email}</p>
        </div>
      )}

      <div className="cart-items">
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>El carrito está vacío</p>
            <small>Agrega productos para comenzar</small>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.presentation.id} className="cart-item">
              <div className="item-info">
                <h4>{item.presentation.product?.name || 'Producto'}</h4>
                <p className="presentation">{item.presentation.presentation_name}</p>
                <p className="presentation-details">
                  {item.presentation.quantity} {item.presentation.unit}
                </p>
                <div className="quantity-price">
                  <span className="quantity">Cantidad: {item.quantity}</span>
                  <span className="unit-price">
                    {formatCurrency(item.unit_price)} c/u
                  </span>
                </div>
              </div>
              <div className="item-total">
                {formatCurrency(item.line_total)}
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="summary-row">
            <span>IVA (19%):</span>
            <span>{formatCurrency(total * 0.19)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>{formatCurrency(total * 1.19)}</span>
          </div>
        </div>
      )}

      <div className="cart-actions">
        <Button
          variant="primary"
          onClick={onProcessSale}
          disabled={!canProcess || isProcessing}
          loading={isProcessing}
          className="process-sale-btn"
        >
          {isProcessing ? 'Procesando...' : 'Procesar Venta'}
        </Button>
        
        {!customer && (
          <p className="warning">Selecciona un cliente para continuar</p>
        )}
        
        {items.length === 0 && (
          <p className="warning">Agrega productos al carrito</p>
        )}
      </div>
    </div>
  );
};