export function escapePdfText(text) {
    return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function normalizeText(value) {
    if (!value) return "";
    return String(value).replace(/\r/g, "");
}

function splitWords(text) {
    return normalizeText(text).split(/\s+/).filter(Boolean);
}

export function wrapText(text, maxLen = 90) {
    const words = splitWords(text);
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

function colorRgb(r, g, b) {
    return `${r} ${g} ${b}`;
}

function sanitizeInline(text) {
    return normalizeText(text).replace(/\n/g, " ");
}

function parseSections(bodyText) {
    const lines = normalizeText(bodyText).split("\n");
    const sections = [];
    let current = { heading: "Blueprint Narrative", lines: [] };

    for (const raw of lines) {
        const line = raw.trim();
        const headingMatch = line.match(/^(#{1,6}\s+.+|\d+\)\s+.+)$/);
        if (headingMatch) {
            if (current.lines.length || current.heading) sections.push(current);
            current = {
                heading: line.replace(/^#{1,6}\s*/, "").trim(),
                lines: [],
            };
            continue;
        }
        current.lines.push(raw);
    }

    if (current.lines.length || current.heading) sections.push(current);
    return sections.filter((s) => s.heading || s.lines.some((x) => x.trim()));
}

function scoreFromInput(value, fallback = 65) {
    if (!value) return fallback;
    const text = sanitizeInline(value);
    const lenScore = Math.min(95, 40 + Math.floor(text.length / 6));
    return Math.max(45, lenScore);
}

function buildScores(meta) {
    const ideaScore = scoreFromInput(meta?.idea, 70);
    const audienceScore = scoreFromInput(meta?.targetAudience, 62);
    const modelScore = scoreFromInput(meta?.revenueModel, 58);
    const executionScore = scoreFromInput(`${meta?.timeline || ""} ${meta?.teamSize || ""}`, 60);

    return [
        { label: "Problem Clarity", value: ideaScore },
        { label: "Audience Fit", value: audienceScore },
        { label: "Monetization", value: modelScore },
        { label: "Execution Readiness", value: executionScore },
    ];
}

export function createPdfFromText(title, bodyText, meta = {}) {
    const PAGE_WIDTH = 612;
    const PAGE_HEIGHT = 792;
    const MARGIN_X = 48;
    const TOP_Y = 760;
    const BOTTOM_Y = 54;
    const INDIGO = colorRgb(0.31, 0.31, 0.86);
    const LIGHT_INDIGO = colorRgb(0.93, 0.94, 1);
    const DARK_TEXT = colorRgb(0.13, 0.15, 0.2);
    const MUTED_TEXT = colorRgb(0.37, 0.4, 0.48);
    const WHITE = colorRgb(1, 1, 1);

    const pages = [];
    let commands = [];
    let y = TOP_Y;

    const push = (line) => commands.push(line);

    const commitPage = () => {
        pages.push(commands.join("\n"));
        commands = [];
        y = TOP_Y;
    };

    const newPage = () => {
        if (commands.length) commitPage();
    };

    const ensureSpace = (height) => {
        if (y - height < BOTTOM_Y) {
            newPage();
            return true;
        }
        return false;
    };

    const drawRect = (x, rectY, w, h, rgb) => {
        push(`${rgb} rg`);
        push(`${x} ${rectY} ${w} ${h} re f`);
    };

    const drawText = (text, x, textY, size = 12, bold = false, rgb = DARK_TEXT) => {
        const font = bold ? "/F2" : "/F1";
        push("BT");
        push(`${rgb} rg`);
        push(`${font} ${size} Tf`);
        push(`1 0 0 1 ${x} ${textY} Tm`);
        push(`(${escapePdfText(sanitizeInline(text))}) Tj`);
        push("ET");
    };

    const drawParagraph = (text, x, startY, widthChars = 84, size = 11, lineGap = 14, rgb = DARK_TEXT) => {
        const lines = normalizeText(text)
            .split("\n")
            .flatMap((line) => (line.trim() ? wrapText(line, widthChars) : [""]));

        let currentY = startY;
        for (const line of lines) {
            const pageBroke = ensureSpace(lineGap + 12);
            if (pageBroke) {
                currentY = y;
            }
            drawText(line, x, currentY, size, false, rgb);
            currentY -= lineGap;
            y = currentY;
        }
        return lines.length * lineGap;
    };

    const drawBadge = (text, x, rectY, w = 160, h = 22) => {
        drawRect(x, rectY, w, h, LIGHT_INDIGO);
        drawText(text, x + 10, rectY + 7, 10, true, INDIGO);
    };

    const scores = buildScores(meta);
    const safeTitle = title || "Untitled Idea";
    const planLabel = meta?.planAtGeneration || meta?.plan || "Starter";

    drawRect(0, PAGE_HEIGHT - 84, PAGE_WIDTH, 84, INDIGO);
    drawText("IdeaEngine", MARGIN_X, PAGE_HEIGHT - 46, 15, true, WHITE);
    drawText("Business Blueprint Report", MARGIN_X, PAGE_HEIGHT - 64, 11, false, WHITE);

    y = PAGE_HEIGHT - 128;
    drawText(safeTitle, MARGIN_X, y, 24, true, DARK_TEXT);
    y -= 22;
    drawText("Structured strategy generated for your business idea.", MARGIN_X, y, 11, false, MUTED_TEXT);
    y -= 34;

    drawBadge(`Plan: ${planLabel}`, MARGIN_X, y - 4, 120, 22);
    drawBadge(`Timeline: ${meta?.timeline || "Not provided"}`, MARGIN_X + 132, y - 4, 210, 22);
    drawBadge(`Model: ${meta?.revenueModel || "Not provided"}`, MARGIN_X + 350, y - 4, 214, 22);
    y -= 42;

    drawText("Business Snapshot", MARGIN_X, y, 14, true, DARK_TEXT);
    y -= 16;
    drawParagraph(
        `Audience: ${meta?.targetAudience || "Not provided"}\nBudget: ${meta?.budget || "Not provided"}\nTeam: ${meta?.teamSize || "Not provided"}`,
        MARGIN_X,
        y,
        92,
        10,
        13,
        MUTED_TEXT
    );
    y -= 6;

    ensureSpace(130);
    drawText("Readiness Signals", MARGIN_X, y, 14, true, DARK_TEXT);
    y -= 18;

    const chartW = 440;
    const barH = 12;
    for (const entry of scores) {
        ensureSpace(28);
        drawText(`${entry.label} (${entry.value}%)`, MARGIN_X, y, 10, false, MUTED_TEXT);
        const trackY = y - 10;
        drawRect(MARGIN_X, trackY, chartW, barH, colorRgb(0.92, 0.92, 0.95));
        drawRect(MARGIN_X, trackY, (chartW * entry.value) / 100, barH, INDIGO);
        y -= 30;
    }

    y -= 6;
    ensureSpace(40);
    drawText("Blueprint Narrative", MARGIN_X, y, 15, true, DARK_TEXT);
    y -= 20;

    const sections = parseSections(bodyText);
    for (const section of sections) {
        const heading = section.heading || "Section";
        ensureSpace(42);
        drawRect(MARGIN_X, y - 14, PAGE_WIDTH - MARGIN_X * 2, 22, LIGHT_INDIGO);
        drawText(heading, MARGIN_X + 10, y - 7, 11, true, INDIGO);
        y -= 30;

        const sectionText = section.lines.join("\n").trim();
        if (sectionText) {
            drawParagraph(sectionText, MARGIN_X + 4, y, 86, 11, 15, DARK_TEXT);
            y -= 8;
        } else {
            drawText("-", MARGIN_X + 4, y, 11, false, MUTED_TEXT);
            y -= 16;
        }
    }

    if (commands.length) {
        commitPage();
    }

    pages.forEach((_, index) => {
        const pageNumber = index + 1;
        const total = pages.length;
        const footer = [
            "BT",
            `${MUTED_TEXT} rg`,
            "/F1 9 Tf",
            `1 0 0 1 ${PAGE_WIDTH - 110} 26 Tm`,
            `(Page ${pageNumber} of ${total}) Tj`,
            "ET",
        ].join("\n");
        pages[index] = `${pages[index]}\n${footer}`;
    });

    const objects = [];
    const pageObjectNums = [];
    const contentObjectNums = [];
    const fontRegularObjNum = 3 + pages.length * 2;
    const fontBoldObjNum = fontRegularObjNum + 1;

    objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    for (let i = 0; i < pages.length; i += 1) {
        pageObjectNums.push(3 + i * 2);
        contentObjectNums.push(4 + i * 2);
    }

    const kids = pageObjectNums.map((n) => `${n} 0 R`).join(" ");
    objects.push(`2 0 obj\n<< /Type /Pages /Count ${pages.length} /Kids [ ${kids} ] >>\nendobj\n`);

    for (let i = 0; i < pages.length; i += 1) {
        const pageObjNum = pageObjectNums[i];
        const contentObjNum = contentObjectNums[i];
        const stream = pages[i];

        objects.push(
            `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularObjNum} 0 R /F2 ${fontBoldObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`
        );
        objects.push(
            `${contentObjNum} 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`
        );
    }

    objects.push(`${fontRegularObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
    objects.push(`${fontBoldObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

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
