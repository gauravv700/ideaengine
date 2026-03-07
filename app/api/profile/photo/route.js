import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function getAuthedUid(req) {
    const session = req.cookies.get("session")?.value;
    if (!session) return null;
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.uid;
}

function sanitizeFilename(name) {
    return (name || "file").replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(req) {
    try {
        const uid = await getAuthedUid(req);
        if (!uid) return new Response("Unauthorized", { status: 401 });

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || typeof file.arrayBuffer !== "function") {
            return new Response("No file provided", { status: 400 });
        }

        if (!file.type?.startsWith("image/")) {
            return new Response("Only image uploads are allowed", { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${sanitizeFilename(file.name)}`;
        const objectPath = `profile-photos/${uid}/${filename}`;

        const bucket = adminAuth.app.storage().bucket();
        const object = bucket.file(objectPath);

        await object.save(buffer, {
            resumable: false,
            contentType: file.type,
            metadata: {
                cacheControl: "public, max-age=31536000",
            },
        });

        const [photoURL] = await object.getSignedUrl({
            action: "read",
            expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 5,
        });

        const userUpdate = { photoURL };
        await Promise.all([
            adminAuth.updateUser(uid, userUpdate),
            adminDb.collection("users").doc(uid).set(
                { photoURL, updatedAt: new Date() },
                { merge: true }
            ),
        ]);

        return NextResponse.json({ photoURL });
    } catch (error) {
        return new Response(`Photo upload failed: ${error.message || "Unknown error"}`, { status: 500 });
    }
}
