import admin from "firebase-admin"
// import serviceAccount from "../../serviceaccountkey.json"
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        databaseURL:
            "https://ideaengine-25bb0-default-rtdb.firebaseio.com",
    });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
