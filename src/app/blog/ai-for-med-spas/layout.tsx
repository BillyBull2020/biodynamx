import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "AI for Med Spas: Increase Bookings 47% With Neuroscience-Powered Automation | BioDynamX",
    description: "Med spas using AI booking automation see 47% more appointments, 24/7 availability, and zero missed calls. Learn how BioDynamX's neuroscience-powered AI handles scheduling, consultations, and follow-up.",
    keywords: ["AI for med spas", "med spa AI", "med spa booking automation", "med spa receptionist AI", "aesthetic clinic automation", "med spa marketing AI"],
    openGraph: { title: "AI for Med Spas — 47% More Bookings", url: "https://biodynamx.com/blog/ai-for-med-spas", type: "article" },
    alternates: { canonical: "https://biodynamx.com/blog/ai-for-med-spas" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
    const schema = { "@context": "https://schema.org", "@type": "Article", headline: "AI for Med Spas: Increase Bookings 47%", author: { "@type": "Person", name: "Billy De La Taurus" }, datePublished: "2026-02-26" };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />{children}</>;
}
