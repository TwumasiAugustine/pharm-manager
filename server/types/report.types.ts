export interface ReportFilters {
    dateRange: {
        start: string;
        end: string;
    };
    reportType: 'sales' | 'inventory' | 'expiry' | 'financial';
    format: 'table' | 'chart';
    category?: string;
    status?: string;
    branchId?: string;
    saleType?: 'unit' | 'pack' | 'carton';
    expiryStatus?: 'expired' | 'critical' | 'warning' | 'notice';
    page?: number;
    limit?: number;
}

export interface ReportSummaryData {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalSales: number;
    totalItems: number;
    profitMargin: number | null;
    topSellingDrug: string;
    averageOrderValue: number;
    period: {
        start: string;
        end: string;
    };
}

export interface ReportDataItem {
    id: string;
    date: string;
    drugName: string;
    category: string;
    brand?: string;
    quantity: number;
    saleType?: 'unit' | 'pack' | 'carton';
    unitPrice: number;
    packPrice?: number;
    cartonPrice?: number;
    totalPrice: number;
    costPrice?: number;
    totalCostValue?: number;
    profit: number | null;
    profitMargin?: number;
    profitLoss?: number;
    customer?: string;
    customerPhone?: string;
    branchName?: string;
    soldBy?: string;
    paymentMethod?: string;
    transactionId?: string;
    finalized?: boolean;
    batchNumber?: string;
    expiryDate?: string;
    daysUntilExpiry?: number;
    expiryStatus?: 'expired' | 'critical' | 'warning' | 'notice';
    unitsPerCarton?: number;
    packsPerCarton?: number;
    requiresPrescription?: boolean;
    supplier?: string;
    location?: string;
}

export interface ReportResponse {
    data: ReportDataItem[];
    summary: ReportSummaryData;
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    pharmacyInfo?: {
        name: string;
        address: {
            street: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
        contact: {
            phone: string;
            email: string;
            website?: string;
        };
        registrationNumber: string;
        slogan: string;
    };
}

export interface ExportReportRequest {
    format: 'pdf' | 'csv';
    filters: ReportFilters;
}
