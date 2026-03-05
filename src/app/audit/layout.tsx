import type { Metadata } from "next";

export const metadata: Metadata = {
    title:
        "Free AI Business Audit — SEO, AEO & GEO Diagnostic | BioDynamX",
    description:
        "Run a free 16-point AI-powered business audit. Our Google Gemini engine scans your SEO, AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), CTA effectiveness, Google Business profile, missed calls, and revenue leaks — results in 60 seconds. No login required.",
    keywords: [
        "free business audit",
        "AI business audit",
        "free SEO audit",
        "free website audit",
        "AI website analysis",
        "SEO audit tool",
        "AEO audit",
        "GEO audit",
        "revenue leak audit",
        "Google Gemini audit",
        "business diagnostic tool",
        "free AI audit tool",
        "BioDynamX audit",
        "call center audit",
        "small business audit",
    ],
    openGraph: {
        title: "Free AI Business Audit — 16 Probes, 60 Seconds | BioDynamX",
        description:
            "Enter your URL. Our AI runs 16 diagnostic probes covering SEO, AEO, GEO, CTA, revenue leaks, and more — powered by Google Gemini 2.5. Free. No login required.",
        url: "https://biodynamx.com/audit",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "BioDynamX Free AI Business Audit Tool",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Free AI Business Audit — BioDynamX",
        description:
            "16 diagnostic probes. 60 seconds. Powered by Google Gemini. Find your revenue leaks before your competitors do.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://biodynamx.com/audit",
    },
};

export default function AuditLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Audit-specific structured data
    const auditToolSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "@id": "https://biodynamx.com/audit#tool",
        name: "BioDynamX Free AI Business Audit",
        url: "https://biodynamx.com/audit",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "SEO & Business Diagnostic Tool",
        operatingSystem: "Web Browser",
        description:
            "Free AI-powered 16-point business audit tool. Scans SEO, AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), CTA effectiveness, Google Business profile, missed call analysis, and revenue leak detection. Powered by Google Gemini 2.5.",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            description: "Completely free, no login required",
            availability: "https://schema.org/InStock",
        },
        featureList: [
            "SEO Analysis",
            "AEO (Answer Engine Optimization) Audit",
            "GEO (Generative Engine Optimization) Audit",
            "CTA Effectiveness Scan",
            "Google Business Profile Check",
            "Missed Call Analysis",
            "Revenue Leak Detection",
            "Competitor Intelligence",
            "Mobile UX Analysis",
            "Site Speed Analysis",
            "AI Readiness Assessment",
            "Structured Data Validation",
            "Content Quality Analysis",
            "Lead Response Time Audit",
            "Tech Debt Detection",
            "ROI Projection Calculator",
        ],
        creator: {
            "@type": "Organization",
            name: "BioDynamX Engineering Group",
            url: "https://biodynamx.com",
        },
        screenshot: "https://biodynamx.com/og-image.png",
        softwareVersion: "2.0",
        isAccessibleForFree: true,
    };

    const auditBreadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://biodynamx.com",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Free AI Business Audit",
                item: "https://biodynamx.com/audit",
            },
        ],
    };

    const auditFaqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "What does the BioDynamX free business audit check?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "The BioDynamX free business audit runs 16 diagnostic probes on your website: SEO analysis, AEO (Answer Engine Optimization) readiness, GEO (Generative Engine Optimization) score, CTA effectiveness, Google Business profile, missed call patterns, revenue leak detection, competitor intelligence, mobile UX, site speed, AI readiness, structured data validation, content quality, lead response time, tech debt, and ROI projections.",
                },
            },
            {
                "@type": "Question",
                name: "How much does the BioDynamX business audit cost?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "The BioDynamX business audit is completely free. No login, no credit card, no signup required. Just enter your business URL and get results in 60 seconds, powered by Google Gemini 2.5 AI.",
                },
            },
            {
                "@type": "Question",
                name: "What is AEO and GEO in the business audit?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "AEO (Answer Engine Optimization) measures how well your business appears in voice search results from Google Assistant, Alexa, and Siri. GEO (Generative Engine Optimization) measures how well AI models like ChatGPT, Gemini, and Perplexity understand and cite your business. Both are critical for future-proofing your digital presence.",
                },
            },
        ],
    };

    const schemas = [auditToolSchema, auditBreadcrumb, auditFaqSchema];

    return (
        <>
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
            {children}
        </>
    );
}
