import { Response } from 'express';
import { InterviewService } from '../db';
import { AuthRequest } from '../Types/AuthRequest';

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const uid = req.user?.uid;  
        if (!uid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await InterviewService.getUserFromFirebaseToken(uid);
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}
