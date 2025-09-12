export interface DashboardOverview {
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    totalCustomers: number;
    totalDrugs: number;
    lowStockCount: number;
    profitMargin: number;
    averageOrderValue: number;
}

export interface TopSellingDrug {
    id: string;
    name: string;
    brand: string;
    category: string;
    totalQuantity: number;
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
    unitPrice: number;
    packPrice?: number;
    cartonPrice?: number;
}

export interface LowStockDrug {
    id: string;
    name: string;
    brand: string;
    category: string;
    quantity: number;
    reorderLevel: number;
    price: number;
    location?: string;
    branchName?: string;
}

export interface SalesPeriodData {
    period: string;
    sales: number;
    revenue: number;
    profit?: number;
}

export interface SaleTypeDistribution {
    type: 'unit' | 'pack' | 'carton';
    count: number;
    revenue: number;
    profit: number;
    percentage: number;
}

export interface ProfitMarginAnalysis {
    category: string;
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
    salesCount: number;
}

export interface DashboardCharts {
    topSellingDrugs: TopSellingDrug[];
    lowStockDrugs: LowStockDrug[];
    salesByPeriod: SalesPeriodData[];
    revenueByPeriod: SalesPeriodData[];
    profitByPeriod: SalesPeriodData[];
    saleTypeDistribution: SaleTypeDistribution[];
    profitMarginAnalysis: ProfitMarginAnalysis[];
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
    branchId?: string;
}

export interface DashboardResponse {
    success: boolean;
    message: string;
    data: DashboardAnalytics;
}

export interface TrendsResponse {
    success: boolean;
    message: string;
    data: SalesTrends;
}
