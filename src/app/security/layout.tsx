import type { Metadata } from "next";
export const metadata: Metadata = {
    title: "AI Voice Agent Security | BioDynamX — Google Cloud, HIPAA-Eligible, SOC 2",
    description: "BioDynamX AI agents run on Google Cloud (SOC 2 Type II, HIPAA-eligible). Your data never trains the AI, stays in your private database, and agents can't be jailbroken. See how we compare to open and DIY AI agents.",
    openGraph: {
        title: "Why BioDynamX Is More Secure Than Open AI Agents",
        description: "Google Cloud infrastructure. No data training. HIPAA-eligible. Server-side prompt locking. Your data in your database. Enterprise-grade AI voice agents for business.",
        url: "https://biodynamx.com/security",
        type: "website",
    },
    twitter: { card: "summary_large_image", title: "BioDynamX Security — Enterprise-Grade AI Voice Agents" },
    alternates: { canonical: "https://biodynamx.com/security" },
};
export default function SecurityLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
