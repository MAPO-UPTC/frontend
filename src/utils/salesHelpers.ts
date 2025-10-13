import { Sale, SaleDetail } from '../types';

/**
 * Obtiene los items de una venta, independientemente de si vienen en 'items' o 'sale_details'
 */
export const getSaleItems = (sale: Sale): SaleDetail[] => {
  return sale.items || sale.sale_details || [];
};

/**
 * Calcula el subtotal de un item de venta
 */
export const calculateItemSubtotal = (item: SaleDetail): number => {
  return item.subtotal || (item.quantity * item.unit_price);
};

/**
 * Calcula el total de una venta sumando todos sus items
 */
export const calculateSaleTotal = (sale: Sale): number => {
  // Si ya viene el total del backend, usarlo
  if (sale.total !== undefined) return sale.total;
  if (sale.total_amount !== undefined) return sale.total_amount;
  
  // Si no, calcularlo sumando los items
  const items = getSaleItems(sale);
  return items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
};

/**
 * Verifica si un item es una venta a granel
 */
export const isBulkSaleItem = (item: SaleDetail): boolean => {
  return item.is_bulk_sale === true;
};

/**
 * Cuenta la cantidad de items en una venta
 */
export const getSaleItemsCount = (sale: Sale): number => {
  return getSaleItems(sale).length;
};

/**
 * Obtiene el nombre del producto de un item, con fallback
 */
export const getItemProductName = (item: SaleDetail, fallback: string = 'Producto sin nombre'): string => {
  return item.product_name || fallback;
};

/**
 * Formatea un item de venta para mostrar en UI
 */
export interface FormattedSaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isBulk: boolean;
}

export const formatSaleItem = (item: SaleDetail): FormattedSaleItem => {
  return {
    id: item.id,
    productId: item.product_id,
    productName: getItemProductName(item),
    quantity: item.quantity,
    unitPrice: item.unit_price,
    subtotal: calculateItemSubtotal(item),
    isBulk: isBulkSaleItem(item)
  };
};

/**
 * Formatea todos los items de una venta
 */
export const formatSaleItems = (sale: Sale): FormattedSaleItem[] => {
  return getSaleItems(sale).map(formatSaleItem);
};
