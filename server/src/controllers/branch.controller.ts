import { Request, Response } from 'express';
import Branch from '../models/branch.model';

export const createBranch = async (req: Request, res: Response) => {
    try {
        const branch = await Branch.create(req.body);
        res.status(201).json(branch);
    } catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        res.status(400).json({ error: message });
    }
};

export const getBranches = async (_req: Request, res: Response) => {
    const branches = await Branch.find();
    res.json(branches);
};

export const updateBranch = async (req: Request, res: Response) => {
    try {
        const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!branch) return res.status(404).json({ error: 'Branch not found' });
        res.json(branch);
    } catch (err) {
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        res.status(400).json({ error: message });
    }
};

export const deleteBranch = async (req: Request, res: Response) => {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json({ message: 'Branch deleted' });
};
