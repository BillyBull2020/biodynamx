import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Pricing — Self-Service $497 or Done-For-You $1,497/mo | BioDynamX",
    description: "BioDynamX pricing: Self-Service SaaS at $497/mo or Done-For-You managed AI at $1,497/mo (introductory, then $2,497/mo). All 11 AI agents, 24/7 coverage, guaranteed 5x ROI. No hidden fees.",
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
            { "@type": "Offer", name: "Self-Service SaaS", price: "497", priceCurrency: "USD", availability: "https://schema.org/InStock", description: "Full AI platform access — you manage it" },
            { "@type": "Offer", name: "Done-For-You Managed AI", price: "1497", priceCurrency: "USD", availability: "https://schema.org/InStock", description: "Introductory 3-month rate, then $2,497/mo — we do everything" },
            { "@type": "Offer", name: "Enterprise OS", price: "4997", priceCurrency: "USD", availability: "https://schema.org/InStock", description: "Unlimited AI agents, custom training, dedicated infrastructure" },
        ],
    };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />{children}</>;
}
