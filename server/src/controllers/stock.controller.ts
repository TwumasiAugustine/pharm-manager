import { Request, Response } from 'express';
import { Drug } from '../models/drug.model';
import Branch from '../models/branch.model';
import mongoose from 'mongoose';

// POST /api/stock/transfer
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
        if (!fromDrug) throw new Error('Drug not found in source branch');
        if (fromDrug.quantity < quantity)
            throw new Error('Insufficient stock in source branch');
        // Deduct from source
        fromDrug.quantity -= quantity;
        await fromDrug.save({ session });
        // Find or create drug in destination branch
        let toDrug = await Drug.findOne({
            name: fromDrug.name,
            branch: toBranchId,
        }).session(session);
        if (!toDrug) {
            // Clone drug to destination branch
            toDrug = new Drug({
                ...fromDrug.toObject(),
                _id: undefined,
                branch: toBranchId,
                quantity: 0,
            });
        }
        toDrug.quantity += quantity;
        await toDrug.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.json({ message: 'Stock transferred successfully' });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        let message = 'Unknown error';
        if (err instanceof Error) message = err.message;
        res.status(400).json({ error: message });
    }
};
