import { PrismaClient } from "@prisma/client";
import { FirebaseDatabaseError } from "firebase-admin/lib/utils/error";
import * as admin from 'firebase-admin';
import logger from "./Config/LoggerConfig";
import { UserProfile } from "./Types/UserProfile";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

prisma.$connect().then(() => {
    return console.log('Connected to MongoDB');
}).catch((error: FirebaseDatabaseError) => {
    throw new Error(`Database connection error: ${error} `);
});

export class UserService {
// TODO: Implement the static methods for the interview service
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
                }
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
    static async createUser(uid: string, user: UserProfile) {
        try {
            const firebaseUser = await admin.auth().getUser(uid);
            const newUser = await prisma.user.create({
                data: {
                    firebaseUid: uid,
                    profile: {
                        name: (firebaseUser.displayName || user.displayName) ?? "",
                        email: firebaseUser.email ?? "",
                        jobRole: user.jobRole ?? "",
                        lastLogin: new Date(),
                    },
                }
            });
            return newUser;
        } catch (error: unknown) {
            logger.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }

    static async updateUser(uid: string, user: UserProfile) {
        try {
            const updatedUser = await prisma.user.update({
                where: { firebaseUid: uid },
                data: user,
            });
            return updatedUser;
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
