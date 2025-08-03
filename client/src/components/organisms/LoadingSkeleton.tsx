import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../molecules/Card';
import DashboardLayout from '../../layouts/DashboardLayout';

const LoadingSkeleton: React.FC = () => (
    <DashboardLayout>
        <div className="animate-pulse">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="border rounded p-3 bg-gray-50">
                            <div className="grid grid-cols-5 gap-4">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-6 bg-gray-200 rounded"
                                    ></div>
                                ))}
                            </div>
                        </div>
                        <div className="border rounded p-3 bg-gray-50">
                            <div className="grid grid-cols-5 gap-4">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-6 bg-gray-200 rounded"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="h-8 bg-gray-200 rounded w-1/4 ml-auto"></div>
                </CardFooter>
            </Card>
        </div>
    </DashboardLayout>
);

export default LoadingSkeleton;
