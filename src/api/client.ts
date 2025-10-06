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
  UUID,
  Timestamp,
  APIError,
  Person,
  Supplier
} from '../types';

export class MAPOAPIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = process.env.REACT_APP_API_BASE_URL || 'http://142.93.187.32:8000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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
    const response = await this.request<AuthResponse>('/auth/login', {
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
    return this.request<Category[]>('/inventory/categories');
  }

  async getProductsByCategory(categoryId: UUID): Promise<Product[]> {
    return this.request<Product[]>(`/inventory/categories/${categoryId}/products`);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.request<Product[]>('/inventory/products');
  }

  async getProductById(productId: UUID): Promise<Product> {
    return this.request<Product>(`/inventory/products/${productId}`);
  }

  async getPresentationById(presentationId: UUID): Promise<any> {
    return this.request<any>(`/inventory/presentations/${presentationId}`);
  }

  async getStock(presentationId: UUID): Promise<StockInfo> {
    return this.request<StockInfo>(`/inventory/presentations/${presentationId}/stock`);
  }

  async createLot(lotData: {
    supplier_id: UUID;
    received_date: Timestamp;
    lot_code: string;
    status: string;
  }): Promise<Lot> {
    return this.request<Lot>('/inventory/lots', {
      method: 'POST',
      body: JSON.stringify(lotData),
    });
  }

  async getLots(): Promise<Lot[]> {
    return this.request<Lot[]>('/inventory/lots');
  }

  async getLotById(lotId: UUID): Promise<Lot> {
    return this.request<Lot>(`/inventory/lots/${lotId}`);
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
    return this.request<LotDetail>(`/inventory/lots/${lotId}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async getSuppliers(): Promise<Supplier[]> {
    return this.request<Supplier[]>('/inventory/suppliers');
  }

  async createSupplier(supplierData: {
    person_id: UUID;
    supplier_code: string;
  }): Promise<Supplier> {
    return this.request<Supplier>('/inventory/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  // ======= SALES ENDPOINTS =======
  async createSale(saleData: SaleCreate): Promise<Sale> {
    return this.request<Sale>('/sales/', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  async getSales(skip: number = 0, limit: number = 50): Promise<Sale[]> {
    return this.request<Sale[]>(`/sales/?skip=${skip}&limit=${limit}`);
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

  async getSalesReportByDateRange(startDate: string, endDate: string): Promise<any> {
    return this.request<any>(`/sales/reports/range?start_date=${startDate}&end_date=${endDate}`);
  }

  // ======= CUSTOMERS ENDPOINTS =======
  async getCustomers(): Promise<Person[]> {
    return this.request<Person[]>('/customers');
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

    const response = await this.request<PersonAPIResponse[]>('/api/v1/persons/');
    
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
    return this.request<Person>('/customers', {
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
}

// Singleton instance
export const apiClient = new MAPOAPIClient();