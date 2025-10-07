import React from 'react';
import { Card, CardContent } from '../../components/molecules/Card';
import { FaStore, FaUserTie, FaBuilding, FaUsers } from 'react-icons/fa';
import type { IPharmacyResponse, IPharmacy } from '../../api/super-admin.api';

interface OverviewCardsProps {
    pharmaciesData?: IPharmacyResponse;
    adminsCount: number;
    loading?: boolean;
}

const CardSkeleton: React.FC = () => (
    <Card>
        <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 min-h-[96px]">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 animate-pulse rounded-lg mb-3 sm:mb-0 sm:mr-4"></div>
            <div className="flex-1 w-full text-center sm:text-left">
                <div className="h-6 bg-gray-200 animate-pulse rounded mb-2 w-24 mx-auto sm:mx-0"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-20 mx-auto sm:mx-0"></div>
            </div>
        </CardContent>
    </Card>
);

const OverviewCards: React.FC<OverviewCardsProps> = ({
    pharmaciesData,
    adminsCount,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
                <CardContent className="flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 min-h-[120px]">
                    <FaStore className="text-3xl sm:text-4xl lg:text-4xl text-blue-600 mb-3 sm:mb-0 sm:mr-4" />
                    <div className="w-full text-center sm:text-left">
                        <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900">
                            {pharmaciesData?.pagination?.total || 0}
                        </h3>
                        <p className="text-gray-600">Total Pharmacies</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 min-h-[120px]">
                    <FaUserTie className="text-3xl sm:text-4xl lg:text-4xl text-green-600 mb-3 sm:mb-0 sm:mr-4" />
                    <div className="w-full text-center sm:text-left">
                        <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900">
                            {adminsCount}
                        </h3>
                        <p className="text-gray-600">Total Admins</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 min-h-[120px]">
                    <FaBuilding className="text-3xl sm:text-4xl lg:text-4xl text-purple-600 mb-3 sm:mb-0 sm:mr-4" />
                    <div className="w-full text-center sm:text-left">
                        <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900">
                            {pharmaciesData?.pharmacies?.reduce(
                                (acc: number, p: IPharmacy) =>
                                    acc + (p.branchCount || 0),
                                0,
                            ) || 0}
                        </h3>
                        <p className="text-gray-600">Total Branches</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 min-h-[120px]">
                    <FaUsers className="text-3xl sm:text-4xl lg:text-4xl text-orange-600 mb-3 sm:mb-0 sm:mr-4" />
                    <div className="w-full text-center sm:text-left">
                        <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900">
                            {pharmaciesData?.pharmacies?.reduce(
                                (acc: number, p: IPharmacy) =>
                                    acc + (p.userCount || 0),
                                0,
                            ) || 0}
                        </h3>
                        <p className="text-gray-600">Total Users</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OverviewCards;
