export * from './client';
export { apiClient } from './client';

// Re-export types for convenience
export type {
  AuthResponse,
  User,
  Person,
  Category,
  Product,
  ProductPresentation,
  Sale,
  SaleCreate,
  SaleItemCreate,  // ✅ Cambiado de SaleItem a SaleItemCreate
  SaleDetail,      // ✅ Agregado SaleDetail
  StockInfo,
  CartItem,
  Notification,
  UUID,
  Timestamp
} from '../types';