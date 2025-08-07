import React from 'react';
import { FaCalculator, FaPercent, FaMoneyBillAlt, FaBox, FaBoxes } from 'react-icons/fa';
import { calculatePackagePricing, formatCurrency, calculateSavingsPercentage, getBestPricingOption } from '../../utils/packagePricing';
import type { Drug } from '../../types/drug.types';

interface PackagePricingDisplayProps {
    drug: Drug;
    quantity?: number;
    showBestOption?: boolean;
}

export const PackagePricingDisplay: React.FC<PackagePricingDisplayProps> = ({
    drug,
    quantity = 1,
    showBestOption = true,
}) => {
    const pricing = calculatePackagePricing(drug.price, drug.packageInfo);
    const bestOption = showBestOption ? getBestPricingOption(quantity, drug.price, drug.packageInfo) : null;

    if (!drug.packageInfo?.isPackaged) {
        return (
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                    <FaMoneyBillAlt className="mr-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Individual Pricing Only</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(drug.price)} per unit
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Individual Pricing */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <FaMoneyBillAlt className="mr-2 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Individual Price</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(pricing.individualPrice)}
                    </span>
                </div>
            </div>

            {/* Pack Pricing */}
            {pricing.packPrice && drug.packageInfo.unitsPerPack && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <FaBox className="mr-2 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                                Pack ({drug.packageInfo.unitsPerPack} units)
                            </span>
                        </div>
                        <span className="text-lg font-semibold text-green-900">
                            {formatCurrency(pricing.packPrice)}
                        </span>
                    </div>
                    {pricing.packSavings && pricing.packSavings > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600">
                                Savings: {formatCurrency(pricing.packSavings)}
                            </span>
                            <span className="text-green-600 font-medium">
                                ({calculateSavingsPercentage(
                                    pricing.individualPrice * drug.packageInfo.unitsPerPack,
                                    pricing.packPrice
                                ).toFixed(1)}% off)
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Carton Pricing */}
            {pricing.cartonPrice && drug.packageInfo.packsPerCarton && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <FaBoxes className="mr-2 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">
                                Carton ({drug.packageInfo.packsPerCarton} packs)
                            </span>
                        </div>
                        <span className="text-lg font-semibold text-purple-900">
                            {formatCurrency(pricing.cartonPrice)}
                        </span>
                    </div>
                    {pricing.cartonSavings && pricing.cartonSavings > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-600">
                                Savings: {formatCurrency(pricing.cartonSavings)}
                            </span>
                            <span className="text-purple-600 font-medium">
                                ({calculateSavingsPercentage(
                                    (drug.packageInfo.packPrice || 0) * drug.packageInfo.packsPerCarton,
                                    pricing.cartonPrice
                                ).toFixed(1)}% off)
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Best Option for Quantity */}
            {showBestOption && bestOption && quantity > 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <FaCalculator className="mr-2 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                            Best Option for {quantity} units
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">
                                {bestOption.type === 'individual' && 'Individual units'}
                                {bestOption.type === 'pack' && `${bestOption.packs} pack(s)`}
                                {bestOption.type === 'carton' && `${bestOption.cartons} carton(s)`}
                            </span>
                            <span className="text-lg font-semibold text-blue-900">
                                {formatCurrency(bestOption.totalCost)}
                            </span>
                        </div>
                        {bestOption.savings > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-600">
                                    Total Savings: {formatCurrency(bestOption.savings)}
                                </span>
                                <span className="text-blue-600 font-medium">
                                    ({calculateSavingsPercentage(
                                        quantity * pricing.individualPrice,
                                        bestOption.totalCost
                                    ).toFixed(1)}% off)
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Package Information Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                        <span>Units per pack:</span>
                        <span>{drug.packageInfo.unitsPerPack || 'N/A'}</span>
                    </div>
                    {drug.packageInfo.packsPerCarton && (
                        <div className="flex justify-between">
                            <span>Packs per carton:</span>
                            <span>{drug.packageInfo.packsPerCarton}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Total units per carton:</span>
                        <span>
                            {drug.packageInfo.unitsPerPack && drug.packageInfo.packsPerCarton
                                ? drug.packageInfo.unitsPerPack * drug.packageInfo.packsPerCarton
                                : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
