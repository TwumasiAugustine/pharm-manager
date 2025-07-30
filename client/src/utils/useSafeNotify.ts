import { useNotify } from '../hooks/useNotify';

/**
 * Safely uses the notification system, providing a fallback if the context is not available
 * @returns A notification object that won't throw errors if used outside NotificationProvider
 */
export const useSafeNotify = () => {
    try {
        return useNotify();
    } catch (error) {
        console.warn(
            'useSafeNotify: Notification context not available, returning no-op functions.',
            error
        );
        return {
            success: () => {},
            error: () => {},
            warning: () => {},
            info: () => {},
        };
    }
};
