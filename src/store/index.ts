import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient } from '../api/client';
import {
  AppState,
  Person,
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
  loadPersons: () => Promise<Person[]>;
  searchCustomers: (query: string) => Promise<Customer[]>;
  createCustomer: (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<Customer>;
  
  // ======= SALES ACTIONS =======
  createSale: () => Promise<Sale | null>;
  loadSales: () => Promise<void>;
  loadSaleById: (saleId: UUID) => Promise<void>;
  
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
        const newItem: CartItem = {
          presentation,
          quantity,
          unit_price: unitPrice,
          line_total: quantity * unitPrice,
          max_available: presentation.stock_available || 999
        };

        set((state) => {
          const newItems = [...state.cart.items, newItem];
          const subtotal = newItems.reduce((sum, item) => sum + item.line_total, 0);
          return { cart: { ...state.cart, items: newItems, subtotal, total: subtotal } };
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
      loadPersons: async () => {
        try {
          return await apiClient.getPersons();
        } catch (error: any) {
          return [];
        }
      },

      searchCustomers: async (query: string) => {
        return [];
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
        return null;
      },

      loadSales: async () => {},

      loadSaleById: async (saleId) => {},

      // ======= INVENTORY ACTIONS =======
      loadCategories: async () => {},

      loadProductsByCategory: async (categoryId) => {},

      loadAllProducts: async () => {
        // Por ahora usa los datos mock del estado inicial
        // En el futuro se reemplazará con una llamada real a la API
        set((state) => ({
          inventory: {
            ...state.inventory,
            loading: false
          }
        }));
        
        // DEBUG: Mostrar los productos cargados
        const currentState = get();
        console.log('🔄 loadAllProducts - Productos cargados:', {
          totalProducts: currentState.inventory.products.length,
          products: currentState.inventory.products.map(p => ({
            name: p.name,
            presentations: p.presentations.map(pres => ({
              name: pres.presentation_name,
              stock_available: pres.stock_available,
              bulk_stock_available: pres.bulk_stock_available
            }))
          }))
        });
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