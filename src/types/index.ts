// Tipos base del sistema
export type UUID = string;
export type Timestamp = string; // ISO 8601 format

// ======= TIPOS DE AUTENTICACIÓN =======
export interface AuthResponse {
  access_token: string;
  token_type: "Bearer";
  user: User;
}

export interface User {
  id: UUID;
  uid: string;
  email: string;
  person: Person;
  roles?: Role[];
}

export interface Person {
  id: UUID;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  document_type?: string;
  document_number?: string;
}

// Response interface for the persons API endpoint
export interface PersonAPIResponse {
  id: UUID;
  name: string;
  last_name: string;
  document_type?: string;
  document_number?: string;
  full_name?: string;
}

// Interfaz extendida que combina ambos formatos para compatibilidad
export interface PersonComplete extends Person {
  name?: string;
  full_name?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

// ======= TIPOS DE CLIENTES =======
export interface Customer {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  document_type?: string;
  document_number?: string;
  address?: string;
  city?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ======= TIPOS DE INVENTARIO =======
export interface Category {
  id: UUID;
  name: string;
  description?: string;
}

export interface Product {
  id: UUID;
  name: string;
  description?: string;
  brand?: string;
  base_unit?: string;
  category_id: UUID;
  image_url?: string;
  category?: Category;
  presentations: ProductPresentation[];
}

export interface ProductPresentation {
  id: UUID;
  presentation_name: string;
  quantity: number;
  unit: string;
  sku?: string;
  price: number;
  stock_available: number;        // Bolsas/unidades completas disponibles
  bulk_stock_available: number;   // Stock disponible a granel
  total_stock: number;           // Stock total
  active: boolean;
  product?: Product;
}

export interface Supplier {
  id: UUID;
  person_id: UUID;
  supplier_code: string;
  person: Person;
}

export interface Lot {
  id: UUID;
  supplier_id: UUID;
  received_date: Timestamp;
  lot_code: string;
  status: "active" | "inactive" | "expired";
  supplier?: Supplier;
  details?: LotDetail[];
}

export interface LotDetail {
  id: UUID;
  lot_id: UUID;
  presentation_id: UUID;
  quantity_received: number;
  quantity_available: number;
  unit_cost: number;
  expiration_date?: Timestamp;
  production_date?: Timestamp;
  presentation?: ProductPresentation;
}

export interface StockInfo {
  presentation_id: UUID;
  available_stock: number;
  total_lots: number;
  next_expiration?: Timestamp;
}

// ======= TIPOS DE VENTAS =======
// Estructura para CREAR una venta (request al backend)
export interface SaleItemCreate {
  presentation_id: UUID;  // ✅ presentation_id (según backend real)
  quantity: number;
  unit_price: number;
}

export interface SaleCreate {
  customer_id: UUID;
  status: "completed" | "pending" | "cancelled";  // ✅ Campo requerido
  items: SaleItemCreate[];  // ✅ items (NO sale_items)
}

// Estructura de RESPUESTA del backend
export interface Sale {
  id: UUID;
  sale_code?: string; // Código de venta (ej: VEN-20251012143000)
  customer_id: UUID;
  user_id?: UUID; // Usuario que realizó la venta
  sale_date: Timestamp;
  total_amount?: number; // Para ventas individuales
  total?: number; // Para historial de ventas
  status: string;
  notes?: string;
  sale_details?: SaleDetail[]; // Algunos endpoints devuelven sale_details
  items?: SaleDetail[]; // Otros endpoints devuelven items
  customer?: Person;
}

export interface SaleDetail {
  id: UUID;
  product_id: UUID;
  product_name?: string; // Opcional, puede no venir en items
  quantity: number;
  unit_price: number;
  is_bulk_sale: boolean; // Indicador si es venta a granel
  subtotal?: number; // Calculado en frontend
  lot_detail_id?: UUID | null;
  bulk_conversion_id?: UUID | null;
}

// ======= TIPOS EXTENDIDOS PARA DETALLES DE VENTA =======
export interface SaleDetailExtended {
  id: UUID;
  sale_id: UUID;
  presentation_id: UUID;
  lot_detail_id: UUID | null;
  bulk_conversion_id: UUID | null;
  quantity: number;
  unit_price: number;
  line_total: number; // quantity × unit_price
  product_name: string; // Nombre del producto
  presentation_name: string; // Nombre de la presentación
  cost_price: number; // Precio de costo del producto
}

export interface SaleDetailFullResponse {
  id: UUID;
  sale_code: string;
  sale_date: Timestamp;
  customer_id: UUID;
  user_id: UUID;
  total: number;
  status: string;
  customer_name: string; // Nombre completo del cliente
  customer_document: string; // Tipo y número de documento
  seller_name: string; // Nombre completo del vendedor
  items: SaleDetailExtended[]; // Items con información extendida
}

export interface SalesReportFilter {
  start_date?: Timestamp;
  end_date?: Timestamp;
  customer_id?: UUID;
  user_id?: UUID;
}

export interface ProductSalesStats {
  presentation_id: UUID;
  presentation_name: string;
  total_sold: number;
  total_revenue: number;
}

export interface BestSellingProductsReport {
  best_selling_products: ProductSalesStats[];
  generated_at: Timestamp;
}

export interface DailySalesSummary {
  date: Timestamp;
  total_sales: number;
  total_revenue: number;
  total_items_sold: number;
  average_sale_value: number;
}

// ======= TIPOS DE ESTADO DE LA APLICACIÓN =======
export interface AppState {
  auth: AuthState;
  cart: CartState;
  inventory: InventoryState;
  sales: SalesState;
  ui: UIState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface CartState {
  items: CartItem[];
  customer: Person | null;
  total: number;
}

export interface CartItem {
  presentation: ProductPresentation;
  quantity: number;
  unit_price: number;
  line_total: number;
  max_available?: number;
}

export interface InventoryState {
  categories: Category[];
  products: Product[];
  currentCategory: UUID | null;
  loading: boolean;
}

export interface SalesState {
  sales: Sale[];
  currentSale: Sale | null;
  filters: SalesFilters;
  hasMore: boolean;
  reports: {
    bestSelling: ProductSalesStats[];
    dailySummary: DailySalesSummary[];
  };
  loading: boolean;
}

export interface UIState {
  notifications: Notification[];
  modals: {
    customerSelector: boolean;
    productDetails: boolean;
  };
  loading: {
    [key: string]: boolean;
  };
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Timestamp;
}

// ======= TIPOS DE FORMULARIOS =======
export interface LoginForm {
  email: string;
  password: string;
}

export interface ProductFilter {
  category?: UUID;
  search?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ReportFilter {
  startDate?: Timestamp;
  endDate?: Timestamp;
  type: 'sales' | 'inventory' | 'best-selling';
}

// ======= TIPOS DE HISTORIAL DE VENTAS =======
export interface SalesFilters {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}

// ======= TIPOS DE CONVERSIÓN A GRANEL =======
export interface BulkConversionCreate {
  source_lot_detail_id: UUID;      // ID del lote empaquetado origen
  target_presentation_id: UUID;    // ID de la presentación a granel destino
  converted_quantity: number;      // Cantidad de bultos/paquetes a abrir (entero)
  unit_conversion_factor: number;  // Cantidad que contiene cada bulto (entero)
}

export interface BulkConversionResponse {
  message: string;
  bulk_conversion_id: UUID;        // UUID de la conversión creada
  converted_quantity: number;      // Cantidad total convertida
  remaining_bulk: number;          // Cantidad disponible a granel
  status: string;                  // Estado: "ACTIVE", "COMPLETED", "CANCELLED"
}

export interface BulkStockItem {
  bulk_conversion_id: UUID;
  remaining_bulk: number;
  converted_quantity: number;
  target_presentation_id: UUID;
  conversion_date: Timestamp;
  status: string;                  // "ACTIVE", "COMPLETED", "CANCELLED"
}

// ======= TIPOS DE RESPUESTA API =======
export interface APIResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface APIError {
  detail: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ======= TIPOS DE CREACIÓN DE PRODUCTOS =======
/**
 * Unidades de medida permitidas
 */
export enum MeasurementUnit {
  KILOGRAM = "kg",
  GRAM = "g",
  LITER = "L",
  MILLILITER = "ml",
  UNIT = "unidad"
}

/**
 * Etiquetas legibles para las unidades
 */
export const UnitLabels: Record<MeasurementUnit, string> = {
  [MeasurementUnit.KILOGRAM]: "Kilogramos",
  [MeasurementUnit.GRAM]: "Gramos",
  [MeasurementUnit.LITER]: "Litros",
  [MeasurementUnit.MILLILITER]: "Mililitros",
  [MeasurementUnit.UNIT]: "Unidades"
};

/**
 * Interface para crear una presentación de producto
 */
export interface ProductPresentationCreate {
  presentation_name: string;   // Nombre descriptivo (ej: "Bolsa 1kg")
  quantity: number;             // Cantidad numérica (ej: 1, 25, 500)
  unit: string;                 // Unidad de medida ("kg", "g", "L", "ml", "unidad")
  price: number;                // Precio de venta
  sku?: string | null;          // Código SKU opcional
  active?: boolean;             // Si está activa (default: true)
}

/**
 * Interface para crear un producto completo con presentaciones
 */
export interface ProductCreate {
  name: string;                          // Nombre del producto
  description: string;                   // Descripción detallada
  brand?: string | null;                 // Marca (opcional)
  base_unit?: string;                    // Unidad base (default: "kg")
  category_id?: UUID | null;             // UUID de categoría
  image_url?: string | null;             // URL de imagen
  presentations: ProductPresentationCreate[];  // Array de presentaciones
}

/**
 * Interface para la respuesta del servidor al crear producto
 */
export interface ProductCreateResponse {
  message: string;
  product: {
    id: UUID;
    name: string;
    description: string;
    brand?: string | null;
    base_unit: string;
    category_id?: UUID | null;
    image_url?: string | null;
  };
}

/**
 * Interface para errores de validación
 */
export interface ValidationError {
  field: string;
  message: string;
}

// ======= TIPOS DE CONFIGURACIÓN =======
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production' | 'test';
  features: {
    enableReports: boolean;
    enableInventoryManagement: boolean;
    enableMultipleWarehouses: boolean;
  };
}

export interface APIClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}