import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { UserActivityFilter } from '../components/organisms/UserActivityFilter';
import { UserActivityTable } from '../components/organisms/UserActivityTable';
import { UserSessionModal } from '../components/organisms/UserSessionModal';
import { UserActivityHeader } from '../components/organisms/UserActivityHeader';
import { UserActivityTabs } from '../components/organisms/UserActivityTabs';
import { UserActivityStatsSection } from '../components/organisms/UserActivityStatsSection';
import { RoleContextInfo } from '../components/molecules/RoleContextInfo';
import { ActiveSessionsTable } from '../components/organisms/ActiveSessionsTable';
import { UserActivitySummary } from '../components/organisms/UserActivitySummary';
import { UserActivityAnalytics } from '../components/organisms/UserActivityAnalytics';
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
    FaUsers,
    FaChartBar,
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
                <UserActivityHeader
                    canAccessSystemFeatures={canAccessSystemFeatures()}
                    cleanupPending={cleanupMutation.isPending}
                    showFilters={showFilters}
                    onCleanup={handleCleanup}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                />

                <UserActivityTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <UserActivityStatsSection
                    stats={statsData}
                    isLoading={isLoadingStats}
                    error={statsError as Error | null}
                />

                <RoleContextInfo
                    userRole={user?.role || UserRole.CASHIER}
                />

                {activeTab === 'activities' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

                        <div className="lg:col-span-3">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                                <FaListAlt className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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

                {activeTab === 'analytics' && <UserActivityAnalytics />}

                {activeTab === 'sessions' && (
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                            <FaUsers className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            Active User Sessions
                        </h2>
                        <ActiveSessionsTable
                            sessions={activeSessionsData || []}
                            isLoading={isLoadingSessions}
                            error={sessionsError as Error | null}
                            onViewSession={handleViewSession}
                        />
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                            <FaChartBar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            Activity Summary
                        </h2>
                        <UserActivitySummary
                            summary={summaryData}
                            isLoading={isLoadingSummary}
                            error={summaryError as Error | null}
                        />
                    </div>
                )}
            </div>

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
