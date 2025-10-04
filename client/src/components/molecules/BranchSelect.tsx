import { useBranches } from '../../hooks/useBranches';
import { useCurrentUser } from '../../hooks/useAuth';
import { UserRole } from '../../types/user.types';
import { useEffect } from 'react';

export function BranchSelect({
    value,
    onChange,
    required = true,
}: {
    value?: string;
    onChange: (id: string) => void;
    required?: boolean;
}) {
    const { data: branches, isLoading } = useBranches();
    const { data: user } = useCurrentUser();

    // Determine if user can change branch (only SUPER_ADMIN and ADMIN can)
    const canChangeBranch =
        user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN;

    // Get user's assigned branch
    const userBranch = user?.branch;
    const userBranchId = userBranch?.id || user?.branchId;

    // Auto-select user's branch for non-admin users
    useEffect(() => {
        if (!canChangeBranch && userBranchId && !value) {
            onChange(userBranchId);
        }
    }, [canChangeBranch, userBranchId, value, onChange]);

    // For non-admin users, if they have a branch, use it and disable the select
    const effectiveValue = canChangeBranch ? value || '' : userBranchId || '';
    const isDisabled = !canChangeBranch && !!userBranchId;
    if (isLoading)
        return (
            <div className="relative">
                <select
                    disabled
                    aria-label="Select Branch"
                    className="block w-full rounded-md border border-gray-300 bg-gray-100 text-sm font-semibold py-2 px-3 pr-8 text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                >
                    <option>Loading...</option>
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

    // Show branch assignment message for non-admin users without branch
    if (!canChangeBranch && !userBranchId) {
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
            {!canChangeBranch && userBranchId && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 z-10">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Assigned
                    </span>
                </div>
            )}
            <select
                value={effectiveValue}
                onChange={(e) =>
                    canChangeBranch ? onChange(e.target.value) : undefined
                }
                required={required}
                disabled={isDisabled}
                aria-label={
                    isDisabled
                        ? `Branch: ${userBranch?.name || 'Assigned Branch'}`
                        : 'Select Branch'
                }
                className={`block w-full rounded-md border border-gray-300 text-sm font-semibold py-2 px-3 pr-8 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none ${
                    isDisabled
                        ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                        : 'bg-white text-gray-700 cursor-pointer'
                }`}
            >
                {canChangeBranch && <option value="">Select Branch</option>}
                {branches?.map((branch: { id: string; name: string }) => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name}
                        {!canChangeBranch && branch.id === userBranchId
                            ? ' (Your Branch)'
                            : ''}
                    </option>
                ))}
                {/* Show user's branch even if not in the general branches list */}
                {!canChangeBranch &&
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
