import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Revenue Dashboard — Real-Time Performance Tracking | BioDynamX",
    description:
        "Monitor your AI agent performance, track revenue recovery, view conversation transcripts, and measure ROI in real-time. The BioDynamX dashboard gives you full visibility into Jenny, Mark, Aria, and Sarah's activity. Built by BioDynamX Engineering Group, founded by Billy De La Taurus.",
    keywords: [
        "AI revenue dashboard",
        "BioDynamX dashboard",
        "AI agent performance tracking",
        "revenue recovery dashboard",
        "AI ROI tracker",
        "voice agent analytics",
        "lead conversion dashboard",
        "BioDynamX Engineering Group",
    ],
    openGraph: {
        title: "AI Revenue Dashboard — BioDynamX",
        description: "Track AI agent performance, revenue recovery, and ROI in real-time. Full visibility into your BioDynamX AI team.",
        url: "https://biodynamx.com/dashboard",
    },
    alternates: {
        canonical: "https://biodynamx.com/dashboard",
    },
    robots: {
        index: false, // Dashboard is behind auth
        follow: true,
    },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
