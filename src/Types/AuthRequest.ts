/**
 * @fileoverview Type definition for authenticated Express request with Firebase user.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Extends the Express Request interface to include a decoded Firebase ID token for authenticated routes.
 *
 * Dependencies:
 * - Express.js
 * - Firebase Admin SDK
 */

import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}
