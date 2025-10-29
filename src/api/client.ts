import {
  AuthResponse,
  Category,
  Product,
  StockInfo,
  Lot,
  LotDetail,
  SaleCreate,
  Sale,
  SalesReportFilter,
  BestSellingProductsReport,
  DailySalesSummary,
  PeriodSalesReportRequest,
  PeriodSalesReportResponse,
  UUID,
  Timestamp,
  APIError,
  Person,
  Supplier,
  SalesFilters,
  SaleDetailFullResponse,
  BulkConversionCreate,
  BulkConversionResponse,
  BulkStockItem,
  ProductCreate,
  ProductCreateResponse,
  ProductUpdate,
  ProductUpdateResponse,
  ProductPresentationCreate,
  ProductPresentationUpdate,
  PresentationResponse,
  SupplierCreate,
  SupplierUpdate,
  InventoryLot,
  InventoryLotCreate,
  InventoryLotDetail,
  InventoryLotDetailCreate,
  InventoryLotDetailWithProduct,
  InventoryLotDetailsResponse,
  InventoryStockInfo,
  InventoryStockReport,
  UserWithRoles,
  UsersListResponse,
  RoleName,
  RoleManagementResponse
} from '../types';

// Configuración inteligente de URL base para el cliente TypeScript
const getApiBaseUrl = (): string => {
  // En desarrollo local: usar variable de entorno o backend directo
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_BASE_URL || 'https://142.93.187.32.nip.io';
  }
  
  // En producción (Netlify): SIEMPRE usar proxy relativo /api/
  // Ignoramos REACT_APP_API_BASE_URL en producción
  return '/api';
};

export class MAPOAPIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = getApiBaseUrl()) {
    this.baseURL = baseURL;
    console.log('🔗 MAPOAPIClient initialized with baseURL:', this.baseURL);
    // No inicializamos el token aquí, se obtiene dinámicamente en getHeaders()
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Siempre obtener el token actualizado del localStorage
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.handleAuthError();
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: APIError = {
          detail: errorData.detail || `HTTP ${response.status}`,
          status: response.status
        };
        
        // Log detallado para errores de validación (422)
        if (response.status === 422) {
          console.error('🚨 Validation Error (422):', JSON.stringify(errorData, null, 2));
        }
        
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  private handleAuthError(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Emit custom event for auth logout
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  // ======= AUTH ENDPOINTS =======
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = response.access_token;
    localStorage.setItem('token', this.token);
    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ======= INVENTORY ENDPOINTS =======
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories/');
  }

  async getProductsByCategory(categoryId: UUID): Promise<Product[]> {
    return this.request<Product[]>(`/categories/${categoryId}/products`);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products/');
  }

  async getProductById(productId: UUID, includeInactive: boolean = false): Promise<Product> {
    const params = includeInactive ? '?include_inactive=true' : '';
    return this.request<Product>(`/products/${productId}${params}`);
  }

