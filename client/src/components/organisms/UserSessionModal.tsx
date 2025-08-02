import React from 'react';
import { useUserSession } from '../../hooks/useUserActivity';
import { Modal } from '../molecules/Modal';
import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { ErrorMessage } from '../atoms/ErrorMessage';
import {
    FaUser,
    FaClock,
    FaDesktop,
    FaMapMarkerAlt,
    FaListUl,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

interface UserSessionModalProps {
    sessionId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const UserSessionModal: React.FC<UserSessionModalProps> = ({
    sessionId,
    isOpen,
    onClose,
}) => {
    const {
        data: session,
        isLoading,
        error,
    } = useUserSession(sessionId, { enabled: isOpen });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Session Details: ${sessionId.substring(0, 8)}...`}
        >
            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            )}
            {error && <ErrorMessage message={(error as Error).message} />}
            {session && (
                <div className="space-y-4 text-sm">
                    {/* User Info */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-semibold mb-2 flex items-center">
                            <FaUser className="mr-2" />
                            User Information
                        </h4>
                        <p>
                            <strong>Name:</strong> {session.userName}
                        </p>
                        <p>
                            <strong>Email:</strong> {session.userEmail}
                        </p>
                        <p>
                            <strong>Role:</strong> {session.userRole}
                        </p>
                    </div>

                    {/* Session Info */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-semibold mb-2 flex items-center">
                            <FaClock className="mr-2" />
                            Session Timing
                        </h4>
                        <p>
                            <strong>Login:</strong>{' '}
                            {new Date(session.loginTime).toLocaleString()}
                        </p>
                        <p>
                            <strong>Last Activity:</strong>{' '}
                            {new Date(session.lastActivity).toLocaleString()} (
                            {formatDistanceToNow(
                                new Date(session.lastActivity),
                                { addSuffix: true },
                            )}
                            )
                        </p>
                        <p>
                            <strong>Duration:</strong> {session.duration}{' '}
                            minutes
                        </p>
                        <p>
                            <strong>Status:</strong>{' '}
                            <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                    session.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {session.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </p>
                    </div>

                    {/* Device Info */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-semibold mb-2 flex items-center">
                            <FaDesktop className="mr-2" />
                            Device & Location
                        </h4>
                        <p>
                            <strong>IP Address:</strong> {session.ipAddress}
                        </p>
                        {session.location && (
                            <p>
                                <strong>Location:</strong> {session.location}
                            </p>
                        )}
                        <p className="break-all">
                            <strong>User Agent:</strong> {session.userAgent}
                        </p>
                    </div>

                    {/* Activities */}
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-semibold mb-2 flex items-center">
                            <FaListUl className="mr-2" />
                            Activities ({session.activityCount})
                        </h4>
                        <div className="max-h-60 overflow-y-auto pr-2">
                            <ul className="space-y-2">
                                {session.activities.map((activity, index) => (
                                    <li
                                        key={index}
                                        className="p-2 bg-white rounded-md border"
                                    >
                                        <p className="font-medium">
                                            {activity.action}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {activity.type} on{' '}
                                            {activity.resource}
                                            {activity.resourceName &&
                                                ` (${activity.resourceName})`}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(
                                                activity.timestamp,
                                            ).toLocaleTimeString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
