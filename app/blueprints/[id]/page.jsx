"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
}

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

                if (!response.ok) {
                    throw new Error(await response.text());
                }

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

    if (loading) {
        return <main className="min-h-screen pt-28 px-6 md:px-16 bg-gray-50">Loading blueprint...</main>;
    }

    if (error || !blueprint) {
        return (
            <main className="min-h-screen pt-28 px-6 md:px-16 bg-gray-50">
                <p className="text-red-600">Failed to load blueprint: {error || "Not found"}</p>
                <Link href="/profile" className="inline-block mt-4 text-indigo-600 hover:underline">Back to Profile</Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-28 pb-16 px-6 md:px-16 bg-gray-50">
            <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{blueprint.businessName}</h1>
                        <p className="mt-1 text-sm text-gray-500">Created: {formatDate(blueprint.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/api/blueprints/${blueprint.id}/pdf`} className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold hover:bg-indigo-700">
                            Download PDF
                        </Link>
                        <Link href="/profile" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                            Back
                        </Link>
                    </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                    <p><span className="font-semibold">Target Audience:</span> {blueprint.targetAudience || "-"}</p>
                    <p><span className="font-semibold">Revenue Model:</span> {blueprint.revenueModel || "-"}</p>
                    <p><span className="font-semibold">Budget:</span> {blueprint.budget || "-"}</p>
                    <p><span className="font-semibold">Timeline:</span> {blueprint.timeline || "-"}</p>
                    <p><span className="font-semibold">Team Size:</span> {blueprint.teamSize || "-"}</p>
                    <p><span className="font-semibold">Plan at Generation:</span> {blueprint.planAtGeneration || "-"}</p>
                </div>

                <div className="mt-6">
                    <h2 className="text-lg font-bold text-gray-900">Idea Summary</h2>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{blueprint.idea || "-"}</p>
                </div>

                <div className="mt-6">
                    <h2 className="text-lg font-bold text-gray-900">Generated Blueprint</h2>
                    <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap">
                        {blueprint.blueprintText || "No blueprint text available."}
                    </div>
                </div>
            </div>
        </main>
    );
}
