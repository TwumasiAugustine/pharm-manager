import { useCurrentUser } from './useAuth';
import { UserRole } from '../types/user.types';

/**
 * Hook to automatically manage branch context for non-admin users
 * This ensures that all data operations are scoped to the user's assigned branch
 */
export const useBranchContext = () => {
    const { data: user } = useCurrentUser();

    // Determine if user can work across branches (only SUPER_ADMIN and ADMIN can)
    const canAccessAllBranches =
        user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN;

    // Get user's assigned branch
    const userBranch = user?.branch;
    const userBranchId = userBranch?.id || user?.branchId;

    // For non-admin users, enforce branch scope
    const enforceBranchScope = !canAccessAllBranches && !!userBranchId;

    // Get the effective branch ID for queries and operations
    const getEffectiveBranchId = (
        providedBranchId?: string,
    ): string | undefined => {
        if (enforceBranchScope) {
            // Non-admin users can only work with their assigned branch
            return userBranchId;
        }
        // Admin users can work with any branch or all branches
        return providedBranchId;
    };

    // Get filter parameters that respect branch restrictions
    const getBranchFilterParams = (filters: Record<string, unknown> = {}) => {
        if (enforceBranchScope) {
            // Force branch filter to user's branch for non-admin users
            return {
                ...filters,
                branchId: userBranchId,
            };
        }
        // Admin users can use any filters
        return filters;
    };

    // Check if user can perform branch-specific operations
    const canPerformBranchOperation = (targetBranchId?: string): boolean => {
        if (canAccessAllBranches) {
            return true; // Admins can work with any branch
        }

        if (!userBranchId) {
            return false; // User has no branch assigned
        }

        if (!targetBranchId) {
            return true; // Operation will use user's default branch
        }

        return targetBranchId === userBranchId; // User can only work with their assigned branch
    };

    return {
        user,
        userBranch,
        userBranchId,
        canAccessAllBranches,
        enforceBranchScope,
        getEffectiveBranchId,
        getBranchFilterParams,
        canPerformBranchOperation,
    };
};

export default useBranchContext;
