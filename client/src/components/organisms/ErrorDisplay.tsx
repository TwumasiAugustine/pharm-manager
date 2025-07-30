import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '../molecules/Alert';
import { Button } from '../atoms/Button';
import { FaArrowLeft } from 'react-icons/fa';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getErrorMessage } from '../../utils/error';

interface ErrorDisplayProps {
    error: Error;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => (
    <DashboardLayout>
        <Alert
            variant={
                error.message === 'Sale not found' ? 'default' : 'destructive'
            }
        >
            <AlertTitle>
                {error.message === 'Sale not found'
                    ? 'Sale Not Found'
                    : 'Error Loading Sale Details'}
            </AlertTitle>
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            <div className="mt-4">
                <Button
                    variant="secondary"
                    onClick={() => window.history.back()}
                >
                    <FaArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sales List
                </Button>
            </div>
        </Alert>
    </DashboardLayout>
);

export default ErrorDisplay;
