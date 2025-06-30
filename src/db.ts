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
import { QuestionFeedback } from './Types/QuestionsType';
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
        score: 0, // Will be updated at the end
        improvements: [],
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
 * Save a candidate's answer to a specific interview question with AI feedback
 * @param sessionId - Interview session identifier
 * @param questionId - Question identifier from the question bank
 * @param answer - Candidate's text response to the question
 * @param questionText - The actual question text for reference
 * @param feedback - Optional AI-generated feedback for the answer
 * @returns Promise<void> - Resolves when answer is successfully saved
 * @throws Error if save operation fails or question not found
 * @example
 * await InterviewService.saveAnswer(
 *   "session_123",
 *   "question_456",
 *   "I have 5 years of experience in React...",
 *   "Tell me about your React experience",
 *   { score: 85, feedback: "Good answer with specific examples" }
 * );
 */
export const saveAnswer = async (
  sessionId: string,
  questionId: string,
  answer: string,
  questionText: string,
  feedback?: QuestionFeedback
) => {
  try {
    // Get question type
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    await prisma.interviewQuestion.create({
      data: {
        interviewId: sessionId,
        questionId: questionId,
        questionText: questionText,
        answer: answer,
        questionType: question?.questionType || '',
        feedback: feedback ? JSON.stringify(feedback) : null,
        answeredAt: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    ErrorLogger(error, 'saveAnswer');
    throw new DatabaseError('Failed to save answer');
  }
};

/**
 * Mark an interview session as completed and calculate final duration
 * @param sessionId - Interview session identifier
 * @returns Promise<Interview> - Completed interview with all questions and calculated duration
 * @throws Error if session not found or completion fails
 * @example
 * const completedInterview = await InterviewService.completeInterview("session_123");
 * // Returns interview with duration calculated and timestamp updated
 */
export const completeInterview = async (sessionId: string) => {
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

    // Calculate duration
    const duration = Date.now() - interview.date.getTime();

    await prisma.interview.update({
      where: { id: sessionId },
      data: {
        duration: Math.floor(duration / 1000), // Duration in seconds
        timestamp: new Date(),
      },
    });

    return interview;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    ErrorLogger(error, 'completeInterview');
    throw new DatabaseError('Failed to complete interview');
  }
};

/**
 * Update interview session with comprehensive AI-generated feedback and final score
 * @param sessionId - Interview session identifier
 * @param feedback - Comprehensive feedback object from AI analysis
 * @param feedback.overallScore - Overall interview score (0-100)
 * @param feedback.improvements - Array of specific improvement suggestions
 * @param feedback.overallFeedback - General feedback summary
 * @returns Promise<void> - Resolves when feedback is successfully saved
 * @throws Error if update fails or session not found
 * @example
 * await InterviewService.updateInterviewFeedback("session_123", {
 *   overallScore: 78,
 *   improvements: ["Provide more specific examples", "Improve technical explanations"],
 *   overallFeedback: "Strong performance with room for improvement in communication"
 * });
 */
export const updateInterviewFeedback = async (
  sessionId: string,
  feedback: {
    overallScore: number;
    improvements: string[];
    overallFeedback: string;
  }
) => {
  try {
    await prisma.interview.update({
      where: { id: sessionId },
      data: {
        score: feedback.overallScore,
        improvements: feedback.improvements,
        feedback: feedback.overallFeedback,
      },
    });
  } catch (error) {
    ErrorLogger(error, 'updateInterviewFeedback');
    throw new DatabaseError('Failed to update interview feedback');
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

/**
 * Process individual interview answer and generate immediate feedback using AI microservice
 * @param data - Answer analysis request data
 * @param data.question - The interview question text
 * @param data.answer - Candidate's response to the question
 * @param data.jobRole - Target job role for context-specific evaluation
 * @param data.jobLevel - Experience level for appropriate feedback depth
 * @param data.interviewType - Interview type for specialized evaluation criteria
 * @param data.questionType - Question category (behavioral, technical, coding, etc.)
 * @returns Promise<QuestionFeedback> - AI-generated feedback with score, suggestions, and tips
 * @throws Error if AI service is unavailable or returns invalid response
 * @example
 * const feedback = await AIService.processAnswer({
 *   question: "Describe your experience with microservices",
 *   answer: "I've worked with Docker and Kubernetes...",
 *   jobRole: "Backend Engineer",
 *   jobLevel: "senior",
 *   interviewType: "technical",
 *   questionType: "technical"
 * });
 * // Returns: { score: 85, feedback: "Good technical depth...", strengths: [...], improvements: [...] }
 */
export const processAnswer = async (data: {
  question: string;
  answer: string;
  jobRole: string;
  jobLevel: string;
  interviewType: string;
  questionType: string;
}) => {
  try {
    if (!process.env.PYTHON_API_URL) {
      throw new NotFoundError('PYTHON_API_URL is not set');
    }
    // Make REST API call to AI microservice
    const response = await fetch(`${process.env.PYTHON_API_URL}/interview-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: data.question,
        answer: data.answer,
        jobRole: data.jobRole,
        jobLevel: data.jobLevel,
        interviewType: data.interviewType,
        questionType: data.questionType,
      }),
    });

    if (!response.ok) {
      throw new Error(`External AI service unavailable (HTTP ${response.status})`);
    }

    const responseData = await response.json();
    return responseData; // Return the AI service response directly
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    ErrorLogger(error, 'processAnswer');
    throw new DatabaseError('Failed to process individual answer feedback');
  }
};

/**
 * Generate comprehensive interview feedback by analyzing all answers collectively
 * @param data - Complete interview data for holistic analysis
 * @param data.jobRole - Target job role for role-specific evaluation
 * @param data.jobLevel - Experience level for appropriate feedback complexity
 * @param data.interviewType - Interview type for specialized assessment criteria
 * @param data.questions - Array of all questions with answers and individual feedback
 * @returns Promise<ComprehensiveFeedback> - Overall performance analysis with actionable insights
 * @throws Error if comprehensive analysis fails
 * @example
 * const comprehensiveFeedback = await AIService.processAllAnswers({
 *   jobRole: "Full Stack Developer",
 *   jobLevel: "mid",
 *   interviewType: "technical",
 *   questions: [
 *     { question: "...", answer: "...", questionType: "technical", individualFeedback: "..." }
 *   ]
 * });
 * // Returns: { overallScore: 78, strengths: [...], areasToImprove: [...], questionFeedback: [...] }
 */
export const processAllAnswers = async (data: {
  jobRole: string;
  jobLevel: string;
  interviewType: string;
  questions: Array<{
    question: string;
    answer: string;
    questionType: string;
    individualFeedback?: string;
  }>;
}) => {
  try {
    // This will process all answers together and provide comprehensive feedback
    // For now, returning a mock response structure
    return {
      overallScore: 75, // Score out of 100
      overallFeedback: 'Overall performance shows good technical knowledge...',
      improvements: [
        'Work on providing more specific examples in behavioral questions',
        'Practice explaining complex technical concepts more clearly',
        'Improve communication skills for better articulation',
      ],
      strengths: ['Strong technical knowledge', 'Good problem-solving approach'],
      areasToImprove: ['Communication clarity', 'Providing concrete examples'],
      questionFeedback: data.questions.map((q, index) => ({
        questionNumber: index + 1,
        question: q.question,
        feedback: 'Specific feedback for this answer...',
        score: Math.floor(Math.random() * 30) + 70, // Random score for demo
      })),
    };
  } catch (error) {
    ErrorLogger(error, 'processAllAnswers');
    throw new DatabaseError('Failed to process comprehensive feedback');
  }
};
