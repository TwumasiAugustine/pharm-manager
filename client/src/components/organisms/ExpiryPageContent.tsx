import React from 'react';
import { ExpiryStatsCards } from '../molecules/ExpiryStatsCards';
import { ExpiryDrugsList } from '../molecules/ExpiryDrugsList';
import type {
    ExpiryFilters,
    ExpiryStats,
    ExpiryDrug,
} from '../../types/expiry.types';

interface ExpiryPageContentProps {
    expiryStats: ExpiryStats | null;
    isStatsLoading: boolean;
    expiringDrugs: ExpiryDrug[];
    drugsLoading: boolean;
    filters: ExpiryFilters;
}

export const ExpiryPageContent: React.FC<ExpiryPageContentProps> = ({
    expiryStats,
    isStatsLoading,
    expiringDrugs,
    drugsLoading,
    filters,
}) => {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-6">
                {/* Stats Cards */}
                <ExpiryStatsCards
                    stats={
                        expiryStats || {
                            totalExpiredDrugs: 0,
                            totalCriticalDrugs: 0,
                            totalWarningDrugs: 0,
                            totalNoticeDrugs: 0,
                            totalValue: 0,
                            totalCostValue: 0,
                            expiredValue: 0,
                            expiredCostValue: 0,
                            criticalValue: 0,
                            criticalCostValue: 0,
                            warningValue: 0,
                            warningCostValue: 0,
                            totalPotentialLoss: 0,
                            profitLoss: 0,
                            upcomingExpiries: {
                                next7Days: 0,
                                next30Days: 0,
                                next60Days: 0,
                                next90Days: 0,
                            },
                            categoryBreakdown: {},
                        }
                    }
                    isLoading={isStatsLoading}
                />

                {/* Drugs List */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 lg:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Expiring Drugs
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {expiringDrugs?.length || 0} drugs found
                                    {filters.alertLevel && (
                                        <span className="ml-1">
                                            ({filters.alertLevel} alerts)
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Results summary */}
                            <div className="text-sm text-gray-500">
                                Showing results for next{' '}
                                {filters.daysRange || 30} days
                            </div>
                        </div>
                    </div>

                    <div className="p-4 lg:p-6">
                        <ExpiryDrugsList
                            drugs={expiringDrugs || []}
                            isLoading={drugsLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpiryPageContent;
