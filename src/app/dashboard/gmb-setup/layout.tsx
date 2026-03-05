import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Google My Business Setup Wizard — Get Found on Google Maps | BioDynamX",
    description:
        "Set up your Google Business Profile the right way the first time. This free 12-step wizard walks you through name optimization, category selection, photos, reviews strategy, and everything needed to rank #1 in local search and Google Maps.",
    keywords: [
        "Google My Business setup", "Google Business Profile optimization", "GMB setup guide",
        "how to set up Google My Business", "Google Maps ranking", "local SEO guide",
        "Google Business Profile checklist", "GMB optimization checklist",
    ],
    openGraph: {
        title: "Google My Business Setup Wizard | BioDynamX",
        description: "12-step guided setup to get your Google Business Profile ranking in 30 days.",
        url: "https://biodynamx.com/dashboard/gmb-setup",
    },
    alternates: { canonical: "https://biodynamx.com/dashboard/gmb-setup" },
};

export default function GMBLayout({ children }: { children: React.ReactNode }) {
    return children;
}
