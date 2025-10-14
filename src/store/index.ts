import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient } from '../api/client';
import { personService } from '../api/personService';
import {
  AppState,
  Person,
  PersonAPIResponse,
  Customer,
  ProductPresentation,
  Sale,
  CartItem,
  Notification,
  StockInfo,
  UUID,
  Timestamp
} from '../types';

interface MAPOStore extends AppState {
  // ======= AUTH ACTIONS =======
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
  
  // ======= CART ACTIONS =======
  addToCart: (presentation: ProductPresentation, quantity: number, unitPrice: number) => Promise<boolean>;
  removeFromCart: (presentationId: UUID) => void;
  updateCartQuantity: (presentationId: UUID, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customer: Person) => void;
  
  // ======= CUSTOMER ACTIONS =======
  loadPersons: () => Promise<PersonAPIResponse[]>;
  searchCustomers: (query: string) => Promise<PersonAPIResponse[]>;
  createCustomer: (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<Customer>;
  
  // ======= SALES ACTIONS =======
  createSale: () => Promise<Sale | null>;
  loadSales: () => Promise<void>;
  loadSaleById: (saleId: UUID) => Promise<void>;
  
  // ======= SALES HISTORY ACTIONS =======
  loadSalesHistory: (filters?: import('../types').SalesFilters) => Promise<void>;
  loadMoreSales: () => Promise<void>;
  filterSalesByDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  filterSalesByLastDays: (days: number) => Promise<void>;
  clearSalesFilters: () => Promise<void>;
  setSalesFilters: (filters: import('../types').SalesFilters) => void;
  
  // ======= INVENTORY ACTIONS =======
  loadCategories: () => Promise<void>;
  loadProductsByCategory: (categoryId: UUID) => Promise<void>;
  loadAllProducts: () => Promise<void>;
  checkStock: (presentationId: UUID) => Promise<StockInfo | null>;
  searchProducts: (query: string) => Promise<void>;
  
  // ======= REPORTS ACTIONS =======
  loadBestSellingProducts: (limit?: number) => Promise<void>;
  loadDailySummary: (date: Timestamp) => Promise<void>;
  
  // ======= UI ACTIONS =======
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (key: string, loading: boolean) => void;
  toggleModal: (modal: string) => void;
}

// Estado inicial
const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
  },
  cart: {
    items: [],
    customer: null,
    total: 0,
  },
  inventory: {
    categories: [],
    products: [
      // Chunky Adulto con presentaciones regulares y a granel
      {
        id: 'e63da26f-88df-4e6b-a2c8-f08dbc402e90',
        name: 'Chunky Adulto',
        description: 'Concentrado para perros adultos',
        brand: 'Chunky',
        base_unit: 'kg',
        image_url: 'https://example.com/chunky-adulto.jpg',
        category_id: '644bdf37-f8ae-4545-b440-c55ef0eecc1b',
        presentations: [
          {
            id: 'a83e3b1a-1038-4ec6-aea9-309592e1e41c',
            presentation_name: 'Bulto 25kg',
            quantity: 25,
            unit: 'kg',
            price: 95000,
            sku: 'CHUNKY-25KG',
            stock_available: 45,
            bulk_stock_available: 22,
            total_stock: 67,
            active: true,
          },
          {
            id: '524dae29-003d-40bc-9fc9-2a7f982fd46c',
            presentation_name: 'Granel por kilogramo',
            quantity: 1,
            unit: 'kg',
            price: 3800,
            sku: 'CHUNKY-GRANEL',
            stock_available: 0,
            bulk_stock_available: 50,
            total_stock: 50,
            active: true,
          }
        ]
      },
      // Nutrecan Adulto RM
      {
        id: '4af265ba-5a7d-49c2-a6be-5677a9250c1e',
        name: 'Nutrecan Adulto RM',
        description: 'Concentrado para perros adultos',
        brand: 'Nutrecan',
        base_unit: 'kg',
        image_url: 'https://example.com/nutrecan-adulto.jpg',
        category_id: '644bdf37-f8ae-4545-b440-c55ef0eecc1b',
        presentations: [
          {
            id: '68e24bc5-194d-4c76-949e-d2fde4846825',
            presentation_name: 'Bulto 25kg',
            quantity: 25,
            unit: 'kg',
            price: 247000,
            sku: 'NUTRECAN-25KG',
            stock_available: 49,
            bulk_stock_available: 0,
            total_stock: 49,
            active: true,
          },
          {
            id: '2f93b1e1-33b0-4648-8fd0-3005df3c4e63',
            presentation_name: 'Granel por kilogramo',
            quantity: 1,
            unit: 'kg',
            price: 11000,
            sku: 'NUTRECAN-GRANEL',
            stock_available: 0,
            bulk_stock_available: 0,
            total_stock: 0,
            active: true,
          }
        ]
      }
    ],
    currentCategory: null,
    loading: false,
  },
  sales: {
    sales: [],
    currentSale: null,
    filters: {
      skip: 0,
      limit: 50,
    },
    hasMore: true,
    reports: {
      bestSelling: [],
      dailySummary: [],
    },
    loading: false,
  },
  ui: {
    modals: {
      customerSelector: false,
      productDetails: false,
    },
    loading: {},
    notifications: [],
  },
};

