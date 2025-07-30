import { Request, Response } from 'express';
import {
    getPharmacyInfo,
    updatePharmacyInfo,
    checkConfigStatus,
} from '../services/pharmacy.service';
import User from '../models/user.model';

export const fetchPharmacyInfo = async (req: Request, res: Response) => {
    try {
        const pharmacyInfo = await getPharmacyInfo();
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
        const updatedInfo = await updatePharmacyInfo(req.body);

        // Mark admin's first setup as complete
        if (req.user?.role === 'admin') {
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
        const isConfigured = await checkConfigStatus();

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
