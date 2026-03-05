import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI for Dental Practices — Recover $14,000+/mo in Missed Calls | BioDynamX",
    description:
        "BioDynamX uses neuroscience-powered AI agents to answer every dental office call, book appointments 24/7, and follow up with patients in 8 seconds. Dental practices recover an average of $14,200/month. Powered by neuromarketing and the science of how patients decide.",
    keywords: [
        "AI for dental practices",
        "dental office AI",
        "dental AI receptionist",
        "missed dental calls",
        "dental practice automation",
        "dental appointment booking AI",
        "AI for dentists",
        "dental revenue recovery",
        "after hours dental answering",
        "dental patient follow up AI",
        "neuroscience dental marketing",
        "dental office phone answering",
        "BioDynamX dental",
    ],
    openGraph: {
        title: "AI for Dental Practices — Never Miss Another Patient Call | BioDynamX",
        description:
            "Neuroscience-powered AI answers every call, books appointments, and follows up with patients automatically. Average recovery: $14,200/month per practice.",
        url: "https://biodynamx.com/industries/dental",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BioDynamX AI for Dental Practices" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI for Dental Practices — $14,200/mo Average Recovery | BioDynamX",
        description: "Neuroscience-powered AI that answers every call, books every appointment, and recovers lost revenue for dental practices.",
        images: ["/og-image.png"],
    },
    alternates: { canonical: "https://biodynamx.com/industries/dental" },
};

export default function DentalLayout({ children }: { children: React.ReactNode }) {
    const dentalFaqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "How does AI help dental practices recover revenue?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX AI agents answer every call instantly, 24/7, including after-hours, weekends, and holidays. They book appointments directly into your calendar, send confirmation texts, and follow up with patients who don't book. Dental practices using BioDynamX recover an average of $14,200 per month in missed call revenue.",
                },
            },
            {
                "@type": "Question",
                name: "What is neuroscience-powered dental marketing?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX applies neurobiology and neuromarketing principles to dental patient communications. Our AI agents use the Triune Brain model to connect with patients on survival, emotional, and logical levels, increasing appointment booking rates by up to 47% compared to traditional answering services.",
                },
            },
            {
                "@type": "Question",
                name: "How many calls does the average dental practice miss per month?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "The average dental practice misses 40 or more calls per month, with most occurring after hours, during lunch breaks, and when staff is busy with patients. Each missed call represents a potential new patient worth $800 to $2,400 in first-year revenue. BioDynamX eliminates missed calls entirely with AI that answers in under one second.",
                },
            },
            {
                "@type": "Question",
                name: "How much does BioDynamX cost for dental practices?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX plans start at $497 per month, which typically pays for itself within the first week through recovered missed call revenue. Compare this to the cost of a full-time receptionist at $3,200 per month or an answering service at $1,500 per month. BioDynamX answers unlimited calls 24/7 for a fraction of the cost.",
                },
            },
            {
                "@type": "Question",
                name: "Can AI really replace a dental receptionist?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "BioDynamX AI doesn't replace your receptionist — it augments them. Your staff handles in-office patients while AI covers overflow calls, after-hours, weekends, and holidays. The AI handles scheduling, insurance verification questions, and new patient intake. Most practices see immediate ROI from capturing the 40+ calls their team was missing every month.",
                },
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(dentalFaqSchema) }}
            />
            {children}
        </>
    );
}
