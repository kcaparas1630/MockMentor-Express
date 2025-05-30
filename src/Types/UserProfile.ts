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
