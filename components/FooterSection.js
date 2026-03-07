import Link from "next/link";

const FooterSection = () => {
    return (
        <footer className="px-6 md:px-16 py-14 bg-black text-gray-300">
            <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold text-white">IdeaEngine</h3>
                    <p className="mt-3 max-w-md text-sm leading-6">
                        AI-powered blueprint generation for founders and teams that need clear strategy and faster execution.
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Product</h4>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li><Link href="/generateblueprint" className="hover:text-white">Generate Blueprint</Link></li>
                        <li><Link href="/#pricing" className="hover:text-white">Pricing</Link></li>
                        <li><Link href="/#features" className="hover:text-white">Features</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Company</h4>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li><Link href="/#about" className="hover:text-white">About</Link></li>
                        <li><Link href="/#contact" className="hover:text-white">Contact</Link></li>
                        <li><Link href="/#faq" className="hover:text-white">FAQ</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-800 text-xs text-gray-400">
                <p>© {new Date().getFullYear()} IdeaEngine. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default FooterSection;
