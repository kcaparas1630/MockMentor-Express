/**
 * @fileoverview Type definitions for user profile and update request structures.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Provides interfaces for user profile data and update requests used in authentication and user management.
 *
 * Dependencies:
 * - None
 */
import { UserRecord } from "firebase-admin/lib/auth/user-record";

export interface ProfileData extends Partial<UserRecord> {
    name: string;
    email: string;
    jobRole: string;
    lastLogin: Date;
    password?: string; // for admin auth
}

export interface UserUpdateRequest {
    profile: Partial<ProfileData>;
}
