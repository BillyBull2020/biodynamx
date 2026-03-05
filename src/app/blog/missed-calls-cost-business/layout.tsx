import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "How Much Do Missed Calls Cost Your Business? The $170K Problem | BioDynamX",
    description: "The average small business misses 62% of incoming calls. Each missed call costs $355-$2,400 depending on your industry. Calculate your exact revenue leak and learn how AI eliminates it.",
    keywords: ["missed calls cost business", "how much do missed calls cost", "missed phone calls revenue loss", "business missed calls statistics", "call answer rate small business", "AI answering missed calls"],
    openGraph: { title: "How Much Do Missed Calls Cost Your Business?", url: "https://biodynamx.com/blog/missed-calls-cost-business", type: "article" },
    alternates: { canonical: "https://biodynamx.com/blog/missed-calls-cost-business" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
    const schema = [
        { "@context": "https://schema.org", "@type": "Article", headline: "How Much Do Missed Calls Cost Your Business?", author: { "@type": "Person", name: "Billy De La Taurus" }, publisher: { "@type": "Organization", name: "BioDynamX Engineering Group" }, datePublished: "2026-02-26" },
        {
            "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
                { "@type": "Question", name: "How much does a missed call cost a small business?", acceptedAnswer: { "@type": "Answer", text: "Each missed call costs a small business between $355-$2,400 depending on industry. Dental practices lose $2,400/missed call, real estate loses $1,800, HVAC loses $475, and general service businesses lose $355 on average. The typical small business misses 40-60 calls per month, losing $14,200-$144,000 annually." } },
                { "@type": "Question", name: "What percentage of callers leave a voicemail?", acceptedAnswer: { "@type": "Answer", text: "Only 20% of callers leave a voicemail. 80% of people who reach voicemail hang up and call a competitor instead. This means voicemail is not a safety net — it's a revenue leak. AI receptionists answer 100% of calls in under 1 second, eliminating this problem entirely." } },
                { "@type": "Question", name: "How can I stop missing business calls?", acceptedAnswer: { "@type": "Answer", text: "The most effective solution in 2026 is an AI receptionist like BioDynamX's Aria, which answers every call within 1 second, 24/7/365. Unlike answering services (which still miss 23% of calls), AI handles 100% of calls and can schedule appointments, answer questions, and qualify leads automatically." } },
            ]
        },
    ];
    return <>{schema.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}{children}</>;
}
