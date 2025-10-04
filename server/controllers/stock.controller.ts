import { Request, Response } from 'express';
import { Drug } from '../models/drug.model';
import Branch from '../models/branch.model';
import mongoose from 'mongoose';

/**
 * Transfers stock of a drug from one branch to another.
 * @route POST /api/stock/transfer
 * @param req Express request object
 * @param res Express response object
 */
export const transferStock = async (req: Request, res: Response) => {
    const { drugId, fromBranchId, toBranchId, quantity } = req.body;
    if (!drugId || !fromBranchId || !toBranchId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    if (fromBranchId === toBranchId) {
        return res.status(400).json({
            error: 'Source and destination branches must be different',
        });
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Find drug in source branch
        const fromDrug = await Drug.findOne({
            _id: drugId,
            branch: fromBranchId,
        }).session(session);
        if (!fromDrug) {
            throw new Error('Drug not found in source branch');
        }
        if (fromDrug.quantity < quantity) {
            throw new Error('Insufficient stock in source branch');
        }
        // Deduct from source
        fromDrug.quantity -= quantity;
        await fromDrug.save({ session });

        // Find or create drug in destination branch
        let toDrug = await Drug.findOne({
            name: fromDrug.name,
            branch: toBranchId,
        }).session(session);
        if (!toDrug) {
            // Clone drug to destination branch, omitting _id and timestamps
            const { _id, createdAt, updatedAt, ...drugData } =
                fromDrug.toObject();
            toDrug = new Drug({
                ...drugData,
                branch: toBranchId,
                quantity: 0,
            });
        }
        toDrug.quantity += quantity;
        await toDrug.save({ session });

        await session.commitTransaction();
        session.endSession();
        return res.json({ message: 'Stock transferred successfully' });
    } catch (err: any) {
        await session.abortTransaction();
        session.endSession();
        const message = err?.message || 'Unknown error';
        return res.status(400).json({ error: message });
    }
};
