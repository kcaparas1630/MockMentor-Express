import { PrismaClient } from '@prisma/client';
import { FirebaseDatabaseError } from 'firebase-admin/lib/utils/error';
import * as admin from 'firebase-admin';
import logger from './Config/LoggerConfig';
import { ProfileData, UserUpdateRequest } from './Types/UserProfile';
import { QuestionFeedback } from './Types/QuestionsType';
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

prisma
  .$connect()
  .then(() => {
    return console.log('Connected to MongoDB');
  })
  .catch((error: FirebaseDatabaseError) => {
    throw new Error(`Database connection error: ${error} `);
  });

export class UserService {
  /**
   * Get user from firebase token
   * @param uid - firebase uid
   * @returns user - user object
   */
  static async getUserFromFirebaseToken(uid: string) {
    try {
      // fetch user from database using prisma
      const user = await prisma.user.findUnique({
        where: {
          firebaseUid: uid,
        },
      });
      return user;
    } catch (error: unknown) {
      logger.error('Error fetching user from firebase token:', error);
      throw new Error('Failed to fetch user from firebase token');
    }
  }
  /**
   * Create a user in the database
   * @param uid - firebase uid
   * @param user - user object
   * @returns user - user object
   */
  static async createUser(user: ProfileData) {
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
        throw new Error('User already exists');
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
      logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  static async updateUser(uid: string, user: UserUpdateRequest) {
    try {
      // Get user first to preserve existing data.
      const currentUser = await prisma.user.findUnique({
        where: { firebaseUid: uid },
      });

      // If user not found, throw error
      if (!currentUser) {
        throw new Error('User not found');
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
      logger.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }
}

export class QuestionService {
  /**
   * Get all questions for a user
   * @param uid - firebase uid
   * @returns questions - array of question objects
   */
  static async getAllQuestions() {
    try {
      const questions = await prisma.question.findMany();
      return questions;
    } catch (error: unknown) {
      logger.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions');
    }
  }
  /**
   * Get a question by id
   * @param id - question id
   * @returns question - question object
   */
  static async getQuestionById(id: string) {
    try {
      const question = await prisma.question.findUnique({
        where: {
          id,
        },
      });
      if (!question) {
        logger.error('Question not found');
        throw new Error('Question not found');
      }
      return question;
    } catch (error: unknown) {
      logger.error('Error fetching question by id:', error);
      throw new Error('Failed to fetch question by id');
    }
  }
}

export class InterviewService {
  /**
   * Create a new interview session
   * @param sessionData - session data
   * @returns interview - interview object
   */
  static async createSession(sessionData: {
    userId: string;
    jobRole: string;
    jobLevel: string;
    interviewType: string;
    totalQuestions: number;
    startedAt: Date;
  }) {
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
      logger.error('Error creating interview session:', error);
      throw new Error('Failed to create interview session');
    }
  }
  /**
   * Get a session by id
   * @param sessionId - session id
   * @returns interview - interview object
   */
  static async getSession(sessionId: string) {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id: sessionId },
        include: {
          questions: true,
        },
      });
      return interview;
    } catch (error) {
      logger.error('Error getting interview session:', error);
      throw new Error('Failed to get interview session');
    }
  }
  /**
   * Save an answer to a question
   * @param sessionId - session id
   * @param questionId - question id
   * @param answer - answer
   * @param questionText - question text
   * @param feedback - feedback
   */
  static async saveAnswer(
    sessionId: string,
    questionId: string,
    answer: string,
    questionText: string,
    feedback?: QuestionFeedback
  ) {
    try {
      // Get question type
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

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
      logger.error('Error saving answer:', error);
      throw new Error('Failed to save answer');
    }
  }
  /**
   * Complete an interview session
   * @param sessionId - session id
   * @returns interview - interview object
   */
  static async completeInterview(sessionId: string) {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id: sessionId },
        include: {
          questions: true,
        },
      });

      if (!interview) {
        throw new Error('Interview not found');
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
      logger.error('Error completing interview:', error);
      throw new Error('Failed to complete interview');
    }
  }
  /**
   * Update interview feedback
   * @param sessionId - session id
   * @param feedback - feedback
   */
  static async updateInterviewFeedback(
    sessionId: string,
    feedback: {
      overallScore: number;
      improvements: string[];
      overallFeedback: string;
    }
  ) {
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
      logger.error('Error updating interview feedback:', error);
      throw new Error('Failed to update interview feedback');
    }
  }
}
