import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { AuditLogTable } from '../components/molecules/AuditLogTable';
import { AuditLogStats } from '../components/molecules/AuditLogStats';
import { AuditLogFilter } from '../components/molecules/AuditLogFilter';
import { Pagination } from '../components/molecules/Pagination';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import {
    Alert,
    AlertTitle,
    AlertDescription,
} from '../components/molecules/Alert';
import {
    useAuditLogs,
    useAuditLogStats,
    useCleanupAuditLogs,
    useRefreshAuditLogs,
} from '../hooks/useAuditLogs';
import type { AuditLogFilters } from '../types/audit-log.types';
import { getErrorMessage } from '../utils/error';
import { useURLFilters } from '../hooks/useURLSearch';

export const AuditLogsPage: React.FC = () => {
    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.audit,
        canonicalPath: '/audit-logs',
    });

    // URL-based filters for audit logs
    const { filters, setFilter } = useURLFilters(
        {
            page: 1,
            limit: 10,
            userId: '',
            action: undefined,
            resource: undefined,
            startDate: '',
            endDate: '',
            userRole: '',
        },
        {
            debounceMs: 300,
            onFiltersChange: (newFilters) => {
                console.log('Audit log filters changed:', newFilters);
            },
        },
    );

    const {
        data: auditLogsData,
        isLoading: auditLogsLoading,
        error: auditLogsError,
    } = useAuditLogs(filters);

    const {
        data: statsData,
        isLoading: statsLoading,
        error: statsError,
    } = useAuditLogStats();

    const cleanupMutation = useCleanupAuditLogs();
    const refreshAuditLogs = useRefreshAuditLogs();

    const handleFiltersChange = (newFilters: AuditLogFilters) => {
        // Update individual filter values
        Object.entries(newFilters).forEach(([key, value]) => {
            setFilter(key as keyof AuditLogFilters, value);
        });
    };

    const handlePageChange = (page: number) => {
        setFilter('page', page);
    };

    const handleRefresh = () => {
        refreshAuditLogs();
    };

    const handleCleanup = () => {
        if (
            window.confirm(
                'Are you sure you want to cleanup old audit logs (older than 90 days)? This action cannot be undone.',
            )
        ) {
            cleanupMutation.mutate(90);
        }
    };

    if (auditLogsError || statsError) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {getErrorMessage(auditLogsError || statsError)}
                        </AlertDescription>
                    </Alert>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <SEOMetadata {...seoData} />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Audit Logs
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Track and monitor all user activities and
                                    system changes
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Statistics */}
                    {statsData && (
                        <AuditLogStats
                            stats={statsData}
                            isLoading={statsLoading}
                        />
                    )}

                    {/* Filters */}
                    <AuditLogFilter
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onRefresh={handleRefresh}
                        onCleanup={handleCleanup}
                        isLoading={
                            auditLogsLoading || cleanupMutation.isPending
                        }
                    />

                    {/* Audit Logs Table */}
                    <AuditLogTable
                        data={auditLogsData?.data || []}
                        isLoading={auditLogsLoading}
                    />

                    {/* Pagination */}
                    {auditLogsData?.pagination &&
                        auditLogsData.pagination.totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={auditLogsData.pagination.page}
                                    totalPages={
                                        auditLogsData.pagination.totalPages
                                    }
                                    onPageChange={handlePageChange}
                                    showInfo={true}
                                    totalItems={auditLogsData.pagination.total}
                                    itemsPerPage={
                                        auditLogsData.pagination.limit
                                    }
                                    size="md"
                                />
                            </div>
                        )}

                    {/* Summary */}
                    {auditLogsData && (
                        <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
                            <div className="text-sm text-gray-600">
                                {filters.action && (
                                    <span> • Action: {filters.action}</span>
                                )}
                                {filters.resource && (
                                    <span> • Resource: {filters.resource}</span>
                                )}
                                {filters.userRole && (
                                    <span> • Role: {filters.userRole}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AuditLogsPage;
