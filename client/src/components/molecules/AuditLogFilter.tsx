import React, { useState, useMemo } from 'react';
import type { AuditLogFilters } from '../../types/audit-log.types';
import { useDebounceFunction } from '../../hooks/useDebounceFunction';
import { useBranches } from '../../hooks/useBranches';
import { AuditLogFilterHeader } from './audit-log-filter/AuditLogFilterHeader';
import { AuditLogQuickFilters } from './audit-log-filter/AuditLogQuickFilters';
import { AuditLogMainFilters } from './audit-log-filter/AuditLogMainFilters';
import { AuditLogDateRange } from './audit-log-filter/AuditLogDateRange';
import { AuditLogAdvancedFilters } from './audit-log-filter/AuditLogAdvancedFilters';

interface AuditLogFilterProps {
    filters: AuditLogFilters;
    onFiltersChange: (filters: AuditLogFilters) => void;
    onRefresh: () => void;
    onCleanup?: () => void;
    isLoading?: boolean;
    className?: string;
    isCollapsible?: boolean;
}

export const AuditLogFilter: React.FC<AuditLogFilterProps> = ({
    filters,
    onFiltersChange,
    onRefresh,
    onCleanup,
    isLoading = false,
    className = '',
    isCollapsible = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Get pharmacy and branch data for filters
    const { data: branches } = useBranches();

    // Debounced filter changes - fix the function to properly handle updates
    const debouncedFilterChange = useDebounceFunction(
        (updatedFilters: Partial<AuditLogFilters>) => {
            onFiltersChange({
                ...filters,
                ...updatedFilters,
                page: 1, // Reset to first page when filters change
            });
        },
        300,
    );

    const handleFilterChange = (
        key: keyof AuditLogFilters,
        value: string | number | undefined,
    ) => {
        // Convert empty strings to undefined
        const processedValue = value === '' ? undefined : value;

        // For immediate UI feedback, update filters directly for certain fields
        if (
            key === 'action' ||
            key === 'resource' ||
            key === 'userRole' ||
            key === 'pharmacyId' ||
            key === 'branchId' ||
            key === 'startDate' ||
            key === 'endDate'
        ) {
            onFiltersChange({
                ...filters,
                [key]: processedValue,
                page: 1,
            });
        } else {
            // Use debounced function for text inputs
            debouncedFilterChange({ [key]: processedValue });
        }
    };

    // Enhanced quick filter presets
    const applyQuickFilter = (quickFilterData: Partial<AuditLogFilters>) => {
        // Reset all filters and apply only the quick filter data
        onFiltersChange({
            userId: undefined,
            pharmacyId: undefined,
            branchId: undefined,
            action: undefined,
            resource: undefined,
            startDate: undefined,
            endDate: undefined,
            userRole: undefined,
            page: 1,
            limit: filters.limit || 20,
            ...quickFilterData,
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            userId: undefined,
            pharmacyId: undefined,
            branchId: undefined,
            action: undefined,
            resource: undefined,
            startDate: undefined,
            endDate: undefined,
            userRole: undefined,
            page: 1,
            limit: filters.limit || 20,
        });
    };

    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.userId ||
            filters.pharmacyId ||
            filters.branchId ||
            filters.action ||
            filters.resource ||
            filters.startDate ||
            filters.endDate ||
            filters.userRole
        );
    }, [filters]);

    const activeFilterCount = useMemo(() => {
        return Object.entries(filters).filter(
            ([key, value]) => value && key !== 'page' && key !== 'limit',
        ).length;
    }, [filters]);

    return (
        <div
            className={`bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}
        >
            <AuditLogFilterHeader
                hasActiveFilters={hasActiveFilters}
                activeFilterCount={activeFilterCount}
                isLoading={!!isLoading}
                isCollapsible={!!isCollapsible}
                isExpanded={isExpanded}
                onRefresh={onRefresh}
                onCleanup={onCleanup}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
            />

            {/* Enhanced Filter Content */}
            {isExpanded && (
                <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50 to-white">
                    <AuditLogQuickFilters
                        hasActiveFilters={hasActiveFilters}
                        onApplyFilter={applyQuickFilter}
                        onClearFilters={clearFilters}
                    />

                    <AuditLogMainFilters
                        filters={filters}
                        branches={branches}
                        onFilterChange={handleFilterChange}
                    />

                    <AuditLogDateRange
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />

                    <AuditLogAdvancedFilters
                        filters={filters}
                        showAdvanced={showAdvanced}
                        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
                        onFilterChange={handleFilterChange}
                    />
                </div>
            )}
        </div>
    );
};

export default AuditLogFilter;
