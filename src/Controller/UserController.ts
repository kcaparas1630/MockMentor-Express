/**
 * @fileoverview Controller for user account management, including retrieval, creation, and update of user profiles.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Provides endpoints for user profile operations, integrating with authentication, validation, and database services. Ensures user data integrity and robust error handling for user-related actions.
 *
 * @see {@link ../db}
 * @see {@link ../Types/UserProfile}
 * @see {@link ../Types/AuthRequest}
 *
 * Dependencies:
 * - Express.js
 * - Database Service
 * - Error Handlers
 */
import { Response, NextFunction } from 'express';
import { getUserFromFirebaseToken, createUser, updateUser, createOAuthUser } from '../db';
import { AuthRequest } from '../Types/AuthRequest';
import ValidationError from '../ErrorHandlers/ValidationError';
import isPasswordValid from '../Helper/IsPasswordValid';
import FirebaseAuthError from '../ErrorHandlers/FirebaseAuthError';
import isEmailValid from '../Helper/isEmailValid';
import NotFoundError from '../ErrorHandlers/NotFoundError';
import * as admin from 'firebase-admin';
import logger from '../Config/LoggerConfig';

/**
 * Retrieves user profile information from Firebase Auth
 * @param req - The authenticated request object containing user ID
 * @param res - The response object
 * @returns JSON response with user profile data
 * @description Fetches user profile information from Firebase Auth based on the authenticated user's ID
 */
export const getUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Non-null assertion since middleware guarantees this
    const uid = req.user!.uid;
    const user = await getUserFromFirebaseToken(uid);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new user account in Firebase Auth
 * @param req - The request object containing user email and password
 * @param res - The response object
 * @returns JSON response with the created user
 * @description Validates user input, creates a new user in Firebase Auth, and returns the created user
 */
export const createUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;
  try {
    // validate if email and password are provided
    if (!email || !password) {
      return next(new ValidationError('Email and password are required'));
    }
    // validate if password meets the required firebase auth password policy
    if (!isPasswordValid(password)) {
      return next(FirebaseAuthError.passwordDoesNotMeetRequirements());
    }
    // validate if email is valid
    if (!isEmailValid(email)) {
      return next(FirebaseAuthError.invalidEmail());
    }
    // create user in firebase auth
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates user profile information in Firebase Auth
 * @param req - The authenticated request object containing user ID and profile updates
 * @param res - The response object
 * @returns JSON response with the updated user
 * @description Validates and updates user profile information in Firebase Auth based on the authenticated user's ID
 */
export const updateUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, jobRole } = req.body.profile;
    // validate that at least one field is provided for update
    if (!name && !email && !jobRole) {
      return next(
        new ValidationError('At least one field (name, email, or jobRole) is required for update')
      );
    }

    // validate email format if email is being updated
    if (email && !isEmailValid(email)) {
      return next(FirebaseAuthError.invalidEmail());
    }

    // Non-null assertion since middleware guarantees this
    const uid = req.user!.uid;
    // update user
    const updatedUser = await updateUser(uid, req.body);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles Google OAuth authentication and user creation/retrieval
 * @param req - The request object containing Google ID token
 * @param res - The response object
 * @returns JSON response with user data
 * @description Verifies Google ID token, checks if user exists, creates new user if needed, or returns existing user data
 */
export const googleAuthController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return next(new ValidationError('ID token is required'));
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const { uid, email, name } = decodedToken;
    logger.info('Google OAuth - Decoded token UID:', uid);
    logger.info('Google OAuth - Email:', email);
    logger.info('Google OAuth - Name:', name);

    try {
      const existingUser = await getUserFromFirebaseToken(uid);
      logger.info('Google OAuth - Found existing user:', existingUser.id);
      res.json({ success: true, user: existingUser });
    } catch (error) {
      if (error instanceof NotFoundError) {
        logger.info('Google OAuth - Creating new user for UID:', uid);
        const newUser = await createOAuthUser({
          email: email || '',
          name: name || '',
          jobRole: '',
          lastLogin: new Date(),
        }, uid);
        logger.info('Google OAuth - Created new user:', newUser.id, 'with UID:', newUser.firebaseUid);
        res.json({ success: true, user: newUser });
      } else {
        logger.error('Google OAuth - Unexpected error:', error);
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};
