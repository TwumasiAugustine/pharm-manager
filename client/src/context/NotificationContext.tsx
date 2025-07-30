import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
    NotificationContext,
    type NotificationType,
    type Notification,
} from './NotificationContextBase';

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider = ({
    children,
}: NotificationProviderProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Generate a unique ID for each notification
    const generateId = () => {
        return (
            Date.now().toString(36) + Math.random().toString(36).substring(2)
        );
    };

    // Remove a notification by ID
    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id),
        );
    }, []);

    // Add a new notification
    const addNotification = useCallback(
        (type: NotificationType, message: string, duration = 5000) => {
            const id = generateId();
            const notification: Notification = {
                id,
                type,
                message,
                duration,
            };

            setNotifications((prev) => [...prev, notification]);

            // Auto-remove notification after duration
            if (duration > 0) {
                setTimeout(() => {
                    removeNotification(id);
                }, duration);
            }
        },
        [removeNotification],
    );

    // Listen for global notification events
    useEffect(() => {
        const handleNotificationEvent = (event: Event) => {
            const customEvent = event as CustomEvent;
            const { type, message, duration } = customEvent.detail;
            addNotification(type, message, duration);
        };

        window.addEventListener('notification', handleNotificationEvent);

        return () => {
            window.removeEventListener('notification', handleNotificationEvent);
        };
    }, [addNotification]);

    const value = {
        notifications,
        addNotification,
        removeNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
