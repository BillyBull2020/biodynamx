import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "What Is Neuromarketing? The Brain Science Behind Converting Customers | BioDynamX",
    description:
        "Neuromarketing is the application of neuroscience to marketing — understanding how the brain makes buying decisions and using that knowledge to increase conversions. Learn how BioDynamX uses the Triune Brain model, loss aversion, anchoring, and neuro-sales frameworks to build AI that converts at 2-3x industry averages.",
    keywords: [
        "what is neuromarketing", "neuromarketing explained", "neuroscience marketing",
        "brain science marketing", "neuromarketing examples", "triune brain marketing",
        "loss aversion marketing", "anchoring effect sales", "neuro-sales",
        "neurobiology of choice", "BioDynamX neuromarketing", "AI neuromarketing",
        "subconscious buying decisions", "consumer neuroscience",
    ],
    openGraph: {
        title: "What Is Neuromarketing? The Brain Science Behind Converting Customers",
        description: "85% of buying decisions are subconscious. Learn how neuroscience, neuromarketing, and the Triune Brain model are used to build AI that sells.",
        url: "https://biodynamx.com/blog/what-is-neuromarketing",
        type: "article",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "What Is Neuromarketing — BioDynamX" }],
    },
    alternates: { canonical: "https://biodynamx.com/blog/what-is-neuromarketing" },
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "What Is Neuromarketing? The Brain Science Behind Converting Customers",
        author: { "@type": "Person", name: "Billy De La Taurus", url: "https://biodynamx.com/about" },
        publisher: { "@type": "Organization", name: "BioDynamX Engineering Group", url: "https://biodynamx.com" },
        datePublished: "2026-02-26",
        dateModified: "2026-02-26",
        description: "A comprehensive guide to neuromarketing — the science of how the brain makes buying decisions and how AI uses it to convert customers.",
        mainEntityOfPage: "https://biodynamx.com/blog/what-is-neuromarketing",
        image: "https://biodynamx.com/og-image.png",
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "What is neuromarketing?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Neuromarketing is the application of neuroscience, neurobiology, and behavioral psychology to marketing. It studies how the brain processes marketing stimuli and makes purchasing decisions. Research shows that 85% of buying decisions happen subconsciously, meaning traditional marketing that only appeals to logic misses the majority of decision-making. Neuromarketing uses techniques like loss aversion, anchoring, the Triune Brain model, and hippocampal activation to engage all three levels of the brain and increase conversion rates.",
                },
            },
            {
                "@type": "Question",
                name: "How does the Triune Brain model work in marketing?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "The Triune Brain model identifies three layers of the brain that influence decisions: the Reptilian Brain (survival instincts, fear, urgency), the Limbic Brain (emotions, memories, social proof), and the Neocortex (logic, data, ROI calculations). Effective neuromarketing addresses all three in sequence — first triggering the reptilian brain with urgency and loss aversion, then engaging the limbic brain with emotional stories and social proof, and finally satisfying the neocortex with data and logical justification. BioDynamX AI agents are trained to follow this exact sequence in every conversation.",
                },
            },
            {
                "@type": "Question",
                name: "What is the difference between neuromarketing and traditional marketing?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Traditional marketing appeals primarily to the neocortex — the logical brain — with features, specs, and rational arguments. Neuromarketing recognizes that 85% of decisions are subconscious and targets all three brain layers. Where traditional marketing says 'Our product has these features,' neuromarketing says 'You're losing $14,000 per month' (reptilian), 'Imagine never worrying about missed calls again' (limbic), then 'Here's the ROI data to confirm your decision' (neocortex). Neuromarketing consistently produces 2-3x higher conversion rates.",
                },
            },
            {
                "@type": "Question",
                name: "Can AI use neuromarketing?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. BioDynamX is the world's first AI platform built on neuromarketing principles. Every AI agent is trained on the Triune Brain model, SPIN selling, SONCAS framework, and Challenger Sale methodology. The AI applies loss aversion, anchoring effects, hippocampal activation through storytelling, and neurological pricing in every conversation. Because AI never has bad days, never forgets the framework, and delivers it consistently on every call, AI neuromarketing often outperforms human sales by 158% in close rates.",
                },
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            {children}
        </>
    );
}
