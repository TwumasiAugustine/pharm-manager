import React from 'react';
import { BranchSelect } from '../molecules/BranchSelect';
import { SalesPageActions } from './SalesPageActions';

interface SalesHeaderProps {
    branchId: string;
    showActionsDropdown: boolean;
    isLoading: boolean;
    isGrouped: boolean;
    actionsDropdownRef: React.RefObject<HTMLDivElement | null>;
    onBranchChange: (branchId: string) => void;
    onToggleActionsDropdown: () => void;
    onToggleFilters: () => void;
    onRefresh: () => void;
    onToggleGrouping: () => void;
    onCreateSale: () => void;
}

export const SalesHeader: React.FC<SalesHeaderProps> = ({
    branchId,
    showActionsDropdown,
    isLoading,
    isGrouped,
    actionsDropdownRef,
    onBranchChange,
    onToggleActionsDropdown,
    onToggleFilters,
    onRefresh,
    onToggleGrouping,
    onCreateSale,
}) => {
    return (
        <>
            <div className="flex items-center gap-3 mb-4">
                <BranchSelect value={branchId} onChange={onBranchChange} />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Sales History
                </h2>

                <SalesPageActions
                    showActionsDropdown={showActionsDropdown}
                    onToggleActionsDropdown={onToggleActionsDropdown}
                    onToggleFilters={onToggleFilters}
                    onRefresh={onRefresh}
                    onToggleGrouping={onToggleGrouping}
                    onCreateSale={onCreateSale}
                    isLoading={isLoading}
                    isGrouped={isGrouped}
                    actionsDropdownRef={actionsDropdownRef}
                />
            </div>
        </>
    );
};
