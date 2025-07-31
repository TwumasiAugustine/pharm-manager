import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSale } from '../hooks/useSales';
import DashboardLayout from '../layouts/DashboardLayout';
import { Button } from '../components/atoms/Button';
import { FaArrowLeft } from 'react-icons/fa';
import LoadingSkeleton from '../components/organisms/LoadingSkeleton';
import ErrorDisplay from '../components/organisms/ErrorDisplay';
import SaleInfoCard from '../components/organisms/SaleInfoCard';
import ItemsTable from '../components/organisms/ItemsTable';
import PrintReceipt from '../components/organisms/PrintReceipt';

/**
 * SaleDetailsPage component
 * Displays detailed information about a single sale transaction
 * Uses modular components for different sections of the page
 */
const SaleDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data:sale, isLoading, error } = useSale(id!);

    // Handle loading state with skeleton UI
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Handle error state
    if (error) {
        return <ErrorDisplay error={error as Error} />;
    }

    // Handle not found state
    if (!sale) {
        const notFoundError = new Error('Sale not found');
        return <ErrorDisplay error={notFoundError} />;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header with navigation and print button */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={() => navigate('/sales')}
                    >
                        <FaArrowLeft className="h-4 w-4" />
                        Back to Sales List
                    </Button>
                    <PrintReceipt sale={sale} />
                </div>

                {/* Sale information card */}
                <SaleInfoCard sale={sale} />

                {/* Items table with pricing breakdown */}
                <ItemsTable
                    items={sale.items}
                    subtotal={sale.totalAmount}
                    tax={0}
                    discount={0}
                    totalAmount={sale.totalAmount}
                />
            </div>
        </DashboardLayout>
    );
};

export default SaleDetailsPage;
