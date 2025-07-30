import { createContext } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (
        type: NotificationType,
        message: string,
        duration?: number,
    ) => void;
    removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<
    NotificationContextType | undefined
>(undefined);
