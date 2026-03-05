import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI for Startups — Launch and Scale Faster with Neuroscience | BioDynamX",
    description:
        "BioDynamX gives startups a complete AI team from day one — customer support, lead qualification, appointment booking, and sales follow-up, all powered by neuroscience and neuromarketing. Launch in 24 hours, scale without hiring.",
    keywords: [
        "AI for startups", "startup AI tools", "startup automation",
        "AI customer support startup", "startup launch AI", "startup sales AI",
        "affordable AI for businesses", "AI business builder", "startup lead generation AI",
        "neuroscience startup growth", "startup scaling AI", "BioDynamX startup",
        "launch business with AI", "AI team for startups", "startup revenue AI",
    ],
    openGraph: {
        title: "AI for Startups — An Entire AI Team from Day One | BioDynamX",
        description: "Neuroscience-powered AI agents handle support, sales, and scheduling so you can focus on building. Launch in 24 hours.",
        url: "https://biodynamx.com/industries/startups",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BioDynamX AI for Startups" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI for Startups — Launch Faster with Brain Science | BioDynamX",
        description: "Skip the hiring. Deploy neuroscience-powered AI agents for support, sales, and scheduling in 24 hours.",
        images: ["/og-image.png"],
    },
    alternates: { canonical: "https://biodynamx.com/industries/startups" },
};

export default function StartupsLayout({ children }: { children: React.ReactNode }) {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "How can AI help a startup grow faster?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX gives startups a complete AI workforce from day one. Instead of hiring a receptionist, sales rep, and customer support team, you deploy AI agents that handle all three simultaneously. They answer calls, qualify leads using neuroscience-based frameworks, book appointments, and follow up automatically. This lets founders focus on product and strategy while AI handles growth.",
                },
            },
            {
                "@type": "Question",
                name: "How much does BioDynamX save compared to hiring staff?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "A basic support team of one receptionist, one sales rep, and one customer service agent costs approximately $9,600 per month in salaries alone. BioDynamX provides AI equivalents of all three starting at $497 per month with 24/7 availability, instant response times, and neuroscience-optimized conversations that convert at higher rates than human staff.",
                },
            },
            {
                "@type": "Question",
                name: "What makes BioDynamX different from other AI tools for startups?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX is the only platform that applies neuroscience, neurobiology, and neuromarketing to AI business automation. While other tools simply automate tasks, BioDynamX engineers buying behavior using the Triune Brain model, loss aversion, anchoring effects, and proven sales frameworks like SPIN and the Challenger Sale. This means higher conversion rates and faster growth.",
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
