import Link from "next/link";

const HomeSection = () => {
    return (
        <section id="home" className="min-h-screen flex items-center justify-center px-6 md:px-16 pt-24 scroll-mt-24 bg-linear-to-b from-indigo-100 via-indigo-50 to-white">
            <div className="max-w-5xl text-center">
                <span className="inline-flex items-center rounded-full border border-indigo-200 bg-white/80 px-4 py-1 text-sm font-medium text-indigo-700">
                    Welcome to IdeaEngine
                </span>

                <h1 className="mt-6 text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                    Turn Your Business Idea Into
                    <span className="text-indigo-600"> A Clear Execution Blueprint</span>
                </h1>

                <p className="mt-5 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                    IdeaEngine is an AI-powered platform that helps founders and teams validate ideas, define strategy,
                    and generate actionable business blueprints in minutes.
                </p>

                <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/generateblueprint" className="inline-block rounded-full bg-indigo-600 text-white px-7 py-3 font-semibold hover:bg-indigo-700">
                        Start Building Blueprint
                    </Link>
                    <Link href="/#pricing" className="inline-block rounded-full border border-gray-300 bg-white text-gray-800 px-7 py-3 font-semibold hover:bg-gray-50">
                        View Pricing
                    </Link>
                </div>

                <p className="mt-5 text-sm text-gray-500">
                    Built for startups, creators, and teams who want to move from idea to action.
                </p>
            </div>
        </section>
    );
};

export default HomeSection;
