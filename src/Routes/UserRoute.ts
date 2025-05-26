import { Router } from 'express';
import { createUser, getUser, updateUser } from '../Controller/UserController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';
const router = Router();

router.get('/user', verifyFirebaseToken, getUser);
router.post('/create-user', verifyFirebaseToken, createUser);
router.put('/update-user', verifyFirebaseToken, updateUser);

export default router;
