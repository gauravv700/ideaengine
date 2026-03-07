const faqItems = [
    {
        question: "Who is IdeaEngine for?",
        answer: "Founders, students, operators, and teams who want to turn business ideas into practical execution plans.",
    },
    {
        question: "Do I need a complete business plan before using it?",
        answer: "No. You can start with just an idea and use the guided prompts to shape strategy, revenue model, and roadmap.",
    },
    {
        question: "What do I get after answering the questions?",
        answer: "You receive a structured business blueprint and can download it as a PDF for collaboration and implementation.",
    },
    {
        question: "Can teams use IdeaEngine together?",
        answer: "Yes. Team plans support higher usage and collaborative workflows for multiple ideas and stakeholders.",
    },
];

const FAQSection = () => {
    return (
        <section id="faq" className="px-6 md:px-16 py-24 scroll-mt-20 bg-gray-950">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center">Frequently Asked Questions</h2>
                <p className="mt-3 text-center text-gray-300">Quick answers about the platform and workflow.</p>

                <div className="mt-10 space-y-4">
                    {faqItems.map((item) => (
                        <article key={item.question} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                            <h3 className="text-base md:text-lg font-semibold text-white">{item.question}</h3>
                            <p className="mt-2 text-sm md:text-base text-gray-300 leading-6">{item.answer}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
