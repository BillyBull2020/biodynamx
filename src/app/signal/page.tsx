import type { Metadata } from "next";
import SignalDeckCarousel, { SIGNAL_VIDEOS } from "@/components/SignalDeckCarousel";
import { SiteNav, SiteFooter } from "@/components/SiteNavFooter";

// ── SEO ─────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
    title: "The Signal — AI Intelligence Library | BioDynamX",
    description:
        "Watch expert-level AI education on Voice AI, neuroscience, GEO/AEO search optimization, and the future of autonomous business growth. Powered by BioDynamX Engineering Group.",
    keywords: [
        "Voice AI education", "AI business automation", "neuroscience marketing",
        "GEO optimization", "generative engine optimization", "AI agents explained",
        "BioDynamX academy", "AI revenue growth", "autonomous AI agents",
    ],
    openGraph: {
        title: "The Signal — BioDynamX AI Intelligence Library",
        description:
            "Deep-dive video education on Voice AI, neuro-sales, GEO/AEO, and autonomous business growth.",
        type: "website",
        url: "https://biodynamx.com/signal",
        siteName: "BioDynamX",
    },
    twitter: {
        card: "summary_large_image",
        title: "The Signal — BioDynamX AI Intelligence Library",
        description: "Expert AI education: voice agents, neuroscience, GEO, and autonomous business.",
    },
    alternates: { canonical: "https://biodynamx.com/signal" },
};

// ── VideoObject JSON-LD Schema ───────────────────────────────────────────────
function VideoSchemaScript() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "The Signal — BioDynamX AI Intelligence Library",
        description:
            "Video education series covering Voice AI, neuroscience-powered marketing, GEO, and autonomous business growth.",
        itemListElement: SIGNAL_VIDEOS.map((v, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
                "@type": "VideoObject",
                name: v.title,
                description: v.description,
                thumbnailUrl: `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`,
                embedUrl: `https://www.youtube.com/embed/${v.youtubeId}`,
                uploadDate: "2026-03-08",
                publisher: {
                    "@type": "Organization",
                    name: "BioDynamX Engineering Group",
                    url: "https://biodynamx.com",
                },
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ── PAGE ─────────────────────────────────────────────────────────────────────
export default function SignalPage() {
    return (
        <>
            <VideoSchemaScript />
            <SiteNav />
            <main
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(180deg, #050508 0%, #08080f 100%)",
                    color: "#fff",
                    fontFamily: "var(--font-geist-sans, -apple-system, sans-serif)",
                    overflowX: "hidden",
                }}
            >
                <SignalDeckCarousel />
            </main>
            <SiteFooter />
        </>
    );
}
