import api from './api';
import type { ReportFilters, ReportResponse } from '../types/report.types';

export const generateReport = async (
    filters: ReportFilters,
): Promise<ReportResponse> => {
    const res = await api.post('/reports/generate', filters);
    return res.data;
};

export const exportReport = async (
    format: 'pdf' | 'csv',
    filters: ReportFilters,
): Promise<void> => {
    const response = await api.post(`/reports/export/${format}`, filters, {
        responseType: 'blob',
    });

    // Handle file download
    const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
