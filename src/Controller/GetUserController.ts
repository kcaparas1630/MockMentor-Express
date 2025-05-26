import { Response } from 'express';
import { UserService } from '../db';
import { AuthRequest } from '../Types/AuthRequest';

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
    let uid: string | undefined;
    try {
        uid = req.user?.uid;  
        if (!uid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await UserService.getUserFromFirebaseToken(uid);
        res.json(user);
    } catch (error) {
        console.error(`Error fetching user for uid ${uid}`, error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}
