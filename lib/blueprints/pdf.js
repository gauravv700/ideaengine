import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MX = 50;
const TOP = PAGE_H - 56;
const BOTTOM = 56;
const CONTENT_W = PAGE_W - MX * 2;

const C = {
    indigo: rgb(0.31, 0.31, 0.86),
    light: rgb(0.93, 0.94, 1),
    text: rgb(0.13, 0.15, 0.2),
    muted: rgb(0.37, 0.4, 0.48),
    border: rgb(0.82, 0.84, 0.9),
    zebra: rgb(0.97, 0.97, 0.99),
    white: rgb(1, 1, 1),
};

/* ---------- Text cleanup (Helvetica only supports WinAnsi) ---------- */

const REPLACEMENTS = [
    [/₹/g, "Rs. "],
    [/→/g, "->"],
    [/←/g, "<-"],
    [/≈/g, "~"],
    [/≥/g, ">="],
    [/≤/g, "<="],
    [/[✓✔]/g, ""],
    [/\u00A0/g, " "],
    [/\t/g, "    "],
    [/<br\s*\/?>/gi, " "],
];

export function sanitize(text) {
    let t = String(text ?? "").replace(/\r/g, "");
    for (const [re, rep] of REPLACEMENTS) t = t.replace(re, rep);
    // keep only characters WinAnsi can encode (drops emojis etc.)
    return t.replace(/[^\n\x20-\x7E\xA1-\xFF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u20AC\u2122]/g, "");
}

const short = (s, n = 30) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/* ---------- Markdown parsing ---------- */

