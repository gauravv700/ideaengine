import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function getAuthedUid(req) {
    const session = req.cookies.get("session")?.value;
    if (!session) return null;
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.uid;
}

function normalizeDate(value) {
    if (!value) return null;
    if (typeof value?.toDate === "function") return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();
    return null;
}

export async function GET(req, { params }) {
    try {
        const uid = await getAuthedUid(req);
        if (!uid) return new Response("Unauthorized", { status: 401 });

        const { id } = await params;
        const docSnap = await adminDb.collection("blueprints").doc(id).get();
        if (!docSnap.exists) return new Response("Blueprint not found", { status: 404 });

        const data = docSnap.data();
        if (data.userId !== uid) return new Response("Forbidden", { status: 403 });

        return NextResponse.json({
            blueprint: {
                id: docSnap.id,
                businessName: data.businessName || "Untitled",
                idea: data.idea || "",
                targetAudience: data.targetAudience || "",
                revenueModel: data.revenueModel || "",
                budget: data.budget || "",
                timeline: data.timeline || "",
                teamSize: data.teamSize || "",
                competitors: data.competitors || "",
                notes: data.notes || "",
                blueprintText: data.blueprintText || "",
                createdAt: normalizeDate(data.createdAt),
                planAtGeneration: data.planAtGeneration || "Starter",
            },
        });
    } catch (error) {
        return new Response(`Failed to load blueprint: ${error.message || "Unknown error"}`, { status: 500 });
    }
}
