import React from 'react';
import { ExpiryPageActions } from './ExpiryPageActions';
import {  type User } from '../../types/auth.types';
import type { ExpiryDrug } from '../../types/expiry.types';

interface ExpiryPageHeaderProps {
    user: User | null;
    onRefresh: () => void;
    onExport: () => void;
    onToggleFilters: () => void;
    onToggleNotifications: () => void;
    onTriggerNotifications: () => void;
    isLoading: boolean;
    isTriggering: boolean;
    unreadNotifications: number;
    expiringDrugs: ExpiryDrug[];
    notificationsDropdownRef: React.RefObject<HTMLDivElement>;
    showActionsDropdown: boolean;
    setShowActionsDropdown: (show: boolean) => void;
    actionsDropdownRef: React.RefObject<HTMLDivElement>;
}

export const ExpiryPageHeader: React.FC<ExpiryPageHeaderProps> = ({
    user,
    onRefresh,
    onExport,
    onToggleFilters,
    onToggleNotifications,
    onTriggerNotifications,
    isLoading,
    isTriggering,
    unreadNotifications,
    expiringDrugs,
    showActionsDropdown,
    setShowActionsDropdown,
    actionsDropdownRef,
}) => {
    return (
        <div className="bg-white shadow-sm border-b">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Expiry Tracker
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Monitor drug expiration dates and manage inventory
                            alerts
                        </p>
                    </div>
                    <ExpiryPageActions
                        user={user}
                        showActionsDropdown={showActionsDropdown}
                        onToggleActionsDropdown={() =>
                            setShowActionsDropdown(!showActionsDropdown)
                        }
                        onToggleFilters={onToggleFilters}
                        onRefresh={onRefresh}
                        onTriggerNotifications={onTriggerNotifications}
                        onExport={onExport}
                        onToggleNotifications={onToggleNotifications}
                        isLoading={isLoading}
                        isTriggering={isTriggering}
                        expiringDrugs={expiringDrugs}
                        unreadNotifications={unreadNotifications}
                        actionsDropdownRef={actionsDropdownRef}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExpiryPageHeader;
