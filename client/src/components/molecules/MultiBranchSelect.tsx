import React, { useState, useEffect, useRef } from 'react';
import { useBranches } from '../../hooks/useBranches';
import { useCurrentUser } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { UserRole } from '../../types/user.types';
import { FaChevronDown, FaCheck, FaTimes } from 'react-icons/fa';

interface MultiBranchSelectProps {
    value?: string[]; // Array of selected branch IDs
    onChange: (ids: string[]) => void;
    placeholder?: string;
    allowSelectAll?: boolean;
    maxSelections?: number;
}

export function MultiBranchSelect({
    value = [],
    onChange,
    placeholder = 'Select branches',
    allowSelectAll = true,
    maxSelections,
}: MultiBranchSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: branches, isLoading } = useBranches();
    const { data: user } = useCurrentUser();
    const { getUserScope } = usePermissions();

    const userScope = getUserScope();
    const canSelectMultipleBranches =
        userScope === 'system' ||
        userScope === 'pharmacy' ||
        user?.role === UserRole.ADMIN;

    // Filter branches based on search term
    const filteredBranches =
        branches?.filter((branch) =>
            branch.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ) || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBranchToggle = (branchId: string) => {
        if (!canSelectMultipleBranches) {
            // For non-admin users, only allow single selection
            onChange([branchId]);
            setIsOpen(false);
            return;
        }

        const currentSelection = [...value];
        const isSelected = currentSelection.includes(branchId);

        if (isSelected) {
            // Remove from selection
            const newSelection = currentSelection.filter(
                (id) => id !== branchId,
            );
            onChange(newSelection);
        } else {
            // Add to selection (check max limit)
            if (!maxSelections || currentSelection.length < maxSelections) {
                onChange([...currentSelection, branchId]);
            }
        }
    };

    const handleSelectAll = () => {
        if (!canSelectMultipleBranches) return;

        const allBranchIds = filteredBranches.map((branch) => branch.id);
        const isAllSelected = allBranchIds.every((id) => value.includes(id));

        if (isAllSelected) {
            // Deselect all filtered branches
            const remainingSelection = value.filter(
                (id) => !allBranchIds.includes(id),
            );
            onChange(remainingSelection);
        } else {
            // Select all filtered branches
            const newSelection = [...new Set([...value, ...allBranchIds])];
            onChange(
                maxSelections
                    ? newSelection.slice(0, maxSelections)
                    : newSelection,
            );
        }
    };

    const handleRemoveBranch = (branchId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        const newSelection = value.filter((id) => id !== branchId);
        onChange(newSelection);
    };

    const getSelectedBranchNames = () => {
        return (
            branches
                ?.filter((branch) => value.includes(branch.id))
                .map((branch) => branch.name) || []
        );
    };

    const selectedNames = getSelectedBranchNames();
    const isAllSelected = branches
        ? branches.every((branch) => value.includes(branch.id))
        : false;

    if (isLoading) {
        return (
            <div className="relative">
                <div className="block w-full rounded-md border border-gray-300 bg-gray-100 text-sm py-2 px-3 pr-8 text-gray-400 min-h-[38px] flex items-center">
                    Loading branches...
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Main Input Display */}
            <div
                className={`block w-full rounded-md border border-gray-300 bg-white text-sm py-2 px-3 pr-8 min-h-[38px] cursor-pointer focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition-all ${
                    isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1 items-center">
                    {value.length === 0 ? (
                        <span className="text-gray-500">{placeholder}</span>
                    ) : canSelectMultipleBranches && value.length > 2 ? (
                        <span className="text-gray-700">
                            {isAllSelected
                                ? 'All Branches'
                                : `${value.length} branches selected`}
                        </span>
                    ) : (
                        selectedNames.map((name, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                                {name}
                                {canSelectMultipleBranches && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            const branchId = branches?.find(
                                                (b) => b.name === name,
                                            )?.id;
                                            if (branchId)
                                                handleRemoveBranch(branchId, e);
                                        }}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                )}
                            </span>
                        ))
                    )}
                </div>

                {/* Dropdown Arrow */}
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                    <FaChevronDown
                        className={`h-3 w-3 transition-transform duration-200 ${
                            isOpen ? 'transform rotate-180' : ''
                        }`}
                    />
                </span>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search branches..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Select All Option */}
                    {canSelectMultipleBranches &&
                        allowSelectAll &&
                        filteredBranches.length > 1 && (
                            <div
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center justify-between"
                                onClick={handleSelectAll}
                            >
                                <span className="text-sm font-medium text-blue-600">
                                    {filteredBranches.every((branch) =>
                                        value.includes(branch.id),
                                    )
                                        ? 'Deselect All'
                                        : 'Select All'}
                                </span>
                                {filteredBranches.every((branch) =>
                                    value.includes(branch.id),
                                ) && (
                                    <FaCheck className="text-blue-600 text-xs" />
                                )}
                            </div>
                        )}

                    {/* Branch Options */}
                    <div className="max-h-40 overflow-y-auto">
                        {filteredBranches.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                No branches found
                            </div>
                        ) : (
                            filteredBranches.map((branch) => {
                                const isSelected = value.includes(branch.id);
                                const isMaxReached =
                                    maxSelections &&
                                    value.length >= maxSelections &&
                                    !isSelected;

                                return (
                                    <div
                                        key={branch.id}
                                        className={`px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-sm ${
                                            isSelected
                                                ? 'bg-blue-50 text-blue-700'
                                                : ''
                                        } ${
                                            isMaxReached
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            !isMaxReached &&
                                            handleBranchToggle(branch.id)
                                        }
                                    >
                                        <span>{branch.name}</span>
                                        {isSelected && (
                                            <FaCheck className="text-blue-600 text-xs" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Selection Info */}
                    {maxSelections && (
                        <div className="px-3 py-1 border-t border-gray-200 text-xs text-gray-500">
                            {value.length}/{maxSelections} selected
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MultiBranchSelect;
