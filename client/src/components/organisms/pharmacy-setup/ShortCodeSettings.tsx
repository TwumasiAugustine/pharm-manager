import React from 'react';
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

interface ShortCodeSettingsProps {
    requireShortCode: boolean;
    shortCodeExpiryMinutes: number;
    toggleLoading: boolean;
    isUpdatingSettings: boolean;
    onToggleShortCode: () => void;
    onUpdateExpiryMinutes: (minutes: number) => void;
    onExpiryMinutesChange: (minutes: number) => void;
}

export const ShortCodeSettings: React.FC<ShortCodeSettingsProps> = ({
    requireShortCode,
    shortCodeExpiryMinutes,
    toggleLoading,
    isUpdatingSettings,
    onToggleShortCode,
    onUpdateExpiryMinutes,
    onExpiryMinutesChange,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FiSettings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    System Settings
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                    Configure system-wide settings and features
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Short Code Toggle */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <FiShield className="h-4 w-4 text-blue-600" />
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
                                    w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2
                                    ${
                                        requireShortCode
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {toggleLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : requireShortCode ? (
                                    <>
                                        <FiCheck className="h-4 w-4" />
                                        Enabled
                                    </>
                                ) : (
                                    <>
                                        <FiX className="h-4 w-4" />
                                        Disabled
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Expiry Time Configuration */}
                    {requireShortCode && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiClock className="h-4 w-4 text-amber-600" />
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
                                                value={shortCodeExpiryMinutes}
                                                onChange={(e) => {
                                                    const value = parseInt(
                                                        e.target.value,
                                                    );
                                                    if (!isNaN(value)) {
                                                        onExpiryMinutesChange(
                                                            value,
                                                        );
                                                    }
                                                }}
                                                onBlur={() =>
                                                    onUpdateExpiryMinutes(
                                                        shortCodeExpiryMinutes,
                                                    )
                                                }
                                                className="w-20 px-3 py-1 border border-amber-300 rounded-md text-amber-900 bg-white focus:border-amber-500 focus:outline-none"
                                                disabled={isUpdatingSettings}
                                            />
                                            <span className="text-xs sm:text-sm text-amber-700 font-medium">
                                                minutes
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onUpdateExpiryMinutes(15)
                                                }
                                                className="px-2 py-1 text-xs bg-amber-200 text-amber-800 rounded hover:bg-amber-300 transition-colors"
                                                disabled={isUpdatingSettings}
                                            >
                                                15m
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onUpdateExpiryMinutes(30)
                                                }
                                                className="px-2 py-1 text-xs bg-amber-200 text-amber-800 rounded hover:bg-amber-300 transition-colors"
                                                disabled={isUpdatingSettings}
                                            >
                                                30m
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onUpdateExpiryMinutes(60)
                                                }
                                                className="px-2 py-1 text-xs bg-amber-200 text-amber-800 rounded hover:bg-amber-300 transition-colors"
                                                disabled={isUpdatingSettings}
                                            >
                                                1h
                                            </button>
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
