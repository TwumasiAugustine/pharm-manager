import { Request, Response } from 'express';
import Branch from '../models/branch.model';
import PharmacyInfo from '../models/pharmacy-info.model';

export const createBranch = async (req: Request, res: Response) => {
    try {
        // Get the pharmacy info to get the pharmacyId
        const pharmacy = await PharmacyInfo.findOne();
        if (!pharmacy) {
            return res.status(400).json({
                error: 'Pharmacy must be set up before creating branches',
            });
        }

        // Add pharmacyId to the branch data
        const branchData = {
            ...req.body,
            pharmacyId: pharmacy._id,
        };

        const branch = await Branch.create(branchData);
        res.status(201).json(branch);
    } catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        res.status(400).json({ error: message });
    }
};

export const getBranches = async (_req: Request, res: Response) => {
    try {
        // Get the pharmacy info to filter branches
        const pharmacy = await PharmacyInfo.findOne();
        if (!pharmacy) {
            return res.status(400).json({
                error: 'Pharmacy must be set up to view branches',
            });
        }

        const branches = await Branch.find({
            pharmacyId: pharmacy._id,
        }).populate('manager', 'firstName lastName email');
        res.json(branches);
    } catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        res.status(500).json({ error: message });
    }
};

export const updateBranch = async (req: Request, res: Response) => {
    try {
        // Get the pharmacy info to ensure branch belongs to this pharmacy
        const pharmacy = await PharmacyInfo.findOne();
        if (!pharmacy) {
            return res.status(400).json({
                error: 'Pharmacy must be set up to update branches',
            });
        }

        const branch = await Branch.findOneAndUpdate(
            { _id: req.params.id, pharmacyId: pharmacy._id },
            req.body,
            { new: true },
        ).populate('manager', 'firstName lastName email');

        if (!branch) {
            return res.status(404).json({
                error: 'Branch not found or does not belong to this pharmacy',
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
        // Get the pharmacy info to ensure branch belongs to this pharmacy
        const pharmacy = await PharmacyInfo.findOne();
        if (!pharmacy) {
            return res.status(400).json({
                error: 'Pharmacy must be set up to delete branches',
            });
        }

        const branch = await Branch.findOneAndDelete({
            _id: req.params.id,
            pharmacyId: pharmacy._id,
        });

        if (!branch) {
            return res.status(404).json({
                error: 'Branch not found or does not belong to this pharmacy',
            });
        }

        res.json({ message: 'Branch deleted successfully' });
    } catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        res.status(500).json({ error: message });
    }
};
