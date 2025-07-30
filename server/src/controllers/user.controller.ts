import { Request, Response } from 'express';
import User from '../models/user.model';

export const checkAdminFirstSetup = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ isFirstSetup: user.isFirstSetup });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to check admin first setup status',
        });
    }
};
