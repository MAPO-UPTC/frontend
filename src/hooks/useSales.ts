import { useCallback } from 'react';
import { useMAPOStore } from '../store';
import { ProductPresentation, Person, UUID } from '../types';

export const useSales = () => {
  const {
    cart,
    sales,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setCustomer,
    searchCustomers,
    createCustomer,
    createSale,
    loadSales,
    loadSaleById,
    addNotification
  } = useMAPOStore();

  const addProductToCart = useCallback(async (
    presentation: ProductPresentation,
    quantity: number,
    unitPrice: number
  ) => {
    const success = await addToCart(presentation, quantity, unitPrice);
    return success;
  }, [addToCart]);

  const processSale = useCallback(async () => {
    try {
      if (!cart.customer) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Debe seleccionar un cliente antes de procesar la venta',
        });
        return null;
      }

      if (cart.items.length === 0) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'El carrito está vacío',
        });
        return null;
      }

      const sale = await createSale();
      return sale;
    } catch (error) {
      console.error('Error processing sale:', error);
      return null;
    }
  }, [cart, createSale, addNotification]);

  const removeProductFromCart = useCallback((presentationId: UUID) => {
    removeFromCart(presentationId);
    addNotification({
      type: 'info',
      title: 'Producto eliminado',
      message: 'Producto eliminado del carrito',
    });
  }, [removeFromCart, addNotification]);

  const updateProductQuantity = useCallback((presentationId: UUID, quantity: number) => {
    updateCartQuantity(presentationId, quantity);
  }, [updateCartQuantity]);

  const selectCustomer = useCallback((customer: Person) => {
    setCustomer(customer);
    addNotification({
      type: 'success',
      title: 'Cliente seleccionado',
      message: `Cliente: ${customer.first_name} ${customer.last_name}`,
    });
  }, [setCustomer, addNotification]);

  const resetCart = useCallback(() => {
    clearCart();
    addNotification({
      type: 'info',
      title: 'Carrito limpiado',
      message: 'El carrito ha sido vaciado',
    });
  }, [clearCart, addNotification]);

  const loadAllSales = useCallback(async () => {
    await loadSales();
  }, [loadSales]);

  const getSaleDetails = useCallback(async (saleId: UUID) => {
    await loadSaleById(saleId);
  }, [loadSaleById]);

  const getCartItemCount = useCallback(() => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }, [cart.items]);

  const getCartSummary = useCallback(() => {
    return {
      itemCount: getCartItemCount(),
      total: cart.total,
      hasItems: cart.items.length > 0,
      hasCustomer: !!cart.customer,
      canProcess: cart.items.length > 0 && !!cart.customer,
    };
  }, [cart, getCartItemCount]);

  return {
    // State
    cart,
    sales: sales.sales,
    currentSale: sales.currentSale,
    loading: sales.loading,
    
    // Cart actions
    addProductToCart,
    removeProductFromCart,
    updateProductQuantity,
    selectCustomer,
    resetCart,
    
    // Customer actions
    searchCustomers,
    createCustomer,
    
    // Sales actions
    processSale,
    loadAllSales,
    getSaleDetails,
    
    // Utilities
    getCartItemCount,
    getCartSummary,
  };
};