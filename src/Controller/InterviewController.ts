/**
 * @fileoverview Controller for managing interview sessions, questions, and user responses.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Handles the creation, progression, and completion of interview sessions, including question retrieval, answer submission, and feedback processing. Integrates with authentication, validation, and database layers. Ensures robust error handling and session management for the interview flow.
 *
 * @see {@link ../db}
 * @see {@link ../Types/QuestionsType}
 * @see {@link ../Types/AuthRequest}
 *
 * Dependencies:
 * - Express.js
 * - Database Service
 * - Error Handlers
 */
import { Response, NextFunction } from 'express';
import {
  getAllQuestions,
  getUserFromFirebaseToken,
  createSession,
  getInterviewWithResults,
} from '../db';
import { AuthRequest } from '../Types/AuthRequest';
import FirebaseAuthError from '../ErrorHandlers/FirebaseAuthError';
import ValidationError from '../ErrorHandlers/ValidationError';
import DatabaseError from '../ErrorHandlers/DatabaseError';
import UnknownError from '../ErrorHandlers/UnknownError';
import NotFoundError from '../ErrorHandlers/NotFoundError';
import ForbiddenError from '../ErrorHandlers/ForbiddenError';



/**
 * Start a new interview session for the authenticated user
 * @param req - The authenticated request object containing user info
 * @param res - The response object
 * @returns JSON response with session details and first question
 * @description Creates a new interview session, validates user profile, and returns the first question
 */
export const startInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Non-null assertion since middleware guarantees this
    const uid = req.user!.uid;

    // Get user data including job role
    const user = await getUserFromFirebaseToken(uid);
    if (!user) {
      return next(FirebaseAuthError.userNotFound());
    }

    const jobRole = user?.profile?.jobRole;
    if (!jobRole) {
      return next(new DatabaseError('User job role not found. Please complete your profile.'));
    }

    // Get all questions for the interview
    const questions = await getAllQuestions();
  
    // TODO: Validate job levels and interview type. Restrict to only certain values.
    const { jobLevel, interviewType } = req.body;
    if (!jobLevel) {
      return next(new ValidationError('Missing required field: jobLevel'));
    }
    if (!interviewType) {
      return next(new ValidationError('Missing required field: interviewType'));
    }

    // Create interview session in database
    const interviewSession = await createSession({
      userId: user.id,
      jobRole,
      jobLevel,
      interviewType,
      totalQuestions: questions.length,
      startedAt: new Date(),
    });

    res.json({
      sessionId: interviewSession.id,
      currentQuestion: questions[0],
      questionNumber: 1,
      totalQuestions: questions.length,
      jobRole: jobRole,
    });
  } catch (error) {
    // If the error is a known error type, pass it through
    if (error instanceof FirebaseAuthError || 
        error instanceof ValidationError || 
        error instanceof DatabaseError ||
        error instanceof NotFoundError) {
      return next(error);
    }
    // For unknown errors, use a generic server error
    return next(new UnknownError('Failed to start interview'));
  }
};



/**
 * Retrieve comprehensive interview results and feedback for a completed interview
 * @param req - The authenticated request object containing session ID in params
 * @param res - The response object
 * @returns JSON response with complete interview data including score, feedback, and questions
 * @description Fetches detailed interview results including AI-generated feedback and improvements
 */
export const getInterviewResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Non-null assertion since middleware guarantees this
    const uid = req.user!.uid;

    const { sessionId } = req.params;
    // Validate required fields.
    if (!sessionId) {
      return next(new ValidationError('Missing required field: sessionId'));
    }

    const interview = await getInterviewWithResults(sessionId);

    // Verify user owns this interview
    const user = await getUserFromFirebaseToken(uid);
    if (!user || interview.userId !== user.id) {
      return next(new ForbiddenError('Forbidden: You do not have access to this interview'));
    }

    res.json({
      interview: {
        duration: interview.duration,
        interviewType: interview.interviewType,
        questions: interview.questions,
      },
    });
  } catch (error) {
    // If the error is a known error type, pass it through
    if (error instanceof FirebaseAuthError || 
        error instanceof ValidationError || 
        error instanceof DatabaseError ||
        error instanceof NotFoundError ||
        error instanceof ForbiddenError) {
      return next(error);
    }
    // For unknown errors, use a generic server error
    return next(new UnknownError('Failed to get interview results'));
  }
};

/**
 * Get a specific question by its index position in the question array
 * @param req - The authenticated request object containing question index in params
 * @param res - The response object
 * @returns JSON response with the requested question and its metadata
 * @description Utility endpoint to fetch individual questions by their sequential index
 */
export const getQuestionByIndex = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const uid = req.user!.uid;
    console.log('uid', uid); // TODO: Remove this after implementing session check.

    // TODO: Verify user has session record in data store before returning a question. Returns 403 if not found.

    const { questionIndex } = req.params; 
    // Validate required fields.
    if (!questionIndex) {
      return next(new ValidationError('Missing required field: questionIndex'));
    }
    // Validate question index is a number and is non-negative.
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return next(new ValidationError('Invalid questionIndex'));
    }

    const index = parseInt(questionIndex, 10);
    if (isNaN(index) || index < 0) {
      return next(new ValidationError('Invalid questionIndex'));
    }

    const questions = await getAllQuestions();

    if (index < 0 || index >= questions.length) {
      return next(new NotFoundError('Question not found'));
    }

    res.json({
      question: questions[index],
      questionNumber: index + 1,
      totalQuestions: questions.length,
      questionIndex: index,
    });
  } catch (error) {
    // If the error is a known error type, pass it through
    if (error instanceof FirebaseAuthError || 
        error instanceof ValidationError || 
        error instanceof DatabaseError ||
        error instanceof NotFoundError) {
      return next(error);
    }
    // For unknown errors, use a generic server error
    return next(new UnknownError('Failed to get question'));
  }
};
