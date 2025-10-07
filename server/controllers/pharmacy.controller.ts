import { Request, Response } from 'express';
import PharmacyInfo from '../models/pharmacy-info.model';
import { UnauthorizedError } from '../utils/errors';
import { UserRole } from '../types/user.types';
import PermissionService from '../services/permission.service';
import { PHARMACY_PERMISSIONS } from '../constants/permissions';

// Admin level: Toggle requireSaleShortCode feature
export const toggleSaleShortCodeFeature = async (
    req: Request,
    res: Response,
) => {
    if (
        !req.user ||
        (req.user.role !== UserRole.ADMIN &&
            req.user.role !== UserRole.SUPER_ADMIN)
    ) {
        throw new UnauthorizedError(
            'Only admin level users can toggle this feature',
        );
    }
    const { enabled } = req.body;
    const info = await PharmacyInfo.findOneAndUpdate(
        {},
        { requireSaleShortCode: !!enabled },
        { new: true, upsert: true },
    );
    res.json({
        success: true,
        requireSaleShortCode: info.requireSaleShortCode,
    });
};
import {
    getPharmacyInfo,
    updatePharmacyInfo,
    checkConfigStatus,
} from '../services/pharmacy.service';
import User from '../models/user.model';

import { PharmacyManagementService } from '../services/pharmacy-management.service';
import { UserManagementService } from '../services/user-management.service';

const pharmacyManagementService = new PharmacyManagementService();
const userManagementService = new UserManagementService();

/**
 * Super Admin: Create a new pharmacy
 */
export const createPharmacy = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can create pharmacies',
            });
        }

        const pharmacy = await pharmacyManagementService.createPharmacy(
            req.body,
            req.user.id,
        );

        res.status(201).json({
            success: true,
            message: 'Pharmacy created successfully',
            data: pharmacy,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to create pharmacy',
        });
    }
};

/**
 * Super Admin: Get all pharmacies
 */
export const getAllPharmacies = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can view all pharmacies',
            });
        }

        const { page = 1, limit = 10, search, isActive } = req.query;
        const result = await pharmacyManagementService.getPharmacies(
            Number(page),
            Number(limit),
            {
                search: search as string,
                isActive:
                    isActive !== undefined ? Boolean(isActive) : undefined,
            },
        );

        res.json({
            success: true,
            message: 'Pharmacies retrieved successfully',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch pharmacies',
        });
    }
};

/**
 * Super Admin: Delete pharmacy
 */
export const deletePharmacy = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can delete pharmacies',
            });
        }

        const { pharmacyId } = req.params;
        await pharmacyManagementService.deletePharmacy(pharmacyId, req.user.id);

        res.json({
            success: true,
            message: 'Pharmacy deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete pharmacy',
        });
    }
};

/**
 * Super Admin: Assign admin to pharmacy
 */
export const assignAdminToPharmacy = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can assign admins to pharmacies',
            });
        }

        const { pharmacyId } = req.params;
        const { adminId, permissions } = req.body;

        const result = await pharmacyManagementService.assignAdminToPharmacy({
            pharmacyId,
            adminId,
            permissions,
        });

        res.json({
            success: true,
            message: 'Admin assigned to pharmacy successfully',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to assign admin',
        });
    }
};

/**
 * Super Admin: Remove admin from pharmacy
 */
export const removeAdminFromPharmacy = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can remove admins from pharmacies',
            });
        }

        const { pharmacyId, adminId } = req.params;

        const result = await pharmacyManagementService.removeAdminFromPharmacy(
            pharmacyId,
            adminId,
        );

        res.json({
            success: true,
            message: 'Admin removed from pharmacy successfully',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to remove admin',
        });
    }
};

/**
 * Super Admin: Remove admin from all pharmacies
 */
export const removeAdminFromAllPharmacies = async (
    req: Request,
    res: Response,
) => {
    try {
        if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({
                success: false,
                message:
                    'Only Super Admin can remove admins from all pharmacies',
            });
        }

        const { adminId } = req.params;

        const result =
            await pharmacyManagementService.removeAdminFromAllPharmacies(
                adminId,
            );

        res.json({
            success: true,
            message: 'Admin removed from all pharmacies successfully',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to remove admin from all pharmacies',
        });
    }
};

