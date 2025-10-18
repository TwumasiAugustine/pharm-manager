import React, { useState, useMemo } from 'react';
import type { AuditLogFilters } from '../../types/audit-log.types';
import { useDebounceFunction } from '../../hooks/useDebounceFunction';
import { useBranches } from '../../hooks/useBranches';
import { useAuditLogQuickFilters } from '../../hooks/useAuditLogQuickFilters';
import { AuditLogFilterHeader } from './audit-log/AuditLogFilterHeader';
import { AuditLogQuickFilters } from './audit-log/AuditLogQuickFilters';
import { AuditLogAdvancedFilters } from './audit-log/AuditLogAdvancedFilters';

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

    const { data: branches } = useBranches();
    const quickFilters = useAuditLogQuickFilters();

    const debouncedFilterChange = useDebounceFunction(
        (updatedFilters: Partial<AuditLogFilters>) => {
            onFiltersChange({
                ...filters,
                ...updatedFilters,
                page: 1,
            });
        },
        300,
    );

    const handleFilterChange = (
        key: keyof AuditLogFilters,
        value: string | number | undefined,
    ) => {
        const processedValue = value === '' ? undefined : value;

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
            debouncedFilterChange({ [key]: processedValue });
        }
    };

    const applyQuickFilter = (quickFilterData: Partial<AuditLogFilters>) => {
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
            className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}
        >
            <AuditLogFilterHeader
                activeFilterCount={activeFilterCount}
                hasActiveFilters={hasActiveFilters}
                isExpanded={isExpanded}
                isCollapsible={isCollapsible}
                isLoading={isLoading || false}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                onRefresh={onRefresh}
                onClearFilters={clearFilters}
                onCleanup={onCleanup}
            />

            {isExpanded && (
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50 to-white">
                    <AuditLogQuickFilters
                        quickFilters={quickFilters}
                        onApplyFilter={applyQuickFilter}
                    />

                    <AuditLogAdvancedFilters
                        filters={filters}
                        branches={branches?.branches || []}
                        onFilterChange={handleFilterChange}
                    />
                </div>
            )}
        </div>
    );
};
