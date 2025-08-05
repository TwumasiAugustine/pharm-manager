import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

export const ReportsPageSkeleton: React.FC = () => {
    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                <div className="animate-pulse">
                    {/* Header skeleton */}
                    <div className="bg-white shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
                                <div>
                                    <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-96"></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content skeleton */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Sidebar skeleton */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <div className="space-y-4">
                                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Main content skeleton */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* Summary skeleton */}
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Table skeleton */}
                                <div className="bg-white rounded-lg shadow-sm border">
                                    <div className="p-6 border-b">
                                        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </div>
                                    <div className="p-6">
                                        {/* Table header */}
                                        <div className="grid grid-cols-7 gap-4 pb-3 border-b mb-4">
                                            {[...Array(7)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-5 bg-gray-200 rounded"
                                                ></div>
                                            ))}
                                        </div>
                                        {/* Table rows */}
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="grid grid-cols-7 gap-4 py-3 border-b border-gray-100"
                                            >
                                                {[...Array(7)].map((_, j) => (
                                                    <div
                                                        key={j}
                                                        className="h-5 bg-gray-200 rounded"
                                                    ></div>
                                                ))}
                                            </div>
                                        ))}
                                        {/* Pagination skeleton */}
                                        <div className="mt-6 flex justify-center">
                                            <div className="flex space-x-2">
                                                <div className="h-10 bg-gray-200 rounded w-10"></div>
                                                <div className="h-10 bg-gray-200 rounded w-10"></div>
                                                <div className="h-10 bg-gray-200 rounded w-10"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
