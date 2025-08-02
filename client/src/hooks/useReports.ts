import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reportApi from '../api/report.api';
import type { ReportFilters, ExportReportRequest } from '../types/report.types';

export const useReports = (filters: ReportFilters) => {
    const queryClient = useQueryClient();

    // Query for report data
    const {
        data: reportResponse,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['reports', filters],
        queryFn: () => reportApi.generateReport(filters),
        enabled: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Mutation for generating reports
    const generateReportMutation = useMutation({
        mutationFn: (filters: ReportFilters) =>
            reportApi.generateReport(filters),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });

    // Mutation for exporting reports
    const exportReportMutation = useMutation({
        mutationFn: (request: ExportReportRequest) =>
            reportApi.exportReport(request.format, request.filters),
    });

    const refreshData = () => {
        refetch();
    };

    const generateReport = async (reportFilters: ReportFilters) => {
        return generateReportMutation.mutateAsync(reportFilters);
    };

    const exportReport = async (
        format: 'pdf' | 'csv',
        reportFilters: ReportFilters,
    ) => {
        return exportReportMutation.mutateAsync({
            format,
            filters: reportFilters,
        });
    };

    return {
        reportData: Array.isArray(reportResponse?.data)
            ? reportResponse.data
            : [],
        reportSummary: reportResponse?.summary || null,
        totalRecords: reportResponse?.totalRecords || 0,
        currentPage: reportResponse?.currentPage || 1,
        totalPages: reportResponse?.totalPages || 1,
        isLoading,
        isGenerating: generateReportMutation.isPending,
        isExporting: exportReportMutation.isPending,
        error,
        generateReport,
        exportReport,
        refreshData,
    };
};
