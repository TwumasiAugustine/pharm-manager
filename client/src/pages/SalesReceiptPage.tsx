import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '../components/atoms/Button';
import DashboardLayout from '../layouts/DashboardLayout';
import Receipt from '../components/molecules/Receipt';
import {
    Alert,
    AlertTitle,
    AlertDescription,
} from '../components/molecules/Alert';
import { getErrorMessage } from '../utils/error';
import type { Sale } from '../types/sale.types';
import type { Drug } from '../types/drug.types';

const fetchSale = async (id: string) => {
    const res = await axios.get(`/api/sales/${id}`);
    return res.data.data;
};

const fetchDrugs = async () => {
    const res = await axios.get('/api/drugs');
    return res.data.data;
};

const SalesReceiptPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        data: sale,
        isLoading: saleLoading,
        error: saleError,
    } = useQuery<Sale>({
        queryKey: ['sale', id],
        queryFn: () => fetchSale(id!),
        enabled: !!id,
    });
    const {
        data: drugs,
        isLoading: drugsLoading,
        error: drugsError,
    } = useQuery<Drug[]>({
        queryKey: ['drugs'],
        queryFn: fetchDrugs,
    });
    if (saleError || drugsError) {
        return (
            <DashboardLayout>
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {getErrorMessage(saleError || drugsError)}
                    </AlertDescription>
                </Alert>
            </DashboardLayout>
        );
    }
    if (saleLoading || drugsLoading || !sale || !drugs) {
        return (
            <DashboardLayout>
                <div className="text-center py-10">Loading...</div>
            </DashboardLayout>
        );
    }
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center py-8">
                <Receipt sale={sale} drugs={drugs} />
                <div className="mt-6 flex gap-4">
                    <Button onClick={() => window.print()}>
                        Print Receipt
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/sales')}
                    >
                        Back to Sales
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SalesReceiptPage;
