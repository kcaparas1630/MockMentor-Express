import { PrismaClient } from "@prisma/client";
import { FirebaseDatabaseError } from "firebase-admin/lib/utils/error";

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
}
