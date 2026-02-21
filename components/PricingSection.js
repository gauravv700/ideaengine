"use client";

import Link from "next/link";
import { useState } from "react";

const PricingSection = () => {
    const [selectedPlan, setSelectedPlan] = useState("pro");

    const getCardClass = (plan, isPopular = false) => {
        const isSelected = selectedPlan === plan;
        const base = "rounded-2xl bg-white p-7 transition-all duration-200 cursor-pointer outline-none";

        if (isSelected) {
            return `${base} border-2 border-indigo-600 ring-4 ring-indigo-100 shadow-lg`;
        }

        if (isPopular) {
            return `${base} border border-gray-200 shadow-sm hover:shadow-md`;
        }

        return `${base} border border-gray-200 shadow-sm hover:shadow-md`;
    };

    return (
        <section id="pricing" className="min-h-screen px-6 md:px-16 py-24 scroll-mt-24 bg-gradient-to-b from-white to-indigo-50/40">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">Pricing That Scales With You</h2>
                <p className="mt-3 text-center text-gray-600">Start free, validate your ideas, then scale with your team.</p>

                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPlan("starter")}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedPlan("starter")}
                        className={getCardClass("starter")}
                    >
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Starter</p>
                        <h3 className="mt-2 text-2xl font-bold text-gray-900">$0<span className="text-base font-medium text-gray-500">/month</span></h3>
                        <p className="mt-2 text-sm text-gray-600">For solo founders testing their first idea.</p>
                        <Link href="/signup" className="mt-6 block w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 text-center">
                            Get Started Free
                        </Link>
                        <ul className="mt-6 space-y-3 text-sm text-gray-700">
                            <li>Up to 5 blueprint generations/month</li>
                            <li>Basic market insights</li>
                            <li>Export blueprint as PDF</li>
                            <li>Email support</li>
                        </ul>
                    </div>

                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPlan("pro")}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedPlan("pro")}
                        className={`${getCardClass("pro", true)} relative`}
                    >
                        <span className="absolute -top-3 right-5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Most Popular</span>
                        <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Pro</p>
                        <h3 className="mt-2 text-2xl font-bold text-gray-900">$29<span className="text-base font-medium text-gray-500">/month</span></h3>
                        <p className="mt-2 text-sm text-gray-600">For builders shipping quickly and iterating often.</p>
                        <Link href="/generateblueprint" className="mt-6 block w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 text-center">
                            Start Pro Trial
                        </Link>
                        <ul className="mt-6 space-y-3 text-sm text-gray-700">
                            <li>Up to 100 blueprint generations/month</li>
                            <li>Advanced GTM and KPI recommendations</li>
                            <li>Competitive positioning analysis</li>
                            <li>Priority email support</li>
                            <li>Version history for generated plans</li>
                        </ul>
                    </div>

                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPlan("team")}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedPlan("team")}
                        className={getCardClass("team")}
                    >
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Team</p>
                        <h3 className="mt-2 text-2xl font-bold text-gray-900">$99<span className="text-base font-medium text-gray-500">/month</span></h3>
                        <p className="mt-2 text-sm text-gray-600">For agencies and product teams managing multiple ideas.</p>
                        <Link href="/#contact" className="mt-6 block w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 text-center">
                            Contact Sales
                        </Link>
                        <ul className="mt-6 space-y-3 text-sm text-gray-700">
                            <li>Unlimited blueprint generations</li>
                            <li>Up to 10 team seats</li>
                            <li>Shared workspace and collaboration</li>
                            <li>Admin controls and audit logs</li>
                            <li>Dedicated onboarding support</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
