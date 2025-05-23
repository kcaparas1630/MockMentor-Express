import { Request, Response } from 'express';
import { InterviewService } from '../db';
import logger from '../Config/LoggerConfig';
export const getQuestion = async (req: Request, res: Response) => {
    try {
        const question = await InterviewService.getAllQuestions();
        res.status(200).json(question);
    } catch (error: unknown) {
        logger.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
}

export const getQuestionById = async (req: Request, res: Response) => {
    try {
        const question = await InterviewService.getQuestionById(req.params.id);
        res.status(200).json(question);
    } catch (error: unknown) {
        logger.error('Error fetching question by id:', error);
        res.status(500).json({ error: 'Failed to fetch question by id' });
    }
}