/**
 * Super Admin: Get all admins
 */
export const getAllAdmins = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can view all admins',
            });
        }

        const admins = await userManagementService.getAllAdmins(req.user.id);

        res.json({
            success: true,
            message: 'Admins retrieved successfully',
            data: admins,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch admins',
        });
    }
};

/**
 * Role-aware: Get pharmacies based on user's role and scope
 * - Super Admin: Gets all pharmacies
 * - Admin: Gets only their assigned pharmacy
 */
export const getPharmaciesByRole = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        const { page = 1, limit = 10, search, isActive } = req.query;
        const result = await pharmacyManagementService.getPharmaciesByRole(
            req.user.id,
            Number(page),
            Number(limit),
            {
                search: search as string,
                isActive:
                    isActive !== undefined ? Boolean(isActive) : undefined,
            },
        );

        res.json({
            success: true,
            message: 'Pharmacies retrieved successfully',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch pharmacies',
        });
    }
};

/**
 * Role-aware: Get admins based on user's role and scope
 * - Super Admin: Gets all admins
 * - Admin: Gets only admins from their pharmacy
 */
export const getAdminsByRole = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        const admins = await userManagementService.getAdminsByRole(req.user.id);

        res.json({
            success: true,
            message: 'Admins retrieved successfully',
            data: admins,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch admins',
        });
    }
};

/**
 * Super Admin: Update admin user
 */
export const updateAdminUser = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can update admin users',
            });
        }

        const { adminId } = req.params;
        const updateData = req.body;

        const updatedAdmin = await userManagementService.updateAdminUser(
            adminId,
            updateData,
            req.user.id,
        );

        res.json({
            success: true,
            message: 'Admin user updated successfully',
            data: updatedAdmin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to update admin user',
        });
    }
};

/**
 * Super Admin: Create admin user
 */
export const createAdminUser = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can create admin users',
            });
        }

        const { assignToPharmacy, ...adminData } = req.body;
        const admin = await userManagementService.createAdminUser(
            { ...adminData, role: UserRole.ADMIN },
            req.user.id,
            assignToPharmacy,
        );

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            data: admin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to create admin user',
        });
    }
};

export const fetchPharmacyInfo = async (req: Request, res: Response) => {
    try {
        // Get pharmacy info based on user's assigned pharmacy (data scoping)
        // Super admin has platform-wide access and doesn't need specific pharmacy
        const userPharmacyId =
            req.user?.role === UserRole.SUPER_ADMIN
                ? undefined
                : req.user?.pharmacyId;
        const pharmacyInfo = await getPharmacyInfo(userPharmacyId, req.user);
        const isConfigured = !!pharmacyInfo;

        // Format response to match frontend expectations
        res.status(200).json({
            success: true,
            message: 'Pharmacy information retrieved successfully',
            data: {
                pharmacyInfo: pharmacyInfo || {
                    name: '',
                    slogan: '',
                    address: {
                        street: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: '',
                    },
                    contact: {
                        phone: '',
                        email: '',
                        website: '',
                    },
                    registrationNumber: '',
                    taxId: '',
                    operatingHours: '',
                    requireSaleShortCode: false,
                },
                isConfigured,
            },
        });
    } catch (error) {
        console.error('Error fetching pharmacy info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pharmacy information',
            data: {
                pharmacyInfo: null,
                isConfigured: false,
            },
        });
    }
};

