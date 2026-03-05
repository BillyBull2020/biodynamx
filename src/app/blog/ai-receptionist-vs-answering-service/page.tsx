"use client";

import Link from "next/link";

export default function AIvsAnsweringService() {
    return (
        <main style={{
            minHeight: "100vh", background: "#050508", color: "#fff",
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            <nav style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                <Link href="/" style={{ textDecoration: "none", color: "#fff", fontWeight: 800, fontSize: 18 }}>BioDynamX</Link>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Link href="/blog" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Blog</Link>
                    <Link href="/" style={{
                        background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                        color: "#fff", padding: "8px 16px", borderRadius: 8,
                        textDecoration: "none", fontSize: 13, fontWeight: 600,
                    }}>Try Jenny Free</Link>
                </div>
            </nav>

            <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
                <Link href="/blog" style={{ color: "#8b5cf6", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Back to Blog</Link>

                <div style={{ marginTop: 24, marginBottom: 32 }}>
                    <span style={{
                        fontSize: 11, fontWeight: 700, color: "#ffa726",
                        padding: "3px 10px", borderRadius: 100,
                        background: "rgba(255,167,38,0.1)", border: "1px solid rgba(255,167,38,0.2)",
                    }}>Comparison</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 12 }}>February 26, 2026 • 7 min read</span>
                </div>

                <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
                    AI Receptionist vs Answering Service: The Complete 2026 Comparison
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 40 }}>
                    By <Link href="/about" style={{ color: "#8b5cf6", textDecoration: "none" }}>Billy De La Taurus</Link>
                </p>

                <div style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.8)", fontSize: 17 }}>
                    <p style={{ fontSize: 20, marginBottom: 28 }}>
                        Answering services were the best option... in 2015. In 2026, AI receptionists cost <strong style={{ color: "#22c55e" }}>67% less</strong>, answer <strong style={{ color: "#22c55e" }}>100% of calls</strong>, and convert <strong style={{ color: "#22c55e" }}>47% more prospects</strong>. Here&apos;s the full breakdown.
                    </p>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 20, color: "#fff" }}>The Head-to-Head Comparison</h2>

                    {/* Comparison Table */}
                    <div style={{ overflowX: "auto", marginBottom: 32 }}>
                        <table style={{
                            width: "100%", borderCollapse: "collapse", fontSize: 15,
                        }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                                    <th style={{ textAlign: "left", padding: "12px 16px", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13 }}>Feature</th>
                                    <th style={{ textAlign: "center", padding: "12px 16px", color: "#ef4444", fontWeight: 700, fontSize: 13 }}>Answering Service</th>
                                    <th style={{ textAlign: "center", padding: "12px 16px", color: "#22c55e", fontWeight: 700, fontSize: 13 }}>AI Receptionist</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Monthly Cost", "$800-$2,000+", "$497 flat"],
                                    ["Answer Speed", "3-5 rings (15-25 sec)", "Under 1 second"],
                                    ["Call Answer Rate", "77%", "100%"],
                                    ["Availability", "Business hours + limited after-hours", "24/7/365"],
                                    ["Can Schedule Appointments", "❌ Takes messages only", "✅ Direct booking"],
                                    ["Insurance Questions", "❌ Can't answer", "✅ Handles instantly"],
                                    ["Per-Minute Overages", "✅ $1.25-$2.50/min", "❌ Unlimited calls"],
                                    ["Booking Rate Increase", "~8%", "47%"],
                                    ["Setup Time", "3-5 business days", "Same day"],
                                    ["Neuroscience-Backed", "❌", "✅ Triune Brain model"],
                                    ["Languages", "English + limited Spanish", "English + Spanish + more"],
                                    ["Monthly ROI", "0.5-2x", "36x average"],
                                ].map((row, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#fff" }}>{row[0]}</td>
                                        <td style={{ padding: "12px 16px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>{row[1]}</td>
                                        <td style={{ padding: "12px 16px", textAlign: "center", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{row[2]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>Why the 23% Gap Matters</h2>
                    <p style={{ marginBottom: 20 }}>
                        Traditional answering services miss <strong style={{ color: "#ef4444" }}>23% of calls</strong> — during peak hours, hold time overflows, and agent unavailability. For a business receiving 200 calls/month, that&apos;s 46 missed calls. At $355 average customer value, you&apos;re losing <strong style={{ color: "#ef4444" }}>$16,330/month</strong> just in the gap between &ldquo;we answer calls&rdquo; and &ldquo;we answer <em>every</em> call.&rdquo;
                    </p>
                    <p style={{ marginBottom: 20 }}>
                        AI receptionists answer <strong style={{ color: "#22c55e" }}>100% of calls</strong>. Zero missed. Zero hold times. Zero &ldquo;all agents are busy.&rdquo; That 23% gap alone pays for the entire AI system 33 times over.
                    </p>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>The Secret Weapon: Neuroscience</h2>
                    <p style={{ marginBottom: 20 }}>
                        Here&apos;s what no other AI receptionist company does: <strong style={{ color: "#8b5cf6" }}>BioDynamX trains its AI on the Neurobiology of Choice</strong>. That means every call is handled using:
                    </p>
                    <ul style={{ paddingLeft: 20, marginBottom: 28 }}>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Loss aversion framing</strong> — &ldquo;I&apos;d hate for you to lose your preferred time slot&rdquo;</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Anchoring</strong> — &ldquo;Most patients choose our comprehensive exam — would you like to start there?&rdquo;</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Cognitive ease</strong> — Simple yes/no options instead of overwhelming choices</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Social proof</strong> — &ldquo;We had 12 patients book that service this week&rdquo;</li>
                    </ul>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>FAQs</h2>
                    {[
                        { q: "How much does an AI receptionist cost compared to an answering service?", a: "AI receptionists like BioDynamX's Aria cost $497/month flat with unlimited calls. Answering services cost $800-$2,000/month with per-minute overages. AI is 67% cheaper on average." },
                        { q: "Can an AI receptionist replace a human receptionist?", a: "For phone answering, yes. AI answers 100% of calls within 1 second, 24/7/365. It handles scheduling, FAQs, lead qualification, and urgent routing. It doesn't replace in-office tasks but eliminates the #1 revenue leak: missed calls." },
                        { q: "What is the best AI receptionist for small business in 2026?", a: "BioDynamX Aria — the only AI receptionist using neuroscience-backed conversation design. Answers under 1 second, handles scheduling and insurance, increases bookings 47%. $497/month with guaranteed 5x ROI." },
                    ].map((faq) => (
                        <div key={faq.q} style={{
                            padding: 20, marginBottom: 12, borderRadius: 12,
                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{faq.q}</h3>
                            <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{faq.a}</p>
                        </div>
                    ))}

                    <div style={{
                        marginTop: 48, padding: 32, borderRadius: 16,
                        background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))",
                        border: "1px solid rgba(139,92,246,0.2)", textAlign: "center",
                    }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Switch From Answering Service to AI</h3>
                        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 20, fontSize: 15 }}>
                            Talk to Jenny and see how much you&apos;re losing in missed calls right now. 60 seconds. Free.
                        </p>
                        <Link href="/" style={{
                            display: "inline-block", padding: "12px 28px", borderRadius: 10,
                            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                            color: "#fff", textDecoration: "none", fontWeight: 700,
                        }}>Talk to Jenny — Free</Link>
                    </div>
                </div>
            </article>

            <footer style={{
                padding: "32px 24px", textAlign: "center",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.3)", fontSize: 13,
            }}>© {new Date().getFullYear()} BioDynamX Engineering Group</footer>
        </main>
    );
}
