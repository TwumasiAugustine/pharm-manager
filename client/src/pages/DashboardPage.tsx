import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { DashboardFilter } from '../components/molecules/DashboardFilter';
import { OverviewCards } from '../components/molecules/OverviewCards';
import { SalesTrendsChart } from '../components/molecules/SalesTrendsChart';
import { TopSellingDrugsChart } from '../components/molecules/TopSellingDrugsChart';
import { SaleTypeDistributionChart } from '../components/molecules/SaleTypeDistributionChart';
import { ProfitMarginAnalysisChart } from '../components/molecules/ProfitMarginAnalysisChart';
import { LowStockDrugs } from '../components/molecules/LowStockDrugs';
import { useDashboardAnalytics } from '../hooks/useDashboard';
import type { DashboardFilters } from '../types/dashboard.types';
import SEOMetadata from '../components/atoms/SEOMetadata';
import { useSEO, SEO_PRESETS } from '../hooks/useSEO';
import { useURLFilters } from '../hooks/useURLSearch';

const DashboardPage: React.FC = () => {
    // URL-based filters for dashboard
    const { filters, setFilters } = useURLFilters(
        {
            period: 'week' as 'day' | 'week' | 'month' | 'year',
            startDate: undefined as string | undefined,
            endDate: undefined as string | undefined,
            branchId: undefined as string | undefined,
        },
        {
            debounceMs: 300,
            onFiltersChange: (newFilters) => {
                console.log('Dashboard filters changed:', newFilters);
            },
        },
    );

    const {
        data: dashboardData,
        isLoading,
        isError,
    } = useDashboardAnalytics(filters);

    // Generate SEO metadata for the dashboard
    const seoData = useSEO({
        ...SEO_PRESETS.dashboard,
        structuredDataType: 'WebApplication',
        preloadFonts: true,
    });

    const handleFilterChange = (newFilters: DashboardFilters) => {
        // Update URL filters using setFilters to handle all changes at once
        setFilters(newFilters);
    };

    return (
        <DashboardLayout>
            {/* SEO Metadata - React 19 will hoist to <head> */}
            <SEOMetadata {...seoData} />

            <div className="space-y-4 sm:space-y-6">
                {/* Header Section - Responsive */}
                <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-start lg:space-y-0 lg:space-x-4">
                    {/* <div className="flex-shrink-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Dashboard
                        </h1>
                    </div> */}
                    <div className="w-full lg:w-auto lg:flex-shrink-0">
                        <DashboardFilter
                            filters={filters}
                            onFiltersChange={handleFilterChange}
                        />
                    </div>
                </div>

                {/* Error State */}
                {isError && (
                    <div className="bg-red-50 border border-red-300 rounded-md p-4 text-center">
                        <p className="text-red-600">
                            Failed to load dashboard data. Please try again
                            later.
                        </p>
                    </div>
                )}

                {/* Overview Cards */}
                <OverviewCards
                    overview={
                        dashboardData?.overview || {
                            totalRevenue: 0,
                            totalProfit: 0,
                            totalSales: 0,
                            totalCustomers: 0,
                            totalDrugs: 0,
                            lowStockCount: 0,
                            profitMargin: 0,
                            averageOrderValue: 0,
                        }
                    }
                    isLoading={isLoading}
                />

                {/* Main Charts Section - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                    <SalesTrendsChart
                        data={dashboardData?.charts?.salesByPeriod || []}
                        isLoading={isLoading}
                    />
                    <TopSellingDrugsChart
                        data={dashboardData?.charts?.topSellingDrugs || []}
                        isLoading={isLoading}
                    />
                </div>

                {/* Analytics Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                    <SaleTypeDistributionChart
                        data={dashboardData?.charts?.saleTypeDistribution || []}
                        isLoading={isLoading}
                    />
                    <ProfitMarginAnalysisChart
                        data={dashboardData?.charts?.profitMarginAnalysis || []}
                        isLoading={isLoading}
                    />
                </div>

                {/* Low Stock Drugs */}
                <LowStockDrugs
                    data={dashboardData?.charts?.lowStockDrugs || []}
                    isLoading={isLoading}
                />
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
