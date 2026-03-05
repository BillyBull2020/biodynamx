import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "BioDynamX Blog — Neuroscience, AI, and Business Growth",
    description:
        "Expert insights on neuroscience-powered AI, neuromarketing, revenue recovery, and business automation from the team at BioDynamX Engineering Group. Learn how the Neurobiology of Choice is transforming how businesses grow.",
    keywords: [
        "AI blog", "neuromarketing blog", "business automation articles",
        "neuroscience marketing", "AI for business", "revenue recovery tips",
        "BioDynamX blog", "AI receptionist guide", "neuro-sales articles",
    ],
    openGraph: {
        title: "BioDynamX Blog — Brain Science Meets Business AI",
        description: "Expert insights on neuroscience, neuromarketing, and AI automation for business growth.",
        url: "https://biodynamx.com/blog",
    },
    alternates: { canonical: "https://biodynamx.com/blog" },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": "https://biodynamx.com/blog",
        name: "BioDynamX Blog",
        description: "Expert insights on neuroscience-powered AI and business automation",
        publisher: {
            "@type": "Organization",
            "@id": "https://biodynamx.com/#organization",
            name: "BioDynamX Engineering Group",
        },
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
            {children}
        </>
    );
}
