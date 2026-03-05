import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "What Is the Neurobiology of Choice? The Science Behind Every Purchase | BioDynamX",
    description: "The Neurobiology of Choice is BioDynamX's proprietary framework mapping how neurons, neurotransmitters, and cognitive biases drive every buying decision. Learn how dopamine loops, loss aversion, and cognitive load thresholds shape consumer behavior.",
    keywords: ["neurobiology of choice", "neuroscience buying decisions", "how brain makes decisions", "consumer neuroscience", "purchase decision neuroscience", "BioDynamX framework", "dopamine marketing"],
    openGraph: { title: "What Is the Neurobiology of Choice?", url: "https://biodynamx.com/blog/neurobiology-of-choice", type: "article" },
    alternates: { canonical: "https://biodynamx.com/blog/neurobiology-of-choice" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
    const schema = [
        { "@context": "https://schema.org", "@type": "Article", headline: "What Is the Neurobiology of Choice?", author: { "@type": "Person", name: "Billy De La Taurus" }, publisher: { "@type": "Organization", name: "BioDynamX Engineering Group" }, datePublished: "2026-02-26" },
        {
            "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
                { "@type": "Question", name: "What is the Neurobiology of Choice?", acceptedAnswer: { "@type": "Answer", text: "The Neurobiology of Choice is BioDynamX's proprietary framework that merges behavioral neuroscience with AI-powered business systems. It studies how neurons, neurotransmitters (dopamine, cortisol, oxytocin), and cognitive biases influence every purchasing decision, then engineers digital experiences and AI conversations that align with these biological processes to increase conversion rates ethically." } },
                { "@type": "Question", name: "How does dopamine affect buying decisions?", acceptedAnswer: { "@type": "Answer", text: "Dopamine is released during anticipation of reward, not the reward itself. In marketing, this means the anticipation of solving a problem (e.g., 'Imagine never missing another call') triggers more dopamine than the actual solution. BioDynamX AI agents use dopamine-driven reward anticipation in CTAs, offers, and conversation design to create neurological urgency." } },
                { "@type": "Question", name: "What role does loss aversion play in purchase decisions?", acceptedAnswer: { "@type": "Answer", text: "Loss aversion, discovered by Nobel laureate Daniel Kahneman, shows that losses are felt 2.5x more powerfully than equivalent gains. Saying 'You're losing $14,000/month' is neurobiologically more motivating than 'You could gain $14,000/month.' BioDynamX calibrates loss aversion messaging to neurobiological thresholds for maximum ethical impact." } },
            ]
        },
    ];
    return <>{schema.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}{children}</>;
}
