import { Router } from 'express';
import { createUserController, getUser, updateUserController } from '../Controller/UserController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';
const router = Router();

router.get('/user', verifyFirebaseToken, getUser);
router.post('/create-user', createUserController);
router.put('/update-user', verifyFirebaseToken, updateUserController);

export default router;
