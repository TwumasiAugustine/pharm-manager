import React from 'react';
import { FiAlertTriangle, FiPackage } from 'react-icons/fi';
import type { LowStockDrug } from '../../types/dashboard.types';

interface LowStockDrugsProps {
    data: LowStockDrug[];
    isLoading?: boolean;
}

export const LowStockDrugs: React.FC<LowStockDrugsProps> = ({
    data,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FiAlertTriangle className="text-red-500" />
                        Low Stock Alert
                    </h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="h-16 bg-gray-100 animate-pulse rounded-lg"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FiPackage className="text-green-500" />
                        Stock Status
                    </h3>
                </div>
                <div className="text-center py-8">
                    <FiPackage className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                        All Stock Levels Good
                    </h4>
                    <p className="text-gray-500">
                        No drugs are currently running low on stock
                    </p>
                </div>
            </div>
        );
    }

    const getStockLevelColor = (quantity: number) => {
        if (quantity === 0) return 'text-red-600 bg-red-50 border-red-200';
        if (quantity <= 5) return 'text-red-600 bg-red-50 border-red-200';
        if (quantity <= 10)
            return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    };

    const getStockLevelLabel = (quantity: number) => {
        if (quantity === 0) return 'Out of Stock';
        if (quantity <= 5) return 'Critical';
        if (quantity <= 10) return 'Low';
        return 'Warning';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiAlertTriangle className="text-red-500" />
                    Low Stock Alert
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        {data.length}
                    </span>
                </h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.map((drug) => (
                    <div
                        key={drug.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <FiPackage className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {drug.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-gray-500">
                                            {drug.brand}
                                        </p>
                                        <span className="text-xs text-gray-400">
                                            •
                                        </span>
                                        <p className="text-xs text-gray-500">
                                            {drug.category}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {new Intl.NumberFormat('en-GH', {
                                        style: 'currency',
                                        currency: 'GHS',
                                    }).format(drug.price)}
                                </p>
                                <p className="text-xs text-gray-500">
                                    per unit
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockLevelColor(
                                        drug.quantity,
                                    )}`}
                                >
                                    {getStockLevelLabel(drug.quantity)}
                                </span>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">
                                        {drug.quantity}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        units
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data.length > 10 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                        Showing top 20 low stock items. View inventory for
                        complete list.
                    </p>
                </div>
            )}
        </div>
    );
};
