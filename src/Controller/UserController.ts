import { Response, NextFunction } from 'express';
import { getUserFromFirebaseToken, createUser, updateUser } from '../db';
import { AuthRequest } from '../Types/AuthRequest';
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
    // Non-null assertion since middleware guarantees this
    const uid = req.user!.uid;
    const user = await getUserFromFirebaseToken(uid);
    res.json(user);
  } catch (error) {
    next(error);
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
    // create user in firebase auth
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, jobRole} = req.body;
    // validate that at least one field is provided for update
    if (!name && !email && !jobRole) {
      return next(new ValidationError('At least one field (name, email, or jobRole) is required for update'));
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
