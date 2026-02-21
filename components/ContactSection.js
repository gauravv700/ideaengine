const ContactSection = () => {
    return (
        <section id="contact" className="min-h-screen px-6 md:px-16 py-24 scroll-mt-24 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">Contact</h2>
                <p className="mt-3 text-center text-gray-600">Reach out and we will get back to you quickly.</p>
                <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 md:p-8">
                    <p className="text-gray-700"><span className="font-semibold">Email:</span> support@ideaengine.app</p>
                    <p className="mt-3 text-gray-700"><span className="font-semibold">Phone:</span> +1 (555) 123-4567</p>
                    <p className="mt-3 text-gray-700"><span className="font-semibold">Address:</span> San Francisco, CA</p>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
