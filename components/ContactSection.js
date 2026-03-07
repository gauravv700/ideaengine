const ContactSection = () => {
    return (
        <section id="contact" className="px-6 md:px-16 p-16 scroll-mt-20 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">Contact</h2>
                <p className="mt-3 text-center text-gray-600">Need help with onboarding, plans, or partnership discussions? Reach out.</p>
                <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 md:p-8">
                    <p className="text-gray-700"><span className="font-semibold">Email:</span> support@ideaengine.app</p>
                    <p className="mt-3 text-gray-700"><span className="font-semibold">Business:</span> partnerships@ideaengine.app</p>
                    <p className="mt-3 text-gray-700"><span className="font-semibold">Availability:</span> Monday to Friday, 9:00 AM to 6:00 PM (IST)</p>
                    <p className="mt-3 text-gray-700"><span className="font-semibold">Response SLA:</span> Within 24 hours for all paid plans</p>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
