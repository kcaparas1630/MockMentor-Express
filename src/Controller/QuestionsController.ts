import { Request, Response, NextFunction } from 'express';
import { getAllQuestions, getQuestionById } from '../db';
import ErrorLogger from '../Helper/ErrorLogger';
import DatabaseError from '../ErrorHandlers/DatabaseError';
import NotFoundError from '../ErrorHandlers/NotFoundError';
import ValidationError from '../ErrorHandlers/ValidationError';

export const getQuestionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await getAllQuestions();
    res.status(200).json(question);
  } catch (error: unknown) {
    ErrorLogger(error, 'getQuestionController');
    next(new DatabaseError('Failed to fetch questions', error));
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

    // if question is not found, return 404 error
    if (!question) {
      return next(new NotFoundError('Question not found'));
    }

    res.status(200).json(question);
  } catch (error: unknown) {
    ErrorLogger(error, 'getQuestionByIdController');
    next(new DatabaseError('Failed to fetch question by id', error));
  }
};
