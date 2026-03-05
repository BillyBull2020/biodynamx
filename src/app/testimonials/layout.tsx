import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "Client Success Stories — Real Results From Real Businesses | BioDynamX",
    description: "See how 4,000+ businesses recovered $2.4M in lost revenue with BioDynamX AI. Real testimonials from dental practices, real estate teams, med spas, and call centers.",
    keywords: ["BioDynamX reviews", "BioDynamX testimonials", "AI receptionist results", "AI voice agent case studies"],
    openGraph: { title: "BioDynamX Client Success Stories", url: "https://biodynamx.com/testimonials", type: "website" },
    alternates: { canonical: "https://biodynamx.com/testimonials" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
