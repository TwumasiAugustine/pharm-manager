import React from 'react';
import { OverviewCards as SharedOverview } from '../../components/molecules/OverviewCards';
import type { DashboardOverview } from '../../types/dashboard.types';

interface PharmacySummary {
    _id: string;
    name: string;
    branchCount?: number;
    userCount?: number;
}

interface PharmaciesData {
    pharmacies: PharmacySummary[];
    pagination: {
        current: number;
        pages: number;
        total: number;
        limit: number;
    };
}

interface Props {
    pharmaciesData?: PharmaciesData;
    adminsCount: number;
    loading?: boolean;
}

// Map the limited super-admin data into the richer DashboardOverview used by
// the shared OverviewCards. Keep values conservative when missing.
const mapToOverview = (
    data: PharmaciesData | undefined,
    adminsCount: number,
): DashboardOverview => {
    const totalBranches =
        data?.pharmacies?.reduce((acc, p) => acc + (p.branchCount || 0), 0) ||
        0;
    const totalUsers =
        data?.pharmacies?.reduce((acc, p) => acc + (p.userCount || 0), 0) ||
        adminsCount ||
        0;

    return {
        totalRevenue: 0,
        totalProfit: 0,
        profitMargin: 0,
        averageOrderValue: 0,
        totalSales: 0,
        totalCustomers: totalUsers,
        totalDrugs: 0,
        lowStockCount: 0,
        totalBranches,
        totalAdmins: adminsCount,
    } as unknown as DashboardOverview;
};

const OverviewCardsAdapter: React.FC<Props> = ({
    pharmaciesData,
    adminsCount,
    loading = false,
}) => {
    const overview = mapToOverview(pharmaciesData, adminsCount);

    return <SharedOverview overview={overview} isLoading={loading} />;
};

export default OverviewCardsAdapter;
