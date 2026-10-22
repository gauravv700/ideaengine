"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
}

// Remove code fences and the leading "# Title" (already shown in the page header)
function cleanMarkdown(text) {
    return String(text || "")
        .replace(/^\s*```(?:markdown|md)?\s*\n/i, "")
        .replace(/\n```\s*$/, "")
        .replace(/^\s*#\s+.*\n/, "")
        .replace(/<br\s*\/?>/gi, " ")
        .trim();
}

const mdComponents = {
    h1: ({ children }) => (
        <h2 className="mt-8 mb-3 text-xl font-bold text-gray-900">{children}</h2>
    ),
    h2: ({ children }) => (
        <h2 className="mt-8 mb-4 rounded-md border-l-4 border-indigo-600 bg-indigo-50 px-4 py-2.5 text-base font-bold text-indigo-700">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="mt-5 mb-2 text-sm font-bold uppercase tracking-wide text-gray-900">{children}</h3>
    ),
    p: ({ children }) => <p className="my-2 leading-relaxed text-gray-700">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
    ul: ({ className, children }) => (
        <ul className={`my-2 space-y-1.5 ${className?.includes("contains-task-list") ? "" : "list-disc pl-5 marker:text-indigo-500"}`}>
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="my-2 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-indigo-600">{children}</ol>
    ),
    li: ({ className, children }) => (
        <li className={`leading-relaxed text-gray-700 ${className?.includes("task-list-item") ? "list-none" : ""}`}>
            {children}
        </li>
    ),
    input: ({ type, checked }) =>
        type === "checkbox" ? (
            <input
                type="checkbox"
                checked={!!checked}
                readOnly
                disabled
                className="mr-2 h-4 w-4 translate-y-0.5 accent-indigo-600"
            />
        ) : null,
    table: ({ children }) => (
        <div className="my-4 overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-left text-sm">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-indigo-600 text-white">{children}</thead>,
    th: ({ children }) => (
        <th className="whitespace-nowrap border border-indigo-500 px-3 py-2 text-xs font-semibold">{children}</th>
    ),
    tbody: ({ children }) => <tbody className="[&>tr:nth-child(even)]:bg-gray-50">{children}</tbody>,
    td: ({ children }) => (
        <td className="min-w-[110px] border border-gray-200 px-3 py-2 align-top text-gray-700">{children}</td>
    ),
    hr: () => <hr className="my-6 border-gray-200" />,
    a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
            {children}
        </a>
    ),
    blockquote: ({ children }) => (
        <blockquote className="my-3 border-l-4 border-indigo-200 pl-4 italic text-gray-600">{children}</blockquote>
    ),
    code: ({ children }) => (
        <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em] text-gray-800">{children}</code>
    ),
};

export default function BlueprintDetailPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [blueprint, setBlueprint] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await fetch(`/api/blueprints/${id}`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok) throw new Error(await response.text());
                const data = await response.json();
                setBlueprint(data.blueprint);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    const markdown = useMemo(() => cleanMarkdown(blueprint?.blueprintText), [blueprint]);

    if (loading) {
        return <main className="min-h-screen pt-28 px-6 md:px-16 bg-gray-50">Loading blueprint...</main>;
    }

    if (error || !blueprint) {
        return (
            <main className="min-h-screen pt-28 px-6 md:px-16 bg-gray-50">
                <p className="text-red-600">Failed to load blueprint: {error || "Not found"}</p>
                <Link href="/profile" className="inline-block mt-4 text-indigo-600 hover:underline">
                    Back to Profile
                </Link>
            </main>
        );
    }

    // Only show fields that exist (works for both old and new blueprints)
    const details = [
        ["Stage", blueprint.businessStage],
        ["Offering", blueprint.offeringType],
        ["Delivery", blueprint.deliveryMode],
        ["Regions", blueprint.serviceRegions],
        ["Target Audience", blueprint.targetAudience],
        ["Revenue Model", blueprint.revenueModel],
        ["Team", blueprint.teamSize],
        ["Initial Investment", blueprint.initialInvestment || blueprint.budget],
        ["First-Year Revenue", blueprint.firstYearRevenue],
        ["Yearly Ops Cost", blueprint.yearlyOperationsCost],
        ["Plan at Generation", blueprint.planAtGeneration],
    ].filter(([, v]) => v);

    const about = blueprint.businessDescription || blueprint.idea;

    return (
        <main className="min-h-screen pt-28 pb-16 px-6 md:px-16 bg-gray-50">
            <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{blueprint.businessName}</h1>
                        <p className="mt-1 text-sm text-gray-500">Created: {formatDate(blueprint.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={`/api/blueprints/${blueprint.id}/pdf`}
                            download
                            className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold hover:bg-indigo-700"
                        >
                            Download PDF
                        </a>
                        <Link
                            href="/profile"
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Back
                        </Link>
                    </div>
                </div>

                {details.length > 0 && (
                    <dl className="mt-6 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
                        {details.map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
                                <dd className="mt-0.5 text-gray-800">{value}</dd>
                            </div>
                        ))}
                    </dl>
                )}

                {about && (
                    <div className="mt-6">
                        <h2 className="text-lg font-bold text-gray-900">About the Business</h2>
                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">{about}</p>
                    </div>
                )}

                <div className="mt-8 border-t border-gray-200 pt-2 text-[15px]">
                    {markdown ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                            {markdown}
                        </ReactMarkdown>
                    ) : (
                        <p className="text-gray-500">No blueprint text available.</p>
                    )}
                </div>
            </div>
        </main>
    );
}