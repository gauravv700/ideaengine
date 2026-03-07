import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function normalizeDate(value) {
    if (!value) return null;
    if (typeof value?.toDate === "function") return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();
    return null;
}

async function getAuthedUid(req) {
    const session = req.cookies.get("session")?.value;
    if (!session) return null;
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.uid;
}

export async function GET(req) {
    try {
        const uid = await getAuthedUid(req);
        if (!uid) return new Response("Unauthorized", { status: 401 });

        const [userRecord, userDocSnap, blueprintsSnap] = await Promise.all([
            adminAuth.getUser(uid),
            adminDb.collection("users").doc(uid).get(),
            adminDb.collection("blueprints").where("userId", "==", uid).limit(50).get(),
        ]);

        const userDoc = userDocSnap.exists ? userDocSnap.data() : {};
        const blueprints = blueprintsSnap.docs
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    businessName: data.businessName || "Untitled",
                    idea: data.idea || "",
                    timeline: data.timeline || "",
                    revenueModel: data.revenueModel || "",
                    createdAt: normalizeDate(data.createdAt),
                };
            })
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        return NextResponse.json({
            user: {
                uid,
                email: userRecord.email || "",
                displayName: userRecord.displayName || userDoc.name || "",
                photoURL: userRecord.photoURL || userDoc.photoURL || "",
                emailVerified: userRecord.emailVerified || false,
                plan: userDoc.plan || "Starter",
                role: userDoc.role || "user",
                company: userDoc.company || "",
                phone: userDoc.phone || "",
                bio: userDoc.bio || "",
                joinedAt: normalizeDate(userDoc.createdAt) || normalizeDate(userRecord.metadata?.creationTime),
            },
            stats: {
                blueprintCount: blueprints.length,
            },
            blueprints,
        });
    } catch (error) {
        return new Response(`Failed to load profile: ${error.message || "Unknown error"}`, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const uid = await getAuthedUid(req);
        if (!uid) return new Response("Unauthorized", { status: 401 });

        const body = await req.json();
        const displayName = (body?.displayName || "").trim();
        const company = (body?.company || "").trim();
        const phone = (body?.phone || "").trim();
        const bio = (body?.bio || "").trim();
        const plan = (body?.plan || "Starter").trim();
        const photoURL = (body?.photoURL || "").trim();

        if (!displayName) {
            return new Response("Display name is required", { status: 400 });
        }

        const allowedPlans = ["Starter", "Pro", "Team"];
        const safePlan = allowedPlans.includes(plan) ? plan : "Starter";

        const userUpdate = { displayName };
        if (photoURL) {
            userUpdate.photoURL = photoURL;
        }

        await Promise.all([
            adminAuth.updateUser(uid, userUpdate),
            adminDb.collection("users").doc(uid).set(
                {
                    name: displayName,
                    company,
                    phone,
                    bio,
                    plan: safePlan,
                    photoURL,
                    updatedAt: new Date(),
                },
                { merge: true }
            ),
        ]);

        return NextResponse.json({ message: "Profile updated" });
    } catch (error) {
        return new Response(`Failed to update profile: ${error.message || "Unknown error"}`, { status: 500 });
    }
}
