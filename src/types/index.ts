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

// ======= TIPOS DE GESTIÓN DE ROLES Y USUARIOS =======
export type RoleName = 'USER' | 'ADMIN' | 'SUPERADMIN';

export interface UserWithRoles {
  user_id: UUID;
  email: string;
  name: string;
  last_name: string;
  document_type?: string;
  document_number?: string;
  roles: RoleName[];
}

export interface UsersListResponse {
  users: UserWithRoles[];
  total: number;
}

export interface AssignRoleRequest {
  user_id: UUID;
  role: RoleName;
}

export interface RemoveRoleRequest {
  user_id: UUID;
  role: RoleName;
}

export interface UpdateRolesRequest {
  roles: RoleName[];
}

export interface RoleManagementResponse {
  message: string;
  user: UserWithRoles;
}

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
  total?: number; // Total original de la venta
  total_refunded?: number; // Total reembolsado por devoluciones
  total_net?: number; // Total neto (total - total_refunded)
  has_returns?: boolean; // Indica si la venta tiene devoluciones
  status: string;
  notes?: string;
  sale_details?: SaleDetail[]; // Algunos endpoints devuelven sale_details
  items?: SaleDetail[]; // Otros endpoints devuelven items
  customer?: Person;
}

export interface SaleDetail {
  id: UUID;
  product_id?: UUID;
  product_name?: string; // Opcional, puede no venir en items
  presentation_id?: UUID;
  presentation_name?: string; // Nombre de la presentación
  quantity: number; // Cantidad original vendida
  quantity_returned?: number; // Cantidad ya devuelta
  quantity_net?: number; // Cantidad neta (quantity - quantity_returned)
  unit_price: number;
  line_total?: number; // Total de la línea
  is_bulk_sale?: boolean; // Indicador si es venta a granel
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

// ======= TIPOS DE REPORTES PERIÓDICOS =======
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface PeriodSalesReportRequest {
  period: ReportPeriod;
  reference_date: string; // Formato: YYYY-MM-DD
  top_limit?: number; // Default: 10
}

export interface TopProductInReport {
  presentation_id: UUID;
  product_name: string;
  presentation_name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface TopCustomerInReport {
  customer_id: UUID;
  customer_name: string;
  customer_document?: string;
  total_purchases: number;
  total_spent: number;
}

export interface PeriodSalesReportResponse {
  period: ReportPeriod;
  start_date: Timestamp;
  end_date: Timestamp;
  // Campos planos (no anidados en metrics)
  total_sales: number;
  total_revenue: number;
  estimated_profit: number;
  profit_margin: number; // Porcentaje
  average_sale_value: number;
  total_items_sold: number;
  top_products: TopProductInReport[];
  top_customers: TopCustomerInReport[];
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
    periodReport: PeriodSalesReportResponse | null;
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
 * Interface para actualizar un producto existente
 * Todos los campos son opcionales - solo se actualizan los campos proporcionados
 */
export interface ProductUpdate {
  name?: string;
  description?: string;
  brand?: string | null;
  base_unit?: string;
  category_id?: UUID | null;
  image_url?: string | null;
}

/**
 * Interface para actualizar una presentación existente
 * Todos los campos son opcionales - solo se actualizan los campos proporcionados
 */
export interface ProductPresentationUpdate {
  presentation_name?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  sku?: string | null;
  active?: boolean;
}

/**
 * Interface para la respuesta al actualizar producto
 */
export interface ProductUpdateResponse {
  message: string;
  product: Product;
}

/**
 * Interface para la respuesta al crear/actualizar presentación
 */
export interface PresentationResponse {
  message: string;
  presentation: ProductPresentation;
}

/**
 * Interface para errores de validación
 */
export interface ValidationError {
  field: string;
  message: string;
}

// ======= SISTEMA DE LOTES E INVENTARIO =======

/**
 * Estados de un lote de inventario
 */
export enum InventoryLotStatus {
  RECEIVED = "received",
  PENDING = "pending",
  COMPLETED = "completed"
}

export const InventoryLotStatusLabels: Record<InventoryLotStatus, string> = {
  [InventoryLotStatus.RECEIVED]: "Recibido",
  [InventoryLotStatus.PENDING]: "Pendiente",
  [InventoryLotStatus.COMPLETED]: "Completado"
};

/**
 * Interface para Proveedor (Supplier)
 */
export interface Supplier {
  id: UUID;
  name: string;
  address?: string | null;
  phone_number?: string | null;
  email?: string | null;
  contact_person?: string | null;
}

/**
 * Interface para crear un proveedor
 */
export interface SupplierCreate {
  name: string;
  address?: string | null;
  phone_number?: string | null;
  email?: string | null;
  contact_person?: string | null;
}

/**
 * Interface para actualizar un proveedor
 */
export interface SupplierUpdate {
  name?: string;
  address?: string | null;
  phone_number?: string | null;
  email?: string | null;
  contact_person?: string | null;
}

/**
 * Interface para Lote de Inventario (InventoryLot)
 */
export interface InventoryLot {
  id: UUID;
  lot_code: string;
  supplier_id: UUID;
  received_date: Timestamp;
  expiry_date?: Timestamp | null;
  status: InventoryLotStatus;
  total_cost: number;
  notes?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Interface para crear un lote de inventario
 */
export interface InventoryLotCreate {
  lot_code: string;
  supplier_id: UUID;
  received_date: Timestamp;
  expiry_date?: Timestamp | null;
  status: InventoryLotStatus;
  total_cost: number;
  notes?: string | null;
}

/**
 * Interface para Detalle de Lote de Inventario (InventoryLotDetail)
 */
export interface InventoryLotDetail {
  id: UUID;
  lot_id: UUID;
  presentation_id: UUID;
  quantity_received: number;
  quantity_available: number;
  unit_cost: number;
  batch_number?: string | null;
}

/**
 * Interface para crear un detalle de lote de inventario
 */
export interface InventoryLotDetailCreate {
  presentation_id: UUID;
  quantity_received: number;
  unit_cost: number;
  batch_number?: string | null;
}

/**
 * Interface extendida para InventoryLotDetail con información del producto (para visualización)
 */
export interface InventoryLotDetailWithProduct extends InventoryLotDetail {
  lot_code?: string;
  received_date?: Timestamp;
  expiry_date?: Timestamp | null;
  lot_status?: InventoryLotStatus;
  product_id?: UUID;
  product_name?: string;
  presentation_name?: string;
  presentation_unit?: string;
}

/**
 * Respuesta de la API para lotes disponibles por presentación (FIFO)
 */
export interface InventoryLotDetailsResponse {
  success: boolean;
  data: InventoryLotDetailWithProduct[];
  count: number;
  metadata: {
    presentation_id: UUID;
    total_available_quantity: number;
    oldest_lot_date?: Timestamp;
    newest_lot_date?: Timestamp;
  };
}

/**
 * Interface para consulta de stock de inventario
 */
export interface InventoryStockInfo {
  presentation_id: UUID;
  available_stock: number;
  checked_at: Timestamp;
}

/**
 * Interface para reporte de stock de inventario
 */
export interface InventoryStockReportItem {
  presentation_id: UUID;
  presentation_name: string;
  stock_available: number;
  last_updated: Timestamp;
}

export interface InventoryStockReport {
  report: InventoryStockReportItem[];
  generated_at: Timestamp;
  generated_by?: string;
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