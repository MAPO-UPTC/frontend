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
  SaleItem,
  StockInfo,
  CartItem,
  Notification,
  UUID,
  Timestamp
} from '../types';