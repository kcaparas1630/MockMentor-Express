/**
 * @fileoverview Controller for retrieving interview questions from the database.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Provides endpoints to fetch all questions or a specific question by ID. Integrates with validation and database services. Ensures robust error handling for question retrieval operations.
 *
 * @see {@link ../db}
 * @see {@link ../ErrorHandlers/ValidationError}
 *
 * Dependencies:
 * - Express.js
 * - Database Service
 * - Error Handlers
 */

import { Request, Response, NextFunction } from 'express';
import { getAllQuestions, getQuestionById } from '../db';
import ValidationError from '../ErrorHandlers/ValidationError';

/**
 * Retrieves all questions from the database
 * @param req - The request object
 * @param res - The response object
 * @returns JSON response with all questions
 * @description Fetches all questions from the database and returns them as a JSON response
 */ 
export const getQuestionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await getAllQuestions();
    res.status(200).json(question);
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Retrieves a specific question by its ID
 * @param req - The request object containing the question ID in params
 * @param res - The response object
 * @returns JSON response with the question
 * @description Fetches a specific question by its ID and returns it as a JSON response
 */
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
