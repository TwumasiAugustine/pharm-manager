import { useState, useRef, useEffect } from 'react';
import { useExpiry } from './useExpiry';
import { useCronTriggers } from './useCron';
import { useSafeNotify } from '../utils/useSafeNotify';
import { useAuthStore } from '../store/auth.store';
import type { ExpiryFilters } from '../types/expiry.types';
import { formatGHSDisplayAmount } from '../utils/currency';

export const useExpiryPage = () => {
    const { user } = useAuthStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const filterDropdownRef = useRef<HTMLDivElement>(null);
    const actionsDropdownRef = useRef<HTMLDivElement>(null);
    const notificationsDropdownRef = useRef<HTMLDivElement>(null);
    const notify = useSafeNotify();
    const { triggerExpiryNotifications } = useCronTriggers();
    const [filters, setFilters] = useState<ExpiryFilters>({
        daysRange: 30,
        alertLevel: undefined,
        category: '',
    });

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // For desktop filter dropdown
            if (
                filterDropdownRef.current &&
                !filterDropdownRef.current.contains(event.target as Node) &&
                window.innerWidth >= 640
            ) {
                setShowFilters(false);
            }

            // For mobile, close filter when clicking outside any filter-related element
            if (window.innerWidth < 640 && showFilters) {
                const target = event.target as Element;
                const isFilterButton = target.closest('[data-filter-trigger]');
                const isFilterPanel = target.closest('[data-filter-panel]');

                if (!isFilterButton && !isFilterPanel) {
                    setShowFilters(false);
                }
            }

            // For actions dropdown
            if (
                actionsDropdownRef.current &&
                !actionsDropdownRef.current.contains(event.target as Node)
            ) {
                setShowActionsDropdown(false);
            }

            // For notifications dropdown (desktop only)
            if (
                notificationsDropdownRef.current &&
                !notificationsDropdownRef.current.contains(
                    event.target as Node,
                ) &&
                window.innerWidth >= 1024
            ) {
                setShowNotifications(false);
            }
        };

        if (showFilters || showActionsDropdown || showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFilters, showActionsDropdown, showNotifications]);

    const {
        expiringDrugs,
        expiryStats,
        notifications,
        isLoading: drugsLoading,
        isStatsLoading,
        refreshData,
    } = useExpiry(filters);

    // Defensive programming: ensure notifications is an array
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const unreadNotifications = safeNotifications.filter(
        (n) => !n.isRead,
    ).length;

    const handleFilterChange = (newFilters: ExpiryFilters) => {
        setFilters(newFilters);
    };

    const handleExportData = () => {
        if (!expiringDrugs || expiringDrugs.length === 0) {
            notify.warning('No data to export');
            return;
        }

        // Create CSV content
        const headers = [
            'Drug Name',
            'Brand',
            'Category',
            'Batch Number',
            'Expiry Date',
            'Days Until Expiry',
            'Quantity',
            'Price',
            'Total Value',
            'Alert Level',
        ];

        const csvContent = [
            headers.join(','),
            ...expiringDrugs.map((drug) =>
                [
                    `"${drug.drugName}"`,
                    `"${drug.brand}"`,
                    `"${drug.category}"`,
                    `"${drug.batchNumber}"`,
                    `"${drug.expiryDate}"`,
                    drug.daysUntilExpiry,
                    drug.quantity,
                    `"${formatGHSDisplayAmount(drug.price)}"`,
                    `"${formatGHSDisplayAmount(drug.quantity * drug.price)}"`,
                    `"${drug.alertLevel}"`,
                ].join(','),
            ),
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expiry-report-${
            new Date().toISOString().split('T')[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return {
        // State
        user,
        showNotifications,
        showFilters,
        showActionsDropdown,
        filters,
        expiringDrugs,
        expiryStats,
        notifications: safeNotifications,
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
        notify,
    };
};

export default useExpiryPage;
