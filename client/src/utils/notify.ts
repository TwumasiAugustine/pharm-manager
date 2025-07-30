import type { NotificationType } from '../context/NotificationContextBase';

// This is a global event-based notification system that can be used outside of React components
// It will be connected to our React-based notification system

// Create custom event for notifications
interface NotificationEvent extends CustomEvent {
    detail: {
        type: NotificationType;
        message: string;
        duration?: number;
    };
}

// Create a global notification utility
export const notify = {
    // Show a success notification
    success: (message: string, duration?: number) => {
        const event = new CustomEvent('notification', {
            detail: {
                type: 'success',
                message,
                duration,
            },
        }) as NotificationEvent;
        window.dispatchEvent(event);
    },

    // Show an error notification
    error: (message: string, duration?: number) => {
        const event = new CustomEvent('notification', {
            detail: {
                type: 'error',
                message,
                duration,
            },
        }) as NotificationEvent;
        window.dispatchEvent(event);
    },

    // Show a warning notification
    warning: (message: string, duration?: number) => {
        const event = new CustomEvent('notification', {
            detail: {
                type: 'warning',
                message,
                duration,
            },
        }) as NotificationEvent;
        window.dispatchEvent(event);
    },

    // Show an info notification
    info: (message: string, duration?: number) => {
        const event = new CustomEvent('notification', {
            detail: {
                type: 'info',
                message,
                duration,
            },
        }) as NotificationEvent;
        window.dispatchEvent(event);
    },
};
