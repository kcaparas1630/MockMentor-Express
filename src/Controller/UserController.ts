import { Response } from 'express';
import { getUserFromFirebaseToken, createUser, updateUser } from '../db';
import { AuthRequest } from '../Types/AuthRequest';
import logger from '../Config/LoggerConfig';

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
    let uid: string | undefined;
    try {
        uid = req.user?.uid;  
        if (!uid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await getUserFromFirebaseToken(uid);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        logger.error(`Error fetching user for uid ${uid}`, error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}

export const createUserController = async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    try {
        const user = await createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        logger.error(`Error creating user`, error);
        res.status(500).json({ error: 'Failed to create user' });
    }
}

export const updateUserController = async (req: AuthRequest, res: Response): Promise<void> => {
    let uid: string | undefined;
    try {
        uid = req.user?.uid;
        if (!uid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await updateUser(uid, req.body);
        res.json(user);
    } catch (error) {
        logger.error(`Error updating user for uid ${uid}`, error);
        res.status(500).json({ error: 'Failed to update user' });
    }
}