// Store simplificado para evitar duplicación
export const useMAPOStore = create<MAPOStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ======= AUTH ACTIONS =======
      login: async (email: string, password: string) => {
        try {
          const response = await apiClient.login(email, password);
          set((state) => ({ auth: { ...state.auth, isAuthenticated: true, user: response.user } }));
        } catch (error: any) {
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('mapo_token');
        set(initialState);
      },

      initializeAuth: () => {
        const token = localStorage.getItem('mapo_token');
        if (token) {
          set((state) => ({ auth: { ...state.auth, isAuthenticated: true } }));
        }
      },

      // ======= CART ACTIONS =======
      addToCart: async (presentation: ProductPresentation, quantity: number, unitPrice: number) => {
        // Validar cantidad
        if (quantity <= 0) {
          get().addNotification({
            type: 'error',
            title: 'Cantidad inválida',
            message: 'La cantidad debe ser mayor a 0'
          });
          return false;
        }
        
        // Determinar si es producto a granel
        const isBulk = presentation.presentation_name?.toLowerCase().includes('granel') || 
                       (presentation.bulk_stock_available !== undefined && presentation.bulk_stock_available > 0);
        
        // Obtener stock disponible
        const availableStock = isBulk 
          ? (presentation.bulk_stock_available || 0)
          : (presentation.stock_available || 0);
        
        // Validar stock disponible
        if (availableStock <= 0) {
          get().addNotification({
            type: 'error',
            title: 'Sin stock',
            message: `No hay stock disponible para ${presentation.presentation_name}`
          });
          return false;
        }
        
        if (quantity > availableStock) {
          get().addNotification({
            type: 'error',
            title: 'Stock insuficiente',
            message: `Stock disponible: ${availableStock} ${isBulk ? 'kg' : 'unidades'}. Solicitado: ${quantity}`
          });
          return false;
        }
        
        // Verificar si el producto ya está en el carrito
        const state = get();
        const existingItemIndex = state.cart.items.findIndex(
          item => item.presentation.id === presentation.id
        );
        
        if (existingItemIndex !== -1) {
          // Si ya existe, actualizar cantidad
          const existingItem = state.cart.items[existingItemIndex];
          const newQuantity = existingItem.quantity + quantity;
          
          if (newQuantity > availableStock) {
            get().addNotification({
              type: 'error',
              title: 'Stock insuficiente',
              message: `No puedes agregar más. Stock disponible: ${availableStock} ${isBulk ? 'kg' : 'unidades'}`
            });
            return false;
          }
          
          // Actualizar la cantidad
          set((state) => {
            const newItems = state.cart.items.map((item, index) => {
              if (index === existingItemIndex) {
                return {
                  ...item,
                  quantity: newQuantity,
                  line_total: newQuantity * item.unit_price
                };
              }
              return item;
            });
            const subtotal = newItems.reduce((sum, item) => sum + item.line_total, 0);
            return { cart: { ...state.cart, items: newItems, subtotal, total: subtotal } };
          });
        } else {
          // Agregar nuevo item
          const newItem: CartItem = {
            presentation,
            quantity,
            unit_price: unitPrice,
            line_total: quantity * unitPrice,
            max_available: availableStock
          };

          set((state) => {
            const newItems = [...state.cart.items, newItem];
            const subtotal = newItems.reduce((sum, item) => sum + item.line_total, 0);
            return { cart: { ...state.cart, items: newItems, subtotal, total: subtotal } };
          });
        }
        
        get().addNotification({
          type: 'success',
          title: 'Producto agregado',
          message: `${presentation.presentation_name} x${quantity} agregado al carrito`
        });

        return true;
      },

      removeFromCart: (presentationId: UUID) => {
        set((state) => {
          const newItems = state.cart.items.filter(item => item.presentation.id !== presentationId);
          const subtotal = newItems.reduce((sum, item) => sum + item.line_total, 0);
          return { cart: { ...state.cart, items: newItems, subtotal, total: subtotal } };
        });
      },

      updateCartQuantity: (presentationId: UUID, quantity: number) => {
        set((state) => {
          const newItems = state.cart.items.map(item => {
            if (item.presentation.id === presentationId) {
              return { ...item, quantity, line_total: quantity * item.unit_price };
            }
            return item;
          });
          const subtotal = newItems.reduce((sum, item) => sum + item.line_total, 0);
          return { cart: { ...state.cart, items: newItems, subtotal, total: subtotal } };
        });
      },

      clearCart: () => {
        set((state) => ({ cart: { ...state.cart, items: [], total: 0, subtotal: 0 } }));
      },

      setCustomer: (customer: Person) => {
        set((state) => ({ cart: { ...state.cart, customer } }));
      },

      // ======= CUSTOMER ACTIONS =======
      loadPersons: async (): Promise<PersonAPIResponse[]> => {
        try {
          console.log('🔄 Store - Cargando personas desde API...');
          const persons = await personService.getAllPersons();
          console.log('✅ Store - Personas cargadas:', persons.length);
          return persons as PersonAPIResponse[];
        } catch (error: any) {
          console.error('❌ Store - Error al cargar personas:', error);
          // En caso de error, devolver datos mock
          const mockPersons = personService.getMockPersons();
          console.log('⚠️ Store - Usando datos mock:', mockPersons.length);
          return mockPersons as PersonAPIResponse[];
        }
      },

      searchCustomers: async (query: string): Promise<PersonAPIResponse[]> => {
        try {
          console.log('🔍 Store - Buscando personas:', query);
          const results = await personService.searchPersons(query);
          console.log('✅ Store - Resultados de búsqueda:', results.length);
          return results as PersonAPIResponse[];
        } catch (error: any) {
          console.error('❌ Store - Error en búsqueda:', error);
          return [];
        }
      },

      createCustomer: async (customerData) => {
        const newCustomer = {
          id: `customer-${Date.now()}`,
          ...customerData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Customer;
        return newCustomer;
      },

      // ======= SALES ACTIONS =======
      createSale: async () => {
        const state = get();
        
        if (!state.cart.customer) {
          console.error('No customer selected');
          get().addNotification({
            type: 'error',
            title: 'Error',
            message: 'Debes seleccionar un cliente'
          });
          return null;
        }
        
        if (state.cart.items.length === 0) {
          console.error('Cart is empty');
          get().addNotification({
            type: 'error',
            title: 'Error',
            message: 'El carrito está vacío'
          });
          return null;
        }
        
        try {
          // ⚠️ ESTRUCTURA CORRECTA según el backend real:
          // {
          //   customer_id: "uuid",
          //   status: "completed",
          //   items: [
          //     {
          //       presentation_id: "uuid",
          //       quantity: 2,
          //       unit_price: 8300
          //     }
          //   ]
          // }
          
          const saleData = {
            customer_id: state.cart.customer.id,
            status: 'completed' as const,  // ✅ Requerido por el backend
            items: state.cart.items.map(item => ({
              presentation_id: item.presentation.id,  // ✅ presentation_id
              quantity: item.quantity,
              unit_price: item.unit_price
            }))
          };
          
          console.log('📤 Enviando venta al backend:');
          console.log('   Customer ID:', saleData.customer_id);
          console.log('   Status:', saleData.status);
          console.log('   Items:', saleData.items);
          console.log('   Full Data:', JSON.stringify(saleData, null, 2));
          
          // Llamar al API
          const sale = await apiClient.createSale(saleData);
          
          console.log('✅ Venta creada exitosamente:', sale);
          
          // Agregar la venta al estado
          set((state) => ({
            sales: {
              ...state.sales,
              sales: [sale, ...state.sales.sales],
              currentSale: sale
            }
          }));
          
          // Limpiar el carrito
          set((state) => ({
            cart: {
              ...state.cart,
              items: [],
              total: 0,
              customer: null
            }
          }));
          
          // Agregar notificación de éxito
          const totalAmount = sale.total_amount || sale.total || 0;
          get().addNotification({
            type: 'success',
            title: 'Venta Exitosa',
            message: `Venta procesada correctamente. Total: $${totalAmount.toLocaleString('es-CO')}`
          });
          
          return sale;
        } catch (error: any) {
          console.error('❌ Error al crear venta:', error);
          
          get().addNotification({
            type: 'error',
            title: 'Error al procesar venta',
            message: error.detail || error.message || 'Error desconocido'
          });
          
          return null;
        }
      },

      loadSales: async () => {},

      loadSaleById: async (saleId) => {},

      // ======= SALES HISTORY ACTIONS =======
      loadSalesHistory: async (filters = {}) => {
        const currentState = get();
        
        set((state) => ({
          sales: { ...state.sales, loading: true }
        }));

        try {
          const mergedFilters = {
            ...currentState.sales.filters,
            ...filters
          };

          const salesData = await apiClient.getSales(mergedFilters);
          
          set((state) => ({
            sales: {
              ...state.sales,
              sales: salesData,
              filters: mergedFilters,
              hasMore: salesData.length === (mergedFilters.limit || 50),
              loading: false
            }
          }));
        } catch (error: any) {
          console.error('Error loading sales history:', error);
          set((state) => ({
            sales: { ...state.sales, loading: false }
          }));
          
          get().addNotification({
            type: 'error',
            title: 'Error al cargar historial',
            message: error.detail || error.message || 'No se pudo cargar el historial de ventas'
          });
        }
      },

      loadMoreSales: async () => {
        const state = get();
        if (!state.sales.hasMore || state.sales.loading) return;

        set((state) => ({
          sales: { ...state.sales, loading: true }
        }));

        try {
          const currentFilters = state.sales.filters;
          const newSkip = state.sales.sales.length;
          
          const moreSales = await apiClient.getSales({
            ...currentFilters,
            skip: newSkip
          });

          set((state) => ({
            sales: {
              ...state.sales,
              sales: [...state.sales.sales, ...moreSales],
              filters: { ...currentFilters, skip: newSkip },
              hasMore: moreSales.length === (currentFilters.limit || 50),
              loading: false
            }
          }));
        } catch (error: any) {
          console.error('Error loading more sales:', error);
          set((state) => ({
            sales: { ...state.sales, loading: false }
          }));
        }
      },

      filterSalesByDateRange: async (startDate: Date, endDate: Date) => {
        await get().loadSalesHistory({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          skip: 0
        });
      },

      filterSalesByLastDays: async (days: number) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        await get().loadSalesHistory({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          skip: 0
        });
      },

      clearSalesFilters: async () => {
        await get().loadSalesHistory({
          skip: 0,
          limit: 50
        });
      },

      setSalesFilters: (filters) => {
        set((state) => ({
          sales: {
            ...state.sales,
            filters: { ...state.sales.filters, ...filters }
          }
        }));
      },

      // ======= INVENTORY ACTIONS =======
      loadCategories: async () => {
        try {
          set((state) => ({
            inventory: {
              ...state.inventory,
              loading: true
            }
          }));

          // Llamar a la API para obtener todas las categorías
          const categories = await apiClient.getCategories();
          
          set((state) => ({
            inventory: {
              ...state.inventory,
              categories: categories,
              loading: false
            }
          }));
          
          console.log('🔄 loadCategories - Categorías cargadas desde API:', {
            totalCategories: categories.length,
            categories: categories.map(c => ({ id: c.id, name: c.name }))
          });
        } catch (error) {
          console.warn('⚠️ No se pudieron cargar categorías desde la API, usando datos locales');
          console.error('Error loading categories:', error);
          // Mantener las categorías que ya están en el estado (mock data)
          set((state) => ({
            inventory: {
              ...state.inventory,
              loading: false
            }
          }));
        }
      },

      loadProductsByCategory: async (categoryId) => {
        try {
          set((state) => ({
            inventory: {
              ...state.inventory,
              loading: true
            }
          }));

          // Llamar a la API para obtener productos de una categoría
          const products = await apiClient.getProductsByCategory(categoryId);
          
          set((state) => ({
            inventory: {
              ...state.inventory,
              products: products,
              currentCategory: categoryId,
              loading: false
            }
          }));
          
          console.log('🔄 loadProductsByCategory - Productos cargados:', {
            categoryId,
            totalProducts: products.length
          });
        } catch (error) {
          console.warn('⚠️ No se pudieron cargar productos por categoría desde la API');
          console.error('Error loading products by category:', error);
          // Mantener los productos que ya están en el estado
          set((state) => ({
            inventory: {
              ...state.inventory,
              loading: false
            }
          }));
        }
      },

      loadAllProducts: async () => {
        try {
          set((state) => ({
            inventory: {
              ...state.inventory,
              loading: true
            }
          }));

          // Llamar a la API para obtener todos los productos
          const products = await apiClient.getAllProducts();
          
          set((state) => ({
            inventory: {
              ...state.inventory,
              products: products,
              loading: false
            }
          }));
          
          // DEBUG: Mostrar los productos cargados
          console.log('🔄 loadAllProducts - Productos cargados desde API:', {
            totalProducts: products.length,
            products: products.map(p => ({
              id: p.id,
              name: p.name,
              presentations: p.presentations?.length || 0
            }))
          });
        } catch (error) {
          console.warn('⚠️ No se pudieron cargar productos desde la API, usando datos locales');
          console.error('Error loading products:', error);
          // Mantener los productos que ya están en el estado (mock data)
          set((state) => ({
            inventory: {
              ...state.inventory,
              loading: false
            }
          }));
        }
      },

      checkStock: async (presentationId) => {
        return null;
      },

      searchProducts: async (query: string) => {
        // Por ahora filtra los datos mock
        const currentState = get();
        const allProducts = currentState.inventory.products;
        
        if (!query.trim()) {
          // Si no hay query, usar todos los productos
          return;
        }
        
        // Filtrar productos por nombre o SKU
        const filteredProducts = allProducts.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.presentations.some(presentation => 
            presentation.sku?.toLowerCase().includes(query.toLowerCase()) ||
            presentation.presentation_name.toLowerCase().includes(query.toLowerCase())
          )
        );
        
        set((state) => ({
          inventory: {
            ...state.inventory,
            products: filteredProducts,
            loading: false
          }
        }));
        
        // DEBUG: Mostrar resultados de búsqueda
        console.log('🔍 searchProducts - Resultados:', {
          query,
          totalResults: filteredProducts.length,
          results: filteredProducts.map(p => ({
            name: p.name,
            presentations: p.presentations.map(pres => ({
              name: pres.presentation_name,
              stock_available: pres.stock_available,
              bulk_stock_available: pres.bulk_stock_available
            }))
          }))
        });
      },

      // ======= REPORTS ACTIONS =======
      loadBestSellingProducts: async (limit = 10) => {},

      loadDailySummary: async (date) => {},

      // ======= UI ACTIONS =======
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const timestamp = new Date().toISOString();
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, { ...notification, id, timestamp }]
          }
        }));
      },

      removeNotification: (id) => {
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.filter(n => n.id !== id)
          }
        }));
      },

      setLoading: (key, loading) => {
        set((state) => ({
          ui: { ...state.ui, loading: { ...state.ui.loading, [key]: loading } }
        }));
      },

      toggleModal: (modal) => {
        set((state) => ({
          ui: {
            ...state.ui,
            modals: { ...state.ui.modals, [modal]: !(state.ui.modals as any)[modal] }
          }
        }));
      },
    }),
    { name: 'mapo-store' }
  )
);

// Export an alias for convenience
export const useStore = useMAPOStore;