import { useState, useRef, useEffect } from 'react';
import { useReports } from './useReports';
import { useSafeNotify } from '../utils/useSafeNotify';
import { useDisplayMode } from './useDisplayMode';
import type { ReportFilters } from '../types/report.types';
import { useURLFilters } from './useURLSearch';

export const useReportsPage = () => {
    const [showFilters, setShowFilters] = useState(true);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const actionsDropdownRef = useRef<HTMLDivElement>(null);
    const notify = useSafeNotify();
    const { setExportMode } = useDisplayMode();

    // URL-based filters for reports page
    const { filters, setFilter, setFilters } = useURLFilters(
        {
            dateRange: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                end: new Date().toISOString().split('T')[0],
            },
            reportType: 'sales' as
                | 'sales'
                | 'inventory'
                | 'expiry'
                | 'financial',
            format: 'table' as 'table' | 'chart',
            page: 1,
            limit: 5, // Set limit to 5 for screen display
            branchId: undefined as string | undefined,
        },
        {
            debounceMs: 300,
            onFiltersChange: (newFilters) => {
                console.log('Report filters changed:', newFilters);
            },
        },
    );

    // Close actions dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                actionsDropdownRef.current &&
                !actionsDropdownRef.current.contains(event.target as Node)
            ) {
                setShowActionsDropdown(false);
            }
        };

        if (showActionsDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActionsDropdown]);

    const {
        reportData,
        reportSummary,
        totalRecords,
        currentPage,
        totalPages,
        isLoading,
        isGenerating,
        generateReport,
        exportReport,
        refreshData,
    } = useReports({ ...filters, branchId: filters.branchId });

    const handleFilterChange = (newFilters: ReportFilters) => {
        // Update URL filters using setFilters to handle all changes at once
        setFilters({ ...newFilters, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilter('page', page);
    };

    const handleExportReport = async (format: 'pdf' | 'csv') => {
        try {
            // Set export mode to true for full number formatting
            setExportMode(true);

            // Create export filters without pagination to get all data
            const exportFilters = {
                ...filters,
                page: undefined,
                limit: undefined,
            };
            await exportReport(format, exportFilters);
        } catch (error) {
            console.error('Export failed:', error);
            notify.error('Failed to export report. Please try again.');
        } finally {
            // Reset to display mode
            setExportMode(false);
        }
    };

    const handleGenerateReport = async () => {
        try {
            // Set export mode to true for full number formatting during generation
            setExportMode(true);
            await generateReport(filters);
        } catch (error) {
            console.error('Report generation failed:', error);
            notify.error('Failed to generate report. Please try again.');
        } finally {
            // Reset to display mode
            setExportMode(false);
        }
    };

    return {
        // State
        showFilters,
        showActionsDropdown,
        filters,
        branchId: filters.branchId || '',
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
        setBranchId: (branchId: string) => setFilter('branchId', branchId),
        handleFilterChange,
        handlePageChange,
        handleExportReport,
        handleGenerateReport,
        refreshData,
        notify,
    };
};
