import { useCallback, useState, useRef } from 'react';
import { useMAPOStore } from '../store';
import { UUID } from '../types';

export const useInventory = () => {
  const {
    inventory,
    loadCategories,
    loadProductsByCategory,
    loadAllProducts,
    searchProducts,
    checkStock
  } = useMAPOStore();

  // Estados para paginación
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false); // Estado separado para loading de "cargar más"
  const loadingMoreRef = useRef(false);

  const loadCategoriesData = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  const loadProductsForCategory = useCallback(async (categoryId: UUID) => {
    await loadProductsByCategory(categoryId);
  }, [loadProductsByCategory]);

  const loadProducts = useCallback(async (resetPage = false) => {
    if (loadingMoreRef.current) return;
    
    loadingMoreRef.current = true;
    const currentPage = resetPage ? 1 : page;
    
    try {
      const response = await loadAllProducts(currentPage, 20, !resetPage && currentPage > 1);
      
      if (response) {
        const { pagination: paginationData } = response;
        
        if (resetPage || currentPage === 1) {
          setPage(1);
        } else {
          setPage(currentPage);
        }
        
        setPagination(paginationData);
        setHasMore(paginationData?.has_next || false);
      }
    } finally {
      loadingMoreRef.current = false;
    }
  }, [loadAllProducts, page]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMoreRef.current) return;
    
    loadingMoreRef.current = true;
    setLoadingMore(true); // Activar loading de "cargar más"
    
    const nextPage = page + 1;
    setPage(nextPage);
    
    try {
      await loadProducts(false);
    } finally {
      setLoadingMore(false); // Desactivar loading de "cargar más"
      loadingMoreRef.current = false;
    }
  }, [hasMore, page, loadProducts]);

  const searchForProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadAllProducts();
      return;
    }
    await searchProducts(query);
  }, [searchProducts, loadAllProducts]);

  const validateStock = useCallback(async (presentationId: UUID) => {
    const stock = await checkStock(presentationId);
    return stock;
  }, [checkStock]);

  const getProductsByCategory = useCallback((categoryId: UUID | null) => {
    if (!categoryId) return inventory.products;
    
    return inventory.products.filter(product => 
      product.category_id === categoryId
    );
  }, [inventory.products]);

  const getAvailableProducts = useCallback(() => {
    return inventory.products.filter(product => 
      product.presentations.some(presentation => 
        (presentation.stock_available || 0) > 0 || (presentation.bulk_stock_available || 0) > 0
      )
    );
  }, [inventory.products]);

  const getCategoryById = useCallback((categoryId: UUID) => {
    return inventory.categories.find(category => category.id === categoryId);
  }, [inventory.categories]);

  const getProductById = useCallback((productId: UUID) => {
    return inventory.products.find(product => product.id === productId);
  }, [inventory.products]);

  const getProductPresentations = useCallback((productId: UUID) => {
    const product = getProductById(productId);
    return product?.presentations || [];
  }, [getProductById]);

  const getLowStockProducts = useCallback((threshold: number = 10) => {
    return inventory.products.filter(product => 
      product.presentations.some(presentation => 
        (presentation.stock_available || 0) <= threshold && 
        (presentation.stock_available || 0) > 0
      )
    );
  }, [inventory.products]);

  const getOutOfStockProducts = useCallback(() => {
    return inventory.products.filter(product => 
      product.presentations.every(presentation => 
        (presentation.stock_available || 0) === 0 && (presentation.bulk_stock_available || 0) === 0
      )
    );
  }, [inventory.products]);

  const getInventoryStats = useCallback(() => {
    const totalProducts = inventory.products.length;
    const totalCategories = inventory.categories.length;
    const lowStockCount = getLowStockProducts().length;
    const outOfStockCount = getOutOfStockProducts().length;
    const availableCount = getAvailableProducts().length;

    return {
      totalProducts,
      totalCategories,
      lowStockCount,
      outOfStockCount,
      availableCount,
      stockPercentage: totalProducts > 0 ? (availableCount / totalProducts) * 100 : 0,
    };
  }, [inventory, getLowStockProducts, getOutOfStockProducts, getAvailableProducts]);

  return {
    // State
    categories: inventory.categories,
    products: inventory.products,
    currentCategory: inventory.currentCategory,
    loading: inventory.loading,
    loadingMore, // Estado separado para loading al final
    hasMore,
    pagination,
    
    // Actions
    loadCategoriesData,
    loadProductsForCategory,
    loadProducts,
    searchForProducts,
    loadMore,
    validateStock,
    
    // Utilities
    getProductsByCategory,
    getAvailableProducts,
    getCategoryById,
    getProductById,
    getProductPresentations,
    getLowStockProducts,
    getOutOfStockProducts,
    getInventoryStats,
  };
};