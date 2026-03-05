import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Client Portal — Sign In to Your Revenue Dashboard | BioDynamX",
    description:
        "Sign in to your BioDynamX client portal. Access your AI revenue dashboard, monitor agent performance, view conversation transcripts, and track ROI — all in real-time. Powered by BioDynamX Engineering Group.",
    keywords: [
        "BioDynamX login",
        "BioDynamX portal",
        "BioDynamX client dashboard",
        "AI revenue dashboard login",
        "BioDynamX sign in",
    ],
    openGraph: {
        title: "Client Portal — BioDynamX Dashboard Login",
        description: "Access your BioDynamX AI revenue dashboard. Monitor agent performance and track ROI in real-time.",
        url: "https://biodynamx.com/portal/login",
    },
    alternates: {
        canonical: "https://biodynamx.com/portal/login",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
