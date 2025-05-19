import { PrismaClient } from "@prisma/client";
import { FirebaseDatabaseError } from "firebase-admin/lib/utils/error";
import * as admin from 'firebase-admin';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

prisma.$connect().then(() => {
    return console.log('Connected to MongoDB');
}).catch((error: FirebaseDatabaseError) => {
    throw new Error(`Database connection error: ${error} `);
});

export class InterviewService {
// TODO: Implement the static methods for the interview service
// get user from firebase token
    static async getUserFromFirebaseToken(uid: string) {
        try {
            // fetch user from database using prisma
            const user = await prisma.user.findUnique({
                where: {
                    firebaseUid: uid,
                }
            });
            // create user if not found
            if (!user) {
                const firebaseUser = await admin.auth().getUser(uid);
                const newUser = await prisma.user.create({
                    data: {
                        firebaseUid: uid,
                        profile: {
                            name: firebaseUser.displayName ?? "",
                            email: firebaseUser.email ?? "",
                            lastLogin: new Date(),
                        },
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                });
                return newUser;
            }
            return user;
        } catch (error) {
            console.error('Error fetching user from firebase token:', error);
            throw new Error('Failed to fetch user from firebase token');
        }
    }
}
