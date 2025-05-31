import { Router } from 'express';
import { startInterview, submitUserResponse, getInterviewResults, getQuestionByIndex } from '../Controller/InterviewController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';

const router = Router();


router.post('/start-interview', verifyFirebaseToken, startInterview);
router.post('/submit-user-response', verifyFirebaseToken, submitUserResponse);
router.get('/get-interview-results', verifyFirebaseToken, getInterviewResults);
router.get('/get-question-by-index', verifyFirebaseToken, getQuestionByIndex);

export default router;
