import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { UserActivityFilter } from '../components/organisms/UserActivityFilter';
import { UserActivityTable } from '../components/organisms/UserActivityTable';
import { UserActivityStats } from '../components/organisms/UserActivityStats';
import { UserSessionModal } from '../components/organisms/UserSessionModal';
import {
    useUserActivities,
    useUserActivityStats,
} from '../hooks/useUserActivity';
import { useDebounce } from '../hooks/useDebounce';
import type { UserActivityFilters } from '../types/user-activity.types';
import { FaChartLine, FaListAlt, FaFilter } from 'react-icons/fa';

const UserActivityPage: React.FC = () => {
    const [filters, setFilters] = useState<UserActivityFilters>({
        page: 1,
        limit: 10,
    });
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
        null,
    );
    const [showFilters, setShowFilters] = useState(false);

    const debouncedFilters = useDebounce(filters, 500);

    const {
        data: activitiesData,
        isLoading: isLoadingActivities,
        error: activitiesError,
    } = useUserActivities(debouncedFilters);
    const {
        data: statsData,
        isLoading: isLoadingStats,
        error: statsError,
    } = useUserActivityStats({
        startDate: debouncedFilters.startDate,
        endDate: debouncedFilters.endDate,
    });

    const handleFilterChange = (newFilters: Partial<UserActivityFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleViewSession = (sessionId: string) => {
        setSelectedSessionId(sessionId);
    };

    return (
        <DashboardLayout>
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
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="sm:hidden mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <FaFilter className="mr-2" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
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

                {/* Main Content */}
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
                                currentPage: activitiesData?.currentPage || 1,
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
