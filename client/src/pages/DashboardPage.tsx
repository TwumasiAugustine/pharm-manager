import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { DashboardFilter } from '../components/molecules/DashboardFilter';
import { OverviewCards } from '../components/molecules/OverviewCards';
import { SalesTrendsChart } from '../components/molecules/SalesTrendsChart';
import { TopSellingDrugsChart } from '../components/molecules/TopSellingDrugsChart';
import { LowStockDrugs } from '../components/molecules/LowStockDrugs';
import { useDashboardAnalytics } from '../hooks/useDashboard';
import type { DashboardFilters } from '../types/dashboard.types';

const DashboardPage: React.FC = () => {
    const [filters, setFilters] = React.useState<DashboardFilters>({
        period: 'week',
        startDate: '',
        endDate: '',
    });

    const {
        data: dashboardData,
        isLoading,
        isError,
    } = useDashboardAnalytics(filters);

    const handleFilterChange = (newFilters: DashboardFilters) => {
        setFilters(newFilters);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (isError) {
        return (
            <DashboardLayout>
                <div className="bg-red-50 border border-red-300 rounded-md p-4 text-center">
                    <p className="text-red-600">
                        Failed to load dashboard data. Please try again later.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Section - Responsive */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <div className="w-full sm:w-auto">
                        <DashboardFilter
                            filters={filters}
                            onFiltersChange={handleFilterChange}
                        />
                    </div>
                </div>

                {dashboardData && (
                    <>
                        {/* Overview Cards */}
                        <OverviewCards overview={dashboardData.overview} />

                        {/* Charts Section - Responsive Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                            <SalesTrendsChart
                                data={dashboardData.charts.salesByPeriod}
                            />
                            <TopSellingDrugsChart
                                data={dashboardData.charts.topSellingDrugs}
                            />
                        </div>

                        {/* Low Stock Drugs */}
                        <LowStockDrugs
                            data={dashboardData.charts.lowStockDrugs}
                        />
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
