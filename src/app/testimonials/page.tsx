"use client";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNavFooter";

const TESTIMONIALS = [
    {
        name: "Dr. Sarah Mitchell", role: "Owner, Bright Smiles Dental", industry: "Dental",
        color: "#3b82f6", metric: "$14,200/mo recovered", stars: 5,
        quote: "We were missing 45+ calls a month and didn't even know it. BioDynamX's AI receptionist Aria now answers every single call — nights, weekends, lunch breaks. In 60 days we recovered $14,200/month in patients we were losing to competitors. The ROI is insane.",
    },
    {
        name: "Marcus Johnson", role: "Team Lead, Apex Realty Group", industry: "Real Estate",
        color: "#8b5cf6", metric: "22 extra deals in 90 days", stars: 5,
        quote: "Our average lead response time was 6 hours. BioDynamX got it to 8 seconds. We closed 22 additional deals in our first quarter — that's $187,000 in commissions we would have lost to faster agents. Jenny doesn't sleep, doesn't take vacations, and never forgets to follow up.",
    },
    {
        name: "Dr. Lisa Chen", role: "Medical Director, Glow Aesthetics", industry: "Med Spa",
        color: "#ec4899", metric: "47% more bookings", stars: 5,
        quote: "72% of our inquiries come after hours — when we used to be closed. Now Aria books Botox appointments at 10 PM on Saturday. Our bookings are up 47% and we haven't added a single staff member. The neuroscience-backed upselling alone pays for the entire system.",
    },
    {
        name: "James Rodriguez", role: "CEO, CallPros Solutions", industry: "Call Center",
        color: "#ffa726", metric: "38x ROI", stars: 5,
        quote: "I was skeptical about AI replacing trained call center agents. Then BioDynamX showed me the data — their AI converts 47% more prospects than our best human reps. We deployed it across 3 campaigns and saw 38x ROI in month one. I'm converting our entire overflow to BioDynamX.",
    },
    {
        name: "Amanda Foster", role: "Founder, FosterTech SaaS", industry: "Startup",
        color: "#22c55e", metric: "24x ROI, 0 missed demos", stars: 5,
        quote: "As a founder, I was the receptionist, salesperson, and CEO all at once. Jenny now handles all inbound calls, qualifies leads, and books demo meetings directly into my calendar. I haven't missed a single lead since we started. Best $497 I spend every month.",
    },
    {
        name: "Robert Kim", role: "Managing Partner, Kim & Associates Law", industry: "Legal",
        color: "#ef4444", metric: "$24,600/mo recovered", stars: 5,
        quote: "Every missed call at a law firm is a potential $3,200 case. We were missing 30+ calls a month. BioDynamX's AI handles intake, qualifies case types, and routes emergencies to my cell. We recovered $24,600/month in the first 60 days. Non-negotiable investment.",
    },
];

export default function TestimonialsPage() {
    return (
        <main style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
            <SiteNav />

            <section style={{ textAlign: "center", padding: "60px 24px 20px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ffa726", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Client Success Stories</div>
                <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
                    $2.4M Recovered Across <span style={{ color: "#22c55e" }}>4,000+</span> Partners
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 550, margin: "0 auto", fontSize: 16 }}>
                    Real results from real businesses. Every number is tracked, verified, and guaranteed.
                </p>
            </section>

            {/* Stats Bar */}
            <section style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px 40px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                    { stat: "4,000+", label: "Active Partners", color: "#8b5cf6" },
                    { stat: "$2.4M", label: "Revenue Recovered", color: "#22c55e" },
                    { stat: "36x", label: "Average ROI", color: "#ffa726" },
                    { stat: "4.9★", label: "Average Rating", color: "#ef4444" },
                ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center", padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.stat}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </section>

            {/* Testimonials Grid */}
            <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
                {TESTIMONIALS.map((t) => (
                    <div key={t.name} style={{
                        padding: 28, borderRadius: 16,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderTop: `3px solid ${t.color}`,
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <span style={{
                                fontSize: 11, fontWeight: 700, color: t.color,
                                padding: "3px 10px", borderRadius: 100,
                                background: `${t.color}15`, border: `1px solid ${t.color}30`,
                            }}>{t.industry}</span>
                            <span style={{ color: "#ffa726", fontSize: 14 }}>{"★".repeat(t.stars)}</span>
                        </div>

                        <div style={{
                            padding: "12px 16px", borderRadius: 10, marginBottom: 16,
                            background: `${t.color}08`, border: `1px solid ${t.color}15`,
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: t.color }}>{t.metric}</div>
                        </div>

                        <p style={{
                            fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.7)",
                            marginBottom: 20, fontStyle: "italic",
                        }}>&ldquo;{t.quote}&rdquo;</p>

                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{t.name}</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{t.role}</div>
                        </div>
                    </div>
                ))}
            </section>

            {/* CTA */}
            <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 60px" }}>
                <div style={{
                    padding: 36, borderRadius: 20, textAlign: "center",
                    background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))",
                    border: "1px solid rgba(139,92,246,0.15)",
                }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Ready to See Your Numbers?</h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 20 }}>
                        Talk to Jenny for 60 seconds and get a free audit of exactly how much revenue you&apos;re losing in missed calls.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href="/" style={{
                            display: "inline-block", padding: "14px 28px", borderRadius: 12,
                            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                            color: "#fff", textDecoration: "none", fontWeight: 700,
                        }}>Talk to Jenny — Free</Link>
                        <Link href="/pricing" style={{
                            display: "inline-block", padding: "14px 28px", borderRadius: 12,
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "#fff", textDecoration: "none", fontWeight: 700,
                        }}>See Pricing</Link>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </main>
    );
}
