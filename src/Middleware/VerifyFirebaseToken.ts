import { AuthRequest } from "../Types/AuthRequest";
import admin from "firebase-admin";
import { Response, NextFunction } from "express";

const verifyFirebaseToken = async (
    req: AuthRequest, 
    res: Response, 
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

export default verifyFirebaseToken;
