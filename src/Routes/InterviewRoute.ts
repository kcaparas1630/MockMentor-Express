/**
 * @fileoverview Express router for interview session endpoints (start, submit, results, question by index).
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Defines API routes for managing interview sessions, integrating authentication middleware and interview controllers. Ensures secure and validated interview flow.
 *
 * @see {@link ../Controller/InterviewController}
 * @see {@link ../Middleware/VerifyFirebaseToken}
 *
 * Dependencies:
 * - Express.js
 * - Interview Controllers
 * - Middleware
 */

import { Router } from 'express';
import { startInterview } from '../Controller/InterviewController';
import verifyFirebaseToken from '../Middleware/VerifyFirebaseToken';

const router = Router();

router.post('/start-interview', verifyFirebaseToken, startInterview);

export default router;
