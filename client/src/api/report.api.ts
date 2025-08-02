import type { ReportFilters, ReportResponse } from '../types/report.types';

const API_BASE_URL = '/api/reports';

export const generateReport = async (
    filters: ReportFilters,
): Promise<ReportResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(filters),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(
                `Failed to generate report: ${response.statusText}`,
            );
        }

        const responseData = await response.json();

        // Handle wrapped API response structure
        const report = responseData?.data || responseData;

        // Defensive response handling
        return {
            data: Array.isArray(report?.data) ? report.data : [],
            summary: report?.summary || {
                totalRevenue: 0,
                totalSales: 0,
                totalItems: 0,
                profitMargin: 0,
                topSellingDrug: '',
                averageOrderValue: 0,
                period: { start: '', end: '' },
            },
            totalRecords: report?.totalRecords || 0,
            currentPage: report?.currentPage || 1,
            totalPages: report?.totalPages || 1,
        };
    } catch (error) {
        console.error('Error generating report:', error);
        // Return a safe fallback response
        return {
            data: [],
            summary: {
                totalRevenue: 0,
                totalSales: 0,
                totalItems: 0,
                profitMargin: 0,
                topSellingDrug: '',
                averageOrderValue: 0,
                period: { start: '', end: '' },
            },
            totalRecords: 0,
            currentPage: 1,
            totalPages: 1,
        };
    }
};

export const exportReport = async (
    format: 'pdf' | 'csv',
    filters: ReportFilters,
): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/export/${format}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Failed to export report: ${response.statusText}`);
    }

    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
