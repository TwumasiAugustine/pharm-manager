import { useState, useEffect } from 'react';
import { useCurrentUser } from './useAuth';
import { usePermissions } from './usePermissions';

/**
 * Hook to manage branch selection with automatic defaults for non-admin users
 * This hook should be used in pages that have branch filtering/selection
 */
export const useBranchSelection = (initialBranchId?: string) => {
    const { data: user } = useCurrentUser();
    const { getUserScope } = usePermissions();

    // Determine if user can change branch based on role hierarchy
    const userScope = getUserScope();
    const canChangeBranch = userScope === 'system' || userScope === 'pharmacy';

    // Get user's assigned branch
    const userBranch = user?.branch;
    const userBranchId = userBranch?.id || user?.branchId;

    // State for selected branch
    const [selectedBranchId, setSelectedBranchId] = useState<string>(
        initialBranchId || '',
    );

    // Auto-select user's branch if they can't change branches and no initial value provided
    useEffect(() => {
        if (
            !canChangeBranch &&
            userBranchId &&
            !initialBranchId &&
            !selectedBranchId
        ) {
            setSelectedBranchId(userBranchId);
        } else if (initialBranchId && initialBranchId !== selectedBranchId) {
            setSelectedBranchId(initialBranchId);
        }
    }, [canChangeBranch, userBranchId, initialBranchId, selectedBranchId]);

    // Handle branch change with automatic restriction for non-admin users
    const handleBranchChange = (branchId: string) => {
        if (!canChangeBranch && userBranchId) {
            // Non-admin users are restricted to their branch in some contexts
            // but in filter mode, they should be able to see "All Branches" option
            setSelectedBranchId(branchId);
        } else {
            setSelectedBranchId(branchId);
        }
    };

    // Get effective branch ID for API calls
    const getEffectiveBranchId = (): string | undefined => {
        if (!canChangeBranch && userBranchId) {
            // Non-admin users: use their assigned branch if no selection or "all branches"
            return selectedBranchId || userBranchId;
        }
        return selectedBranchId || undefined;
    };

    return {
        selectedBranchId,
        setSelectedBranchId: handleBranchChange,
        canChangeBranch,
        userBranchId,
        userBranch,
        getEffectiveBranchId,
        // Helper for API calls
        branchIdForAPI: getEffectiveBranchId(),
    };
};

export default useBranchSelection;
