import React from 'react';
import {
    FiPackage,
    FiCalendar,
    FiTrendingUp,
    FiMapPin,
    FiShoppingBag,
} from 'react-icons/fi';
import { useNumberFormatter } from '../../hooks/useDisplayMode';
import type { ReportDataItem, ReportFilters } from '../../types/report.types';

interface ReportTableProps {
    data: ReportDataItem[];
    reportType: ReportFilters['reportType'];
    isLoading: boolean;
}

export const ReportTable: React.FC<ReportTableProps> = ({
    data,
    reportType,
    isLoading,
}) => {
    const {  formatCurrency } = useNumberFormatter();

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse"
                    >
                        <div className="h-10 w-10 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No data available
                </h3>
                <p className="text-gray-500">
                    No records found for the selected filters
                </p>
            </div>
        );
    }

    const getTableHeaders = () => {
        switch (reportType) {
            case 'sales':
                return [
                    'Date',
                    'Drug Name',
                    'Customer',
                    'Sale Type',
                    'Quantity',
                    'Unit Price',
                    'Total',
                    'Profit',
                    'Branch',
                ];
            case 'inventory':
                return [
                    'Drug Name',
                    'Category',
                    'Brand',
                    'Batch Number',
                    'Quantity',
                    'Unit Price',
                    'Pack Price',
                    'Total Value',
                    'Branch',
                    'Expiry Date',
                ];
            case 'expiry':
                return [
                    'Drug Name',
                    'Category',
                    'Brand',
                    'Batch Number',
                    'Expiry Date',
                    'Status',
                    'Days Left',
                    'Quantity',
                    'Value at Risk',
                    'Branch',
                ];
            case 'financial':
                return [
                    'Date',
                    'Type',
                    'Description',
                    'Sale Type',
                    'Amount',
                    'Cost',
                    'Profit',
                    'Margin %',
                    'Branch',
                ];
            default:
                return ['Date', 'Description', 'Amount'];
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const renderTableRow = (item: ReportDataItem) => {
        switch (reportType) {
            case 'sales':
                return (
                    <>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <FiPackage className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {item.drugName}
                                    </span>
                                    {item.brand && (
                                        <p className="text-xs text-gray-500">
                                            {item.brand}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            <div>
                                {item.customer || 'Walk-in'}
                                {item.customerPhone && (
                                    <p className="text-xs text-gray-500">
                                        {item.customerPhone}
                                    </p>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.saleType === 'unit'
                                        ? 'bg-blue-100 text-blue-800'
                                        : item.saleType === 'pack'
                                        ? 'bg-green-100 text-green-800'
                                        : item.saleType === 'carton'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                <FiShoppingBag className="h-3 w-3 mr-1" />
                                {item.saleType?.toUpperCase() || 'UNIT'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(item.totalPrice)}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="inline-flex items-center text-sm font-medium text-green-600">
                                    <FiTrendingUp className="h-4 w-4 mr-1" />
                                    {item.profit !== null
                                        ? formatCurrency(item.profit)
                                        : 'N/A'}
                                </span>
                                {item.profitMargin !== undefined && (
                                    <span className="text-xs text-gray-500">
                                        {item.profitMargin.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-900">
                                <FiMapPin className="h-4 w-4 text-gray-400 mr-2" />
                                {item.branchName || 'N/A'}
                            </div>
                        </td>
                    </>
                );

            case 'inventory':
                return (
                    <>
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <FiPackage className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">
                                    {item.drugName}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                            {item.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                            {item.brand || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {item.batchNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {item.packPrice
                                ? formatCurrency(item.packPrice)
                                : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(item.totalPrice)}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-900">
                                <FiMapPin className="h-4 w-4 text-gray-400 mr-2" />
                                {item.branchName || 'N/A'}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {item.expiryDate
                                ? formatDate(item.expiryDate)
                                : 'N/A'}
                        </td>
                    </>
                );

            case 'expiry': {
                const daysLeft =
                    item.daysUntilExpiry !== undefined
                        ? item.daysUntilExpiry
                        : item.expiryDate
                        ? Math.ceil(
                              (new Date(item.expiryDate).getTime() -
                                  Date.now()) /
                                  (1000 * 60 * 60 * 24),
                          )
                        : 0;

                const getStatusColor = (status?: string) => {
                    switch (status) {
                        case 'expired':
                            return 'bg-red-100 text-red-800';
                        case 'critical':
                            return 'bg-red-100 text-red-800';
                        case 'warning':
                            return 'bg-yellow-100 text-yellow-800';
                        case 'notice':
                            return 'bg-orange-100 text-orange-800';
                        default:
                            return 'bg-green-100 text-green-800';
                    }
                };

                return (
                    <>
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <FiPackage className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {item.drugName}
                                    </span>
                                    {item.location && (
                                        <p className="text-xs text-gray-500">
                                            Location: {item.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                            {item.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                            {item.brand || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {item.batchNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-900">
                                <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                                {item.expiryDate
                                    ? formatDate(item.expiryDate)
                                    : 'N/A'}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    item.expiryStatus,
                                )}`}
                            >
                                {item.expiryStatus?.toUpperCase() ||
                                    (daysLeft <= 0 ? 'EXPIRED' : 'GOOD')}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    daysLeft <= 0
                                        ? 'bg-red-100 text-red-800'
                                        : daysLeft <= 30
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : daysLeft <= 90
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-green-100 text-green-800'
                                }`}
                            >
                                {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="flex flex-col">
                                <span>{formatCurrency(item.totalPrice)}</span>
                                {item.profitLoss !== undefined && (
                                    <span className="text-xs text-red-500">
                                        Loss: {formatCurrency(item.profitLoss)}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-900">
                                <FiMapPin className="h-4 w-4 text-gray-400 mr-2" />
                                {item.branchName || 'N/A'}
                            </div>
                        </td>
                    </>
                );
            }

            case 'financial':
                return (
                    <>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            Sale
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {item.drugName}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(item.totalPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            <span className="inline-flex items-center text-sm font-medium text-green-600">
                                {item.profit !== null
                                    ? formatCurrency(item.profit)
                                    : 'N/A'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(item.totalPrice)}
                        </td>
                    </>
                );

            default:
                return (
                    <>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {item.drugName}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(item.totalPrice)}
                        </td>
                    </>
                );
        }
    };

    return (
        <div className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {getTableHeaders().map((header, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, index) => (
                            <tr
                                key={item.id || index}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                {renderTableRow(item)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer with summary */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Showing {data.length} records</span>
                    <div className="flex items-center space-x-4">
                        <span>
                            Total Value:{' '}
                            {formatCurrency(
                                data.reduce(
                                    (sum, item) => sum + item.totalPrice,
                                    0,
                                ),
                            )}
                        </span>
                        {reportType === 'sales' && (
                            <span>
                                Total Profit:{' '}
                                {formatCurrency(
                                    data.reduce(
                                        (sum, item) => sum + (item.profit || 0),
                                        0,
                                    ),
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportTable;
