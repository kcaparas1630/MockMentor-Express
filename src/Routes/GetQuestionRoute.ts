import { Router } from 'express';
import { getQuestionController, getQuestionByIdController } from '../Controller/QuestionsController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';

const router = Router();

router.get('/questions', verifyFirebaseToken, getQuestionController);
router.get('/questions/:id', verifyFirebaseToken, getQuestionByIdController);

export default router;
