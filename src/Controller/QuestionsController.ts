import { Request, Response, NextFunction } from 'express';
import { getAllQuestions, getQuestionById } from '../db';
import ValidationError from '../ErrorHandlers/ValidationError';

export const getQuestionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await getAllQuestions();
    res.status(200).json(question);
  } catch (error: unknown) {
    next(error);
  }
};

export const getQuestionByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // check if id is not missing
    if (!id) {
        return next(new ValidationError('Question id is required'));
    }

    // get question by id   
    const question = await getQuestionById(id);

    res.status(200).json(question);
  } catch (error: unknown) {
    next(error);
  }
};
