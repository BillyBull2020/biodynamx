import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "How Dental Practices Use AI to Recover $14,000/Month in Missed Calls | BioDynamX",
    description:
        "The average dental practice misses 40+ calls per month, each worth up to $2,400 in first-year patient revenue. Learn how AI receptionists powered by neuroscience eliminate missed calls, boost bookings, and recover thousands in lost revenue every month.",
    keywords: [
        "AI for dental practices", "dental AI receptionist", "missed calls dental office",
        "dental practice revenue recovery", "AI answering dental calls", "dental office automation",
        "dental patient booking AI", "how much revenue do dental offices lose to missed calls",
        "AI phone answering for dentists", "dental practice growth",
    ],
    openGraph: {
        title: "How Dental Practices Use AI to Recover $14,000/Month",
        description: "Dental practices miss 40+ calls/month. AI receptionists recover every dollar.",
        url: "https://biodynamx.com/blog/ai-for-dental-practices",
        type: "article",
    },
    alternates: { canonical: "https://biodynamx.com/blog/ai-for-dental-practices" },
};

export default function DentalArticleLayout({ children }: { children: React.ReactNode }) {
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "How Dental Practices Use AI to Recover $14,000/Month in Missed Calls",
        author: { "@type": "Person", name: "Billy De La Taurus", url: "https://biodynamx.com/about" },
        publisher: { "@type": "Organization", name: "BioDynamX Engineering Group" },
        datePublished: "2026-02-26",
        mainEntityOfPage: "https://biodynamx.com/blog/ai-for-dental-practices",
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            { "@type": "Question", name: "How many calls does the average dental practice miss per month?", acceptedAnswer: { "@type": "Answer", text: "The average dental practice misses 40-60 calls per month, typically during lunch breaks, after hours, and when staff is busy with patients. Each missed call represents an average of $2,400 in first-year patient revenue, meaning practices lose between $96,000 and $144,000 per year in unreturned calls." } },
            { "@type": "Question", name: "How does an AI receptionist work for dental offices?", acceptedAnswer: { "@type": "Answer", text: "An AI receptionist like BioDynamX's Aria answers every incoming call within 1 second, 24 hours a day, 365 days a year. It can schedule appointments, answer questions about services and insurance, handle rescheduling, and qualify new patients — all using neuroscience-backed conversational techniques that increase booking rates by 47% compared to human receptionists." } },
            { "@type": "Question", name: "What is the ROI of AI for dental practices?", acceptedAnswer: { "@type": "Answer", text: "BioDynamX dental partners see an average 36x ROI. At $497/month, the AI recovers $14,200/month in previously missed calls — producing a net return of $13,703/month or $164,436/year. This doesn't include additional revenue from improved patient retention and automated follow-up sequences." } },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            {children}
        </>
    );
}
