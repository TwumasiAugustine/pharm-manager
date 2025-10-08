import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { AuditLogTable } from '../components/molecules/AuditLogTable';
import { AuditLogStats } from '../components/molecules/AuditLogStats';
import { AuditLogFilter } from '../components/molecules/AuditLogFilter';
import { Pagination } from '../components/molecules/Pagination';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import PlatformAuditStats from '../components/molecules/PlatformAuditStats';
import SecurityAlerts from '../components/molecules/SecurityAlerts';
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
    usePlatformAuditStats,
    useSecurityAlerts,
} from '../hooks/useAuditLogs';
import type { AuditLogFilters } from '../types/audit-log.types';
import { getErrorMessage } from '../utils/error';
import { useURLFilters } from '../hooks/useURLSearch';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types/user.types';
import { FiEye, FiShield, FiBarChart } from 'react-icons/fi';

export const AuditLogsPage: React.FC = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    const [activeTab, setActiveTab] = useState<
        'logs' | 'security' | 'platform'
    >('logs');

    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.audit,
        canonicalPath: '/audit-logs',
    });

    // URL-based filters for audit logs
    const { filters, setFilter, setFilters } = useURLFilters(
        {
            page: 1,
            limit: 10,
            userId: undefined,
            pharmacyId: undefined,
            branchId: undefined,
            action: undefined,
            resource: undefined,
            startDate: undefined,
            endDate: undefined,
            userRole: undefined,
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

    // Super Admin only features
    const {
        data: platformStatsData,
        isLoading: platformStatsLoading,
        error: platformStatsError,
    } = usePlatformAuditStats();

    const {
        data: securityAlertsData,
        isLoading: securityAlertsLoading,
        error: securityAlertsError,
    } = useSecurityAlerts(24);

    const cleanupMutation = useCleanupAuditLogs();
    const refreshAuditLogs = useRefreshAuditLogs();

    const handleFiltersChange = (newFilters: AuditLogFilters) => {
        // Use setFilters to update all filters at once to avoid debouncing issues
        setFilters(newFilters as Partial<Record<string, unknown>>);
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

    if (
        auditLogsError ||
        statsError ||
        platformStatsError ||
        securityAlertsError
    ) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {getErrorMessage(
                                auditLogsError ||
                                    statsError ||
                                    platformStatsError ||
                                    securityAlertsError,
                            )}
                        </AlertDescription>
                    </Alert>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <SEOMetadata {...seoData} />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                {/* Enhanced Header */}
                <div className="bg-white shadow-lg border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                            <FiEye className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                                                Audit Logs
                                            </h1>
                                            <p className="text-lg text-gray-600 font-medium">
                                                Track and monitor all user activities and system changes
                                                {isSuperAdmin && (
                                                    <span className="text-blue-600 font-semibold"> across the entire platform</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleRefresh}
                                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105"
                                    >
                                        <FiEye className="mr-2 h-4 w-4" />
                                        Refresh
                                    </button>
                                    {isSuperAdmin && (
                                        <button
                                            onClick={handleCleanup}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-105"
                                        >
                                            <FiBarChart className="mr-2 h-4 w-4" />
                                            Cleanup
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Tab Navigation for Super Admin */}
                            {isSuperAdmin && (
                                <div className="mt-8">
                                    <div className="border-b border-gray-200 bg-gray-50 rounded-t-xl p-1">
                                        <nav className="flex space-x-1">
                                            <button
                                                onClick={() => setActiveTab('logs')}
                                                className={`flex items-center px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                                    activeTab === 'logs'
                                                        ? 'bg-white text-blue-600 shadow-md border border-blue-200'
                                                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                                                }`}
                                            >
                                                <FiEye className="mr-2 h-5 w-5" />
                                                Audit Logs
                                                {activeTab === 'logs' && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Active
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('security')}
                                                className={`flex items-center px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                                    activeTab === 'security'
                                                        ? 'bg-white text-red-600 shadow-md border border-red-200'
                                                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                                                }`}
                                            >
                                                <FiShield className="mr-2 h-5 w-5" />
                                                Security Alerts
                                                {activeTab === 'security' && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Active
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('platform')}
                                                className={`flex items-center px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                                    activeTab === 'platform'
                                                        ? 'bg-white text-purple-600 shadow-md border border-purple-200'
                                                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                                                }`}
                                            >
                                                <FiBarChart className="mr-2 h-5 w-5" />
                                                Platform Stats
                                                {activeTab === 'platform' && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Active
                                                    </span>
                                                )}
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enhanced Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Tab Content */}
                    {(!isSuperAdmin || activeTab === 'logs') && (
                        <div className="space-y-8">
                            {/* Statistics Card */}
                            {statsData && (
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-4">
                                        <h3 className="text-xl font-bold text-white flex items-center">
                                            <FiBarChart className="mr-3 h-6 w-6" />
                                            Audit Statistics
                                        </h3>
                                        <p className="text-blue-100 text-sm mt-1">
                                            Real-time insights into system activities
                                        </p>
                                    </div>
                                    <div className="p-6">
                                        <AuditLogStats
                                            stats={statsData}
                                            isLoading={statsLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Filters Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                                <AuditLogFilter
                                    filters={filters}
                                    onFiltersChange={handleFiltersChange}
                                    onRefresh={handleRefresh}
                                    onCleanup={handleCleanup}
                                    isLoading={
                                        auditLogsLoading ||
                                        cleanupMutation.isPending
                                    }
                                />
                            </div>

                            {/* Audit Logs Table Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                                <FiEye className="mr-3 h-6 w-6 text-blue-500" />
                                                Audit Log Records
                                            </h3>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {auditLogsData?.pagination?.total || 0} total records found
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {auditLogsLoading && (
                                                <div className="flex items-center text-blue-600">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                                    <span className="text-sm font-medium">Loading...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <AuditLogTable
                                        data={auditLogsData?.data || []}
                                        isLoading={auditLogsLoading}
                                    />
                                </div>
                            </div>

                            {/* Pagination Card */}
                            {auditLogsData?.pagination &&
                                auditLogsData.pagination.totalPages > 1 && (
                                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                                        <Pagination
                                            currentPage={
                                                auditLogsData.pagination.page
                                            }
                                            totalPages={
                                                auditLogsData.pagination
                                                    .totalPages
                                            }
                                            onPageChange={handlePageChange}
                                            showInfo={true}
                                            totalItems={
                                                auditLogsData.pagination.total
                                            }
                                            itemsPerPage={
                                                auditLogsData.pagination.limit
                                            }
                                            size="md"
                                        />
                                    </div>
                                )}

                            {/* Enhanced Summary Card */}
                            {auditLogsData && (
                                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-xl border border-blue-200 p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FiBarChart className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h4 className="ml-3 text-lg font-bold text-gray-900">
                                            Active Filters Summary
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {filters.action && (
                                            <div className="bg-white rounded-lg p-3 border border-blue-200">
                                                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Action</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">{filters.action}</p>
                                            </div>
                                        )}
                                        {filters.resource && (
                                            <div className="bg-white rounded-lg p-3 border border-purple-200">
                                                <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">Resource</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">{filters.resource}</p>
                                            </div>
                                        )}
                                        {filters.userRole && (
                                            <div className="bg-white rounded-lg p-3 border border-green-200">
                                                <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Role</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">{filters.userRole}</p>
                                            </div>
                                        )}
                                        {filters.pharmacyId && (
                                            <div className="bg-white rounded-lg p-3 border border-orange-200">
                                                <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">Pharmacy</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">{filters.pharmacyId}</p>
                                            </div>
                                        )}
                                        {filters.branchId && (
                                            <div className="bg-white rounded-lg p-3 border border-pink-200">
                                                <span className="text-xs font-medium text-pink-600 uppercase tracking-wide">Branch</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">{filters.branchId}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Enhanced Security Alerts Tab (Super Admin Only) */}
                    {isSuperAdmin && activeTab === 'security' && (
                        <div className="bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                                <h3 className="text-xl font-bold text-white flex items-center">
                                    <FiShield className="mr-3 h-6 w-6" />
                                    Security Alerts
                                </h3>
                                <p className="text-red-100 text-sm mt-1">
                                    Monitor security threats and suspicious activities
                                </p>
                            </div>
                            <div className="p-6">
                                <SecurityAlerts
                                    alerts={securityAlertsData || []}
                                    isLoading={securityAlertsLoading}
                                    hours={24}
                                />
                            </div>
                        </div>
                    )}

                    {/* Enhanced Platform Stats Tab (Super Admin Only) */}
                    {isSuperAdmin && activeTab === 'platform' && (
                        <div className="bg-white rounded-2xl shadow-xl border border-purple-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                                <h3 className="text-xl font-bold text-white flex items-center">
                                    <FiBarChart className="mr-3 h-6 w-6" />
                                    Platform Statistics
                                </h3>
                                <p className="text-purple-100 text-sm mt-1">
                                    Comprehensive platform-wide analytics and insights
                                </p>
                            </div>
                            <div className="p-6">
                                {platformStatsData && (
                                    <PlatformAuditStats
                                        stats={platformStatsData}
                                        isLoading={platformStatsLoading}
                                    />
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
