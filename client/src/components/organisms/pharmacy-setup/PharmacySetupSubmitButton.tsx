import React from 'react';
import { FiSave } from 'react-icons/fi';
import { Card, CardContent } from '../../molecules/Card';

interface PharmacySetupSubmitButtonProps {
    isPending: boolean;
}

export const PharmacySetupSubmitButton: React.FC<
    PharmacySetupSubmitButtonProps
> = ({ isPending }) => {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                            Ready to save your pharmacy information?
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                            This information will be used throughout the system
                            and on printed receipts.
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave className="h-4 w-4" />
                                Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};
