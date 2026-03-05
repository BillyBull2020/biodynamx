import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI for Real Estate Teams — Close 22+ Extra Deals in 90 Days | BioDynamX",
    description:
        "BioDynamX uses neuroscience-powered AI to respond to every real estate lead in 8 seconds, qualify prospects automatically, and book showings 24/7. Real estate teams using BioDynamX close an average of 22 extra deals per quarter. Powered by neuromarketing and behavioral science.",
    keywords: [
        "AI for real estate", "real estate AI", "real estate lead follow up AI",
        "real estate automation", "AI for realtors", "real estate lead management",
        "real estate AI receptionist", "property showing AI", "real estate CRM AI",
        "neuroscience real estate sales", "AI lead response real estate",
        "BioDynamX real estate", "real estate missed leads", "instant lead response",
    ],
    openGraph: {
        title: "AI for Real Estate — Never Lose Another Lead | BioDynamX",
        description: "Neuroscience-powered AI responds to leads in 8 seconds, qualifies, and books showings. Average: 22 extra deals in 90 days.",
        url: "https://biodynamx.com/industries/real-estate",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BioDynamX AI for Real Estate" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI for Real Estate — 22 Extra Deals in 90 Days | BioDynamX",
        description: "Neuroscience-powered AI that responds to every lead in 8 seconds and books showings automatically.",
        images: ["/og-image.png"],
    },
    alternates: { canonical: "https://biodynamx.com/industries/real-estate" },
};

export default function RealEstateLayout({ children }: { children: React.ReactNode }) {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "How does AI help real estate teams close more deals?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX AI agents respond to every lead in 8 seconds via text and voice, 24/7. They qualify prospects using neuroscience-based questioning, schedule showings automatically, and nurture leads that aren't ready to buy yet. Real estate teams using BioDynamX close an average of 22 extra deals per quarter because they never lose a lead to slow response times.",
                },
            },
            {
                "@type": "Question",
                name: "What is the average response time for real estate leads?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "The industry average real estate lead response time is 14 hours. The leaders respond in under 5 minutes. BioDynamX AI responds in 8 seconds — making you 6,300 times faster than the average agent. Studies show 78% of buyers go with whoever responds first.",
                },
            },
            {
                "@type": "Question",
                name: "How much revenue do real estate teams lose from slow lead response?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "The average real estate team loses $22,000 per month in dead leads that went cold due to slow response. BioDynamX eliminates this by responding instantly, qualifying leads using neuromarketing principles, and booking showings automatically.",
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
