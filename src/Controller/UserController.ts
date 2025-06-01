import { Response, NextFunction } from 'express';
import { getUserFromFirebaseToken, createUser, updateUser, checkIfUserExists } from '../db';
import { AuthRequest } from '../Types/AuthRequest';
import logger from '../Config/LoggerConfig';
import DatabaseError from '../ErrorHandlers/DatabaseError';
import ErrorLogger from '../Helper/LoggerFunc';
import ValidationError from '../ErrorHandlers/ValidationError';
import isPasswordValid from '../Helper/IsPasswordValid';
import FirebaseAuthError from '../ErrorHandlers/FirebaseAuthError';
import isEmailValid from '../Helper/isEmailValid';

export const getUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const uid = req.user?.uid;

    // validate if uid is provided - a bit extra since middleware should have already checked this. But typescript is complaining otherwise.
    if (!uid) {
      return next(FirebaseAuthError.invalidIdToken());
    }

    const user = await getUserFromFirebaseToken(uid);

    if (!user) {
      return next(FirebaseAuthError.userNotFound());
    }
    res.json(user);
  } catch (error) {
    ErrorLogger(error, 'getUser');
    // if the error is a firebase auth error, return the error
    if (error instanceof FirebaseAuthError) {
      return next(error);
    }
    // if the error is not a firebase auth error, return a database error
    next(new DatabaseError('Failed to fetch user', error));
  }
};

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
    // validate if user already exists
    const userExists = await checkIfUserExists(email);
    if (userExists) {
      return next(FirebaseAuthError.emailAlreadyInUse());
    }
    // create user in firebase auth
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    ErrorLogger(error, 'createUser');
    // if the error is a firebase auth error, return the error
    if (error instanceof FirebaseAuthError) {
      return next(error);
    }
    // if the error is not a firebase auth error, return a database error
    next(new DatabaseError('Failed to create user', error));
  }
};

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
};
