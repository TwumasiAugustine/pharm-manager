import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { ExpiryPageHeader } from '../components/organisms/ExpiryPageHeader';
import { ExpiryPageFilters } from '../components/organisms/ExpiryPageFilters';
import { ExpiryPageContent } from '../components/organisms/ExpiryPageContent';
import { NotificationPanel } from '../components/molecules/NotificationPanel';
import { BranchSelect } from '../components/molecules/BranchSelect';
import { useExpiryPage } from '../hooks/useExpiryPage';

export const ExpiryPage: React.FC = () => {
    const {
        // State
        user,
        showNotifications,
        showFilters,
        showActionsDropdown,
        filters,
        branchId,
        expiringDrugs,
        expiryStats,
        unreadNotifications,
        drugsLoading,
        isStatsLoading,

        // Refs
        filterDropdownRef,
        actionsDropdownRef,
        notificationsDropdownRef,

        // Actions
        setShowNotifications,
        setShowFilters,
        setShowActionsDropdown,
        setBranchId,
        handleFilterChange,
        handleExportData,
        refreshData,
        triggerExpiryNotifications,
    } = useExpiryPage();

    return (
        <DashboardLayout>
            <div className="min-h-full bg-gray-50 -m-4 sm:-m-6">
                {/* Header */}
                <div className="relative">
                    <ExpiryPageHeader
                        user={user}
                        onRefresh={refreshData}
                        onExport={handleExportData}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        onToggleNotifications={() =>
                            setShowNotifications(!showNotifications)
                        }
                        onTriggerNotifications={() =>
                            triggerExpiryNotifications.mutate()
                        }
                        isLoading={drugsLoading}
                        isTriggering={triggerExpiryNotifications.isPending}
                        unreadNotifications={unreadNotifications}
                        expiringDrugs={expiringDrugs || []}
                        notificationsDropdownRef={
                            notificationsDropdownRef as React.RefObject<HTMLDivElement>
                        }
                        showActionsDropdown={showActionsDropdown}
                        setShowActionsDropdown={setShowActionsDropdown}
                        actionsDropdownRef={
                            actionsDropdownRef as React.RefObject<HTMLDivElement>
                        }
                    />

                    {/* Branch Filter */}
                    <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b">
                        <div className="flex items-center gap-3">
                            <BranchSelect
                                value={branchId}
                                onChange={setBranchId}
                            />
                        </div>
                    </div>

                    {/* Filter Dropdowns */}
                    <ExpiryPageFilters
                        showFilters={showFilters}
                        filters={filters}
                        onFiltersChange={handleFilterChange}
                        onCloseFilters={() => setShowFilters(false)}
                        filterDropdownRef={
                            filterDropdownRef as React.RefObject<HTMLDivElement>
                        }
                    />

                    {/* Desktop Notification Dropdown */}
                    {showNotifications && (
                        <div className="hidden lg:block absolute top-full right-8 mt-2 w-80 lg:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <NotificationPanel
                                isOpen={true}
                                onClose={() => setShowNotifications(false)}
                                className=""
                            />
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <ExpiryPageContent
                    expiryStats={expiryStats ?? null}
                    isStatsLoading={isStatsLoading}
                    expiringDrugs={expiringDrugs || []}
                    drugsLoading={drugsLoading}
                    filters={filters}
                />

                {/* Mobile/Tablet Notification Panel */}
                <div className="lg:hidden">
                    <NotificationPanel
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                        className="fixed top-24 sm:top-28 right-4 w-80 z-50"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ExpiryPage;