export const modifyPharmacyInfo = async (req: Request, res: Response) => {
    try {
        // Check if pharmacy name is being changed and user has permission
        if (req.body.name) {
            // Get current pharmacy info based on user's assigned pharmacy
            // Super admin has platform-wide access
            const userPharmacyId =
                req.user?.role === UserRole.SUPER_ADMIN
                    ? undefined
                    : req.user?.pharmacyId;
            const currentPharmacyInfo = await getPharmacyInfo(
                userPharmacyId,
                req.user,
            );
            if (
                currentPharmacyInfo &&
                currentPharmacyInfo.name !== req.body.name
            ) {
                // Name is being changed, check if user has UPDATE_PHARMACY_NAME permission
                if (
                    !PermissionService.hasPermissionFromToken(
                        req.user!,
                        PHARMACY_PERMISSIONS.UPDATE_PHARMACY_NAME,
                    )
                ) {
                    return res.status(403).json({
                        success: false,
                        message:
                            'Only Super Admin can change the pharmacy name',
                        data: {
                            pharmacyInfo: null,
                            isConfigured: false,
                        },
                    });
                }
            }
        }

        const userPharmacyId =
            req.user?.role === UserRole.SUPER_ADMIN
                ? undefined
                : req.user?.pharmacyId;
        const updatedInfo = await updatePharmacyInfo(
            req.body,
            userPharmacyId,
            req.user,
        );

        // Mark admin's first setup as complete
        // Only mark ADMIN's first setup as completed. SUPER_ADMIN should not
        // be considered part of a single pharmacy's first-setup flow because
        // they manage multiple pharmacies.
        if (req.user?.role === UserRole.ADMIN) {
            await User.findByIdAndUpdate(req.user.id, { isFirstSetup: false });
        }

        // Format response to match frontend expectations
        res.status(200).json({
            success: true,
            message: 'Pharmacy information updated successfully',
            data: {
                pharmacyInfo: updatedInfo,
                isConfigured: true,
            },
        });
    } catch (error) {
        console.error('Error updating pharmacy information:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update pharmacy information',
            data: {
                pharmacyInfo: null,
                isConfigured: false,
            },
        });
    }
};

export const checkPharmacyConfigStatus = async (
    req: Request,
    res: Response,
) => {
    try {
        // Super admin can check platform-wide config, regular users check their pharmacy
        const userPharmacyId =
            req.user?.role === UserRole.SUPER_ADMIN
                ? undefined
                : req.user?.pharmacyId;
        const isConfigured = await checkConfigStatus(userPharmacyId, req.user);

        res.status(200).json({
            success: true,
            message: 'Pharmacy configuration status retrieved successfully',
            data: {
                isConfigured,
            },
        });
    } catch (error) {
        console.error('Error checking pharmacy config status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check pharmacy configuration status',
            data: {
                isConfigured: false,
            },
        });
    }
};

export const checkAdminFirstSetup = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                isFirstSetup: false,
            });
        }

        const user = await User.findById(req.user.id);
        const isFirstSetup = user ? !!user.isFirstSetup : true;

        res.status(200).json({
            success: true,
            message: 'Admin first setup status retrieved successfully',
            isFirstSetup,
        });
    } catch (error) {
        console.error('Error checking admin first setup status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check admin first setup status',
            isFirstSetup: false,
        });
    }
};

// Admin level: Update short code settings
export const updateShortCodeSettings = async (req: Request, res: Response) => {
    try {
        if (
            !req.user ||
            (req.user.role !== UserRole.ADMIN &&
                req.user.role !== UserRole.SUPER_ADMIN)
        ) {
            throw new UnauthorizedError(
                'Only admin level users can update short code settings',
            );
        }

        const { requireSaleShortCode, shortCodeExpiryMinutes } = req.body;

        const updateData: any = {};
        if (typeof requireSaleShortCode === 'boolean') {
            updateData.requireSaleShortCode = requireSaleShortCode;
        }
        if (
            typeof shortCodeExpiryMinutes === 'number' &&
            shortCodeExpiryMinutes > 0
        ) {
            updateData.shortCodeExpiryMinutes = shortCodeExpiryMinutes;
        }

        const info = await PharmacyInfo.findOneAndUpdate({}, updateData, {
            new: true,
            upsert: true,
        });

        res.json({
            success: true,
            message: 'Short code settings updated successfully',
            data: {
                requireSaleShortCode: info.requireSaleShortCode,
                shortCodeExpiryMinutes: info.shortCodeExpiryMinutes,
            },
        });
    } catch (error) {
        console.error('Error updating short code settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update short code settings',
        });
    }
};
