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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
                <div className="container mx-auto px-4">
                    <Receipt
                        sale={enhancedSale}
                        drugs={drugs}
                        pharmacyInfo={pharmacyInfo?.pharmacyInfo}
                    />
                    {canFinalize ? (
                        <div className="mt-8 mx-auto max-w-md">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            className="w-8 h-8 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Finalize Sale
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Enter the sale short code to finalize
                                        and enable printing
                                    </p>
                                </div>
                                <input
                                    type="text"
                                    value={shortCodeInput}
                                    onChange={(e) =>
                                        setShortCodeInput(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center font-mono text-xl tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    placeholder="Enter short code"
                                    maxLength={8}
                                    disabled={finalizing}
                                />
                                {finalizeError && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm text-center">
                                            {finalizeError}
                                        </p>
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
                                                (e as any)?.response?.data
                                                    ?.message ||
                                                    'Invalid or expired code',
                                            );
                                        } finally {
                                            setFinalizing(false);
                                        }
                                    }}
                                    isLoading={finalizing}
                                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                                    disabled={
                                        !shortCodeInput.trim() || finalizing
                                    }
                                >
                                    {finalizing
                                        ? 'Finalizing...'
                                        : 'Finalize & Enable Print'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 flex justify-center gap-4 print:hidden">
                            <Button
                                onClick={handlePrint}
                                className="bg-green-600 hover:bg-green-700 focus:ring-green-500 px-8 py-3"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                    />
                                </svg>
                                Print Receipt
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/sales')}
                                className="px-8 py-3"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Back to Sales
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SalesReceiptPage;
