"use client";

import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNavFooter";

const ARTICLES = [
    // June 2026 (newest first)
    {
        slug: "the-restaurants-owners-guide-to-recovering-11000-month-with-ai-automation",
        title: "The Restaurants Owner's Guide to Recovering $11,000+/Month with AI Automation",
        excerpt: "Your answering service is costing you more than it saves. Learn how BioDynamX's Neuromarketing Conversion System recovers $11,000+/month for restaurants through AI automation.",
        date: "June 29, 2026",
        readTime: "10 min read",
        category: "Neuromarketing",
        color: "#8b5cf6",
    },
    {
        slug: "the-real-estate-owners-guide-to-recovering-11000-month-with-ai-automation",
        title: "The Real Estate Owner's Guide to Recovering $11,000+/Month with AI Automation",
        excerpt: "The businesses buying the most AI tools are usually the ones getting the least value from them. Learn how BioDynamX's Neuromarketing Conversion System recovers lost revenue for real estate.",
        date: "June 27, 2026",
        readTime: "12 min read",
        category: "Neuromarketing",
        color: "#8b5cf6",
    },
    {
        slug: "how-real-estate-businesses-dominate-ai-search-results",
        title: "How Real Estate Businesses Dominate AI Search Results",
        excerpt: "When potential clients ask AI for the best real estate agent near them, does your business show up? Learn the GEO/AEO strategies that put real estate businesses on top of AI search results.",
        date: "June 24, 2026",
        readTime: "6 min read",
        category: "GEO/AEO",
        color: "#8b5cf6",
    },
    {
        slug: "ai-voice-agent-vs-answering-service-for-roofing-contractors-the-2026-comparison",
        title: "AI Voice Agent vs Answering Service for Roofing Contractors: The 2026 Comparison",
        excerpt: "Roofing contractors lose $14,000+ per year to missed calls. Compare AI voice agents vs traditional answering services on cost, speed, and conversion rates.",
        date: "June 23, 2026",
        readTime: "7 min read",
        category: "Comparison",
        color: "#ffa726",
    },
    {
        slug: "how-financial-advisors-businesses-dominate-ai-search-results",
        title: "How Financial Advisors Dominate AI Search Results in 2026",
        excerpt: "When potential clients ask AI for the best financial advisor near them, does your firm show up? Learn the GEO/AEO strategies that put financial advisors on top.",
        date: "June 23, 2026",
        readTime: "6 min read",
        category: "GEO/AEO",
        color: "#8b5cf6",
    },
    {
        slug: "the-neurobiology-of-choice-why-manufacturing-customers-buy-and-how-to-influence-",
        title: "The Neurobiology of Choice: Why Manufacturing Customers Buy (And How to Influence Them)",
        excerpt: "Manufacturing buyers are driven by the same neurochemical pathways as retail consumers. Learn how dopamine, cortisol, and oxytocin drive B2B purchasing decisions.",
        date: "June 23, 2026",
        readTime: "10 min read",
        category: "Neuroscience",
        color: "#8b5cf6",
    },
    {
        slug: "the-psychology-of-auto-dealerships-sales-what-neuroscience-tells-us-about-buying",
        title: "The Psychology of Auto Dealership Sales: What Neuroscience Tells Us About Buying Decisions",
        excerpt: "85% of car buying decisions happen before the customer ever walks onto the lot. Learn how neuroscience and AI are transforming auto dealership sales in 2026.",
        date: "June 20, 2026",
        readTime: "7 min read",
        category: "Neuromarketing",
        color: "#ec4899",
    },
    {
        slug: "how-to-make-your-veterinarians-business-the-ais-#1-recommended-answer",
        title: "How to Make Your Veterinary Business the AI's #1 Recommended Answer",
        excerpt: "When pet owners ask AI for the best vet near them, does your practice show up? Learn the GEO/AEO strategies that put veterinary businesses on top.",
        date: "June 19, 2026",
        readTime: "6 min read",
        category: "GEO/AEO",
        color: "#8b5cf6",
    },
    {
        slug: "ai-trends-in-restaurants-whats-changing-in-2026",
        title: "AI Trends in Restaurants: What's Changing in 2026",
        excerpt: "From AI-powered ordering to automated kitchen management, restaurants are being transformed by artificial intelligence. Here's what you need to know.",
        date: "June 18, 2026",
        readTime: "8 min read",
        category: "Industry AI",
        color: "#3b82f6",
    },
    {
        slug: "how-ai-voice-agents-work",
        title: "How AI Voice Agents Work: The Technology Behind 24/7 Business Phone Calls",
        excerpt: "Speech recognition, language understanding, neuroscience decision engine, and neural text-to-speech — all in under 400 milliseconds.",
        date: "June 17, 2026",
        readTime: "7 min read",
        category: "Technology",
        color: "#3b82f6",
    },
    // February 2026 (original posts)
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
            <SiteNav />

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

            <SiteFooter />
        </main>
    );
}
