const features = [
    {
        title: "Guided Business Discovery",
        description: "Step-by-step prompts capture your idea, market, operations, and growth assumptions with clarity.",
    },
    {
        title: "AI Strategy Generation",
        description: "Get a structured plan with positioning, GTM strategy, risks, KPIs, and execution priorities.",
    },
    {
        title: "Investor-Ready Blueprint PDF",
        description: "Export clean PDF blueprints you can share with co-founders, mentors, or stakeholders.",
    },
    {
        title: "Built-In Readiness Signals",
        description: "See practical scoring around problem clarity, audience fit, monetization, and execution readiness.",
    },
    {
        title: "Founder-Friendly Workflow",
        description: "From idea stage to early growth, the workflow is optimized for speed without losing depth.",
    },
    {
        title: "Plan-Based Usage Controls",
        description: "Starter, Pro, and Team limits help you scale blueprint generation based on your operating model.",
    },
];

const FeaturesSection = () => {
    return (
        <section id="features" className="px-6 md:px-16 py-24 scroll-mt-20 bg-gray-950">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center">What You Can Build With IdeaEngine</h2>
                <p className="mt-3 text-center text-gray-300">Everything you need to convert raw ideas into actionable strategy.</p>

                <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature) => (
                        <article key={feature.title} className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-gray-300">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
