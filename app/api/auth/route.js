import { adminAuth } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

const EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days (ms)

export async function POST(req) {
    try {
        const { idToken } = await req.json();
        if (!idToken) return new Response("Missing token", { status: 400 });

        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn: EXPIRES_IN,
        });

        const res = NextResponse.json({ message: "Logged in" });
        res.cookies.set("session", sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: EXPIRES_IN / 1000, // seconds
        });
        return res;
    } catch (error) {
        console.error("Session cookie creation failed:", error);
        const isInvalidToken = error?.code === "auth/invalid-id-token" || error?.code === "auth/id-token-expired";
        return new Response(
            isInvalidToken ? "Invalid login token" : "Failed to create session cookie",
            { status: isInvalidToken ? 401 : 500 }
        );
    }
}

export async function GET(req) {
    const session = req.cookies.get("session")?.value;
    if (!session) return new Response("Unauthorized", { status: 401 });

    try {
        const decoded = await adminAuth.verifySessionCookie(session, true);
        const userRecord = await adminAuth.getUser(decoded.uid);

        return NextResponse.json({
            message: "Verified",
            user: {
                uid: decoded.uid,
                email: userRecord.email,
                name: userRecord.displayName,
                photoURL: userRecord.photoURL,
                emailVerified: userRecord.emailVerified,
            },
            claims: decoded,
        });
    } catch {
        return new Response("Invalid session", { status: 401 });
    }
}

export async function DELETE() {
    const res = NextResponse.json({ message: "Logged out" });
    res.cookies.set("session", "", { path: "/", maxAge: 0 });
    return res;
}
