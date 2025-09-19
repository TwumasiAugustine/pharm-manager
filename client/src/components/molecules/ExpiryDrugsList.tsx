import React from 'react';
import {
    FiAlertTriangle,
    FiAlertCircle,
    FiClock,
    FiInfo,
    FiPackage,
    FiMapPin,
    FiBox,
    FiTrendingDown,
} from 'react-icons/fi';
import type { ExpiryDrug } from '../../types/expiry.types';
import { formatGHSDisplayAmount } from '../../utils/currency';
import { Badge } from '../atoms/Badge';

interface ExpiryDrugsListProps {
    drugs: ExpiryDrug[];
    isLoading?: boolean;
}

interface DrugCardProps {
    drug: ExpiryDrug;
}

const DrugCard: React.FC<DrugCardProps> = ({ drug }) => {
    const getAlertIcon = (alertLevel: string) => {
        switch (alertLevel) {
            case 'expired':
                return <FiAlertTriangle className="h-5 w-5 text-red-500" />;
            case 'critical':
                return <FiAlertCircle className="h-5 w-5 text-orange-500" />;
            case 'warning':
                return <FiClock className="h-5 w-5 text-yellow-500" />;
            case 'notice':
                return <FiInfo className="h-5 w-5 text-blue-500" />;
            default:
                return <FiPackage className="h-5 w-5 text-gray-400" />;
        }
    };

    const getAlertVariant = (
        alertLevel: string,
    ): 'danger' | 'warning' | 'info' | 'secondary' => {
        switch (alertLevel) {
            case 'expired':
                return 'danger';
            case 'critical':
                return 'warning';
            case 'warning':
                return 'warning';
            case 'notice':
                return 'info';
            default:
                return 'secondary';
        }
    };

    const getAlertText = (drug: ExpiryDrug) => {
        if (drug.daysUntilExpiry < 0) {
            return `Expired ${Math.abs(drug.daysUntilExpiry)} days ago`;
        }
        return `Expires in ${drug.daysUntilExpiry} days`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div
            className={`rounded-lg border p-4 sm:p-6 transition-all hover:shadow-md ${getAlertColors(
                drug.alertLevel,
            )}`}
        >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Drug Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                        {getAlertIcon(drug.alertLevel)}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {drug.drugName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                                <span>{drug.brand}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{drug.category}</span>
                                {drug.dosageForm && (
                                    <>
                                        <span className="hidden sm:inline">
                                            •
                                        </span>
                                        <span>{drug.dosageForm}</span>
                                    </>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {drug.requiresPrescription && (
                                        <Badge variant="secondary" size="sm">
                                            Prescription Required
                                        </Badge>
                                    )}
                                    {drug.ableToSell !== undefined && (
                                        <Badge
                                            variant={
                                                drug.ableToSell
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                            size="sm"
                                        >
                                            {drug.ableToSell
                                                ? 'Available for Sale'
                                                : 'Not for Sale'}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div>
                            <p className="text-gray-500">Batch Number</p>
                            <p className="font-medium text-gray-900">
                                {drug.batchNumber}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-medium text-gray-900">
                                {drug.quantity.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Unit Price</p>
                            <p className="font-medium text-gray-900">
                                {formatGHSDisplayAmount(
                                    drug.pricePerUnit || drug.price,
                                )}
                            </p>
                        </div>
                        {drug.pricePerPack && (
                            <div>
                                <p className="text-gray-500 flex items-center">
                                    <FiBox className="h-3 w-3 mr-1" />
                                    Pack Price
                                </p>
                                <p className="font-medium text-gray-900">
                                    {formatGHSDisplayAmount(drug.pricePerPack)}
                                </p>
                            </div>
                        )}
                        {drug.pricePerCarton && (
                            <div>
                                <p className="text-gray-500 flex items-center">
                                    <FiPackage className="h-3 w-3 mr-1" />
                                    Carton Price
                                </p>
                                <p className="font-medium text-gray-900">
                                    {formatGHSDisplayAmount(
                                        drug.pricePerCarton,
                                    )}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-gray-500">Total Value</p>
                            <p className="font-medium text-gray-900">
                                {formatGHSDisplayAmount(
                                    drug.unitValueLoss ||
                                        drug.quantity *
                                            (drug.pricePerUnit || drug.price),
                                )}
                            </p>
                        </div>
                        {drug.costLoss && (
                            <div>
                                <p className="text-gray-500">Cost Loss</p>
                                <p className="font-medium text-red-600">
                                    {formatGHSDisplayAmount(drug.costLoss)}
                                </p>
                            </div>
                        )}
                        {drug.profitLoss && (
                            <div>
                                <p className="text-gray-500 flex items-center">
                                    <FiTrendingDown className="h-3 w-3 mr-1" />
                                    Profit Loss
                                </p>
                                <p className="font-medium text-red-600">
                                    {formatGHSDisplayAmount(drug.profitLoss)}
                                </p>
                            </div>
                        )}
                        {drug.location && (
                            <div>
                                <p className="text-gray-500">Location</p>
                                <p className="font-medium text-gray-900">
                                    {drug.location}
                                </p>
                            </div>
                        )}
                        {drug.supplier && (
                            <div>
                                <p className="text-gray-500">Supplier</p>
                                <p className="font-medium text-gray-900">
                                    {drug.supplier}
                                </p>
                            </div>
                        )}
                        {drug.branchName && (
                            <div>
                                <p className="text-gray-500 flex items-center">
                                    <FiMapPin className="h-3 w-3 mr-1" />
                                    Branch
                                </p>
                                <p className="font-medium text-gray-900">
                                    {drug.branchName}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alert Status */}
                <div className="flex flex-col items-end text-right">
                    <Badge
                        variant={getAlertVariant(drug.alertLevel)}
                        size="md"
                        className="mb-3"
                    >
                        {drug.alertLevel.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-gray-600">
                        <p className="font-medium">{getAlertText(drug)}</p>
                        <p className="mt-1">
                            Expiry: {formatDate(drug.expiryDate)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action needed for expired/critical drugs */}
            {(drug.alertLevel === 'expired' ||
                drug.alertLevel === 'critical') && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm font-medium">
                            {drug.alertLevel === 'expired'
                                ? '⚠️ Remove from inventory immediately'
                                : '⚡ Take immediate action'}
                        </p>
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                drug.alertLevel === 'expired'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                            }`}
                        >
                            {drug.alertLevel === 'expired'
                                ? 'Mark as Removed'
                                : 'Acknowledge'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ExpiryDrugsList: React.FC<ExpiryDrugsListProps> = ({
    drugs,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-lg border p-4 sm:p-6"
                    >
                        <div className="animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map((j) => (
                                    <div
                                        key={`skeleton-${i}-${j}`}
                                        className="space-y-2"
                                    >
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (drugs.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-8 text-center">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Expiring Drugs Found
                </h3>
                <p className="text-gray-500">
                    No drugs are expiring within the selected time range.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {drugs.map((drug, index) => (
                <DrugCard
                    key={drug.id || drug._id || `drug-${index}`}
                    drug={drug}
                />
            ))}
        </div>
    );
};
