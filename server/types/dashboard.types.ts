export interface DashboardOverview {
    totalSales: number;
    totalRevenue: number;
    totalCustomers: number;
    totalDrugs: number;
    lowStockCount: number;
}

export interface TopSellingDrug {
    id: string;
    name: string;
    brand: string;
    category: string;
    totalQuantity: number;
    totalRevenue: number;
    salesByType: Array<{
        saleType: string;
        quantity: number;
    }>;
}

export interface LowStockDrug {
    id: string;
    name: string;
    brand: string;
    category: string;
    quantity: number;
    price: number;
}

export interface SalesPeriodData {
    period: string;
    sales: number;
    revenue: number;
}

export interface DashboardCharts {
    topSellingDrugs: TopSellingDrug[];
    lowStockDrugs: LowStockDrug[];
    salesByPeriod: SalesPeriodData[];
    revenueByPeriod: SalesPeriodData[];
}

export interface DashboardAnalytics {
    overview: DashboardOverview;
    charts: DashboardCharts;
}

export interface SalesTrends {
    salesByPeriod: SalesPeriodData[];
    revenueByPeriod: SalesPeriodData[];
}

export interface DashboardFilters {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
}
