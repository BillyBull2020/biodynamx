import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI for Call Centers — Cut Cost-Per-Call by 85% | BioDynamX",
    description:
        "BioDynamX replaces expensive call center operations with neuroscience-powered AI agents that handle unlimited calls for $0.25 each. Reduce cost-per-call from $6 to $0.25 while increasing close rates by 158%. Powered by neuromarketing and behavioral science.",
    keywords: [
        "AI call center", "call center AI", "AI for call centers",
        "call center automation", "reduce call center costs", "AI phone answering",
        "call center cost reduction", "IVR replacement AI", "automated call handling",
        "neuroscience call center", "AI inbound calls", "call center close rate",
        "BioDynamX call center", "cost per call reduction", "call center ROI",
    ],
    openGraph: {
        title: "AI for Call Centers — 85% Cost Reduction, 158% Higher Close Rate | BioDynamX",
        description: "Neuroscience-powered AI handles unlimited calls at $0.25 each. Close rates jump from 12% to 31%.",
        url: "https://biodynamx.com/industries/call-centers",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BioDynamX AI for Call Centers" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI for Call Centers — $0.25/Call vs $6/Call | BioDynamX",
        description: "Neuroscience-powered AI that handles unlimited inbound calls, qualifies leads, and closes at 2.5x the rate of human agents.",
        images: ["/og-image.png"],
    },
    alternates: { canonical: "https://biodynamx.com/industries/call-centers" },
};

export default function CallCentersLayout({ children }: { children: React.ReactNode }) {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "How does AI reduce call center costs?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX AI agents handle unlimited inbound calls for a flat monthly fee, reducing cost-per-call from a typical $6 with human agents down to $0.25 per call. The AI answers in under 1 second, never takes breaks, and handles call spikes without staffing increases. Most call centers see an 85% cost reduction within the first month.",
                },
            },
            {
                "@type": "Question",
                name: "Can AI really outperform human call center agents?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX AI agents use neuroscience-based conversation frameworks including SPIN selling, loss aversion, and the Triune Brain model to engage callers at a deeper level than scripted human agents. Results show close rates increase from 12% to 31% on average because the AI never has bad days, never forgets the script, and uses proven neuromarketing techniques on every single call.",
                },
            },
            {
                "@type": "Question",
                name: "How fast can AI be deployed in a call center?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX AI agents can be deployed in an existing call center within 24 hours. Setup includes training the AI on your products, services, and FAQs, configuring call routing, and connecting to your CRM. No hardware installation is needed and the AI scales instantly to handle any call volume.",
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
