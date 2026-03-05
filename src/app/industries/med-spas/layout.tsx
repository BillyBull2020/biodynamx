import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI for Med Spas — Increase Bookings 47% with Neuroscience | BioDynamX",
    description:
        "BioDynamX uses neuroscience-powered AI to answer every med spa call, book consultations 24/7, and follow up with leads automatically. Med spas using BioDynamX increase bookings by an average of 47%. Powered by neuromarketing and the science of how patients decide.",
    keywords: [
        "AI for med spas", "med spa AI", "med spa booking automation",
        "med spa appointment AI", "medical spa AI receptionist", "aesthetic clinic AI",
        "med spa lead follow up", "botox appointment AI", "medspa automation",
        "neuroscience med spa marketing", "med spa revenue growth",
        "BioDynamX med spa", "cosmetic practice AI", "med spa missed calls",
    ],
    openGraph: {
        title: "AI for Med Spas — 47% More Bookings with Neuroscience | BioDynamX",
        description: "Neuroscience-powered AI answers every call, books consultations, and follows up automatically. Average: 47% increase in bookings.",
        url: "https://biodynamx.com/industries/med-spas",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BioDynamX AI for Med Spas" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI for Med Spas — 47% Booking Increase | BioDynamX",
        description: "Neuroscience-powered AI that never lets a consultation request go unanswered.",
        images: ["/og-image.png"],
    },
    alternates: { canonical: "https://biodynamx.com/industries/med-spas" },
};

export default function MedSpaLayout({ children }: { children: React.ReactNode }) {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "How does AI help med spas increase bookings?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX AI agents answer every call and inquiry instantly, 24/7. They use neuroscience-based communication to help callers feel confident about booking consultations, handle common questions about treatments and pricing, and send automatic follow-up texts to leads who don't book immediately. Med spas using BioDynamX increase bookings by 47% on average.",
                },
            },
            {
                "@type": "Question",
                name: "What neuromarketing techniques does BioDynamX use for med spas?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX applies the Triune Brain model to med spa patient communication. Our AI activates the limbic brain through emotional language about confidence and self-image, addresses the reptilian brain with limited-time offers and scarcity signals, and satisfies the neocortex with treatment details and safety information. This multi-brain approach increases booking conversion by engaging patients at every level of decision-making.",
                },
            },
            {
                "@type": "Question",
                name: "How much does a med spa lose from missed calls?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "The average med spa treatment is worth $500 to $2,000. With 20 to 30 missed calls per month, that represents $10,000 to $60,000 in potential lost revenue. BioDynamX eliminates missed calls entirely, answering every inquiry in under 1 second and booking consultations automatically.",
                },
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            {children}
        </>
    );
}