  /**
   * Crear un nuevo producto con sus presentaciones
   * @param productData - Datos del producto y sus presentaciones
   * @returns Respuesta del servidor con el producto creado
   */
  async createProduct(productData: ProductCreate): Promise<ProductCreateResponse> {
    return this.request<ProductCreateResponse>('/products/', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  /**
   * Actualizar un producto existente
   * @param productId - UUID del producto a actualizar
   * @param productData - Datos parciales a actualizar
   * @returns Respuesta del servidor con el producto actualizado
   */
  async updateProduct(productId: UUID, productData: ProductUpdate): Promise<ProductUpdateResponse> {
    return this.request<ProductUpdateResponse>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  /**
   * Agregar una nueva presentación a un producto existente
   * @param productId - UUID del producto
   * @param presentationData - Datos de la nueva presentación
   * @returns Respuesta del servidor con la presentación creada
   */
  async createPresentation(
    productId: UUID, 
    presentationData: ProductPresentationCreate
  ): Promise<PresentationResponse> {
    return this.request<PresentationResponse>(`/products/${productId}/presentations`, {
      method: 'POST',
      body: JSON.stringify(presentationData),
    });
  }

  /**
   * Actualizar una presentación existente
   * @param productId - UUID del producto
   * @param presentationId - UUID de la presentación
   * @param presentationData - Datos parciales a actualizar
   * @returns Respuesta del servidor con la presentación actualizada
   */
  async updatePresentation(
    productId: UUID,
    presentationId: UUID,
    presentationData: ProductPresentationUpdate
  ): Promise<PresentationResponse> {
    return this.request<PresentationResponse>(
      `/products/${productId}/presentations/${presentationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(presentationData),
      }
    );
  }

  async getPresentationById(presentationId: UUID): Promise<any> {
    return this.request<any>(`/presentations/${presentationId}`);
  }

  async getStock(presentationId: UUID): Promise<StockInfo> {
    return this.request<StockInfo>(`/presentations/${presentationId}/stock`);
  }

  async createLot(lotData: {
    supplier_id: UUID;
    received_date: Timestamp;
    lot_code: string;
    status: string;
  }): Promise<Lot> {
    return this.request<Lot>('/lots/', {
      method: 'POST',
      body: JSON.stringify(lotData),
    });
  }

  async getLots(): Promise<Lot[]> {
    return this.request<Lot[]>('/lots/');
  }

  async getLotById(lotId: UUID): Promise<Lot> {
    return this.request<Lot>(`/lots/${lotId}`);
  }

  async addProductsToLot(
    lotId: UUID,
    productData: {
      presentation_id: UUID;
      quantity_received: number;
      unit_cost: number;
      expiration_date?: Timestamp;
      production_date?: Timestamp;
    }
  ): Promise<LotDetail> {
    return this.request<LotDetail>(`/lots/${lotId}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // ======= SALES ENDPOINTS =======
  async createSale(saleData: SaleCreate): Promise<Sale> {
    return this.request<Sale>('/sales/', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  async getSaleById(saleId: UUID): Promise<Sale> {
    return this.request<Sale>(`/sales/${saleId}`);
  }

  async getSaleByCode(saleCode: string): Promise<Sale> {
    return this.request<Sale>(`/sales/code/${saleCode}`);
  }

  async updateSaleStatus(saleId: UUID, status: 'completed' | 'pending' | 'cancelled'): Promise<Sale> {
    return this.request<Sale>(`/sales/${saleId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // ======= SALES HISTORY ENDPOINT =======
  async getSales(filters: SalesFilters = {}): Promise<Sale[]> {
    const params = new URLSearchParams();
    
    if (filters.skip !== undefined) {
      params.append('skip', filters.skip.toString());
    }
    if (filters.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters.end_date) {
      params.append('end_date', filters.end_date);
    }

    const queryString = params.toString();
    const endpoint = `/sales/${queryString ? '?' + queryString : ''}`;
    
    return this.request<Sale[]>(endpoint);
  }

  // ======= SALE DETAILS ENDPOINT =======
  async getSaleDetails(saleId: UUID): Promise<SaleDetailFullResponse> {
    return this.request<SaleDetailFullResponse>(`/sales/${saleId}/details`);
  }

  // ======= REPORTS ENDPOINTS =======
  async getBestSellingProducts(limit: number = 10): Promise<BestSellingProductsReport> {
    return this.request<BestSellingProductsReport>(`/sales/reports/best-products?limit=${limit}`);
  }

  async getSalesReport(filters: SalesReportFilter): Promise<any> {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    if (filters.user_id) params.append('user_id', filters.user_id);

    return this.request<any>(`/sales/reports/summary?${params.toString()}`);
  }

  async getDailySummary(date: Timestamp): Promise<DailySalesSummary> {
    return this.request<DailySalesSummary>(`/sales/reports/daily/${date}`);
  }

  /**
   * Obtener reporte de ventas por periodo (diario, semanal, mensual)
   * @param request - Parámetros del reporte
   * @returns Reporte completo con métricas y tops
   */
  async getPeriodSalesReport(request: import('../types').PeriodSalesReportRequest): Promise<import('../types').PeriodSalesReportResponse> {
    return this.request<import('../types').PeriodSalesReportResponse>('/reports/sales', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getSalesReportByDateRange(startDate: string, endDate: string): Promise<any> {
    return this.request<any>(`/sales/reports/range?start_date=${startDate}&end_date=${endDate}`);
  }

  // ======= CUSTOMERS ENDPOINTS =======
  async getCustomers(): Promise<Person[]> {
    return this.request<Person[]>('/customers/');
  }

  // New endpoint for persons
  async getPersons(): Promise<Person[]> {
    interface PersonAPIResponse {
      id: string;
      name: string;
      last_name: string;
      document_type?: string;
      document_number?: string;
    }

    const response = await this.request<PersonAPIResponse[]>('/persons/');
    
    // Transform API response to Person interface format
    return response.map(apiPerson => ({
      id: apiPerson.id,
      first_name: apiPerson.name,
      last_name: apiPerson.last_name,
      document_type: apiPerson.document_type,
      document_number: apiPerson.document_number,
      phone: undefined, // Not provided by API
      email: undefined, // Not provided by API
    }));
  }

  async getCustomerById(customerId: UUID): Promise<Person> {
    return this.request<Person>(`/customers/${customerId}`);
  }

  async createCustomer(customerData: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    document_type?: string;
    document_number?: string;
  }): Promise<Person> {
    return this.request<Person>('/customers/', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(customerId: UUID, customerData: Partial<Person>): Promise<Person> {
    return this.request<Person>(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  // ======= SEARCH ENDPOINTS =======
  async searchProducts(query: string): Promise<Product[]> {
    const params = new URLSearchParams({ q: query });
    return this.request<Product[]>(`/inventory/products/search?${params.toString()}`);
  }

  async searchCustomers(query: string): Promise<Person[]> {
    const params = new URLSearchParams({ q: query });
    return this.request<Person[]>(`/customers/search?${params.toString()}`);
  }

  // ======= UTILITY METHODS =======
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearAuth(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ======= BULK CONVERSION ENDPOINTS =======
  /**
   * Abre un bulto/paquete y lo convierte a granel
   */
  async openBulkConversion(data: BulkConversionCreate): Promise<BulkConversionResponse> {
    return this.request<BulkConversionResponse>('/products/open-bulk/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Obtiene stock a granel activo
   */
  async getActiveBulkStock(): Promise<BulkStockItem[]> {
    return this.request<BulkStockItem[]>('/products/bulk-stock/');
  }

  /**
   * Obtiene los detalles de lotes disponibles para una presentación específica
   * Necesario para obtener el lot_detail_id requerido para la conversión a granel
   * 
   * El backend retorna los lotes ordenados por FIFO (First In, First Out)
   * El primer elemento del array es siempre el lote más antiguo disponible
   */
  async getAvailableLotDetails(presentationId: UUID): Promise<LotDetail[]> {
    const response = await this.request<{
      success: boolean;
      data: LotDetail[];
      count: number;
      metadata: {
        presentation_id: string;
        total_available_quantity: number;
        oldest_lot_date: string;
        newest_lot_date: string;
      };
    }>(`/inventory/presentations/${presentationId}/lot-details`);
    
    // Extraer solo el array de lotes del objeto de respuesta
    return response.data;
  }

  // ======= MÉTODOS DE GESTIÓN DE INVENTARIO (LOTES) =======

  /**
   * Gestión de Proveedores (Suppliers)
   * Requiere: ADMIN o SUPERADMIN para crear/actualizar/eliminar
   */
  
  // Listar proveedores
  async getSuppliers(): Promise<Supplier[]> {
    return this.request<Supplier[]>('/suppliers/');
  }

  // Obtener proveedor por ID
  async getSupplierById(supplierId: UUID): Promise<Supplier> {
    return this.request<Supplier>(`/suppliers/${supplierId}`);
  }

  // Crear proveedor
  async createSupplier(supplierData: SupplierCreate): Promise<Supplier> {
    return this.request<Supplier>('/suppliers/', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  // Actualizar proveedor
  async updateSupplier(supplierId: UUID, data: SupplierUpdate): Promise<Supplier> {
    return this.request<Supplier>(`/suppliers/${supplierId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Eliminar proveedor
  async deleteSupplier(supplierId: UUID): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/suppliers/${supplierId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Gestión de Lotes (Inventory Lots)
   */
  
  // Crear lote
  async createInventoryLot(lotData: InventoryLotCreate): Promise<InventoryLot> {
    return this.request<InventoryLot>('/inventory/lots/', {
      method: 'POST',
      body: JSON.stringify(lotData),
    });
  }

  // Listar lotes
  async getInventoryLots(skip: number = 0, limit: number = 100): Promise<InventoryLot[]> {
    return this.request<InventoryLot[]>(`/inventory/lots/?skip=${skip}&limit=${limit}`);
  }

  // Obtener lote por ID
  async getInventoryLotById(lotId: UUID): Promise<InventoryLot> {
    return this.request<InventoryLot>(`/inventory/lots/${lotId}`);
  }

  // Obtener detalles de un lote
  async getInventoryLotDetails(lotId: UUID): Promise<InventoryLotDetail[]> {
    return this.request<InventoryLotDetail[]>(`/inventory/lots/${lotId}/details/`);
  }

  /**
   * Gestión de Detalles de Lote (Lot Details)
   */
  
  // Agregar producto a un lote
  async addProductToInventoryLot(
    lotId: UUID,
    detailData: InventoryLotDetailCreate
  ): Promise<InventoryLotDetail> {
    return this.request<InventoryLotDetail>(`/inventory/lots/${lotId}/details/`, {
      method: 'POST',
      body: JSON.stringify(detailData),
    });
  }

  /**
   * Consultas de Stock
   */
  
  // Consultar stock por presentación
  async getInventoryStock(presentationId: UUID): Promise<InventoryStockInfo> {
    return this.request<InventoryStockInfo>(`/inventory/stock/${presentationId}`);
  }

  // Obtener lotes disponibles por presentación (FIFO)
  async getInventoryLotDetailsByPresentation(
    presentationId: UUID,
    availableOnly: boolean = true
  ): Promise<InventoryLotDetailsResponse> {
    const params = new URLSearchParams({
      available_only: availableOnly.toString()
    });
    return this.request<InventoryLotDetailsResponse>(
      `/inventory/presentations/${presentationId}/lot-details?${params.toString()}`
    );
  }

  // Reporte general de stock
  async getInventoryStockReport(): Promise<InventoryStockReport> {
    return this.request<InventoryStockReport>('/inventory/reports/stock');
  }

  // Test connection
  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (response.ok) {
        return { status: 'success', message: 'Connection successful' };
      }
      return { status: 'error', message: 'Server responded with error' };
    } catch (error) {
      return { status: 'error', message: 'Failed to connect to server' };
    }
  }

  // ======= ROLE MANAGEMENT ENDPOINTS =======
  /**
   * Obtener todos los usuarios registrados en el sistema
   * Requiere: Rol SUPERADMIN
   */
  async getAllUsers(): Promise<UsersListResponse> {
    return this.request<UsersListResponse>('/role-management/users');
  }

  /**
   * Asignar un rol a un usuario
   * Requiere: Rol SUPERADMIN
   */
  async assignRoleToUser(
    userId: UUID,
    role: import('../types').RoleName
  ): Promise<import('../types').RoleManagementResponse> {
    return this.request<import('../types').RoleManagementResponse>(
      `/role-management/users/${userId}/roles`,
      {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, role }),
      }
    );
  }

  /**
   * Actualizar todos los roles de un usuario (reemplaza roles existentes)
   * Requiere: Rol SUPERADMIN
   */
  async updateUserRoles(
    userId: UUID,
    roles: import('../types').RoleName[]
  ): Promise<import('../types').RoleManagementResponse> {
    return this.request<import('../types').RoleManagementResponse>(
      `/role-management/users/${userId}/roles`,
      {
        method: 'PUT',
        body: JSON.stringify(roles),
      }
    );
  }

  /**
   * Remover un rol de un usuario
   * Requiere: Rol SUPERADMIN
   */
  async removeRoleFromUser(
    userId: UUID,
    role: import('../types').RoleName
  ): Promise<import('../types').RoleManagementResponse> {
    return this.request<import('../types').RoleManagementResponse>(
      '/role-management/remove-role',
      {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, role }),
      }
    );
  }
}

// Singleton instance
export const apiClient = new MAPOAPIClient();