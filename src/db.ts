/**
 * @fileoverview Database service layer for user, question, and interview session management.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Provides database access and business logic for user profiles, interview questions, sessions, and answers. Integrates with Prisma ORM and Firebase Admin SDK. Handles error logging and robust error propagation for all database operations.
 *
 * @see {@link ./Types/UserProfile}
 * @see {@link ./Types/QuestionsType}
 * @see {@link ./ErrorHandlers/*}
 *
* Dependencies:
* - Prisma ORM
* - Firebase Admin SDK
* - Error Handlers
*/
import { PrismaClient } from '@prisma/client';
import { FirebaseDatabaseError } from 'firebase-admin/lib/utils/error';
import * as admin from 'firebase-admin';
import { ProfileData, UserUpdateRequest } from './Types/UserProfile';
// import { QuestionFeedback } from './Types/QuestionsType';
import ErrorLogger from './Helper/ErrorLogger';
import DatabaseError from './ErrorHandlers/DatabaseError';
import ConflictError from './ErrorHandlers/ConflictError';
import NotFoundError from './ErrorHandlers/NotFoundError';
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

prisma
  .$connect()
  .then(() => {
    return console.log('Connected to MongoDB');
  })
  .catch((error: FirebaseDatabaseError) => {
    console.error('Database connection error:', error);
  });

/**
 * Retrieve user data from database using Firebase UID
 * @param uid - Firebase user identifier from authenticated token
 * @returns Promise<User | null> - User object with profile data or null if not found
 * @throws Error if database query fails
 * @example
 * const user = await UserService.getUserFromFirebaseToken("firebase_uid_123");
 */
export const getUserFromFirebaseToken = async (uid: string) => {
  try {
    // fetch user from database using prisma
    const user = await prisma.user.findUnique({
      where: {
        firebaseUid: uid,
      },
    });
    if (!user) {
      throw new NotFoundError('User not found in database');
    }
    return user;
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    ErrorLogger(error, 'getUserFromFirebaseToken');
    throw new DatabaseError('Failed to fetch user from firebase token');
  }
};

/**
 * Create a new user account in both Firebase Auth and local database
 * @param user - ProfileData containing user information (email, password, displayName, jobRole)
 * @returns Promise<User> - Created user object with database ID and profile
 * @throws Error if user already exists or Firebase/database creation fails
 * @example
 * const newUser = await UserService.createUser({
 *   email: "john@example.com",
 *   password: "securePassword",
 *   displayName: "John Doe",
 *   jobRole: "Software Engineer"
 * });
 */
export const createUser = async (user: ProfileData) => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        profile: {
          is: {
            email: user.email ?? '',
          },
        },
      },
    });
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }
    // Create Firebase user
    const firebaseUser = await admin.auth().createUser({
      email: user.email,
      password: user.password,
    });
    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        firebaseUid: firebaseUser.uid,
        profile: {
          name: (firebaseUser.displayName || user.displayName) ?? '',
          email: firebaseUser.email ?? '',
          jobRole: user.jobRole ?? '',
          lastLogin: new Date(),
        },
      },
    });
    return newUser;
  } catch (error: unknown) {
    if (error instanceof ConflictError) {
      throw error; // Re-throw conflict errors (like email already exists)
    }
    ErrorLogger(error, 'createUser');
    throw new DatabaseError('Failed to create user');
  }
};

/**
 * Create a new user account in database for OAuth users (Firebase user already exists)
 * @param user - ProfileData containing user information and existing Firebase UID
 * @param firebaseUid - Existing Firebase UID from OAuth provider
 * @returns Promise<User> - Created user object with database ID and profile
 * @throws Error if user already exists or database creation fails
 */
export const createOAuthUser = async (user: ProfileData, firebaseUid: string) => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        profile: {
          is: {
            email: user.email ?? '',
          },
        },
      },
    });
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }
    
    // Create user in database with existing Firebase UID
    const newUser = await prisma.user.create({
      data: {
        firebaseUid: firebaseUid,
        profile: {
          name: user.name ?? '',
          email: user.email ?? '',
          jobRole: user.jobRole ?? '',
          lastLogin: new Date(),
        },
      },
    });
    return newUser;
  } catch (error: unknown) {
    if (error instanceof ConflictError) {
      throw error;
    }
    ErrorLogger(error, 'createOAuthUser');
    throw new DatabaseError('Failed to create OAuth user');
  }
};

/**
 * Update existing user profile information
 * @param uid - Firebase user identifier
 * @param user - UserUpdateRequest containing fields to update
 * @returns Promise<User> - Updated user object with merged profile data
 * @throws Error if user not found or update operation fails
 * @example
 * const updatedUser = await UserService.updateUser("firebase_uid", {
 *   profile: { jobRole: "Senior Software Engineer" }
 * });
 */
