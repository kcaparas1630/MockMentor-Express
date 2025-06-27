/**
 * @fileoverview Type definitions for interview questions and feedback structures.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Provides interfaces for questions, feedback, and interview question data used throughout the application.
 *
 * Dependencies:
 * - None
 */
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
  