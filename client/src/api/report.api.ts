import type { ReportFilters, ReportResponse } from '../types/report.types';

const API_BASE_URL = '/api/reports';

export const generateReport = async (
    filters: ReportFilters,
): Promise<ReportResponse> => {
    const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    return response.json();
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
