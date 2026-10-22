"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FIELDS = [
    {
        name: "businessStage", type: "select", required: true, placeholder: "Select business stage",
        options: ["Idea / Vision", "Startup / Growth", "Brand / Enterprise"]
    },
    { name: "businessName", type: "input", required: true, placeholder: "Business name" },
    {
        name: "businessDescription", type: "textarea", required: true,
        placeholder: "What does your business do? (e.g. boutique hotel, online store, SaaS tool)"
    },
    {
        name: "offeringType", type: "select", required: true, placeholder: "Do you offer a product or service?",
        options: ["Product", "Service", "Both"]
    },
    {
        name: "deliveryMode", type: "select", required: true, placeholder: "How do customers get it?",
        options: ["Online", "Offline", "Both"]
    },
    {
        name: "serviceRegions", type: "input", required: true,
        placeholder: "Where do you serve customers? (city / country / region)"
    },
    {
        name: "targetAudience", type: "input", required: true,
        placeholder: "Target audience (e.g. college students, small restaurant owners)"
    },
    {
        name: "revenueModel", type: "input", required: true,
        placeholder: "Revenue model (subscription, one-time sales, marketplace, etc.)"
    },
    {
        name: "teamSize", type: "input", required: true,
        placeholder: "Team size and roles (e.g. 3: 2 developers, 1 marketer)"
    },
    {
        name: "initialInvestment", type: "input", required: true,
        placeholder: "Total initial investment (include currency)"
    },
    {
        name: "firstYearRevenue", type: "input", required: false,
        placeholder: "Expected first-year revenue (optional)"
    },
    {
        name: "yearlyOperationsCost", type: "input", required: false,
        placeholder: "Estimated yearly operations cost (optional)"
    },
    {
        name: "competitors", type: "textarea", required: false,
        placeholder: "Known competitors (optional)"
    },
    {
        name: "notes", type: "textarea", required: false,
        placeholder: "Main goal or biggest challenge right now (optional)"
    },
];

const initialForm = Object.fromEntries(FIELDS.map((f) => [f.name, ""]));
const inputClass = "w-full rounded-md border border-gray-300 px-3 py-2";

export default function GenerateBlueprintPage() {
    const router = useRouter();
    const [form, setForm] = useState(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const ensureLoggedIn = async () => {
            try {
                const res = await fetch("/api/auth", { method: "GET", credentials: "include" });
                if (!res.ok) router.replace("/login");
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

    const renderField = (f) => {
        const common = {
            name: f.name,
            value: form[f.name],
            onChange,
            required: f.required,
            className: inputClass,
        };
        if (f.type === "select") {
            return (
                <select key={f.name} {...common}>
                    <option value="">{f.placeholder}</option>
                    {f.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
            );
        }
        if (f.type === "textarea") {
            return <textarea key={f.name} {...common} placeholder={f.placeholder} className={`${inputClass} min-h-24`} />;
        }
        return <input key={f.name} {...common} placeholder={f.placeholder} />;
    };

    return (
        <main className="min-h-screen bg-gray-50 px-6 md:px-16 py-28">
            <div className="max-w-3xl mx-auto rounded-xl bg-white border border-gray-200 shadow-sm p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-900">Generate Blueprint</h1>
                <p className="text-gray-600 mt-2">
                    Answer a few questions to generate a detailed strategy blueprint PDF.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    {FIELDS.map(renderField)}
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