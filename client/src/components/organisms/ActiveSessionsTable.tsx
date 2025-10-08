import React from 'react';

interface Session {
    sessionId: string;
    userName: string;
    userRole: string;
    duration: number;
    activityCount: number;
    ipAddress: string;
}

interface ActiveSessionsTableProps {
    sessions: Session[];
    isLoading: boolean;
    error: Error | null;
    onViewSession: (sessionId: string) => void;
}

export const ActiveSessionsTable: React.FC<ActiveSessionsTableProps> = ({
    sessions,
    isLoading,
    error,
    onViewSession,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading active sessions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center text-red-600">
                Error loading sessions: {error.message}
            </div>
        );
    }

    if (!sessions || sessions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No active sessions found
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                User
                            </th>
                            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Session Duration
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Activities
                            </th>
                            <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                IP Address
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sessions.map((session) => (
                            <tr
                                key={session.sessionId}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {session.userName}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-500">
                                            {session.userRole}
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {Math.floor(
                                        session.duration / (1000 * 60),
                                    )}{' '}
                                    min
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {session.activityCount}
                                    </span>
                                </td>
                                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {session.ipAddress}
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() =>
                                            onViewSession(session.sessionId)
                                        }
                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
