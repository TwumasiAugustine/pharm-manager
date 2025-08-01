import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button';
import DashboardLayout from '../layouts/DashboardLayout';
import Receipt from '../components/molecules/Receipt';
import {
    Alert,
    AlertTitle,
    AlertDescription,
} from '../components/molecules/Alert';
import { getErrorMessage } from '../utils/error';
import { useSale } from '../hooks/useSales';
import { useDrugs } from '../hooks/useDrugs';
import { usePharmacyInfo } from '../hooks/usePharmacy';
import LoadingSkeleton from '../components/organisms/LoadingSkeleton';
import ReactDOMServer from 'react-dom/server';

const SalesReceiptPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        data: sale,
        isLoading: saleLoading,
        error: saleError,
    } = useSale(id!);

    const {
        data: drugsResponse,
        isLoading: drugsLoading,
        error: drugsError,
    } = useDrugs();

    const {
        data: pharmacyInfo,
        isLoading: pharmacyInfoLoading,
        error: pharmacyInfoError,
    } = usePharmacyInfo();

    const drugs = drugsResponse?.drugs || [];

    const handlePrint = () => {
        if (!sale || !pharmacyInfo) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print the receipt.');
            return;
        }

        const receiptHtml = ReactDOMServer.renderToString(
            <Receipt
                sale={sale}
                drugs={drugs}
                pharmacyInfo={pharmacyInfo.pharmacyInfo}
            />,
        );

        const stylesheets = Array.from(document.styleSheets)
            .map((styleSheet) => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map((rule) => rule.cssText)
                        .join('');
                } catch (e) {
                    console.warn('Could not read stylesheet rules:', e);
                    return '';
                }
            })
            .join('\n');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Receipt</title>
                    <style>${stylesheets}</style>
                </head>
                <body style="background-color: white; margin: 2rem;">
                    ${receiptHtml}
                </body>
            </html>
        `);

        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    if (saleError || drugsError || pharmacyInfoError) {
        return (
            <DashboardLayout>
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {getErrorMessage(
                            saleError || drugsError || pharmacyInfoError,
                        )}
                    </AlertDescription>
                </Alert>
            </DashboardLayout>
        );
    }

    if (saleLoading || drugsLoading || pharmacyInfoLoading || !sale) {
        return <LoadingSkeleton />;
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col items-center py-8 bg-gray-50">
                <Receipt
                    sale={sale}
                    drugs={drugs}
                    pharmacyInfo={pharmacyInfo?.pharmacyInfo}
                />
                <div className="mt-6 flex gap-4 print:hidden">
                    <Button onClick={handlePrint}>Print Receipt</Button>
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
