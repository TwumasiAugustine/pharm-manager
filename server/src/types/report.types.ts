export interface ReportFilters {
    dateRange: {
        start: string;
        end: string;
    };
    reportType: 'sales' | 'inventory' | 'expiry' | 'financial';
    format: 'table' | 'chart';
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface ReportSummaryData {
    totalRevenue: number;
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
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    profit: number | null;
    customer?: string;
    batchNumber?: string;
    expiryDate?: string;
    daysUntilExpiry?: number;
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
