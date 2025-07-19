/**
 * @fileoverview Express router for user-related endpoints (profile retrieval, creation, update).
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Defines API routes for user management, integrating authentication middleware and user controllers. Ensures secure and validated user operations.
 *
 * @see {@link ../Controller/UserController}
 * @see {@link ../Middleware/VerifyFirebaseToken}
 *
 * Dependencies:
 * - Express.js
 * - User Controllers
 * - Middleware
 */
import { Router } from 'express';
import { createUserController, getUserController, updateUserController, googleAuthController } from '../Controller/UserController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';
const router = Router();

router.get('/user', verifyFirebaseToken, getUserController);
router.post('/google', googleAuthController);
router.post('/create-user', createUserController);
router.put('/update-user', verifyFirebaseToken, updateUserController);

export default router;
