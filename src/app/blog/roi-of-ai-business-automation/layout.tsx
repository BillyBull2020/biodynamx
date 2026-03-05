import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "The ROI of AI Business Automation: Real Numbers From 4,000+ Companies | BioDynamX",
    description: "BioDynamX partners see an average 36x ROI from AI business automation — $497/month investment recovering $17,892/month in lost revenue. See real numbers from dental, real estate, med spa, and call center clients.",
    keywords: ["ROI of AI", "AI business automation ROI", "AI return on investment", "is AI worth it for small business", "AI cost savings", "AI revenue recovery", "BioDynamX ROI"],
    openGraph: { title: "The ROI of AI — Real Numbers From 4,000+ Companies", url: "https://biodynamx.com/blog/roi-of-ai-business-automation", type: "article" },
    alternates: { canonical: "https://biodynamx.com/blog/roi-of-ai-business-automation" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
    const schema = { "@context": "https://schema.org", "@type": "Article", headline: "The ROI of AI Business Automation", author: { "@type": "Person", name: "Billy De La Taurus" }, datePublished: "2026-02-26" };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />{children}</>;
}
