import React from 'react';
import { useNumberFormatter } from '../../../hooks/useDisplayMode';
import type { ReportDataItem } from '../../../types/report.types';

interface ChartSummaryProps {
    data: ReportDataItem[];
    reportType: 'sales' | 'inventory' | 'expiry' | 'financial';
}

export const ChartSummary: React.FC<ChartSummaryProps> = ({
    data,
    reportType,
}) => {
    const { formatCurrency } = useNumberFormatter();

    if (reportType === 'expiry') {
        return null;
    }

    return (
        <div className="mt-4 sm:mt-6 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="text-center">
                    <p className="text-gray-600 mb-1">Total Records</p>
                    <p className="font-semibold text-gray-900">
                        {data.length}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-gray-600 mb-1">Total Value</p>
                    <p className="font-semibold text-gray-900">
                        {formatCurrency(
                            data.reduce((sum, item) => sum + item.totalPrice, 0),
                        )}
                    </p>
                </div>
                {reportType === 'sales' && (
                    <div className="text-center">
                        <p className="text-gray-600 mb-1">Total Profit</p>
                        <p className="font-semibold text-green-600">
                            {formatCurrency(
                                data.reduce(
                                    (sum, item) => sum + (item.profit || 0),
                                    0,
                                ),
                            )}
                        </p>
                    </div>
                )}
                {reportType === 'inventory' && (
                    <div className="text-center">
                        <p className="text-gray-600 mb-1">Total Quantity</p>
                        <p className="font-semibold text-gray-900">
                            {data.reduce((sum, item) => sum + item.quantity, 0)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
