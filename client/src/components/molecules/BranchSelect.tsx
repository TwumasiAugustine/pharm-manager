import { useEffect } from 'react';
import { useBranches } from '../../hooks/useBranches';
import { useCurrentUser } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { UserRole } from '../../types/user.types';

interface BranchSelectProps {
    value?: string;
    onChange: (id: string) => void;
    required?: boolean;
    mode?: 'form' | 'filter'; // New prop to determine behavior
    allowEmpty?: boolean; // Allow "All Branches" option in filter mode
    placeholder?: string;
}

export function BranchSelect({
    value,
    onChange,
    required = true,
    mode = 'form',
    allowEmpty = false,
    placeholder = 'Select Branch',
}: BranchSelectProps) {
    const { data: branches, isLoading } = useBranches();
    const { data: user } = useCurrentUser();
    const { getUserScope } = usePermissions();

    // Determine if user can change branch based on role hierarchy
    const userScope = getUserScope();
    const canChangeBranch = userScope === 'system' || userScope === 'pharmacy';

    // Get user's assigned branch - handle both direct branchId and branch object
    const userBranch = user?.branch;
    const userBranchId = userBranch?.id || user?.branchId;

    // In filter mode, allow branch selection for visibility/filtering purposes
    // In form mode, enforce branch restrictions for data entry
    const shouldEnforceBranchRestriction = mode === 'form' && !canChangeBranch;
    const isDisabled = shouldEnforceBranchRestriction && !!userBranchId;

    // Auto-select user's branch for non-admin users in form mode
    // For filter mode, non-admin users should still default to their branch if no selection
    useEffect(() => {
        if (userBranchId && !value) {
            if (shouldEnforceBranchRestriction) {
                // Form mode: auto-select and lock to user's branch
                onChange(userBranchId);
            } else if (mode === 'filter' && !canChangeBranch) {
                // Filter mode for non-admin: default to user's branch but allow changes
                onChange(userBranchId);
            }
        }
    }, [
        shouldEnforceBranchRestriction,
        userBranchId,
        value,
        onChange,
        mode,
        canChangeBranch,
    ]);

    // For non-admin users in form mode, use their branch; otherwise use provided value
    const effectiveValue = shouldEnforceBranchRestriction
        ? userBranchId || ''
        : value || '';
    if (isLoading)
        return (
            <div className="relative">
                <select
                    disabled
                    aria-label="Select Branch"
                    className="block w-full rounded-md border border-gray-300 bg-gray-100 text-sm font-semibold py-2 px-3 pr-8 text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                >
                    <option>Loading branches...</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300">
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </span>
            </div>
        );

    // For admin users, if no branches are loaded, show a different message
    if (
        user?.role === UserRole.ADMIN &&
        (!branches || branches.length === 0) &&
        !isLoading
    ) {
        return (
            <div className="relative">
                <select
                    disabled
                    aria-label="No Branches Available"
                    className="block w-full rounded-md border border-red-300 bg-red-50 text-sm font-semibold py-2 px-3 pr-8 text-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all appearance-none"
                >
                    <option>
                        No branches available - Create a branch first
                    </option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-red-500">
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </span>
            </div>
        );
    }

    // Show branch assignment message for non-admin users without branch in form mode
    // Admins should always be able to select branches regardless of their assignment
    if (
        shouldEnforceBranchRestriction &&
        !userBranchId &&
        user?.role !== UserRole.ADMIN
    ) {
        return (
            <div className="relative">
                <select
                    disabled
                    aria-label="No Branch Assigned"
                    className="block w-full rounded-md border border-gray-300 bg-gray-100 text-sm font-semibold py-2 px-3 pr-8 text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                >
                    <option>No branch assigned</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300">
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </span>
            </div>
        );
    }
    return (
        <div className="relative">
            {shouldEnforceBranchRestriction && userBranchId && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 z-10">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Assigned
                    </span>
                </div>
            )}
            <select
                value={effectiveValue}
                onChange={(e) =>
                    isDisabled ? undefined : onChange(e.target.value)
                }
                required={required}
                disabled={isDisabled}
                aria-label={
                    isDisabled
                        ? `Branch: ${userBranch?.name || 'Assigned Branch'}`
                        : placeholder
                }
                className={`block w-full rounded-md border border-gray-300 text-sm font-semibold py-2 px-3 pr-8 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none ${
                    isDisabled
                        ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                        : 'bg-white text-gray-700 cursor-pointer'
                }`}
            >
                {/* Show placeholder/empty option for admins or filter mode */}
                {(canChangeBranch ||
                    mode === 'filter' ||
                    user?.role === UserRole.ADMIN) && (
                    <option value="">
                        {mode === 'filter' && allowEmpty
                            ? 'All Branches'
                            : user?.role === UserRole.ADMIN
                            ? 'All Branches'
                            : canChangeBranch && mode === 'form'
                            ? 'Select a branch...'
                            : placeholder}
                    </option>
                )}
                {branches?.map((branch: { id: string; name: string }) => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name}
                        {shouldEnforceBranchRestriction &&
                        branch.id === userBranchId
                            ? ' (Your Branch)'
                            : ''}
                    </option>
                ))}
                {/* Show user's branch even if not in the general branches list */}
                {shouldEnforceBranchRestriction &&
                    userBranch &&
                    !branches?.find((b) => b.id === userBranchId) && (
                        <option value={userBranchId}>
                            {userBranch.name} (Your Branch)
                        </option>
                    )}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </span>
            {isDisabled && (
                <div
                    className="absolute inset-0 cursor-not-allowed"
                    title="Branch assignment is managed by your administrator"
                />
            )}
        </div>
    );
}
