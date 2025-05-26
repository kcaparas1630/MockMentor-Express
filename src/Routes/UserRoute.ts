import { Router } from 'express';
import { createUser, getUser } from '../Controller/UserController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';
const router = Router();

router.get('/user', verifyFirebaseToken, getUser);
router.post('/create-user', verifyFirebaseToken, createUser);

export default router;
