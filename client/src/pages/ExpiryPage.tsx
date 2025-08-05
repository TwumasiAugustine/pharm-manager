import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { ExpiryPageHeader } from '../components/organisms/ExpiryPageHeader';
import { ExpiryPageActions } from '../components/organisms/ExpiryPageActions';
import { ExpiryPageFilters } from '../components/organisms/ExpiryPageFilters';
import { ExpiryPageContent } from '../components/organisms/ExpiryPageContent';
import { NotificationPanel } from '../components/molecules/NotificationPanel';
import { useExpiryPage } from '../hooks/useExpiryPage';

export const ExpiryPage: React.FC = () => {
    const {
        // State
        user,
        showNotifications,
        showFilters,
        showActionsDropdown,
        filters,
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
                        onRefresh={() => refreshData()}
                        onExport={handleExportData}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        onToggleNotifications={() =>
                            setShowNotifications(!showNotifications)
                        }
                        onTriggerNotifications={() =>
                            triggerExpiryNotifications.mutate()
                        }
                        showFilters={showFilters}
                        isLoading={drugsLoading}
                        isTriggering={triggerExpiryNotifications.isPending}
                        unreadNotifications={unreadNotifications}
                        expiringDrugs={expiringDrugs || []}
                        notificationsDropdownRef={
                            notificationsDropdownRef as React.RefObject<HTMLDivElement>
                        }
                    />

                    {/* Mobile/Tablet Actions */}
                    <div className="absolute top-4 right-4 sm:hidden">
                        <ExpiryPageActions
                            user={user}
                            showActionsDropdown={showActionsDropdown}
                            onToggleActionsDropdown={() =>
                                setShowActionsDropdown(!showActionsDropdown)
                            }
                            onToggleFilters={() => setShowFilters(true)}
                            onRefresh={() => refreshData()}
                            onTriggerNotifications={() =>
                                triggerExpiryNotifications.mutate()
                            }
                            onExport={handleExportData}
                            onToggleNotifications={() =>
                                setShowNotifications(!showNotifications)
                            }
                            isLoading={drugsLoading}
                            isTriggering={triggerExpiryNotifications.isPending}
                            expiringDrugs={expiringDrugs || []}
                            unreadNotifications={unreadNotifications}
                            actionsDropdownRef={
                                actionsDropdownRef as React.RefObject<HTMLDivElement>
                            }
                        />
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
