/**
 * @fileoverview Express router for question-related endpoints (fetch all questions, fetch by ID).
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Defines API routes for retrieving interview questions, integrating authentication middleware and question controllers. Ensures secure and validated question retrieval.
 *
 * @see {@link ../Controller/QuestionsController}
 * @see {@link ../Middleware/VerifyFirebaseToken}
 *
 * Dependencies:
 * - Express.js
 * - Question Controllers
 * - Middleware
 */
import { Router } from 'express';
import { getQuestionController, getQuestionByIdController } from '../Controller/QuestionsController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';

const router = Router();

router.get('/questions', verifyFirebaseToken, getQuestionController);
router.get('/questions/:id', verifyFirebaseToken, getQuestionByIdController);

export default router;
