import { useCallback } from 'react';
import { useMAPOStore } from '../store';

export const useReports = () => {
  const {
    sales,
    loadBestSellingProducts,
    loadDailySummary,
    addNotification
  } = useMAPOStore();

  const loadBestSellers = useCallback(async (limit: number = 10) => {
    try {
      await loadBestSellingProducts(limit);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar el reporte de productos más vendidos',
      });
    }
  }, [loadBestSellingProducts, addNotification]);

  const loadDailyReport = useCallback(async (date: string) => {
    try {
      await loadDailySummary(date);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar el resumen diario',
      });
    }
  }, [loadDailySummary, addNotification]);

  const getTodayReport = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    await loadDailyReport(today);
  }, [loadDailyReport]);

  const getSalesStats = useCallback(() => {
    const salesData = sales.sales;
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total_amount, 0);  // ✅ total_amount
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    const today = new Date().toISOString().split('T')[0];
    const todaySales = salesData.filter(sale => 
      sale.sale_date.split('T')[0] === today
    );
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);  // ✅ total_amount

    return {
      totalSales,
      totalRevenue,
      averageSaleValue,
      todaySalesCount: todaySales.length,
      todayRevenue,
      bestSelling: sales.reports.bestSelling,
      dailySummary: sales.reports.dailySummary,
    };
  }, [sales]);

  const getRecentSales = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sales.sales.filter(sale => 
      new Date(sale.sale_date) >= cutoffDate
    );
  }, [sales.sales]);

  const getSalesByDateRange = useCallback((startDate: string, endDate: string) => {
    return sales.sales.filter(sale => {
      const saleDate = sale.sale_date.split('T')[0];
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [sales.sales]);

  const getTopCustomers = useCallback((limit: number = 5) => {
    const customerSales = new Map();
    
    sales.sales.forEach(sale => {
      if (sale.customer) {
        const customerId = sale.customer_id;
        const existing = customerSales.get(customerId) || {
          customer: sale.customer,
          totalSales: 0,
          totalAmount: 0,
          salesCount: 0,
        };
        
        existing.totalAmount += sale.total_amount;  // ✅ total_amount
        existing.salesCount += 1;
        customerSales.set(customerId, existing);
      }
    });

    return Array.from(customerSales.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);
  }, [sales.sales]);

  return {
    // State
    bestSelling: sales.reports.bestSelling,
    dailySummary: sales.reports.dailySummary,
    loading: sales.loading,
    
    // Actions
    loadBestSellers,
    loadDailyReport,
    getTodayReport,
    
    // Utilities
    getSalesStats,
    getRecentSales,
    getSalesByDateRange,
    getTopCustomers,
  };
};