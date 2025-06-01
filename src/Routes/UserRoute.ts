import { Router } from 'express';
import { createUserController, getUserController, updateUserController } from '../Controller/UserController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';
const router = Router();

router.get('/user', verifyFirebaseToken, getUserController);
router.post('/create-user', createUserController);
router.put('/update-user', verifyFirebaseToken, updateUserController);

export default router;
