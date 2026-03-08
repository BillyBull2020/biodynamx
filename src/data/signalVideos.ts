// ─── SIGNAL VIDEO DATA — server + client safe ───────────────────────────────
// Replace each youtubeId with your real YouTube video ID when ready.
// Example: "dQw4w9WgXcQ" → "yourRealVideoId"

export interface SignalVideo {
    id: string;
    youtubeId: string;
    title: string;
    subtitle: string;
    category: string;
    categoryColor: string;
    duration: string;
    description: string;
}

export const SIGNAL_VIDEOS: SignalVideo[] = [
    {
        id: "v1",
        youtubeId: "dQw4w9WgXcQ",         // ← replace with your YouTube ID
        title: "What Is Voice AI & Why It Changes Everything",
        subtitle: "The complete beginner's guide to autonomous AI agents",
        category: "Voice AI",
        categoryColor: "#00ff41",
        duration: "12:34",
        description:
            "Discover how Voice AI answers your business phone 24/7, qualifies leads in seconds, and transforms how customers experience your brand — all without you lifting a finger.",
    },
    {
        id: "v2",
        youtubeId: "dQw4w9WgXcQ",         // ← replace
        title: "Speed to Lead: The 60-Second Rule That Closes More Deals",
        subtitle: "Neuroscience of response time & conversion",
        category: "Neuroscience",
        categoryColor: "#a78bfa",
        duration: "8:17",
        description:
            "The first business to respond wins 78% of the time. Learn the neurobiological window of opportunity and how BioDynamX AI closes it automatically.",
    },
    {
        id: "v3",
        youtubeId: "dQw4w9WgXcQ",         // ← replace
        title: "GEO vs SEO: How AI Search Changes Your Visibility",
        subtitle: "Get ChatGPT & Gemini to recommend your business",
        category: "AI Search",
        categoryColor: "#60a5fa",
        duration: "15:02",
        description:
            "Traditional SEO is not enough. Generative Engine Optimization (GEO) means training AI systems to cite your business by name. Here's the exact playbook.",
    },
    {
        id: "v4",
        youtubeId: "dQw4w9WgXcQ",         // ← replace
        title: "The 3-Brain Framework: Sell to the Subconscious",
        subtitle: "85% of buying decisions happen before logic kicks in",
        category: "Neuroscience",
        categoryColor: "#a78bfa",
        duration: "11:45",
        description:
            "Your customers have a reptilian brain, a limbic brain, and a neocortex. BioDynamX agents are trained to speak to all three — in the right order, every time.",
    },
    {
        id: "v5",
        youtubeId: "dQw4w9WgXcQ",         // ← replace
        title: "Google Business Profile Optimization with AI",
        subtitle: "Dominate local search in 2026",
        category: "Local SEO",
        categoryColor: "#fbbf24",
        duration: "9:58",
        description:
            "46% of all Google searches have local intent. Watch how BioDynamX AI fully manages your GMB profile, automates reviews, and pushes you to position #1.",
    },
    {
        id: "v6",
        youtubeId: "dQw4w9WgXcQ",         // ← replace
        title: "Building an Autonomous Revenue Machine",
        subtitle: "How BioDynamX replaces your entire marketing stack",
        category: "Platform",
        categoryColor: "#f97316",
        duration: "18:21",
        description:
            "One platform. Voice AI, video, email automation, social AI, review engine, GEO, and revenue intelligence — all connected and running 24/7 on autopilot.",
    },
];

export const SIGNAL_CATEGORIES = ["All", "Voice AI", "Neuroscience", "AI Search", "Local SEO", "Platform"];
