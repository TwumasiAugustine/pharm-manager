import React from 'react';
import { FaStore, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import { Card, CardContent, CardHeader } from '../molecules/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import PharmacyTable from '../../pages/super-admin/PharmacyTable';
import type { IPharmacy } from '../../api/super-admin.api';

interface PharmacyManagementSectionProps {
    pharmacies: IPharmacy[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onClearSearch: () => void;
    onCreatePharmacy: () => void;
    onDeletePharmacy: (pharmacy: IPharmacy) => void;
    onAssignAdmin: (pharmacy: IPharmacy) => void;
    pagination: {
        current: number;
        total: number;
        onPageChange: (page: number) => void;
    };
}

const PharmacyManagementSection: React.FC<PharmacyManagementSectionProps> = ({
    pharmacies,
    loading,
    searchQuery,
    onSearchChange,
    onClearSearch,
    onCreatePharmacy,
    onDeletePharmacy,
    onAssignAdmin,
    pagination,
}) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FaStore className="text-blue-600" />
                        Pharmacy Management
                    </h2>
                    <Button onClick={onCreatePharmacy}>
                        <FaPlus className="mr-2" /> Create Pharmacy
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 relative">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search pharmacies..."
                            value={searchQuery}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => onSearchChange(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        {searchQuery && (
                            <button
                                onClick={onClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>

                <PharmacyTable
                    pharmacies={pharmacies}
                    loading={loading}
                    onDelete={onDeletePharmacy}
                    onAssign={onAssignAdmin}
                    pagination={pagination}
                />
            </CardContent>
        </Card>
    );
};

export default PharmacyManagementSection;
