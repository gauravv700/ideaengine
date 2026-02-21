import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

function escapePdfText(text) {
    return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(text, maxLen = 95) {
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";

    for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (next.length > maxLen) {
            if (current) lines.push(current);
            current = word;
        } else {
            current = next;
        }
    }

    if (current) lines.push(current);
    return lines;
}

function createPdfFromText(title, bodyText) {
    const lines = [
        `Blueprint: ${title || "Untitled Idea"}`,
        "",
        ...bodyText.split("\n").flatMap((line) => line.trim() ? wrapText(line) : [""]),
    ];

    const linesPerPage = 42;
    const pages = [];
    for (let i = 0; i < lines.length; i += linesPerPage) {
        pages.push(lines.slice(i, i + linesPerPage));
    }

    const fontObjNum = 3 + pages.length * 2;
    const objects = [];

    objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    const kids = pages.map((_, idx) => `${3 + idx * 2} 0 R`).join(" ");
    objects.push(`2 0 obj\n<< /Type /Pages /Count ${pages.length} /Kids [ ${kids} ] >>\nendobj\n`);

    for (let idx = 0; idx < pages.length; idx += 1) {
        const pageObjNum = 3 + idx * 2;
        const contentObjNum = pageObjNum + 1;
        const pageLines = pages[idx];

        const contentLines = [
            "BT",
            "/F1 12 Tf",
            "50 742 Td",
            "14 TL",
            ...pageLines.flatMap((line) => [`(${escapePdfText(line)}) Tj`, "T*"]),
            "ET",
        ].join("\n");

        objects.push(
            `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`
        );
        objects.push(
            `${contentObjNum} 0 obj\n<< /Length ${Buffer.byteLength(contentLines, "utf8")} >>\nstream\n${contentLines}\nendstream\nendobj\n`
        );
    }

    objects.push(`${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    for (const obj of objects) {
        offsets.push(Buffer.byteLength(pdf, "utf8"));
        pdf += obj;
    }

    const xrefStart = Buffer.byteLength(pdf, "utf8");
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    for (let i = 1; i < offsets.length; i += 1) {
        pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, "utf8");
}

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
            ...payload,
            blueprintText,
        });

        const pdfBuffer = createPdfFromText(payload.businessName, blueprintText);
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
