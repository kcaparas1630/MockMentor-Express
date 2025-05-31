import { JsonValue } from '@prisma/client/runtime/library';

export interface Question {
    question: string;
    questionType: string;
}

export interface QuestionFeedback {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    tips: string[];
}

export interface InterviewQuestion {
    id: string;
    interviewId: string;
    questionId: string;
    questionText: string;
    answer: string;
    questionType: string;
}
export interface CompletedInterviewQuestion extends InterviewQuestion {
    feedback: JsonValue;
    answeredAt: Date;
}
  