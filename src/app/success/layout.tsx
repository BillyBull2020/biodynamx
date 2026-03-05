import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Deployment Success — Your AI Growth Engine Is Live | BioDynamX",
    description:
        "Congratulations! Your BioDynamX AI Growth Engine has been deployed. Jenny, Mark, Aria, and Sarah are now working 24/7 to recover your revenue. Powered by the Neurobiology of Choice and Google Gemini.",
    openGraph: {
        title: "Deployment Success — Your AI Team Is Live | BioDynamX",
        description: "Your BioDynamX AI agents are now deployed and recovering revenue 24/7.",
        url: "https://biodynamx.com/success",
    },
    alternates: {
        canonical: "https://biodynamx.com/success",
    },
    robots: {
        index: false, // Don't index the post-purchase page
        follow: true,
    },
};

export default function SuccessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
