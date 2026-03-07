import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Pricing — Elite AI Workforce Starting at $1,250/Month | BioDynamX",
    description: "BioDynamX Elite AI workforce at $2,500/month — 50% off for the first 90 days ($1,250/mo). Unlimited calls, 24/7 coverage, and a guaranteed 5x ROI. No hidden fees, no contracts.",
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
            { "@type": "Offer", name: "Trial / Rescue (90-Day)", price: "1250", priceCurrency: "USD", availability: "https://schema.org/InStock", description: "50% off Elite Access for first 90 days — Full Elite 11 workforce" },
            { "@type": "Offer", name: "Elite 11", price: "2500", priceCurrency: "USD", availability: "https://schema.org/InStock", description: "Full autonomous neuro-workforce, done-for-you managed AI" },
            { "@type": "Offer", name: "Enterprise", price: "4997", priceCurrency: "USD", availability: "https://schema.org/InStock", description: "Unlimited AI agents, custom training, dedicated success manager" },
        ],
    };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />{children}</>;
}
