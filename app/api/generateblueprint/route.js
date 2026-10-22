import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { createPdfFromText } from "@/lib/blueprints/pdf";

export const runtime = "nodejs";

function formatInputs(data) {
    const fields = [
        ["Business name", data.businessName],
        ["Business stage", data.businessStage],
        ["What the business does", data.businessDescription],
        ["Offering type", data.offeringType],
        ["Delivery mode", data.deliveryMode],
        ["Service regions", data.serviceRegions],
        ["Target audience", data.targetAudience],
        ["Revenue model", data.revenueModel],
        ["Team size and roles", data.teamSize],
        ["Initial investment", data.initialInvestment],
        ["Expected first-year revenue", data.firstYearRevenue],
        ["Yearly operations cost", data.yearlyOperationsCost],
        ["Known competitors", data.competitors],
        ["Main goal or biggest challenge", data.notes],
    ];

    return fields
        .map(([label, value]) => {
            const v = value === undefined || value === null ? "" : String(value).trim();
            return `- ${label}: ${v || "NOT PROVIDED"}`;
        })
        .join("\n");
}

const SYSTEM_INSTRUCTION = `You are a senior startup strategist and business consultant with 15+ years of experience advising early-stage founders and small businesses. You write blueprints that are specific, realistic, and immediately actionable.

RULES:
- Be specific to THIS business. Never give generic advice that could apply to any company.
- Ground every recommendation in the user's inputs (stage, budget, team size, timeline, region).
- If an input is "NOT PROVIDED", make a reasonable, clearly labeled assumption (write "Assumption:" before it). Never invent facts about the user's business.
- Keep all financial figures internally consistent: the budget, revenue, costs, and KPIs must agree with each other. Use the same currency as the user's inputs.
- Recommendations must fit the stated budget and team size. Do not suggest tactics the team cannot afford or staff.
- Be concise. Prefer short bullets and tables over long paragraphs. No filler, no motivational fluff, no repeating the user's input back.
- Do not add any text before the first heading or after the last section.
    - Write currency as "INR" or "Rs."(never the ₹ symbol).Do not use emojis or HTML tags such as <br>.
- Keep every table cell under 12 words so tables stay readable in print.
- Use only: # /## /### headings, bullets(max 2 levels), numbered lists, "- [ ]" checklists, GFM tables, and ** bold **.No code fences.`

