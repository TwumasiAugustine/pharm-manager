import React, { useState } from 'react';
import {
    FiSettings,
    FiShield,
    FiClock,
    FiCheck,
    FiX,
} from 'react-icons/fi';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../molecules/Card';

interface PharmacySystemSettingsProps {
    requireShortCode: boolean;
    shortCodeExpiryMinutes: number;
    toggleLoading: boolean;
    isUpdatingSettings: boolean;
    onToggleShortCode: () => void;
    onUpdateExpiryMinutes: (minutes: number) => void;
}

export const PharmacySystemSettings: React.FC<
    PharmacySystemSettingsProps
> = ({
    requireShortCode,
    shortCodeExpiryMinutes,
    toggleLoading,
    isUpdatingSettings,
    onToggleShortCode,
    onUpdateExpiryMinutes,
}) => {
    const [localExpiryMinutes, setLocalExpiryMinutes] = useState(
        shortCodeExpiryMinutes,
    );

    const handleUpdateExpiry = () => {
        onUpdateExpiryMinutes(localExpiryMinutes);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FiSettings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    System Settings
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                    Configure system-wide settings and features
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <FiShield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                    <h4 className="text-sm sm:text-base font-semibold text-blue-900">
                                        Sale Short Code Security
                                    </h4>
                                </div>
                                <p className="text-xs sm:text-sm text-blue-700">
                                    When enabled, cashiers must enter a
                                    generated short code to finalize and print
                                    sales receipts.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onToggleShortCode}
                                disabled={toggleLoading}
                                className={`
                                    px-3 py-2 sm:px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm
                                    ${
                                        requireShortCode
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] sm:min-w-[120px]
                                `}
                            >
                                {toggleLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : requireShortCode ? (
                                    <>
                                        <FiCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">
                                            Enabled
                                        </span>
                                        <span className="sm:hidden">On</span>
                                    </>
                                ) : (
                                    <>
                                        <FiX className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">
                                            Disabled
                                        </span>
                                        <span className="sm:hidden">Off</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {requireShortCode && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col gap-3 sm:gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiClock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                        <h4 className="text-sm sm:text-base font-semibold text-amber-900">
                                            Short Code Expiry Time
                                        </h4>
                                    </div>
                                    <p className="text-xs sm:text-sm text-amber-700 mb-3">
                                        Set how long short codes remain valid
                                        before expiring. Expired sales are
                                        automatically cleaned up and drug
                                        quantities are restored.
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                max="1440"
                                                value={localExpiryMinutes}
                                                onChange={(e) => {
                                                    const value = parseInt(
                                                        e.target.value,
                                                    );
                                                    if (!isNaN(value)) {
                                                        setLocalExpiryMinutes(
                                                            value,
                                                        );
                                                    }
                                                }}
                                                onBlur={handleUpdateExpiry}
                                                className="w-16 sm:w-20 px-2 sm:px-3 py-1 border border-amber-300 rounded-md text-amber-900 bg-white focus:border-amber-500 focus:outline-none text-sm"
                                                disabled={isUpdatingSettings}
                                            />
                                            <span className="text-xs sm:text-sm text-amber-700 font-medium">
                                                minutes
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {[15, 30, 60].map((mins) => (
                                                <button
                                                    key={mins}
                                                    type="button"
                                                    onClick={() => {
                                                        setLocalExpiryMinutes(
                                                            mins,
                                                        );
                                                        onUpdateExpiryMinutes(
                                                            mins,
                                                        );
                                                    }}
                                                    className="px-2 py-1 text-xs bg-amber-200 text-amber-800 rounded hover:bg-amber-300 transition-colors"
                                                    disabled={isUpdatingSettings}
                                                >
                                                    {mins < 60
                                                        ? `${mins}m`
                                                        : `${mins / 60}h`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-amber-600 mt-2">
                                        Range: 1 minute to 1440 minutes (24
                                        hours)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
