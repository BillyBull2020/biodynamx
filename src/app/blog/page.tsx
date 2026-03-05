"use client";

import Link from "next/link";

const ARTICLES = [
    {
        slug: "what-is-neuromarketing",
        title: "What Is Neuromarketing? The Brain Science Behind Converting Customers",
        excerpt: "85% of buying decisions happen subconsciously. Learn how BioDynamX uses neuroscience, neurobiology, and neuromarketing to engineer AI agents that close deals by speaking to the brain — not the person.",
        date: "February 26, 2026",
        readTime: "8 min read",
        category: "Neuroscience",
        color: "#8b5cf6",
    },
    {
        slug: "ai-for-dental-practices",
        title: "How Dental Practices Use AI to Recover $14,000/Month in Missed Calls",
        excerpt: "The average dental practice misses 40+ calls per month — each worth up to $2,400 in first-year revenue. Here's how neuroscience-powered AI eliminates that loss entirely.",
        date: "February 26, 2026",
        readTime: "6 min read",
        category: "Industry",
        color: "#3b82f6",
    },
    {
        slug: "ai-receptionist-vs-answering-service",
        title: "AI Receptionist vs Answering Service: The Complete 2026 Comparison",
        excerpt: "Answering services cost $1,500/mo and miss 23% of calls. AI receptionists cost $497/mo and miss 0%. Here's the full breakdown of cost, speed, and conversion rates.",
        date: "February 26, 2026",
        readTime: "7 min read",
        category: "Comparison",
        color: "#ffa726",
    },
    {
        slug: "missed-calls-cost-business",
        title: "How Much Do Missed Calls Cost Your Business? The $170K Problem",
        excerpt: "The average small business misses 62% of incoming calls. Each one costs $355-$2,400 depending on your industry. Calculate your exact revenue leak.",
        date: "February 26, 2026",
        readTime: "5 min read",
        category: "Revenue Leak",
        color: "#ef4444",
    },
    {
        slug: "neurobiology-of-choice",
        title: "What Is the Neurobiology of Choice? The Science Behind Every Purchase",
        excerpt: "The Neurobiology of Choice is BioDynamX's proprietary framework mapping how dopamine, cortisol, and oxytocin drive every buying decision.",
        date: "February 26, 2026",
        readTime: "10 min read",
        category: "Deep Science",
        color: "#8b5cf6",
    },
    {
        slug: "ai-for-real-estate",
        title: "AI for Real Estate: How Top Teams Close 22 Extra Deals in 90 Days",
        excerpt: "The average team takes 8 hours to respond to a lead. BioDynamX responds in 8 seconds. See the revenue difference.",
        date: "February 26, 2026",
        readTime: "6 min read",
        category: "Real Estate",
        color: "#8b5cf6",
    },
    {
        slug: "ai-for-med-spas",
        title: "AI for Med Spas: Increase Bookings 47% With Neuroscience-Powered Automation",
        excerpt: "72% of aesthetic inquiries happen outside business hours. AI captures every one and books 47% more appointments.",
        date: "February 26, 2026",
        readTime: "5 min read",
        category: "Med Spas",
        color: "#ec4899",
    },
    {
        slug: "how-ai-voice-agents-work",
        title: "How AI Voice Agents Work: The Technology Behind 24/7 Business Phone Calls",
        excerpt: "Speech recognition, language understanding, neuroscience decision engine, and neural text-to-speech — all in under 400 milliseconds.",
        date: "February 26, 2026",
        readTime: "7 min read",
        category: "Technology",
        color: "#3b82f6",
    },
    {
        slug: "roi-of-ai-business-automation",
        title: "The ROI of AI Business Automation: Real Numbers From 4,000+ Companies",
        excerpt: "Average 36x ROI. $497/month in, $17,892/month out. Real data from dental, real estate, med spa, and call center clients.",
        date: "February 26, 2026",
        readTime: "6 min read",
        category: "ROI Data",
        color: "#22c55e",
    },
];

export default function BlogIndex() {
    return (
        <main style={{
            minHeight: "100vh", background: "#050508", color: "#fff",
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            {/* Nav */}
            <nav style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                <Link href="/" style={{ textDecoration: "none", color: "#fff", fontWeight: 800, fontSize: 18 }}>BioDynamX</Link>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Link href="/about" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>About</Link>
                    <Link href="/audit" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Free Audit</Link>
                    <Link href="/" style={{
                        background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                        color: "#fff", padding: "8px 16px", borderRadius: 8,
                        textDecoration: "none", fontSize: 13, fontWeight: 600,
                    }}>Talk to Jenny</Link>
                </div>
            </nav>

            {/* Header */}
            <section style={{ textAlign: "center", padding: "60px 24px 40px" }}>
                <div style={{
                    fontSize: 11, fontWeight: 700, color: "#8b5cf6",
                    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
                }}>Blog</div>
                <h1 style={{
                    fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 12,
                }}>
                    Neuroscience, AI &amp; Business Growth
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 550, margin: "0 auto", fontSize: 16 }}>
                    Expert insights from the team engineering the future of AI-powered revenue.
                </p>
            </section>

            {/* Articles Grid */}
            <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
                <div style={{ display: "grid", gap: 24 }}>
                    {ARTICLES.map((article) => (
                        <Link
                            key={article.slug}
                            href={`/blog/${article.slug}`}
                            style={{
                                display: "block", textDecoration: "none", color: "#fff",
                                padding: 28, borderRadius: 16,
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = article.color;
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, color: article.color,
                                    padding: "3px 10px", borderRadius: 100,
                                    background: `${article.color}15`, border: `1px solid ${article.color}30`,
                                }}>{article.category}</span>
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{article.date}</span>
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>• {article.readTime}</span>
                            </div>
                            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
                                {article.title}
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.6 }}>
                                {article.excerpt}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <footer style={{
                padding: "32px 24px", textAlign: "center",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.3)", fontSize: 13,
            }}>
                © {new Date().getFullYear()} BioDynamX Engineering Group
            </footer>
        </main>
    );
}
