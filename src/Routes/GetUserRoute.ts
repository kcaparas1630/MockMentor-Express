import { Router } from 'express';
import { getUser } from '../Controller/GetUserController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';
const router = Router();

router.get('/user', verifyFirebaseToken, getUser);

export default router;
