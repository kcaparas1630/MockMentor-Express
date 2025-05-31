import { Request, Response } from 'express';
import { getAllQuestions, getQuestionById } from '../db';
import logger from '../Config/LoggerConfig';
export const getQuestionController = async (req: Request, res: Response) => {
    try {
        const question = await getAllQuestions();
        res.status(200).json(question);
    } catch (error: unknown) {
        logger.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
}

export const getQuestionByIdController = async (req: Request, res: Response) => {
    try {
        const question = await getQuestionById(req.params.id);
        res.status(200).json(question);
    } catch (error: unknown) {
        logger.error('Error fetching question by id:', error);
        res.status(500).json({ error: 'Failed to fetch question by id' });
    }
}
