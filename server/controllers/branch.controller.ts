import { Request, Response } from 'express';
import Branch from '../models/branch.model';
import PharmacyInfo from '../models/pharmacy-info.model';
import { UserRole } from '../types/user.types';
import { trackActivity } from '../utils/activity-tracker';

export const createBranch = async (req: Request, res: Response) => {
    try {
        // Get the user's pharmacy ID for data scoping
        const userPharmacyId = req.user?.pharmacyId;
        if (!userPharmacyId) {
            return res.status(400).json({
                error: 'User must be assigned to a pharmacy to create branches',
            });
        }

        // Verify the pharmacy exists
        const pharmacy = await PharmacyInfo.findById(userPharmacyId);
        if (!pharmacy) {
            return res.status(400).json({
                error: 'Assigned pharmacy not found',
            });
        }

        // Add pharmacyId to the branch data
        const branchData = {
            ...req.body,
            pharmacyId: pharmacy._id,
        };

        const branch = await Branch.create(branchData);

        // Track branch creation activity
        if (req.user) {
            trackActivity(req.user.id, 'CREATE', 'BRANCH', {
                endpoint: req.path,
                method: req.method,
                action: 'createBranch',
                resourceId: branch._id?.toString(),
                resourceName: branch.name,
                branchId: branch._id,
                branchData: {
                    name: branch.name,
                    address: branch.address,
                    phone: branch.contact?.phone,
                    email: branch.contact?.email,
                },
                pharmacyId: userPharmacyId,
                pharmacyName: pharmacy.name,
            });
        }

        res.status(201).json(branch);
    } catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        res.status(400).json({ error: message });
    }
};

export const getBranches = async (req: Request, res: Response) => {
    try {
        // Get the user's pharmacy ID for data scoping
        const userPharmacyId = req.user?.pharmacyId;
        if (!userPharmacyId) {
            return res.status(400).json({
                error: 'User must be assigned to a pharmacy to view branches',
            });
        }

        // Super admin can see all branches, others see only their pharmacy's branches
        let query: any = {};
        if (req.user?.role !== UserRole.SUPER_ADMIN) {
            query.pharmacyId = userPharmacyId;
        }

        const branches = await Branch.find(query);

        // Track branch listing activity
        if (req.user) {
            trackActivity(req.user.id, 'VIEW', 'BRANCH', {
                endpoint: req.path,
                method: req.method,
                action: 'getBranches',
                dataScope:
                    req.user?.role === UserRole.SUPER_ADMIN
                        ? 'all_pharmacies'
                        : 'pharmacy_specific',
                pharmacyId:
                    req.user?.role !== UserRole.SUPER_ADMIN
                        ? userPharmacyId
                        : undefined,
                resultCount: branches.length,
                userRole: req.user.role,
            });
        }

        res.json(branches);
    } catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        res.status(500).json({ error: message });
    }
};

export const updateBranch = async (req: Request, res: Response) => {
    try {
        // Get the user's pharmacy ID for data scoping
        const userPharmacyId = req.user?.pharmacyId;
        if (!userPharmacyId && req.user?.role !== UserRole.SUPER_ADMIN) {
            return res.status(400).json({
                error: 'User must be assigned to a pharmacy to update branches',
            });
        }

        // Build query - super admin can update any branch, others only their pharmacy's
        const query: any = { _id: req.params.id };
        if (req.user?.role !== UserRole.SUPER_ADMIN) {
            query.pharmacyId = userPharmacyId;
        }

        const branch = await Branch.findOneAndUpdate(query, req.body, {
            new: true,
        });

        if (!branch) {
            return res.status(404).json({
                error: 'Branch not found or access denied',
            });
        }

        // Track branch update activity
        if (req.user) {
            trackActivity(req.user.id, 'UPDATE', 'BRANCH', {
                endpoint: req.path,
                method: req.method,
                action: 'updateBranch',
                resourceId: req.params.id,
                resourceName: branch.name,
                branchId: req.params.id,
                updatedFields: Object.keys(req.body),
                updatedData: {
                    name: branch.name,
                    address: branch.address,
                    phone: branch.contact?.phone,
                    email: branch.contact?.email,
                },
                userRole: req.user.role,
                pharmacyId: branch.pharmacyId,
            });
        }

        res.json(branch);
    } catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        res.status(400).json({ error: message });
    }
};

export const deleteBranch = async (req: Request, res: Response) => {
    try {
        // Get the user's pharmacy ID for data scoping
        const userPharmacyId = req.user?.pharmacyId;
        if (!userPharmacyId && req.user?.role !== UserRole.SUPER_ADMIN) {
            return res.status(400).json({
                error: 'User must be assigned to a pharmacy to delete branches',
            });
        }

        // Build query - super admin can delete any branch, others only their pharmacy's
        const query: any = { _id: req.params.id };
        if (req.user?.role !== UserRole.SUPER_ADMIN) {
            query.pharmacyId = userPharmacyId;
        }

        const branch = await Branch.findOneAndDelete(query);

        if (!branch) {
            return res.status(404).json({
                error: 'Branch not found or access denied',
            });
        }

        // Track branch deletion activity
        if (req.user) {
            trackActivity(req.user.id, 'DELETE', 'BRANCH', {
                endpoint: req.path,
                method: req.method,
                action: 'deleteBranch',
                resourceId: req.params.id,
                resourceName: branch.name,
                branchId: req.params.id,
                deletedBranch: {
                    name: branch.name,
                    address: branch.address,
                    phone: branch.contact?.phone,
                    email: branch.contact?.email,
                },
                userRole: req.user.role,
                pharmacyId: branch.pharmacyId,
                reason: 'Branch deletion',
            });
        }

        res.json({ message: 'Branch deleted successfully' });
    } catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        res.status(500).json({ error: message });
    }
};
