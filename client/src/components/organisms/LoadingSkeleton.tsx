import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const LoadingSkeleton: React.FC = () => (
    <DashboardLayout>
        <div className="flex flex-col items-center py-8 bg-gray-50">
            <div className="w-full max-w-4xl mx-auto bg-white border rounded-lg shadow-lg p-8 animate-pulse">
                {/* Receipt Header Skeleton */}
                <header className="border-b-2 border-dashed pb-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="h-10 bg-gray-200 rounded w-64 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="text-right">
                            <div className="h-8 bg-gray-200 rounded w-40 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-56"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                        <div className="h-4 bg-gray-200 rounded w-72"></div>
                    </div>
                </header>

                {/* Transaction Info Skeleton */}
                <section className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <div className="h-5 bg-gray-200 rounded w-20 mb-2 border-b"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="h-5 bg-gray-200 rounded w-24 mb-2 ml-auto border-b"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-40 ml-auto"></div>
                            <div className="h-4 bg-gray-200 rounded w-32 ml-auto"></div>
                        </div>
                    </div>
                </section>

                {/* Items Table Skeleton */}
                <section className="mb-8">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-3">
                                    <div className="h-4 bg-gray-200 rounded w-4"></div>
                                </th>
                                <th className="text-left p-3">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                </th>
                                <th className="text-right p-3">
                                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                                </th>
                                <th className="text-right p-3">
                                    <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                                </th>
                                <th className="text-right p-3">
                                    <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(3)].map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="p-3">
                                        <div className="h-4 bg-gray-200 rounded w-4"></div>
                                    </td>
                                    <td className="p-3">
                                        <div className="h-4 bg-gray-200 rounded w-40 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td className="text-right p-3">
                                        <div className="h-4 bg-gray-200 rounded w-8 ml-auto"></div>
                                    </td>
                                    <td className="text-right p-3">
                                        <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                                    </td>
                                    <td className="text-right p-3">
                                        <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Totals Section Skeleton */}
                <section className="flex justify-end mb-8">
                    <div className="w-full max-w-xs">
                        <div className="flex justify-between py-2 border-b">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                        </div>
                        <div className="flex justify-between py-3 bg-gray-50 -mx-3 px-3 rounded">
                            <div className="h-5 bg-gray-200 rounded w-24"></div>
                            <div className="h-5 bg-gray-200 rounded w-20"></div>
                        </div>
                    </div>
                </section>

                {/* Footer Skeleton */}
                <footer className="text-center pt-6 border-t space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-64 mx-auto"></div>
                    <div className="h-3 bg-gray-200 rounded w-80 mx-auto"></div>
                </footer>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="mt-6 flex gap-4">
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
        </div>
    </DashboardLayout>
);

export default LoadingSkeleton;
