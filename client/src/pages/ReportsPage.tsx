import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { ReportsPageHeader } from '../components/organisms/ReportsPageHeader';
import { ReportsPageFilters } from '../components/organisms/ReportsPageFilters';
import { ReportsPageContent } from '../components/organisms/ReportsPageContent';
import { ReportsPageSkeleton } from '../components/organisms/ReportsPageSkeleton';
import { useReportsPage } from '../hooks/useReportsPage';

export const ReportsPage: React.FC = () => {
    const {
        // State
        showFilters,
        showActionsDropdown,
        filters,
        reportData,
        reportSummary,
        totalRecords,
        currentPage,
        totalPages,
        isLoading,
        isGenerating,

        // Refs
        actionsDropdownRef,

        // Actions
        setShowFilters,
        setShowActionsDropdown,
        handleFilterChange,
        handlePageChange,
        handleExportReport,
        handleGenerateReport,
        refreshData,
    } = useReportsPage();

    // Show skeleton on initial load
    if (isLoading && !reportData?.length) {
        return <ReportsPageSkeleton />;
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <ReportsPageHeader
                    showFilters={showFilters}
                    showActionsDropdown={showActionsDropdown}
                    isLoading={isLoading}
                    isGenerating={isGenerating}
                    reportData={reportData}
                    actionsDropdownRef={
                        actionsDropdownRef as React.RefObject<HTMLDivElement>
                    }
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    onToggleActionsDropdown={() =>
                        setShowActionsDropdown(!showActionsDropdown)
                    }
                    onRefresh={refreshData}
                    onGenerateReport={handleGenerateReport}
                    onExportReport={handleExportReport}
                />

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Sidebar - Filters */}
                        <ReportsPageFilters
                            showFilters={showFilters}
                            filters={filters}
                            onFiltersChange={handleFilterChange}
                        />

                        {/* Main Content Area */}
                        <ReportsPageContent
                            filters={filters}
                            reportData={reportData}
                            reportSummary={reportSummary}
                            totalRecords={totalRecords}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            isLoading={isLoading}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReportsPage;
