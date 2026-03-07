const AboutSection = () => {
    return (
        <section id="about" className="px-6 md:px-16 py-24 scroll-mt-20 bg-white">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">About IdeaEngine</h2>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                    IdeaEngine helps entrepreneurs move from concept to execution with structured AI workflows.
                </p>
                <p className="mt-3 text-gray-600 max-w-3xl mx-auto">
                    The platform combines guided business discovery, strategy generation, and export-ready documentation so
                    you can align teams and execute faster.
                </p>

                <div className="mt-10 grid sm:grid-cols-3 gap-5 text-left">
                    <article className="rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900">Mission</h3>
                        <p className="mt-2 text-sm text-gray-600">Make strategic planning accessible to every founder and builder.</p>
                    </article>
                    <article className="rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900">Vision</h3>
                        <p className="mt-2 text-sm text-gray-600">Become the default engine for idea-to-blueprint execution worldwide.</p>
                    </article>
                    <article className="rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900">Approach</h3>
                        <p className="mt-2 text-sm text-gray-600">Blend structured prompts, AI intelligence, and practical output formats.</p>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
