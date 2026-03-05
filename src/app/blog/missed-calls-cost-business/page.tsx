"use client";
import Link from "next/link";

export default function MissedCallsArticle() {
    return (
        <main style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <Link href="/" style={{ textDecoration: "none", color: "#fff", fontWeight: 800, fontSize: 18 }}>BioDynamX</Link>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Link href="/blog" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Blog</Link>
                    <Link href="/" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Try Jenny Free</Link>
                </div>
            </nav>
            <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
                <Link href="/blog" style={{ color: "#8b5cf6", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Back to Blog</Link>
                <div style={{ marginTop: 24, marginBottom: 32 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", padding: "3px 10px", borderRadius: 100, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>Revenue Leak</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 12 }}>February 26, 2026 • 5 min read</span>
                </div>
                <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>How Much Do Missed Calls Cost Your Business? The $170K Problem</h1>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 40 }}>By <Link href="/about" style={{ color: "#8b5cf6", textDecoration: "none" }}>Billy De La Taurus</Link></p>

                <div style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.8)", fontSize: 17 }}>
                    <div style={{ padding: 24, borderRadius: 14, marginBottom: 32, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#fff" }}>⚠️ Right now, your business is losing between <strong style={{ color: "#ef4444" }}>$14,200 and $170,400 per year</strong> in calls that never get answered.</p>
                    </div>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>The Numbers Don&apos;t Lie</h2>
                    <p style={{ marginBottom: 20 }}>Here&apos;s what research from Forrester, Harvard Business Review, and our own data across 4,000+ partners reveals:</p>
                    <ul style={{ paddingLeft: 20, marginBottom: 28 }}>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>62% of calls</strong> to small businesses go unanswered</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>80% of callers</strong> who reach voicemail hang up without leaving a message</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>85% of people</strong> whose calls aren&apos;t answered will NOT call back</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>75% of callers</strong> who can&apos;t reach you call a competitor within 60 seconds</li>
                    </ul>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>Cost Per Missed Call by Industry</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 28 }}>
                        {[
                            { industry: "Dental", cost: "$2,400", color: "#3b82f6" },
                            { industry: "Real Estate", cost: "$1,800", color: "#8b5cf6" },
                            { industry: "Med Spa", cost: "$950", color: "#ec4899" },
                            { industry: "HVAC / Plumbing", cost: "$475", color: "#ffa726" },
                            { industry: "Legal", cost: "$3,200", color: "#ef4444" },
                            { industry: "General Service", cost: "$355", color: "#22c55e" },
                        ].map((item) => (
                            <div key={item.industry} style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.cost}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{item.industry}</div>
                            </div>
                        ))}
                    </div>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>Why You&apos;re Missing Calls</h2>
                    <p style={{ marginBottom: 20 }}>It&apos;s not your staff&apos;s fault. The top reasons businesses miss calls:</p>
                    <ul style={{ paddingLeft: 20, marginBottom: 28 }}>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>After hours</strong> — 38% of calls come outside business hours</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Lunch breaks</strong> — 22% of daily call volume hits during lunch</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Staff busy</strong> — receptionists handle walk-ins, check-ins, and admin simultaneously</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Hold times</strong> — 60% of callers hang up after 60 seconds on hold</li>
                    </ul>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>The Solution: AI That Never Misses</h2>
                    <p style={{ marginBottom: 20 }}>BioDynamX&apos;s AI receptionist <strong style={{ color: "#fff" }}>Aria</strong> answers every call in under 1 second, 24/7/365. She eliminates 100% of missed calls by being available when your staff can&apos;t be — nights, weekends, lunch breaks, holidays. And unlike answering services, she uses <strong style={{ color: "#8b5cf6" }}>neuroscience-backed conversation</strong> to actually <em>book</em> the appointment, not just take a message.</p>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>FAQs</h2>
                    {[
                        { q: "How much does a missed call cost a small business?", a: "Between $355-$2,400 per missed call depending on your industry. Dental practices lose $2,400/call, legal firms lose $3,200/call, and general service businesses lose $355/call on average." },
                        { q: "What percentage of callers leave a voicemail?", a: "Only 20%. The other 80% hang up and call a competitor. Voicemail is not a safety net — it's a revenue leak." },
                        { q: "How can I stop missing business calls?", a: "AI receptionists like BioDynamX's Aria answer 100% of calls within 1 second, 24/7/365. They cost $497/month and recover $14,200+/month in missed call revenue." },
                    ].map((faq) => (
                        <div key={faq.q} style={{ padding: 20, marginBottom: 12, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{faq.q}</h3>
                            <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{faq.a}</p>
                        </div>
                    ))}

                    <div style={{ marginTop: 48, padding: 32, borderRadius: 16, background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(239,68,68,0.15)", textAlign: "center" }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Calculate Your Exact Revenue Leak</h3>
                        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 20, fontSize: 15 }}>Get a free 20-point AI audit and see exactly how much you&apos;re losing in missed calls.</p>
                        <Link href="/audit" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg, #ef4444, #8b5cf6)", color: "#fff", textDecoration: "none", fontWeight: 700 }}>Get Free Revenue Leak Audit</Link>
                    </div>
                </div>
            </article>
            <footer style={{ padding: "32px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>© {new Date().getFullYear()} BioDynamX Engineering Group</footer>
        </main>
    );
}
