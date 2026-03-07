import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { createPdfFromText } from "@/lib/blueprints/pdf";

export const runtime = "nodejs";

async function getAuthedUid(req) {
    const session = req.cookies.get("session")?.value;
    if (!session) return null;
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.uid;
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

        const pdfBuffer = createPdfFromText(data.businessName, data.blueprintText || "", {
            idea: data.idea || "",
            targetAudience: data.targetAudience || "",
            revenueModel: data.revenueModel || "",
            budget: data.budget || "",
            timeline: data.timeline || "",
            teamSize: data.teamSize || "",
            planAtGeneration: data.planAtGeneration || "Starter",
        });
        const filename = `${(data.businessName || "blueprint").replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${id}.pdf`;

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        return new Response(`Failed to build PDF: ${error.message || "Unknown error"}`, { status: 500 });
    }
}
