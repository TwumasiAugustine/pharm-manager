/**
 * Pharmacy Access Utilities
 * Helper functions to check if users have access to specific pharmacies
 * considering both primary pharmacy assignment and additional pharmacy assignments
 */

import { ITokenPayload } from '../types/auth.types';
import User from '../models/user.model';
import { UserRole } from '../types/user.types';

/**
 * Check if a user has access to a specific pharmacy
 * Considers both primary pharmacy (pharmacyId) and assigned pharmacies
 */
export async function hasPharmacyAccess(
    userId: string,
    targetPharmacyId: string,
): Promise<boolean> {
    if (!userId || !targetPharmacyId) {
        return false;
    }

    const user = await User.findById(userId);
    if (!user) {
        return false;
    }

    // Super Admin has access to all pharmacies
    if (user.role === UserRole.SUPER_ADMIN) {
        return true;
    }

    // Check primary pharmacy assignment
    if (user.pharmacyId && user.pharmacyId.toString() === targetPharmacyId) {
        return true;
    }

    // Check assigned pharmacies for additional assignments
    if (user.assignedPharmacies && user.assignedPharmacies.length > 0) {
        const hasAssignment = user.assignedPharmacies.some(
            (assignment) =>
                assignment.pharmacyId.toString() === targetPharmacyId &&
                assignment.isActive,
        );
        if (hasAssignment) {
            return true;
        }
    }

    return false;
}

/**
 * Check if a user has access to a pharmacy based on token payload
 * This is a faster version that uses the token data without database lookup
 */
export function hasPharmacyAccessFromToken(
    userToken: ITokenPayload,
    targetPharmacyId: string,
): boolean {
    if (!userToken || !targetPharmacyId) {
        return false;
    }

    // Super Admin has access to all pharmacies
    if (userToken.role === UserRole.SUPER_ADMIN) {
        return true;
    }

    // Check primary pharmacy assignment
    if (userToken.pharmacyId === targetPharmacyId) {
        return true;
    }

    // Note: Token doesn't include assignedPharmacies array
    // For full access checking, use hasPharmacyAccess() instead
    return false;
}

/**
 * Get all pharmacy IDs that a user has access to
 * Returns array of pharmacy IDs including primary and assigned pharmacies
 */
export async function getUserPharmacyIds(userId: string): Promise<string[]> {
    if (!userId) {
        return [];
    }

    const user = await User.findById(userId);
    if (!user) {
        return [];
    }

    // Super Admin has access to all pharmacies (return empty array to indicate "all")
    if (user.role === UserRole.SUPER_ADMIN) {
        return [];
    }

    const pharmacyIds: string[] = [];

    // Add primary pharmacy
    if (user.pharmacyId) {
        pharmacyIds.push(user.pharmacyId.toString());
    }

    // Add assigned pharmacies
    if (user.assignedPharmacies && user.assignedPharmacies.length > 0) {
        const activeAssignments = user.assignedPharmacies
            .filter((assignment) => assignment.isActive)
            .map((assignment) => assignment.pharmacyId.toString());

        // Add unique assignments only
        activeAssignments.forEach((id) => {
            if (!pharmacyIds.includes(id)) {
                pharmacyIds.push(id);
            }
        });
    }

    return pharmacyIds;
}

/**
 * Validate that a user has access to perform operations on a specific pharmacy
 * Throws error if access is denied
 */
export async function validatePharmacyAccess(
    userId: string,
    targetPharmacyId: string,
    operation: string = 'access this pharmacy',
): Promise<void> {
    const hasAccess = await hasPharmacyAccess(userId, targetPharmacyId);

    if (!hasAccess) {
        throw new Error(
            `Access denied: You don't have permission to ${operation}`,
        );
    }
}
