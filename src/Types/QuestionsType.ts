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
