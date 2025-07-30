import React from 'react';
import { Button } from '../atoms/Button';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';

interface SaleHeaderProps {
    navigate: (path: number | string) => void;
}

const SaleHeader: React.FC<SaleHeaderProps> = ({ navigate }) => {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Sale Details
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Transaction information and items sold
                </p>
            </div>
            <div className="flex space-x-2">
                <Button
                    variant="secondary"
                    className="flex items-center"
                    onClick={() => navigate(-1)}
                >
                    <FaPrint className="mr-2 h-4 w-4" />
                    Print Receipt
                </Button>
                <Button
                    variant="secondary"
                    className="flex items-center"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
        </div>
    );
};

export default SaleHeader;
