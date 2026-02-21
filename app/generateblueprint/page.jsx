"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const initialForm = {
    businessName: "",
    idea: "",
    targetAudience: "",
    revenueModel: "",
    budget: "",
    timeline: "",
    teamSize: "",
    competitors: "",
    notes: "",
};

export default function GenerateBlueprintPage() {
    const router = useRouter();
    const [form, setForm] = useState(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const ensureLoggedIn = async () => {
            try {
                const res = await fetch("/api/auth", {
                    method: "GET",
                    credentials: "include",
                });
                if (!res.ok) {
                    router.replace("/login");
                }
            } catch {
                router.replace("/login");
            }
        };

        ensureLoggedIn();
    }, [router]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus("Generating blueprint PDF...");

        try {
            const res = await fetch("/api/generateblueprint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to generate blueprint");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${(form.businessName || "blueprint").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(url);
            setStatus("Blueprint generated and downloaded.");
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 px-6 md:px-16 py-28">
            <div className="max-w-3xl mx-auto rounded-xl bg-white border border-gray-200 shadow-sm p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-900">Generate Blueprint</h1>
                <p className="text-gray-600 mt-2">
                    Answer these questions and we will generate a business blueprint PDF.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <input name="businessName" value={form.businessName} onChange={onChange} placeholder="Business name" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <textarea name="idea" value={form.idea} onChange={onChange} placeholder="Describe your business idea" className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-24" required />
                    <input name="targetAudience" value={form.targetAudience} onChange={onChange} placeholder="Target audience" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <input name="revenueModel" value={form.revenueModel} onChange={onChange} placeholder="Revenue model (e.g. subscription, SaaS, marketplace)" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <input name="budget" value={form.budget} onChange={onChange} placeholder="Budget range" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <input name="timeline" value={form.timeline} onChange={onChange} placeholder="Expected timeline (e.g. 3 months MVP)" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <input name="teamSize" value={form.teamSize} onChange={onChange} placeholder="Team size and roles" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <textarea name="competitors" value={form.competitors} onChange={onChange} placeholder="Competitors (optional)" className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-20" />
                    <textarea name="notes" value={form.notes} onChange={onChange} placeholder="Additional notes (optional)" className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-20" />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Generating..." : "Generate Blueprint PDF"}
                    </button>
                </form>

                {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
            </div>
        </main>
    );
}
