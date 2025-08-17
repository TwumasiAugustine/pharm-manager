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
import saleApi from '../api/sale.api';
import { useAuthStore } from '../store/auth.store';
import { useDrugs } from '../hooks/useDrugs';
import { usePharmacyInfo } from '../hooks/usePharmacy';
import { useSafeNotify } from '../utils/useSafeNotify';
import LoadingSkeleton from '../components/organisms/LoadingSkeleton';
import ReactDOMServer from 'react-dom/server';

const SalesReceiptPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notify = useSafeNotify();
    const { user } = useAuthStore();
    const [shortCodeInput, setShortCodeInput] = React.useState('');
    const [finalizing, setFinalizing] = React.useState(false);
    const [finalizeError, setFinalizeError] = React.useState<string | null>(
        null,
    );
    // sale will be loaded below, so finalized state is derived from sale
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

    // No need for finalized state, use enhancedSale.finalized directly

    // Use useMemo to prevent re-creation on every render
    const drugs = React.useMemo(
        () => drugsResponse?.drugs || [],
        [drugsResponse],
    );

    // Enhance sale data with drug information - placed immediately after all hooks
    const enhancedSale = React.useMemo(() => {
        if (!sale) return null;

        return {
            ...sale,
            items:
                sale.items?.map((item) => {
                    // Try to find matching drug from drugs array
                    const matchingDrug = drugs.find(
                        (drug) =>
                            drug.id === item.drugId || drug._id === item.drugId,
                    );

                    // If found, add drug property to item
                    if (matchingDrug) {
                        return {
                            ...item,
                            drug: matchingDrug,
                            name: item.name || matchingDrug.name,
                            brand: item.brand || matchingDrug.brand,
                        };
                    }

                    return item;
                }) || [],
        };
    }, [sale, drugs]);

    const handlePrint = () => {
        if (!enhancedSale || !pharmacyInfo) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            notify.warning('Please allow popups to print the receipt.');
            return;
        }

        const receiptHtml = ReactDOMServer.renderToString(
            <Receipt
                sale={enhancedSale}
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

    if (!enhancedSale) return null;

    // Show finalize/print UI if not finalized, user has FINALIZE_SALE permission, and shortCode exists
    const canFinalize =
        !enhancedSale.finalized &&
        user?.permissions?.includes('FINALIZE_SALE') &&
        enhancedSale.shortCode;

    return (
        <DashboardLayout>
            <div className="flex flex-col items-center py-8 bg-gray-50">
                <Receipt
                    sale={enhancedSale}
                    drugs={drugs}
                    pharmacyInfo={pharmacyInfo?.pharmacyInfo}
                />
                {canFinalize ? (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded text-center w-full max-w-md">
                        <div className="text-lg font-bold text-blue-800 mb-2">
                            Enter Sale Short Code to Finalize & Print
                        </div>
                        <input
                            type="text"
                            value={shortCodeInput}
                            onChange={(e) =>
                                setShortCodeInput(e.target.value.toUpperCase())
                            }
                            className="border rounded px-3 py-2 w-full text-center font-mono text-xl mb-2"
                            placeholder="Enter short code"
                            maxLength={8}
                            disabled={finalizing}
                        />
                        {finalizeError && (
                            <div className="text-red-600 text-sm mb-2">
                                {finalizeError}
                            </div>
                        )}
                        <Button
                            onClick={async () => {
                                setFinalizing(true);
                                setFinalizeError(null);
                                try {
                                    await saleApi.finalizeSaleByShortCode(
                                        shortCodeInput,
                                    );
                                    notify.success(
                                        'Sale finalized! You can now print the receipt.',
                                    );
                                } catch (e) {
                                    setFinalizeError(
                                        (e as any)?.response?.data?.message ||
                                            'Invalid or expired code',
                                    );
                                } finally {
                                    setFinalizing(false);
                                }
                            }}
                            isLoading={finalizing}
                            className="w-full mt-2"
                        >
                            Finalize & Print
                        </Button>
                    </div>
                ) : (
                    <div className="mt-6 flex gap-4 print:hidden">
                        <Button onClick={handlePrint}>Print Receipt</Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/sales')}
                        >
                            Back to Sales
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SalesReceiptPage;
