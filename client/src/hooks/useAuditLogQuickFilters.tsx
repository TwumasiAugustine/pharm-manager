import { useMemo } from 'react';
import { FiClock, FiCalendar, FiUser, FiSettings } from 'react-icons/fi';
import type { AuditLogFilters } from '../types/audit-log.types';

export const useAuditLogQuickFilters = () => {
    return useMemo(
        () => [
            {
                label: 'Today',
                icon: <FiClock className="h-3 w-3" />,
                filters: {
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                } as Partial<AuditLogFilters>,
            },
            {
                label: 'Last 7 Days',
                icon: <FiCalendar className="h-3 w-3" />,
                filters: {
                    startDate: new Date(
                        Date.now() - 7 * 24 * 60 * 60 * 1000,
                    )
                        .toISOString()
                        .split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                } as Partial<AuditLogFilters>,
            },
            {
                label: 'Last 30 Days',
                icon: <FiCalendar className="h-3 w-3" />,
                filters: {
                    startDate: new Date(
                        Date.now() - 30 * 24 * 60 * 60 * 1000,
                    )
                        .toISOString()
                        .split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                } as Partial<AuditLogFilters>,
            },
            {
                label: 'Login Activities',
                icon: <FiUser className="h-3 w-3" />,
                filters: {
                    action: 'LOGIN' as const,
                } as Partial<AuditLogFilters>,
            },
            {
                label: 'User Management',
                icon: <FiUser className="h-3 w-3" />,
                filters: {
                    resource: 'USER' as const,
                } as Partial<AuditLogFilters>,
            },
            {
                label: 'Sales Activities',
                icon: <FiSettings className="h-3 w-3" />,
                filters: {
                    resource: 'SALE' as const,
                } as Partial<AuditLogFilters>,
            },
            {
                label: 'System Changes',
                icon: <FiSettings className="h-3 w-3" />,
                filters: {
                    resource: 'SYSTEM' as const,
                } as Partial<AuditLogFilters>,
            },
        ],
        [],
    );
};
