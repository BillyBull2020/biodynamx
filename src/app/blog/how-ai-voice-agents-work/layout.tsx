import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "How AI Voice Agents Work: The Technology Behind 24/7 Business Phone Calls | BioDynamX",
    description: "AI voice agents use natural language processing, neural text-to-speech, and real-time decision engines to answer business calls in under 1 second. Learn the technology stack, how they integrate with your systems, and why they outperform human receptionists.",
    keywords: ["how AI voice agents work", "AI voice agent technology", "AI phone agent", "voice AI for business", "conversational AI business", "AI call answering technology"],
    openGraph: { title: "How AI Voice Agents Work", url: "https://biodynamx.com/blog/how-ai-voice-agents-work", type: "article" },
    alternates: { canonical: "https://biodynamx.com/blog/how-ai-voice-agents-work" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
    const schema = { "@context": "https://schema.org", "@type": "Article", headline: "How AI Voice Agents Work", author: { "@type": "Person", name: "Billy De La Taurus" }, datePublished: "2026-02-26" };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />{children}</>;
}