export const updateUser = async (uid: string, user: UserUpdateRequest) => {
  try {
    // Get user first to preserve existing data.
    const currentUser = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    // If user not found, throw error
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    // Merge existing data with new data
    const updatedUser = {
      ...currentUser.profile,
      ...(user.profile ?? {}), // Ensure user.profile is not undefined
    };

    // Update user with new data
    const updateUser = await prisma.user.update({
      where: { firebaseUid: uid },
      data: {
        profile: updatedUser,
      },
    });
    return updateUser;
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    ErrorLogger(error, 'updateUser');
    throw new DatabaseError('Failed to update user');
  }
};

/**
 * Retrieve all available interview questions from the database
 * @returns Promise<Question[]> - Array of all interview questions with their types and content
 * @throws Error if database query fails
 * @example
 * const questions = await QuestionService.getAllQuestions();
 * // Returns: [{ id: "1", question: "Tell me about yourself", questionType: "behavioral" }, ...]
 */
export const getAllQuestions = async () => {
  try {
    const questions = await prisma.question.findMany();
    if (!questions) {
      throw new NotFoundError('No questions found');
    }
    return questions;
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    ErrorLogger(error, 'getAllQuestions');
    throw new DatabaseError('Failed to fetch questions');
  }
};

/**
 * Retrieve a specific interview question by its unique identifier
 * @param id - Unique question identifier from database
 * @returns Promise<Question> - Question object containing question text and type
 * @throws Error if question not found or database query fails
 * @example
 * const question = await QuestionService.getQuestionById("question_123");
 * // Returns: { id: "question_123", question: "Explain REST APIs", questionType: "technical" }
 */
export const getQuestionById = async (id: string) => {
  try {
    const question = await prisma.question.findUnique({
      where: {
        id,
      },
    });
    if (!question) {
      throw new NotFoundError('Question not found');
    }
    return question;
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    ErrorLogger(error, 'getQuestionById');
    throw new DatabaseError('Failed to fetch question by id');
  }
};

/**
 * Create a new interview session for a candidate
 * @param sessionData - Object containing interview configuration
 * @param sessionData.userId - Database user ID
 * @param sessionData.jobRole - Target job role for the interview
 * @param sessionData.jobLevel - Experience level (junior, mid, senior)
 * @param sessionData.interviewType - Type of interview (technical, behavioral, full-stack)
 * @param sessionData.totalQuestions - Number of questions in the interview
 * @param sessionData.startedAt - Timestamp when interview began
 * @returns Promise<Interview> - Created interview session with unique ID
 * @throws Error if session creation fails
 * @example
 * const session = await InterviewService.createSession({
 *   userId: "user_123",
 *   jobRole: "Software Engineer",
 *   jobLevel: "mid",
 *   interviewType: "technical",
 *   totalQuestions: 5,
 *   startedAt: new Date()
 * });
 */
export const createSession = async (sessionData: {
  userId: string;
  jobRole: string;
  jobLevel: string;
  interviewType: string;
  totalQuestions: number;
  startedAt: Date;
}) => {
  try {
    const interview = await prisma.interview.create({
      data: {
        userId: sessionData.userId,
        date: sessionData.startedAt,
        // improvements: [],
        interviewType: sessionData.interviewType,
        // Store additional session data in metadata
        metadata: {
          jobRole: sessionData.jobRole,
          jobLevel: sessionData.jobLevel,
          totalQuestions: sessionData.totalQuestions,
        },
      },
    });
    return interview;
  } catch (error) {
    ErrorLogger(error, 'createSession');
    throw new DatabaseError('Failed to create interview session');
  }
};

/**
 * Retrieve an existing interview session with all associated questions and answers
 * @param sessionId - Unique interview session identifier
 * @returns Promise<Interview | null> - Interview session with questions array or null if not found
 * @throws Error if database query fails
 * @example
 * const session = await InterviewService.getSession("session_123");
 * // Returns session with questions: { id: "session_123", questions: [...], metadata: {...} }
 */
export const getSession = async (sessionId: string) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: sessionId },
      include: {
        questions: true,
      },
    });
    if (!interview) {
      throw new NotFoundError('Interview session not found');
    }
    return interview;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    ErrorLogger(error, 'getSession');
    throw new DatabaseError('Failed to get interview session');
  }
};


/**
 * Retrieve complete interview results including all questions, answers, and feedback
 * @param sessionId - Interview session identifier
 * @returns Promise<Interview | null> - Complete interview data with nested questions or null
 * @throws Error if database query fails
 * @example
 * const results = await InterviewService.getInterviewWithResults("session_123");
 * // Returns: { score: 78, feedback: "...", questions: [...], improvements: [...] }
 */
export const getInterviewWithResults = async (sessionId: string) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: sessionId },
      include: {
        questions: true,
      },
    });
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }
    return interview;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    ErrorLogger(error, 'getInterviewWithResults');
    throw new DatabaseError('Failed to get interview results');
  }
};
