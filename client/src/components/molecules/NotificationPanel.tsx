import React, { useState } from 'react';
import {
    FiBell,
    FiX,
    FiCheck,
    FiCheckCircle,
    FiAlertTriangle,
    FiAlertCircle,
    FiClock,
    FiInfo,
    FiFilter,
} from 'react-icons/fi';
import { useExpiry } from '../../hooks/useExpiry';
import type { ExpiryNotification } from '../../types/expiry.types';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

interface NotificationItemProps {
    notification: ExpiryNotification;
    onMarkAsRead: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
}) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'expired':
                return <FiAlertTriangle className="h-5 w-5 text-red-500" />;
            case 'critical':
                return <FiAlertCircle className="h-5 w-5 text-orange-500" />;
            case 'warning':
                return <FiClock className="h-5 w-5 text-yellow-500" />;
            case 'notice':
                return <FiInfo className="h-5 w-5 text-blue-500" />;
            default:
                return <FiBell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getBgColor = (type: string, isRead: boolean) => {
        const opacity = isRead ? 'bg-opacity-30' : 'bg-opacity-50';
        switch (type) {
            case 'expired':
                return `bg-red-100 ${opacity}`;
            case 'critical':
                return `bg-orange-100 ${opacity}`;
            case 'warning':
                return `bg-yellow-100 ${opacity}`;
            case 'notice':
                return `bg-blue-100 ${opacity}`;
            default:
                return `bg-gray-100 ${opacity}`;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    return (
        <div
            className={`p-4 notification-item-hover ${getBgColor(
                notification.type,
                notification.isRead,
            )} ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4
                            className={`text-sm font-medium ${
                                notification.isRead
                                    ? 'text-gray-700'
                                    : 'text-gray-900'
                            }`}
                        >
                            {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-gray-500">
                                {formatDate(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                                <button
                                    onClick={() =>
                                        onMarkAsRead(notification.id)
                                    }
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Mark as read"
                                >
                                    <FiCheck className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                    <p
                        className={`text-sm mt-1 ${
                            notification.isRead
                                ? 'text-gray-500'
                                : 'text-gray-700'
                        }`}
                    >
                        {notification.message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
    isOpen,
    onClose,
    className = '',
}) => {
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const {
        notifications,
        isLoading: notificationsLoading,
        markAsRead,
        markAllAsRead,
    } = useExpiry();

    // Defensive programming: ensure notifications is an array
    const safeNotifications = Array.isArray(notifications) ? notifications : [];

    const filteredNotifications = safeNotifications.filter((notification) => {
        // Filter by read status
        if (filter === 'unread' && notification.isRead) return false;
        if (filter === 'read' && !notification.isRead) return false;

        // Filter by type
        if (typeFilter !== 'all' && notification.type !== typeFilter)
            return false;

        return true;
    });

    const unreadCount = safeNotifications.filter((n) => !n.isRead).length;

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 lg:relative lg:inset-auto ${className}`}
        >
            {/* Mobile backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl lg:relative lg:h-auto lg:max-h-[32rem] lg:rounded-lg lg:border flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <FiBell className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close notifications panel"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                        <FiFilter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                            Filters
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {['all', 'unread', 'read'].map((filterOption) => (
                            <button
                                key={filterOption}
                                onClick={() =>
                                    setFilter(
                                        filterOption as
                                            | 'all'
                                            | 'unread'
                                            | 'read',
                                    )
                                }
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                    filter === filterOption
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {filterOption.charAt(0).toUpperCase() +
                                    filterOption.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            'all',
                            'expired',
                            'critical',
                            'warning',
                            'notice',
                        ].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                    typeFilter === type
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllAsRead.mutate()}
                            className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <FiCheckCircle className="h-4 w-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin notification-scroll-shadow min-h-0">
                    {notificationsLoading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredNotifications &&
                      filteredNotifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={(id) => markAsRead.mutate(id)}
                                />
                            ))}
                            {/* Scroll indicator for many notifications */}
                            {filteredNotifications.length > 5 && (
                                <div className="p-2 text-center bg-gray-50">
                                    <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                        <span>•</span>
                                        <span>
                                            {filteredNotifications.length}{' '}
                                            notifications total
                                        </span>
                                        <span>•</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <FiBell className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                            <p className="text-gray-500">
                                {filter === 'unread'
                                    ? 'No unread notifications'
                                    : filter === 'read'
                                    ? 'No read notifications'
                                    : 'No notifications found'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
