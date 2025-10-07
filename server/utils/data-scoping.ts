import { UserRole } from '../types/user.types';
import { ITokenPayload } from '../types/auth.types';
import { Types } from 'mongoose';

/**
 * Data scoping utilities for multi-tenant pharmacy management
 * Ensures users only see data from their assigned pharmacy/branch
 */

export interface IScopingFilter {
    pharmacyId?: Types.ObjectId | string;
    branch?: Types.ObjectId | string;
    // Add other potential filtering fields as needed
}

/**
 * Get data scoping filter based on user role and assignments
 * @param user - The authenticated user from req.user
 * @returns MongoDB filter object for data scoping
 */
export function getDataScopingFilter(user: ITokenPayload): IScopingFilter {
    const filter: IScopingFilter = {};

    switch (user.role) {
        case UserRole.SUPER_ADMIN:
            // Super Admin sees all data across all pharmacies - no filter
            break;

        case UserRole.ADMIN:
            // Admin sees only data from their assigned pharmacy
            if (user.pharmacyId) {
                filter.pharmacyId = new Types.ObjectId(user.pharmacyId);
            }
            break;

        case UserRole.PHARMACIST:
        case UserRole.CASHIER:
            // Pharmacist/Cashier sees only data from their assigned pharmacy and branch
            if (user.pharmacyId) {
                filter.pharmacyId = new Types.ObjectId(user.pharmacyId);
            }
            if (user.branchId) {
                filter.branch = new Types.ObjectId(user.branchId);
            }
            break;

        default:
            // Unknown role - restrict to nothing for security
            filter.pharmacyId = new Types.ObjectId('000000000000000000000000'); // Non-existent ID
            break;
    }

    return filter;
}

/**
 * Get pharmacy scoping filter (ignores branch-level filtering)
 * Useful for pharmacy-level operations like user management, reporting, etc.
 * @param user - The authenticated user from req.user
 * @returns MongoDB filter object for pharmacy-level scoping
 */
export function getPharmacyScopingFilter(user: ITokenPayload): IScopingFilter {
    const filter: IScopingFilter = {};

    switch (user.role) {
        case UserRole.SUPER_ADMIN:
            // Super Admin sees all pharmacies - no filter
            break;

        case UserRole.ADMIN:
        case UserRole.PHARMACIST:
        case UserRole.CASHIER:
            // All non-super-admin users are scoped to their pharmacy
            if (user.pharmacyId) {
                filter.pharmacyId = new Types.ObjectId(user.pharmacyId);
            }
            break;

        default:
            // Unknown role - restrict to nothing for security
            filter.pharmacyId = new Types.ObjectId('000000000000000000000000'); // Non-existent ID
            break;
    }

    return filter;
}

/**
 * Get branch scoping filter (includes both pharmacy and branch filtering)
 * Useful for branch-specific operations like inventory, sales, etc.
 * @param user - The authenticated user from req.user
 * @returns MongoDB filter object for branch-level scoping
 */
export function getBranchScopingFilter(user: ITokenPayload): IScopingFilter {
    const filter: IScopingFilter = {};

    switch (user.role) {
        case UserRole.SUPER_ADMIN:
            // Super Admin sees all data - no filter
            break;

        case UserRole.ADMIN:
            // Admin sees all branches within their pharmacy
            if (user.pharmacyId) {
                filter.pharmacyId = new Types.ObjectId(user.pharmacyId);
            }
            break;

        case UserRole.PHARMACIST:
        case UserRole.CASHIER:
            // Pharmacist/Cashier sees only their specific branch
            if (user.pharmacyId) {
                filter.pharmacyId = new Types.ObjectId(user.pharmacyId);
            }
            if (user.branchId) {
                filter.branch = new Types.ObjectId(user.branchId);
            }
            break;

        default:
            // Unknown role - restrict to nothing for security
            filter.pharmacyId = new Types.ObjectId('000000000000000000000000'); // Non-existent ID
            break;
    }

    return filter;
}

/**
 * Check if user can access a specific pharmacy
 * @param user - The authenticated user from req.user
 * @param pharmacyId - The pharmacy ID to check access for
 * @returns true if user can access the pharmacy, false otherwise
 */
export function canAccessPharmacy(
    user: ITokenPayload,
    pharmacyId: string,
): boolean {
    switch (user.role) {
        case UserRole.SUPER_ADMIN:
            // Super Admin can access all pharmacies
            return true;

        case UserRole.ADMIN:
        case UserRole.PHARMACIST:
        case UserRole.CASHIER:
            // Other users can only access their assigned pharmacy
            return user.pharmacyId === pharmacyId;

        default:
            // Unknown role - deny access
            return false;
    }
}

/**
 * Check if user can access a specific branch
 * @param user - The authenticated user from req.user
 * @param branchId - The branch ID to check access for
 * @param pharmacyId - The pharmacy ID that owns the branch
 * @returns true if user can access the branch, false otherwise
 */
export function canAccessBranch(
    user: ITokenPayload,
    branchId: string,
    pharmacyId?: string,
): boolean {
    switch (user.role) {
        case UserRole.SUPER_ADMIN:
            // Super Admin can access all branches
            return true;

        case UserRole.ADMIN:
            // Admin can access all branches in their pharmacy
            if (pharmacyId) {
                return user.pharmacyId === pharmacyId;
            }
            // If no pharmacy ID provided, we can't determine access
            return false;

        case UserRole.PHARMACIST:
        case UserRole.CASHIER:
            // Pharmacist/Cashier can only access their specific branch
            return (
                user.branchId === branchId &&
                (pharmacyId ? user.pharmacyId === pharmacyId : true)
            );

        default:
            // Unknown role - deny access
            return false;
    }
}
