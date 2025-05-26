import { UserRecord } from "firebase-admin/lib/auth/user-record";

export interface UserProfile extends UserRecord {
    jobRole: string;
    name?: string;
    password: string;  
}
