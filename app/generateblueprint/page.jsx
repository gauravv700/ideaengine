"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const initialForm = {
    businessName: "",
    businessStage: "",
    businessDescription: "",
    idea: "",
    employees: "",
    offeringType: "",
    deliveryMode: "",
    serviceRegions: "",
    productName: "",
    productDescription: "",
    targetAudience: "",
    revenueModel: "",
    initialInvestment: "",
    firstYearRevenue: "",
    revenueGrowthRate: "",
    yearlyOperationsCost: "",
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

        const payload = {
            ...form,
            idea: form.idea || form.businessDescription || form.productDescription,
            budget: form.budget || form.initialInvestment,
            teamSize: form.teamSize || form.employees,
        };

        try {
            const res = await fetch("/api/generateblueprint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to generate blueprint");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${(payload.businessName || "blueprint").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
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
                    Answer these business questions to generate a detailed strategy blueprint PDF.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <select name="businessStage" value={form.businessStage} onChange={onChange} className="w-full rounded-md border border-gray-300 px-3 py-2" required>
                        <option value="">Select business stage</option>
                        <option value="Idea / Vision">Idea / Vision</option>
                        <option value="Startup / Growth">Startup / Growth</option>
                        <option value="Brand / Enterprise">Brand / Enterprise</option>
                    </select>

                    <input name="businessName" value={form.businessName} onChange={onChange} placeholder="Business name" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <textarea name="businessDescription" value={form.businessDescription} onChange={onChange} placeholder="Business description (e.g. hotel, restaurant, online store)" className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-24" required />
                    <input name="employees" value={form.employees} onChange={onChange} placeholder="Total number of employees" className="w-full rounded-md border border-gray-300 px-3 py-2" required />

                    <select name="offeringType" value={form.offeringType} onChange={onChange} className="w-full rounded-md border border-gray-300 px-3 py-2" required>
                        <option value="">Do you offer product or service?</option>
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                        <option value="Both">Both</option>
                    </select>

                    <select name="deliveryMode" value={form.deliveryMode} onChange={onChange} className="w-full rounded-md border border-gray-300 px-3 py-2" required>
                        <option value="">How can customers get it?</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Both">Both</option>
                    </select>

                    <input name="serviceRegions" value={form.serviceRegions} onChange={onChange} placeholder="Where do you serve customers? (city/country/region)" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <input name="productName" value={form.productName} onChange={onChange} placeholder="Product or service name" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <textarea name="productDescription" value={form.productDescription} onChange={onChange} placeholder="Product or service description" className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-24" required />

                    <input name="targetAudience" value={form.targetAudience} onChange={onChange} placeholder="Target audience" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <input name="revenueModel" value={form.revenueModel} onChange={onChange} placeholder="Revenue model (subscription, SaaS, marketplace, etc.)" className="w-full rounded-md border border-gray-300 px-3 py-2" required />

                    <input name="initialInvestment" value={form.initialInvestment} onChange={onChange} placeholder="Total initial investment" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <input name="firstYearRevenue" value={form.firstYearRevenue} onChange={onChange} placeholder="Expected first-year revenue" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <input name="revenueGrowthRate" value={form.revenueGrowthRate} onChange={onChange} placeholder="Expected yearly revenue growth rate (%)" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <input name="yearlyOperationsCost" value={form.yearlyOperationsCost} onChange={onChange} placeholder="Estimated yearly operations cost" className="w-full rounded-md border border-gray-300 px-3 py-2" required />

                    <textarea name="idea" value={form.idea} onChange={onChange} placeholder="Core business idea (optional if already covered above)" className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-20" />
                    <input name="budget" value={form.budget} onChange={onChange} placeholder="Budget range (optional if initial investment filled)" className="w-full rounded-md border border-gray-300 px-3 py-2" />
                    <input name="timeline" value={form.timeline} onChange={onChange} placeholder="Expected timeline (e.g. 3 months MVP)" className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                    <input name="teamSize" value={form.teamSize} onChange={onChange} placeholder="Team size and roles (optional if employees filled)" className="w-full rounded-md border border-gray-300 px-3 py-2" />
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
