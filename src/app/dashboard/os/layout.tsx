import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "BioDynamX OS — Your Business Operating System",
    description:
        "The AI-powered operating system for your business. Your agents know your business, follow your processes, remember everything, and grow with you. Autonomous and agentic — they work even when you don't.",
    robots: {
        index: false,
        follow: true,
    },
};

export default function OSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