function buildPrompt(data) {
    return `Create a practical, investor-grade business blueprint for the business described below.

## USER INPUTS
${formatInputs(data)}

## OUTPUT FORMAT
Return valid GitHub-flavored Markdown only. Use EXACTLY these 10 sections, in this order, with these exact "##" headings. Start with a single "# {Business name} — Business Blueprint" title.

## 1. Executive Summary
- 3-4 sentence overview (what it is, who it serves, how it makes money, why now).
- A "Key Numbers" table: Initial Investment | Year-1 Revenue | Growth Rate | Yearly Ops Cost | Estimated Break-even.

## 2. Problem and Audience
- **Problem:** 2-3 specific pain points, each with a concrete example.
- **Primary Audience:** a short persona (who, where, needs, buying triggers).
- **Market Opportunity:** brief and realistic; flag any estimate as an assumption.

## 3. Value Proposition
- One-sentence value proposition.
- 3 differentiators vs. alternatives.
- A "Competitor Comparison" table (You vs. each named competitor): Pricing | Strength | Weakness | Your Edge. If no competitors are provided, identify 2-3 likely ones as assumptions.

## 4. Business Model
- Revenue streams table: Stream | Pricing | Who Pays | Estimated Share of Revenue.
- Unit economics: estimated CAC, LTV, and gross margin (state assumptions).
- A 3-year revenue projection table using the given first-year revenue and growth rate: Year | Revenue | Costs | Profit/Loss.

## 5. Product Roadmap (30/60/90 days)
Three sub-sections (Days 1-30, 31-60, 61-90). For each: Goal, 3-5 deliverables, and one measurable milestone. Stay within the stated timeline and team size.

## 6. Go-To-Market Strategy
- Positioning statement (one sentence).
- Top 3 acquisition channels, ranked, with: why it fits, first concrete tactic, estimated cost, expected outcome.
- Launch plan: pre-launch, launch, post-launch (2-3 bullets each).
- Pricing and sales approach appropriate for the delivery mode and service regions.

## 7. Risks and Mitigations
A table with 5-7 rows: Risk | Category (Market/Operational/Financial/Legal/Technical) | Likelihood (Low/Med/High) | Impact (Low/Med/High) | Mitigation.

## 8. KPI Dashboard
A table: KPI | Definition | Baseline | 30-Day Target | 90-Day Target | 12-Month Target | Tracking Tool.
Include 8-10 KPIs across acquisition, revenue, retention, and operations.

## 9. Budget and Resources
- Budget allocation table: Category | Amount | % of Budget | Notes. Percentages must total 100% and amounts must fit the stated investment/budget.
- Team and roles: who is needed now vs. later, and what to outsource.
- Recommended tools/stack (prefer free or low-cost options when budget is tight).
- Monthly burn rate and estimated runway.

## 10. Action Plan (Next 14 Days)
A checklist using "- [ ]" items, grouped under Days 1-3, Days 4-7, Days 8-10, Days 11-14. Each item must be a single concrete action starting with a verb, with an owner role in parentheses.

## STYLE REQUIREMENTS
- Use "###" for sub-headings, bullets for lists, tables for comparisons and numbers, and **bold** for key terms only.
- Include a concrete example, number, or sample wherever it helps (e.g., sample ad copy, sample pricing tier, sample outreach message).
- Keep each section tight; the whole blueprint should read cleanly in about 6-8 minutes.
- End with a short "### Assumptions Made" list covering any inputs marked NOT PROVIDED. Omit it if there were none.`;
}

const MODELS = [
    process.env.GEMINI_MODEL || "gemini-3.6-flash",
    "gemini-3.5-flash-lite",   // lighter model, usually has spare capacity
    "gemini-3.1-flash-lite",
];

const RETRYABLE = new Set([429, 500, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function POST(req) {
    const session = req.cookies.get("session")?.value;
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const decoded = await adminAuth.verifySessionCookie(session, true);
        const payload = await req.json();

        const required = ["businessName", "businessDescription", "initialInvestment", "targetAudience", "revenueModel", "teamSize"];
        const missing = required.filter((key) => !payload?.[key]);
        if (missing.length) {
            return new Response(`Missing fields: ${missing.join(", ")}`, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

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
        const retriesPerModel = 2
        let lastError = "Unknown error";

        for (const model of MODELS) {
            for (let attempt = 0; attempt <= retriesPerModel; attempt++) {
                const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                            contents: [{ role: "user", parts: [{ text: buildPrompt(payload) }] }],
                            generationConfig: {
                                temperature: 0.4,        // lower = more consistent structure and numbers
                                topP: 0.9,
                                maxOutputTokens: 8192,   // avoid cut-off on long blueprints
                            },
                        }),
                    }
                );

                if (!geminiRes.ok) {
                    lastError = `Gemini request failed (${geminiRes.status}): ${await geminiRes.text()}`;
                    if (!RETRYABLE.has(geminiRes.status)) {
                        throw new Error(lastError);
                    }

                    // Exponential backoff with jitter: ~1s, ~2s, ~4s
                    if (attempt < retriesPerModel) {
                        await sleep(1000 * 2 ** attempt + Math.random() * 500);
                    }
                    continue;
                }

                const geminiData = await geminiRes.json()
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

                const pdfBuffer = await createPdfFromText(payload.businessName, blueprintText, {
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
            }
        }

        return new Response(`Gemini request failed: ${lastError}`, { status: 502 });
    } catch (error) {
        return new Response(`Failed to generate blueprint: ${error.message || "Unknown error"}`, { status: 500 });
    }
}
