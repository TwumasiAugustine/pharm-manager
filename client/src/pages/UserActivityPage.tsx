import React, { useState } from 'react';
import { format } from 'date-fns';
import DashboardLayout from '../layouts/DashboardLayout';
import { UserActivityFilter } from '../components/organisms/UserActivityFilter';
import { UserActivityTable } from '../components/organisms/UserActivityTable';
import { UserActivityStats } from '../components/organisms/UserActivityStats';
import { UserSessionModal } from '../components/organisms/UserSessionModal';
import RoleHierarchyIndicator from '../components/molecules/RoleHierarchyIndicator';
import {
    useUserActivities,
    useUserActivityStats,
    useActiveSessions,
    useUserActivitySummary,
    useCleanupOldActivities,
} from '../hooks/useUserActivity';
import type { UserActivityFilters } from '../types/user-activity.types';
import {
    FaChartLine,
    FaListAlt,
    FaFilter,
    FaInfoCircle,
    FaUsers,
    FaChartBar,
    FaTrash,
} from 'react-icons/fa';
import { useURLFilters } from '../hooks/useURLSearch';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types/user.types';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import { usePermissions } from '../hooks/usePermissions';

const UserActivityPage: React.FC = () => {
    const { user } = useAuthStore();
    const { canAccessSystemFeatures } = usePermissions();

    // SEO configuration
    const seoData = useSEO({
        ...SEO_PRESETS.userActivity,
        canonicalPath: '/user-activity',
    });

    // Active tab state
    const [activeTab, setActiveTab] = useState<
        'activities' | 'sessions' | 'summary'
    >('activities');

    // URL-based filters for user activity
    const { filters, setFilter } = useURLFilters(
        {
            page: 1,
            limit: 10,
            userId: '',
            sessionId: '',
            activityType: undefined,
            resource: undefined,
            startDate: '',
            endDate: '',
            isActive: undefined as boolean | undefined,
            userRole: '',
            ipAddress: '',
        },
        {
            debounceMs: 500,
            onFiltersChange: (newFilters) => {
                console.log('User activity filters changed:', newFilters);
            },
        },
    );

    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
        null,
    );
    const [showFilters, setShowFilters] = useState(false);

    // Data fetching hooks
    const {
        data: activitiesData,
        isLoading: isLoadingActivities,
        error: activitiesError,
    } = useUserActivities(filters);

    const {
        data: statsData,
        isLoading: isLoadingStats,
        error: statsError,
    } = useUserActivityStats({
        startDate: filters.startDate,
        endDate: filters.endDate,
    });

    const {
        data: activeSessionsData,
        isLoading: isLoadingSessions,
        error: sessionsError,
    } = useActiveSessions();

    const {
        data: summaryData,
        isLoading: isLoadingSummary,
        error: summaryError,
    } = useUserActivitySummary();

    const cleanupMutation = useCleanupOldActivities();

    const handleFilterChange = (newFilters: Partial<UserActivityFilters>) => {
        // Update individual filter values and reset to page 1
        Object.entries(newFilters).forEach(([key, value]) => {
            setFilter(key as keyof UserActivityFilters, value);
        });
        if (!('page' in newFilters)) {
            setFilter('page', 1);
        }
    };

    const handlePageChange = (page: number) => {
        setFilter('page', page);
    };

    const handleViewSession = (sessionId: string) => {
        setSelectedSessionId(sessionId);
    };

    const handleCleanup = async () => {
        try {
            const daysToKeep = 90; // Default to 90 days
            await cleanupMutation.mutateAsync(daysToKeep);
            console.log('Successfully cleaned up old activity records');
            // You can replace this with your notification system
        } catch {
            console.error('Failed to cleanup old activities');
            // You can replace this with your notification system
        }
    };

    const tabs = [
        { id: 'activities', label: 'Activity Log', icon: FaListAlt },
        { id: 'sessions', label: 'Active Sessions', icon: FaUsers },
        { id: 'summary', label: 'Summary', icon: FaChartBar },
    ] as const;

    return (
        <DashboardLayout>
            <SEOMetadata {...seoData} />
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            User Activity Tracker
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Monitor user actions, sessions, and system
                            performance.
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                        {canAccessSystemFeatures() && (
                            <button
                                onClick={handleCleanup}
                                disabled={cleanupMutation.isPending}
                                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                            >
                                <FaTrash className="mr-2" />
                                {cleanupMutation.isPending
                                    ? 'Cleaning...'
                                    : 'Cleanup Old Records'}
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="sm:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <FaFilter className="mr-2" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <FaChartLine className="mr-2" />
                        Activity Statistics
                    </h2>
                    <UserActivityStats
                        stats={statsData}
                        isLoading={isLoadingStats}
                        error={statsError as Error | null}
                    />
                </div>

                {/* Role Context Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <FaInfoCircle className="text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-900">
                            Role Context for Activity Tracking
                        </h3>
                    </div>
                    <p className="text-blue-700 mb-4">
                        Activities are tracked and filtered by user roles.
                        Understanding the role hierarchy helps interpret user
                        actions and access patterns.
                    </p>
                    <RoleHierarchyIndicator
                        currentUserRole={user?.role || UserRole.CASHIER}
                    />
                </div>

                {/* Tab Content */}
                {activeTab === 'activities' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Filters */}
                        <div
                            className={`lg:col-span-1 ${
                                showFilters ? 'block' : 'hidden'
                            } lg:block`}
                        >
                            <UserActivityFilter
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                isLoading={isLoadingActivities}
                            />
                        </div>

                        {/* Activities Table */}
                        <div className="lg:col-span-3">
                            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                                <FaListAlt className="mr-2" />
                                Activity Log
                            </h2>
                            <UserActivityTable
                                activities={activitiesData?.activities || []}
                                pagination={{
                                    currentPage:
                                        activitiesData?.currentPage || 1,
                                    totalPages: activitiesData?.totalPages || 1,
                                    hasNextPage:
                                        activitiesData?.hasNextPage || false,
                                    hasPrevPage:
                                        activitiesData?.hasPrevPage || false,
                                }}
                                isLoading={isLoadingActivities}
                                error={activitiesError as Error | null}
                                onPageChange={handlePageChange}
                                onViewSession={handleViewSession}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                            <FaUsers className="mr-2" />
                            Active User Sessions
                        </h2>
                        <div className="bg-white rounded-lg shadow">
                            {isLoadingSessions ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">
                                        Loading active sessions...
                                    </p>
                                </div>
                            ) : sessionsError ? (
                                <div className="p-8 text-center text-red-600">
                                    Error loading sessions:{' '}
                                    {(sessionsError as Error).message}
                                </div>
                            ) : activeSessionsData &&
                              activeSessionsData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Session Duration
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Activities
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    IP Address
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {activeSessionsData.map(
                                                (session: {
                                                    sessionId: string;
                                                    userName: string;
                                                    userRole: string;
                                                    duration: number;
                                                    activityCount: number;
                                                    ipAddress: string;
                                                }) => (
                                                    <tr key={session.sessionId}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        session.userName
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {
                                                                        session.userRole
                                                                    }
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {Math.floor(
                                                                session.duration /
                                                                    (1000 * 60),
                                                            )}{' '}
                                                            minutes
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {
                                                                session.activityCount
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {session.ipAddress}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() =>
                                                                    handleViewSession(
                                                                        session.sessionId,
                                                                    )
                                                                }
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No active sessions found
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                            <FaChartBar className="mr-2" />
                            Activity Summary
                        </h2>
                        <div className="bg-white rounded-lg shadow p-6">
                            {isLoadingSummary ? (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">
                                        Loading summary...
                                    </p>
                                </div>
                            ) : summaryError ? (
                                <div className="text-center text-red-600">
                                    Error loading summary:{' '}
                                    {(summaryError as Error).message}
                                </div>
                            ) : summaryData ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold text-blue-900">
                                                Today
                                            </h3>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {summaryData.todayActivity || 0}
                                            </p>
                                            <p className="text-sm text-blue-700">
                                                Activities
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold text-green-900">
                                                This Week
                                            </h3>
                                            <p className="text-2xl font-bold text-green-600">
                                                {summaryData.weeklyActivity ||
                                                    0}
                                            </p>
                                            <p className="text-sm text-green-700">
                                                Activities
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold text-purple-900">
                                                This Month
                                            </h3>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {summaryData.activeSessions ||
                                                    0}
                                            </p>
                                            <p className="text-sm text-purple-700">
                                                Activities
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold text-orange-900">
                                                Active Users
                                            </h3>
                                            <p className="text-2xl font-bold text-orange-600">
                                                {summaryData.topActiveUsers
                                                    ?.length || 0}
                                            </p>
                                            <p className="text-sm text-orange-700">
                                                Users
                                            </p>
                                        </div>
                                    </div>

                                    {summaryData.topActiveUsers &&
                                        summaryData.topActiveUsers.length >
                                            0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                                    Most Active Users
                                                </h3>
                                                <div className="space-y-2">
                                                    {summaryData.topActiveUsers
                                                        .slice(0, 5)
                                                        .map(
                                                            (user: {
                                                                userId: string;
                                                                userName: string;
                                                                activityCount: number;
                                                                lastActivity: string;
                                                            }) => (
                                                                <div
                                                                    key={
                                                                        user.userId
                                                                    }
                                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                                >
                                                                    <div>
                                                                        <span className="font-medium">
                                                                            {
                                                                                user.userName
                                                                            }
                                                                        </span>
                                                                        <span className="text-sm text-gray-500 ml-2">
                                                                            Last
                                                                            activity:{' '}
                                                                            {format(
                                                                                new Date(
                                                                                    user.lastActivity,
                                                                                ),
                                                                                'MMM dd, HH:mm',
                                                                            )}
                                                                            )
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {
                                                                            user.activityCount
                                                                        }{' '}
                                                                        activities
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    No summary data available
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Session Modal */}
            {selectedSessionId && (
                <UserSessionModal
                    sessionId={selectedSessionId}
                    isOpen={!!selectedSessionId}
                    onClose={() => setSelectedSessionId(null)}
                />
            )}
        </DashboardLayout>
    );
};

export default UserActivityPage;
