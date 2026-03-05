import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About BioDynamX — The Science of Selling, Built Into AI | Founded by Billy De La Taurus",
    description:
        "BioDynamX Engineering Group is the world's first AI platform built on the Neurobiology of Choice. Founded by 2x Amazon best-selling author Billy De La Taurus, we use neuroscience, neuromarketing, and behavioral science to engineer AI agents that close deals, recover revenue, and grow businesses. Meet the team and the science behind the results.",
    keywords: [
        "about BioDynamX", "Billy De La Taurus", "neurobiology of choice",
        "AI company", "neuroscience AI", "neuromarketing company",
        "AI business automation founder", "BioDynamX team", "BioDynamX story",
        "Amazon best selling author AI", "AI revenue recovery company",
        "persuasive design engineering", "cognitive automation expert",
    ],
    openGraph: {
        title: "About BioDynamX — Neuroscience Meets AI | Billy De La Taurus",
        description: "Meet the founder, the team, and the neuroscience framework behind BioDynamX — the world's first AI platform built on the Neurobiology of Choice.",
        url: "https://biodynamx.com/about",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "About BioDynamX Engineering Group" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "About BioDynamX — The Neuroscience Behind the AI",
        description: "Founded by 2x Amazon best-seller Billy De La Taurus. We don't just automate — we engineer buying behavior with brain science.",
        images: ["/og-image.png"],
    },
    alternates: { canonical: "https://biodynamx.com/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    const aboutSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": "https://biodynamx.com/about",
        name: "About BioDynamX Engineering Group",
        description: "BioDynamX is the world's first AI platform built on the Neurobiology of Choice — a neuroscience framework that engineers how customers make buying decisions.",
        mainEntity: {
            "@type": "Organization",
            "@id": "https://biodynamx.com/#organization",
            name: "BioDynamX Engineering Group",
            founder: {
                "@type": "Person",
                "@id": "https://biodynamx.com/#founder",
                name: "Billy De La Taurus",
                jobTitle: "Founder & CEO",
                description: "2x Amazon best-selling author, recognized expert in AI automation and the Neurobiology of Choice",
            },
            foundingDate: "2024",
            numberOfEmployees: { "@type": "QuantitativeValue", value: "12" },
            knowsAbout: [
                "Neuroscience", "Neurobiology", "Neuromarketing", "Neuro-Sales",
                "AI Business Automation", "Voice AI", "Revenue Recovery",
                "Generative Engine Optimization", "Answer Engine Optimization",
                "Persuasive Design Engineering", "Cognitive Automation",
            ],
        },
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
            {children}
        </>
    );
}
