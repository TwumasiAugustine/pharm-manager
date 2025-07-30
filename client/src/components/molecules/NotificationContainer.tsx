import { useNotification } from '../../hooks/useNotificationContext';
import type { NotificationType } from '../../context/NotificationContextBase';
import { useEffect, useState } from 'react';
import { getDurationClass } from '../../utils/notifications';

// Styles for different notification types
const getNotificationStyles = (type: NotificationType) => {
    const baseStyles = {
        notification: `
      flex items-center justify-between p-4 mb-4 rounded-lg shadow-md
      transition-all duration-300 ease-in-out transform
    `,
        icon: 'w-6 h-6 mr-3',
    };

    switch (type) {
        case 'success':
            return {
                ...baseStyles,
                notification: `${baseStyles.notification} bg-green-100 border-l-4 border-green-500 text-green-700`,
                icon: `${baseStyles.icon} text-green-500`,
            };
        case 'error':
            return {
                ...baseStyles,
                notification: `${baseStyles.notification} bg-red-100 border-l-4 border-red-500 text-red-700`,
                icon: `${baseStyles.icon} text-red-500`,
            };
        case 'warning':
            return {
                ...baseStyles,
                notification: `${baseStyles.notification} bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700`,
                icon: `${baseStyles.icon} text-yellow-500`,
            };
        case 'info':
        default:
            return {
                ...baseStyles,
                notification: `${baseStyles.notification} bg-blue-100 border-l-4 border-blue-500 text-blue-700`,
                icon: `${baseStyles.icon} text-blue-500`,
            };
    }
};

// Icons for different notification types
const NotificationIcon = ({ type }: { type: NotificationType }) => {
    const styles = getNotificationStyles(type);

    switch (type) {
        case 'success':
            return (
                <svg
                    className={styles.icon}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    ></path>
                </svg>
            );
        case 'error':
            return (
                <svg
                    className={styles.icon}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                    ></path>
                </svg>
            );
        case 'warning':
            return (
                <svg
                    className={styles.icon}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    ></path>
                </svg>
            );
        case 'info':
        default:
            return (
                <svg
                    className={styles.icon}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                    ></path>
                </svg>
            );
    }
};

// Individual notification component
const NotificationItem = ({
    id,
    type,
    message,
    onRemove,
    duration = 5000,
}: {
    id: string;
    type: NotificationType;
    message: string;
    onRemove: (id: string) => void;
    duration?: number;
}) => {
    const [isExiting, setIsExiting] = useState(false);
    const styles = getNotificationStyles(type);

    const handleRemove = () => {
        setIsExiting(true);
        // Wait for exit animation to complete
        setTimeout(() => {
            onRemove(id);
        }, 300);
    };

    useEffect(() => {
        if (duration > 0) {
            // Start the exit animation a bit before actual removal
            const exitTimeout = setTimeout(() => {
                setIsExiting(true);
            }, duration - 300);

            return () => {
                clearTimeout(exitTimeout);
            };
        }
    }, [duration]);

    return (
        <div
            className={`${styles.notification} relative ${
                isExiting ? 'notification-exit' : 'notification-enter'
            }`}
            role="alert"
        >
            <div className="flex items-center">
                <NotificationIcon type={type} />
                <div>{message}</div>
            </div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8"
                onClick={handleRemove}
                aria-label="Close"
            >
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    ></path>
                </svg>
            </button>
            {duration > 0 && (
                <div
                    className={`notification-progress notification-progress-${type} ${getDurationClass(
                        duration,
                    )}`}
                ></div>
            )}
        </div>
    );
};

// Main notification container
export const NotificationContainer = () => {
    const { notifications, removeNotification } = useNotification();

    return (
        <div className="fixed top-4 right-4 z-50 w-80 max-w-full flex flex-col gap-2">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    id={notification.id}
                    type={notification.type}
                    message={notification.message}
                    onRemove={removeNotification}
                    duration={notification.duration}
                />
            ))}
        </div>
    );
};
