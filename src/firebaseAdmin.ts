import admin from 'firebase-admin';
import serviceAccountJson from './Config/firebase-admin-key.json';
import { ServiceAccount } from 'firebase-admin';

const serviceAccount = serviceAccountJson as ServiceAccount;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default admin;
