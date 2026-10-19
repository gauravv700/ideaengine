import admin from "firebase-admin";
import fs from "node:fs";
import path from "node:path";

function loadServiceAccount() {
    const rawEnvValue = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();

    if (rawEnvValue) {
        try {
            const parsed = JSON.parse(rawEnvValue);
            return {
                ...parsed,
                private_key: parsed.private_key?.replace(/\\n/g, "\n"),
            };
        } catch (error) {
            console.warn("Ignoring invalid FIREBASE_SERVICE_ACCOUNT env value and falling back to serviceaccountkey.json.", error);
        }
    }

    const fallbackPath = path.join(process.cwd(), "serviceaccountkey.json");
    const fallbackContents = fs.readFileSync(fallbackPath, "utf8");
    const parsed = JSON.parse(fallbackContents);

    return {
        ...parsed,
        private_key: parsed.private_key?.replace(/\\n/g, "\n"),
    };
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        databaseURL: "https://ideaengine-25bb0-default-rtdb.firebaseio.com",
    });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