function parseInline(text) {
    const clean = String(text).replace(/`/g, "");
    const runs = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    let m;
    while ((m = re.exec(clean))) {
        if (m.index > last) runs.push({ text: clean.slice(last, m.index), bold: false });
        runs.push({ text: m[1], bold: true });
        last = m.index + m[0].length;
    }
    if (last < clean.length) runs.push({ text: clean.slice(last), bold: false });
    return runs;
}

const plain = (s) => String(s ?? "").replace(/\*\*/g, "").replace(/`/g, "");

function tableBlock(rows) {
    const split = (r) =>
        r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const isSep = (r) => /^\|?[\s:|-]+\|?$/.test(r) && r.includes("-");
    const parsed = rows.filter((r) => !isSep(r)).map(split);
    const header = parsed[0] || [];
    const n = header.length;
    const body = parsed.slice(1).map((r) => {
        if (r.length > n) return [...r.slice(0, n - 1), r.slice(n - 1).join(" | ")];
        return [...r, ...Array(n - r.length).fill("")];
    });
    return { type: "table", header, rows: body };
}

function parseBlocks(md) {
    const cleaned = sanitize(md)
        .replace(/^\s*```(?:markdown|md)?\s*\n/i, "")
        .replace(/\n```\s*$/, "");
    const lines = cleaned.split("\n");
    const blocks = [];
    let para = [];
    let i = 0;

    const flush = () => {
        if (para.length) {
            blocks.push({ type: "p", text: para.join(" ") });
            para = [];
        }
    };

    while (i < lines.length) {
        const raw = lines[i];
        const line = raw.trim();

        if (!line) { flush(); i++; continue; }
        if (/^[-*•]$/.test(line)) { i++; continue; } // stray empty bullet
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) { flush(); blocks.push({ type: "hr" }); i++; continue; }

        let m = line.match(/^(#{1,6})\s+(.*)$/);
        if (m) { flush(); blocks.push({ type: "h", level: m[1].length, text: m[2] }); i++; continue; }

        if (line.startsWith("|")) {
            flush();
            const rows = [];
            while (i < lines.length && lines[i].trim().startsWith("|")) {
                rows.push(lines[i].trim());
                i++;
            }
            blocks.push(tableBlock(rows));
            continue;
        }

        m = raw.match(/^(\s*)[-*•]\s+\[( |x|X)\]\s+(.*)$/);
        if (m) {
            flush();
            blocks.push({ type: "li", marker: "box", level: Math.min(2, Math.ceil(m[1].length / 4)), text: m[3] });
            i++; continue;
        }

        m = raw.match(/^(\s*)[-*•]\s+(.*)$/);
        if (m) {
            flush();
            blocks.push({ type: "li", marker: "dot", level: Math.min(2, Math.ceil(m[1].length / 4)), text: m[2] });
            i++; continue;
        }

        m = raw.match(/^(\s*)(\d+)[.)]\s+(.*)$/);
        if (m) {
            flush();
            blocks.push({ type: "li", marker: `${m[2]}.`, level: Math.min(2, Math.ceil(m[1].length / 4)), text: m[3] });
            i++; continue;
        }

        para.push(line);
        i++;
    }
    flush();
    return blocks;
}

/* ---------- PDF writer ---------- */

class PdfWriter {
    constructor(doc, fonts) {
        this.doc = doc;
        this.f = fonts;
        this.pages = [];
        this.page = null;
        this.y = 0;
    }

    addPage(first = false) {
        this.page = this.doc.addPage([PAGE_W, PAGE_H]);
        this.pages.push(this.page);
        if (!first) {
            this.page.drawRectangle({ x: 0, y: PAGE_H - 14, width: PAGE_W, height: 14, color: C.indigo });
        }
        this.y = first ? PAGE_H - 40 : TOP;
    }

    ensure(h) {
        if (this.y - h < BOTTOM) {
            this.addPage();
            return true;
        }
        return false;
    }

    width(text, bold, size) {
        return (bold ? this.f.bold : this.f.regular).widthOfTextAtSize(text, size);
    }

    breakLong(word, bold, size, maxW) {
        if (this.width(word, bold, size) <= maxW) return [word];
        const out = [];
        let cur = "";
        for (const ch of word) {
            if (cur && this.width(cur + ch, bold, size) > maxW) {
                out.push(cur);
                cur = ch;
            } else cur += ch;
        }
        if (cur) out.push(cur);
        return out;
    }

    // Word-wrap mixed bold/regular runs into lines
    layout(runs, size, maxW, forceBold = false) {
        const spaceW = this.width(" ", false, size);
        const tokens = [];
        let pending = false;

        for (const run of runs) {
            for (const part of run.text.match(/\S+|\s+/g) || []) {
                if (/^\s/.test(part)) { pending = true; continue; }
                const bold = forceBold || run.bold;
                for (const piece of this.breakLong(part, bold, size, maxW)) {
                    tokens.push({
                        text: piece,
                        bold,
                        space: pending && tokens.length > 0,
                        w: this.width(piece, bold, size),
                    });
                    pending = false;
                }
            }
        }

        const lines = [];
        let line = [];
        let lw = 0;
        for (const t of tokens) {
            const add = (t.space && line.length ? spaceW : 0) + t.w;
            if (line.length && lw + add > maxW) {
                lines.push(line);
                line = [{ ...t, space: false }];
                lw = t.w;
            } else {
                line.push(t);
                lw += add;
            }
        }
        if (line.length) lines.push(line);
        return { lines, spaceW };
    }

    drawLine(line, x, baseY, size, color, spaceW) {
        let cx = x;
        line.forEach((t, i) => {
            if (i > 0 && t.space) cx += spaceW;
            this.page.drawText(t.text, {
                x: cx, y: baseY, size, color,
                font: t.bold ? this.f.bold : this.f.regular,
            });
            cx += t.w;
        });
    }

    rich(text, { x = MX, width = CONTENT_W, size = 10.5, color = C.text, bold = false, lh = size * 1.45 } = {}) {
        const { lines, spaceW } = this.layout(parseInline(text), size, width, bold);
        for (const line of lines) {
            this.ensure(lh);
            this.drawLine(line, x, this.y - size, size, color, spaceW);
            this.y -= lh;
        }
    }

    h1(text) {
        this.ensure(60);
        this.y -= 10;
        this.rich(text, { size: 16, bold: true, lh: 22 });
        this.y -= 4;
    }

    h2(text) {
        this.ensure(70);
        this.y -= 10;
        this.page.drawRectangle({ x: MX, y: this.y - 22, width: CONTENT_W, height: 26, color: C.light });
        this.page.drawRectangle({ x: MX, y: this.y - 22, width: 3, height: 26, color: C.indigo });
        this.page.drawText(text.replace(/\*\*/g, ""), {
            x: MX + 12, y: this.y - 14, size: 12, font: this.f.bold, color: C.indigo,
        });
        this.y -= 38;
    }

    h3(text) {
        this.ensure(40);
        this.y -= 6;
        this.rich(text, { size: 11, bold: true, lh: 16 });
        this.y -= 2;
    }

    paragraph(text) {
        this.rich(text);
        this.y -= 5;
    }

    listItem({ text, marker, level }) {
        const size = 10.5;
        const lh = 15;
        const markerX = MX + level * 16 + 2;
        const isNum = /^\d+\.$/.test(marker);
        const textX = markerX + (isNum ? 20 : 14);

        this.ensure(lh);
        const baseY = this.y - size;

        if (marker === "box") {
            this.page.drawRectangle({
                x: markerX, y: baseY - 1, width: 8, height: 8,
                borderColor: C.indigo, borderWidth: 1,
            });
        } else if (isNum) {
            this.page.drawText(marker, { x: markerX, y: baseY, size, font: this.f.bold, color: C.indigo });
        } else {
            this.page.drawText("•", { x: markerX, y: baseY, size, font: this.f.bold, color: C.indigo });
        }

        this.rich(text, { x: textX, width: PAGE_W - MX - textX, size, lh });
        this.y -= 2;
    }

    hr() {
        this.ensure(16);
        this.y -= 6;
        this.page.drawLine({
            start: { x: MX, y: this.y }, end: { x: PAGE_W - MX, y: this.y },
            thickness: 0.5, color: C.border,
        });
        this.y -= 8;
    }

    table({ header, rows }) {
        const n = header.length;
        if (!n) return;

        const size = n >= 6 ? 7.5 : n >= 5 ? 8 : 9;
        const lh = size * 1.35;
        const pad = 4;

        const weights = header.map((h, j) => {
            const lens = rows.map((r) => plain(r[j]).length);
            const avg = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
            return Math.min(36, Math.max(8, plain(h).length, avg));
        });
        const total = weights.reduce((a, b) => a + b, 0);
        const widths = weights.map((w) => (w / total) * CONTENT_W);

        const drawRow = (cells, isHeader, zebra) => {
            const laid = cells.map((c, j) =>
                this.layout(parseInline(c), size, widths[j] - pad * 2, isHeader)
            );
            const h = Math.max(...laid.map((l) => l.lines.length), 1) * lh + pad * 2;

            // on page break, repeat the header row
            if (this.ensure(h) && !isHeader) {
                drawRow(header, true, false);
                this.ensure(h);
            }

            const top = this.y;
            let x = MX;
            cells.forEach((_, j) => {
                this.page.drawRectangle({
                    x, y: top - h, width: widths[j], height: h,
                    color: isHeader ? C.indigo : zebra ? C.zebra : C.white,
                    borderColor: C.border, borderWidth: 0.5,
                });
                laid[j].lines.forEach((line, k) => {
                    this.drawLine(
                        line, x + pad, top - pad - size - k * lh + 1.5, size,
                        isHeader ? C.white : C.text, laid[j].spaceW
                    );
                });
                x += widths[j];
            });
            this.y -= h;
        };

        this.ensure(70); // avoid a lonely header row at the bottom of a page
        drawRow(header, true, false);
        rows.forEach((r, i) => drawRow(r, false, i % 2 === 1));
        this.y -= 12;
    }

    cover(title, meta) {
        const p = this.page;
        p.drawRectangle({ x: 0, y: PAGE_H - 84, width: PAGE_W, height: 84, color: C.indigo });
        p.drawText("IdeaEngine", { x: MX, y: PAGE_H - 46, size: 16, font: this.f.bold, color: C.white });
        p.drawText("Business Blueprint Report", { x: MX, y: PAGE_H - 64, size: 11, font: this.f.regular, color: C.white });

        this.y = PAGE_H - 118;
        this.rich(title, { size: 24, bold: true, lh: 30 });
        this.y -= 2;
        this.rich("Structured strategy generated for your business idea.", { size: 11, color: C.muted });
        this.y -= 12;

        const badges = [
            `Plan: ${meta.planAtGeneration || meta.plan || "Starter"}`,
            meta.businessStage && `Stage: ${meta.businessStage}`,
            meta.revenueModel && `Model: ${short(sanitize(meta.revenueModel), 28)}`,
        ].filter(Boolean);

        let bx = MX;
        for (const label of badges) {
            const w = this.width(label, true, 9) + 20;
            p.drawRectangle({ x: bx, y: this.y - 18, width: w, height: 20, color: C.light });
            p.drawText(label, { x: bx + 10, y: this.y - 12, size: 9, font: this.f.bold, color: C.indigo });
            bx += w + 8;
        }
        this.y -= 34;

        this.h2("Business Snapshot");
        const snapshot = [
            ["Stage", meta.businessStage],
            ["Offering", meta.offeringType],
            ["Delivery", meta.deliveryMode],
            ["Regions", meta.serviceRegions],
            ["Audience", meta.targetAudience],
            ["Revenue model", meta.revenueModel],
            ["Team", meta.teamSize],
            ["Initial investment", meta.initialInvestment],
        ];
        for (const [label, value] of snapshot) {
            const v = sanitize(value).trim() || "Not provided";
            this.rich(`**${label}:** ${v}`, { size: 10, color: C.muted });
        }
        this.y -= 8;
    }
}

/* ---------- Public API ---------- */

export async function createPdfFromText(title, bodyText, meta = {}) {
    const safeTitle = sanitize(title).trim() || "Untitled Idea";

    const doc = await PDFDocument.create();
    doc.setTitle(`${safeTitle} - Business Blueprint`);
    doc.setAuthor("IdeaEngine");

    const fonts = {
        regular: await doc.embedFont(StandardFonts.Helvetica),
        bold: await doc.embedFont(StandardFonts.HelveticaBold),
    };

    const w = new PdfWriter(doc, fonts);
    w.addPage(true);
    w.cover(safeTitle, meta);

    const blocks = parseBlocks(bodyText);
    blocks.forEach((b, idx) => {
        switch (b.type) {
            case "h":
                // first "# Title" duplicates the cover title, so skip it
                if (b.level === 1 && idx === 0) break;
                if (b.level === 1) w.h1(b.text);
                else if (b.level === 2) w.h2(b.text);
                else w.h3(b.text);
                break;
            case "p": w.paragraph(b.text); break;
            case "li": w.listItem(b); break;
            case "table": w.table(b); break;
            case "hr": w.hr(); break;
        }
    });

    // Footers on every page
    const total = w.pages.length;
    w.pages.forEach((p, i) => {
        const label = `Page ${i + 1} of ${total}`;
        const lw = fonts.regular.widthOfTextAtSize(label, 9);
        p.drawLine({
            start: { x: MX, y: 42 }, end: { x: PAGE_W - MX, y: 42 },
            thickness: 0.5, color: C.border,
        });
        p.drawText(`IdeaEngine | ${short(safeTitle, 50)}`, { x: MX, y: 28, size: 9, font: fonts.regular, color: C.muted });
        p.drawText(label, { x: PAGE_W - MX - lw, y: 28, size: 9, font: fonts.regular, color: C.muted });
    });

    return Buffer.from(await doc.save());
}