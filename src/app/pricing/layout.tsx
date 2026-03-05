import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Pricing — AI Voice Agents Starting at $497/Month | BioDynamX",
    description: "BioDynamX AI voice agents start at $497/month with unlimited calls, 24/7 coverage, and a guaranteed 5x ROI. See our transparent pricing — no hidden fees, no per-minute charges, no long-term contracts.",
    keywords: ["AI receptionist pricing", "AI voice agent cost", "BioDynamX pricing", "AI answering service price", "AI phone agent cost", "virtual receptionist pricing"],
    openGraph: { title: "BioDynamX Pricing — AI That Pays for Itself", url: "https://biodynamx.com/pricing", type: "website" },
    alternates: { canonical: "https://biodynamx.com/pricing" },
};
export default function PricingLayout({ children }: { children: React.ReactNode }) {
    const schema = {
        "@context": "https://schema.org", "@type": "Product", name: "BioDynamX AI Voice Agent",
        description: "Neuroscience-powered AI receptionist that answers 100% of calls, books appointments, and increases conversions 47%.",
        brand: { "@type": "Brand", name: "BioDynamX" },
        offers: [
            { "@type": "Offer", name: "Starter", price: "497", priceCurrency: "USD", availability: "https://schema.org/InStock", description: "1 AI agent, unlimited calls, 24/7 coverage" },
            { "@type": "Offer", name: "Growth", price: "997", priceCurrency: "USD", availability: "https://schema.org/InStock", description: "3 AI agents, advanced analytics, priority support" },
            { "@type": "Offer", name: "Enterprise", price: "2497", priceCurrency: "USD", availability: "https://schema.org/InStock", description: "Unlimited AI agents, custom training, dedicated success manager" },
        ],
    };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />{children}</>;
}
