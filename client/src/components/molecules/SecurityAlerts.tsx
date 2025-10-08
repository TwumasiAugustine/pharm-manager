import React from 'react';
import { format } from 'date-fns';
import { FiAlertTriangle, FiShield, FiUser, FiClock } from 'react-icons/fi';
import type { AuditLogResponse } from '../../types/audit-log.types';
import { Badge } from '../atoms/Badge';

interface SecurityAlertsProps {
    alerts: AuditLogResponse[];
    isLoading?: boolean;
    hours?: number;
}

const getSeverityColor = (action: string, resource: string) => {
    // High severity for login failures, system modifications, user deletions
    if (action === 'LOGIN' && resource === 'SYSTEM') return 'danger';
    if (action === 'DELETE' && resource === 'USER') return 'danger';
    if (action === 'UPDATE' && resource === 'SYSTEM') return 'warning';
    if (action === 'CREATE' && resource === 'USER') return 'info';
    return 'secondary';
};

const getAlertIcon = (action: string, resource: string) => {
    const severity = getSeverityColor(action, resource);
    const iconClass = `h-5 w-5 ${
        severity === 'danger'
            ? 'text-red-600'
            : severity === 'warning'
            ? 'text-yellow-600'
            : severity === 'info'
            ? 'text-blue-600'
            : 'text-gray-600'
    }`;

    if (action === 'LOGIN') return <FiShield className={iconClass} />;
    if (resource === 'USER') return <FiUser className={iconClass} />;
    return <FiAlertTriangle className={iconClass} />;
};

export const SecurityAlerts: React.FC<SecurityAlertsProps> = ({
    alerts,
    isLoading = false,
    hours = 24,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex space-x-4">
                            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!alerts || alerts.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FiShield className="h-5 w-5 mr-2 text-green-600" />
                        Security Alerts
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="h-4 w-4 mr-1" />
                        Last {hours}h
                    </div>
                </div>
                <div className="text-center py-8">
                    <FiShield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                        All Clear!
                    </h4>
                    <p className="text-gray-500">
                        No security alerts in the last {hours} hours.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiAlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Security Alerts
                    <Badge variant="danger" size="sm" className="ml-2">
                        {alerts.length}
                    </Badge>
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                    <FiClock className="h-4 w-4 mr-1" />
                    Last {hours}h
                </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border-l-4 border-red-400"
                    >
                        <div className="flex-shrink-0">
                            {getAlertIcon(alert.action, alert.resource)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                    <Badge
                                        variant={getSeverityColor(
                                            alert.action,
                                            alert.resource,
                                        )}
                                        size="sm"
                                    >
                                        {alert.action}
                                    </Badge>
                                    <Badge variant="secondary" size="sm">
                                        {alert.resource}
                                    </Badge>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {format(
                                        new Date(alert.timestamp),
                                        'MMM dd, HH:mm',
                                    )}
                                </span>
                            </div>

                            <p className="text-sm text-gray-900 font-medium mb-1">
                                {alert.details.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-4">
                                    <span>User: {alert.userName}</span>
                                    {alert.details.userRole && (
                                        <span>
                                            Role: {alert.details.userRole}
                                        </span>
                                    )}
                                    {alert.pharmacyName && (
                                        <span>
                                            Pharmacy: {alert.pharmacyName}
                                        </span>
                                    )}
                                </div>
                                {alert.details.ipAddress && (
                                    <span>IP: {alert.details.ipAddress}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {alerts.length > 10 && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        Showing latest 10 alerts. Total: {alerts.length}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SecurityAlerts;
