import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "AI for Real Estate: How Top Teams Close 22 Extra Deals in 90 Days | BioDynamX",
    description: "Real estate teams using AI lead follow-up respond in 8 seconds instead of 8 hours. Learn how neuroscience-powered AI agents qualify leads, book showings, and close deals 24/7.",
    keywords: ["AI for real estate", "real estate AI lead follow up", "AI real estate agent", "real estate automation", "AI lead response real estate", "real estate ISA AI"],
    openGraph: { title: "AI for Real Estate — 22 Extra Deals in 90 Days", url: "https://biodynamx.com/blog/ai-for-real-estate", type: "article" },
    alternates: { canonical: "https://biodynamx.com/blog/ai-for-real-estate" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
    const schema = [
        { "@context": "https://schema.org", "@type": "Article", headline: "AI for Real Estate: How Top Teams Close 22 Extra Deals in 90 Days", author: { "@type": "Person", name: "Billy De La Taurus" }, publisher: { "@type": "Organization", name: "BioDynamX Engineering Group" }, datePublished: "2026-02-26" },
        {
            "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
                { "@type": "Question", name: "How does AI help real estate agents close more deals?", acceptedAnswer: { "@type": "Answer", text: "AI responds to every lead within 8 seconds (vs. the industry average of 8 hours), qualifies prospects using neuroscience-backed questioning, books showings automatically, and follows up persistently via text, email, and voice. BioDynamX real estate partners close an average of 22 extra deals in their first 90 days." } },
                { "@type": "Question", name: "What is the best AI for real estate lead follow up?", acceptedAnswer: { "@type": "Answer", text: "BioDynamX combines speed-to-lead (8-second response), neuroscience-trained AI agents, and multi-channel follow-up (voice, SMS, email). Unlike generic CRMs, BioDynamX uses the Neurobiology of Choice to qualify and convert leads using brain science, achieving 3x industry-average conversion rates." } },
            ]
        },
    ];
    return <>{schema.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}{children}</>;
}
