export interface ReportFilters {
    dateRange: {
        start: string;
        end: string;
    };
    reportType: 'sales' | 'inventory' | 'expiry' | 'financial';
    format: 'table' | 'chart';
    category?: string;
    status?: string;
}

export interface ReportSummaryData {
    totalRevenue: number;
    totalSales: number;
    totalItems: number;
    profitMargin: number;
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
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    profit: number;
    customer?: string;
    batchNumber?: string;
    expiryDate?: string;
}

export interface ReportResponse {
    data: ReportDataItem[];
    summary: ReportSummaryData;
    totalRecords: number;
    currentPage: number;
    totalPages: number;
}

export interface ExportReportRequest {
    format: 'pdf' | 'csv';
    filters: ReportFilters;
}
