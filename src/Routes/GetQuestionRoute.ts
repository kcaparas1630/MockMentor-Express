import { Router } from 'express';
import { getQuestion, getQuestionById } from '../Controller/QuestionsController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';

const router = Router();

router.get('/questions', verifyFirebaseToken, getQuestion);
router.get('/questions/:id', verifyFirebaseToken, getQuestionById);

export default router;
