const steps = [
    "Choose your business stage and core objective.",
    "Answer focused questions about product, audience, investment, and operations.",
    "Generate a structured strategy blueprint using AI.",
    "Download and share your blueprint PDF for execution.",
];

const ProcessSection = () => {
    return (
        <section id="process" className="px-6 md:px-16 py-24 scroll-mt-20 bg-white">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">How It Works</h2>
                <p className="mt-3 text-center text-gray-600">A simple workflow designed for founders who need speed and structure.</p>

                <div className="mt-12 grid gap-4">
                    {steps.map((step, index) => (
                        <div key={step} className="rounded-xl border border-gray-200 bg-gray-50 p-5 flex items-start gap-4">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                                {index + 1}
                            </span>
                            <p className="text-gray-700">{step}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProcessSection;
