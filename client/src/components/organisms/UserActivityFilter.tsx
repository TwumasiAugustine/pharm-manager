import React from 'react';
import type { UserActivityFilters } from '../../types/user-activity.types';
import { FaFilter, FaTimes } from 'react-icons/fa';

interface UserActivityFilterProps {
    filters: UserActivityFilters;
    onFilterChange: (filters: Partial<UserActivityFilters>) => void;
    isLoading: boolean;
}

export const UserActivityFilter: React.FC<UserActivityFilterProps> = ({
    filters,
    onFilterChange,
    isLoading,
}) => {
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        onFilterChange({ [name]: value });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onFilterChange({
            [name]: value ? new Date(value).toISOString() : undefined,
        });
    };

    const clearFilters = () => {
        onFilterChange({
            userId: '',
            sessionId: '',
            activityType: '',
            resource: '',
            startDate: '',
            endDate: '',
            ipAddress: '',
            userRole: '',
        });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaFilter className="mr-2" />
                Filters
            </h3>
            <div className="space-y-4">
                {/* User ID */}
                <div>
                    <label
                        htmlFor="userId"
                        className="block text-sm font-medium text-gray-700"
                    >
                        User ID
                    </label>
                    <input
                        type="text"
                        id="userId"
                        name="userId"
                        value={filters.userId || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter user ID"
                    />
                </div>

                {/* Session ID */}
                <div>
                    <label
                        htmlFor="sessionId"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Session ID
                    </label>
                    <input
                        type="text"
                        id="sessionId"
                        name="sessionId"
                        value={filters.sessionId || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter session ID"
                    />
                </div>

                {/* Activity Type */}
                <div>
                    <label
                        htmlFor="activityType"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Activity Type
                    </label>
                    <select
                        id="activityType"
                        name="activityType"
                        value={filters.activityType || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="VIEW">View</option>
                        <option value="DOWNLOAD">Download</option>
                        <option value="SEARCH">Search</option>
                    </select>
                </div>

                {/* Resource */}
                <div>
                    <label
                        htmlFor="resource"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Resource
                    </label>
                    <select
                        id="resource"
                        name="resource"
                        value={filters.resource || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">All Resources</option>
                        <option value="USER">User</option>
                        <option value="DRUG">Drug</option>
                        <option value="SALE">Sale</option>
                        <option value="CUSTOMER">Customer</option>
                        <option value="REPORT">Report</option>
                        <option value="SYSTEM">System</option>
                        <option value="DASHBOARD">Dashboard</option>
                    </select>
                </div>

                {/* User Role */}
                <div>
                    <label
                        htmlFor="userRole"
                        className="block text-sm font-medium text-gray-700"
                    >
                        User Role
                    </label>
                    <select
                        id="userRole"
                        name="userRole"
                        value={filters.userRole || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="pharmacist">Pharmacist</option>
                        <option value="cashier">Cashier</option>
                    </select>
                </div>

                {/* IP Address */}
                <div>
                    <label
                        htmlFor="ipAddress"
                        className="block text-sm font-medium text-gray-700"
                    >
                        IP Address
                    </label>
                    <input
                        type="text"
                        id="ipAddress"
                        name="ipAddress"
                        value={filters.ipAddress || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter IP address"
                    />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="startDate"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={
                                filters.startDate
                                    ? filters.startDate.split('T')[0]
                                    : ''
                            }
                            onChange={handleDateChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="endDate"
                            className="block text-sm font-medium text-gray-700"
                        >
                            End Date
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={
                                filters.endDate
                                    ? filters.endDate.split('T')[0]
                                    : ''
                            }
                            onChange={handleDateChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Clear Filters Button */}
                <div className="pt-2">
                    <button
                        onClick={clearFilters}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        <FaTimes className="mr-2" />
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
};
