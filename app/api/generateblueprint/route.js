import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { createPdfFromText } from "@/lib/blueprints/pdf";

export const runtime = "nodejs";

function buildPrompt(data) {
    return `You are an expert startup strategist.
Create a practical business blueprint in markdown.
Use the exact sections below:
1) Executive Summary
2) Problem and Audience
3) Value Proposition
4) Business Model
5) Product Roadmap (30/60/90 days)
6) Go-To-Market Strategy
7) Risks and Mitigations
8) KPI Dashboard
9) Budget and Resources
10) Action Plan (next 14 days, checklist style)

User inputs:
- Business name: ${data.businessName}
- Idea: ${data.idea}
- Target audience: ${data.targetAudience}
- Revenue model: ${data.revenueModel}
- Budget range: ${data.budget}
- Timeline: ${data.timeline}
- Team size: ${data.teamSize}
- Competitors: ${data.competitors}
- Notes: ${data.notes}

Write concise, actionable recommendations and include concrete examples where possible.`;
}

export async function POST(req) {
    const session = req.cookies.get("session")?.value;
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const decoded = await adminAuth.verifySessionCookie(session, true);
        const payload = await req.json();

        const required = ["businessName", "idea", "targetAudience", "revenueModel", "budget", "timeline", "teamSize"];
        const missing = required.filter((key) => !payload?.[key]);
        if (missing.length) {
            return new Response(`Missing fields: ${missing.join(", ")}`, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

        if (!apiKey) {
            return new Response("Missing GEMINI_API_KEY", { status: 500 });
        }

        const userDocSnap = await adminDb.collection("users").doc(decoded.uid).get();
        const userData = userDocSnap.exists ? userDocSnap.data() : {};
        const plan = userData?.plan || "Starter";
        const planLimits = { Starter: 5, Pro: 100, Team: Infinity };
        const monthlyLimit = planLimits[plan] ?? 5;

        if (Number.isFinite(monthlyLimit)) {
            const blueprintsSnap = await adminDb.collection("blueprints").where("userId", "==", decoded.uid).get();
            const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
            const monthlyUsed = blueprintsSnap.docs.filter((doc) => {
                const createdAt = doc.data()?.createdAt;
                const created = typeof createdAt?.toDate === "function" ? createdAt.toDate().getTime() : new Date(createdAt || 0).getTime();
                return created >= cutoff;
            }).length;

            if (monthlyUsed >= monthlyLimit) {
                return new Response(
                    `Plan limit reached: ${plan} allows ${monthlyLimit} blueprints per 30 days.`,
                    { status: 403 }
                );
            }
        }

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: buildPrompt(payload) }] }],
                    generationConfig: { temperature: 0.5 },
                }),
            }
        );

        if (!geminiRes.ok) {
            const text = await geminiRes.text();
            return new Response(`Gemini request failed: ${text}`, { status: 502 });
        }

        const geminiData = await geminiRes.json();
        const blueprintText = geminiData?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();

        if (!blueprintText) {
            return new Response("Empty response from Gemini", { status: 502 });
        }

        const docRef = await adminDb.collection("blueprints").add({
            userId: decoded.uid,
            createdAt: new Date(),
            planAtGeneration: plan,
            ...payload,
            blueprintText,
        });

        const pdfBuffer = createPdfFromText(payload.businessName, blueprintText, {
            ...payload,
            planAtGeneration: plan,
        });
        const filename = `${payload.businessName.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "blueprint"}-${docRef.id}.pdf`;

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        return new Response(`Failed to generate blueprint: ${error.message || "Unknown error"}`, { status: 500 });
    }
}
