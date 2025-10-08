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
    useActivityAnalytics,
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
        'activities' | 'sessions' | 'summary' | 'analytics'
    >('activities');

    // URL-based filters for user activity
    const { filters, setFilter, setFilters } = useURLFilters(
        {
            page: 1,
            limit: 10,
            userId: undefined,
            sessionId: undefined,
            activityType: undefined,
            resource: undefined,
            startDate: undefined,
            endDate: undefined,
            isActive: undefined,
            userRole: undefined,
            ipAddress: undefined,
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
        // Use setFilters to update all filters at once to avoid debouncing issues
        setFilters(newFilters as Partial<Record<string, unknown>>);
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
        { id: 'analytics', label: 'Analytics', icon: FaChartLine },
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

                {activeTab === 'analytics' && <AnalyticsTab />}

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
                                                {typeof summaryData.todayActivity ===
                                                'object'
                                                    ? summaryData.todayActivity
                                                          ?.totalActivities || 0
                                                    : summaryData.todayActivity ||
                                                      0}
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
                                                {typeof summaryData.weeklyActivity ===
                                                'object'
                                                    ? summaryData.weeklyActivity
                                                          ?.totalActivities || 0
                                                    : summaryData.weeklyActivity ||
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

// Analytics Tab Component
const AnalyticsTab: React.FC = () => {
    const [timeframe, setTimeframe] = useState<
        'today' | 'week' | 'month' | 'quarter'
    >('week');
    const [selectedResource, setSelectedResource] = useState<string>('');

    const {
        data: analyticsData,
        isLoading: isLoadingAnalytics,
        error: analyticsError,
    } = useActivityAnalytics({
        timeframe,
        resource: selectedResource || undefined,
    });

    const activitySummary = analyticsData?.summary;
    const stats = analyticsData?.stats;

    return (
        <div className="space-y-6">
            {/* Analytics Header with Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FaChartLine className="mr-2" />
                        Activity Analytics
                    </h2>
                    <div className="flex gap-3 mt-3 sm:mt-0">
                        <select
                            value={timeframe}
                            onChange={(e) =>
                                setTimeframe(
                                    e.target.value as
                                        | 'today'
                                        | 'week'
                                        | 'month'
                                        | 'quarter',
                                )
                            }
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                        </select>
                        <select
                            value={selectedResource}
                            onChange={(e) =>
                                setSelectedResource(e.target.value)
                            }
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Resources</option>
                            <option value="DRUG">Drugs</option>
                            <option value="SALE">Sales</option>
                            <option value="CUSTOMER">Customers</option>
                            <option value="USER">Users</option>
                            <option value="BRANCH">Branches</option>
                            <option value="REPORT">Reports</option>
                        </select>
                    </div>
                </div>

                {isLoadingAnalytics ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">
                            Loading analytics...
                        </span>
                    </div>
                ) : analyticsError ? (
                    <div className="text-red-600 text-center py-4">
                        Error loading analytics:{' '}
                        {(analyticsError as Error).message}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800">
                                Total Activities
                            </h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {activitySummary?.todayActivity
                                    ?.totalActivities || 0}
                            </p>
                            <p className="text-xs text-blue-600">Today</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-green-800">
                                Weekly Activities
                            </h3>
                            <p className="text-2xl font-bold text-green-600">
                                {activitySummary?.weeklyActivity
                                    ?.totalActivities || 0}
                            </p>
                            <p className="text-xs text-green-600">This Week</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-purple-800">
                                Active Users
                            </h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats?.overview?.activeUsers || 0}
                            </p>
                            <p className="text-xs text-purple-600">
                                Currently Active
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Activity Breakdown by Resource */}
            {activitySummary?.todayActivity?.byResource && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Today's Activity by Resource
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(
                            activitySummary.todayActivity.byResource,
                        ).map(([resource, activities]) => (
                            <div
                                key={resource}
                                className="border-l-4 border-blue-500 pl-4"
                            >
                                <h4 className="font-medium text-gray-800 capitalize">
                                    {resource.toLowerCase()}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                    {(
                                        activities as Array<{
                                            action: string;
                                            count: number;
                                            uniqueUsers: number;
                                        }>
                                    ).map((activity, index: number) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 p-2 rounded text-sm"
                                        >
                                            <span className="font-medium">
                                                {activity.action}:
                                            </span>{' '}
                                            {activity.count}
                                            <br />
                                            <span className="text-gray-600 text-xs">
                                                {activity.uniqueUsers} users
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity Feed */}
            {activitySummary?.recentActivities &&
                activitySummary.recentActivities.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Recent Specific Activities
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {activitySummary.recentActivities.map(
                                (activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-900">
                                                    {activity.user.name}
                                                </span>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                    {activity.user.role}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1">
                                                {activity.activity.description}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                <span>
                                                    {format(
                                                        new Date(
                                                            activity.timestamp,
                                                        ),
                                                        'MMM dd, yyyy HH:mm',
                                                    )}
                                                </span>
                                                {activity.ipAddress && (
                                                    <span>
                                                        IP: {activity.ipAddress}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                            {activity.activity.resource}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}

            {/* Top Actions This Week */}
            {activitySummary?.weeklyActivity?.topActions &&
                activitySummary.weeklyActivity.topActions.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Top Actions This Week
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activitySummary.weeklyActivity.topActions
                                .slice(0, 6)
                                .map(
                                    (
                                        action: {
                                            action: string;
                                            resource: string;
                                            totalCount?: number;
                                            count?: number;
                                            uniqueUsers: number;
                                        },
                                        index: number,
                                    ) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-800 capitalize">
                                                    {action.action}{' '}
                                                    {action.resource.toLowerCase()}
                                                </span>
                                                <span className="text-2xl font-bold text-blue-600">
                                                    {action.totalCount ||
                                                        action.count}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {action.uniqueUsers} unique
                                                users
                                            </p>
                                        </div>
                                    ),
                                )}
                        </div>
                    </div>
                )}
        </div>
    );
};

export default UserActivityPage;
