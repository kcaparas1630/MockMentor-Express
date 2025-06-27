/**
 * @fileoverview Express middleware for verifying Firebase ID tokens in API requests.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Validates Firebase authentication tokens on protected routes, attaches the decoded user to the request, and handles authentication errors.
 *
 * @see {@link ../firebaseAdmin}
 *
 * Dependencies:
 * - Express.js
 * - Firebase Admin SDK
 */
import { AuthRequest } from '../Types/AuthRequest';
import admin from 'firebase-admin';
import { Response, NextFunction } from 'express';
import UnauthorizedError from '../ErrorHandlers/UnauthorizedError';
import ErrorLogger from '../Helper/ErrorLogger';
import FirebaseAuthError from '../ErrorHandlers/FirebaseAuthError';

const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Unauthorized'));
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error: unknown) {
    ErrorLogger(error, 'verifyFirebaseToken');

    // Type guard to check if it's a Firebase error
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code) {
        return next(FirebaseAuthError.fromFirebaseError(firebaseError));
    }
    // if the error is not firebase auth error
    return next(new UnauthorizedError('Unauthorized'));
  }
};

export default verifyFirebaseToken;
