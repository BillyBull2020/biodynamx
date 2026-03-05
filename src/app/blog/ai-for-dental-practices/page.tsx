"use client";

import Link from "next/link";

export default function DentalAIArticle() {
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
                    <Link href="/industries/dental" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Dental AI</Link>
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
                        fontSize: 11, fontWeight: 700, color: "#3b82f6",
                        padding: "3px 10px", borderRadius: 100,
                        background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                    }}>Industry</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 12 }}>February 26, 2026 • 6 min read</span>
                </div>

                <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
                    How Dental Practices Use AI to Recover $14,000/Month in Missed Calls
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 40 }}>
                    By <Link href="/about" style={{ color: "#8b5cf6", textDecoration: "none" }}>Billy De La Taurus</Link>
                </p>

                <div style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.8)", fontSize: 17 }}>
                    {/* Loss Aversion Hook */}
                    <div style={{
                        padding: 24, borderRadius: 14, marginBottom: 32,
                        background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)",
                    }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#fff", lineHeight: 1.5 }}>
                            ⚠️ Your dental practice is <strong style={{ color: "#ef4444" }}>losing $14,200 every month</strong> in calls that go unanswered. That&apos;s $170,400 per year walking out the door.
                        </p>
                    </div>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>The $170,000 Problem Nobody Talks About</h2>
                    <p style={{ marginBottom: 20 }}>
                        Here&apos;s a number that should concern every dental practice owner: <strong style={{ color: "#fff" }}>the average dental practice misses 40-60 calls per month</strong>. During lunch breaks. After 5 PM. While the front desk handles a patient. During scheduling rushes.
                    </p>
                    <p style={{ marginBottom: 20 }}>
                        Each of those calls represents a potential new patient worth an average of <strong style={{ color: "#ffa726" }}>$2,400 in first-year revenue</strong> (initial exam, cleaning, X-rays, and at least one treatment plan). At 40 missed calls × $355 in average first-visit value, that&apos;s <strong style={{ color: "#ef4444" }}>$14,200/month evaporating</strong> before you even know it happened.
                    </p>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>Why Answering Services Don&apos;t Fix It</h2>
                    <p style={{ marginBottom: 20 }}>
                        Traditional answering services cost $800-$2,000/month and still miss 23% of calls. They can take messages, but they can&apos;t check your schedule, book appointments, or answer insurance questions. Callers know they&apos;re talking to a service — not your practice — and <strong style={{ color: "#fff" }}>62% hang up without leaving a message</strong>.
                    </p>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>How AI Changes the Math Entirely</h2>
                    <p style={{ marginBottom: 20 }}>
                        BioDynamX&apos;s AI receptionist <strong style={{ color: "#fff" }}>Aria</strong> answers every call in under 1 second. Not 3 rings. Not &ldquo;please hold.&rdquo; Under one second. Here&apos;s what she does:
                    </p>
                    <ul style={{ paddingLeft: 20, marginBottom: 28 }}>
                        <li style={{ marginBottom: 10 }}>Answers <strong style={{ color: "#fff" }}>24/7/365</strong> — nights, weekends, holidays, lunch breaks</li>
                        <li style={{ marginBottom: 10 }}>Schedules appointments directly into your calendar system</li>
                        <li style={{ marginBottom: 10 }}>Answers questions about services, insurance, and pricing</li>
                        <li style={{ marginBottom: 10 }}>Handles rescheduling and cancellations automatically</li>
                        <li style={{ marginBottom: 10 }}>Qualifies emergency vs. routine calls and routes accordingly</li>
                        <li style={{ marginBottom: 10 }}>Uses <strong style={{ color: "#8b5cf6" }}>neuroscience-backed conversation</strong> to increase booking rates by 47%</li>
                    </ul>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>The ROI Breakdown</h2>
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28,
                    }}>
                        {[
                            { label: "Monthly Investment", value: "$497", color: "#3b82f6" },
                            { label: "Revenue Recovered", value: "$14,200", color: "#22c55e" },
                            { label: "Net Monthly Return", value: "$13,703", color: "#ffa726" },
                            { label: "Annual ROI", value: "36x", color: "#8b5cf6" },
                        ].map((stat) => (
                            <div key={stat.label} style={{
                                padding: 20, borderRadius: 12, textAlign: "center",
                                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                            }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>FAQs</h2>
                    {[
                        { q: "How many calls does the average dental practice miss per month?", a: "40-60 calls, typically during lunch breaks, after hours, and when staff is busy with patients. Each represents $2,400 in first-year patient revenue." },
                        { q: "How does an AI receptionist work for dental offices?", a: "Aria answers every call within 1 second, 24/7/365. She schedules appointments, answers insurance questions, handles rescheduling, and qualifies patients — using neuroscience-backed techniques that boost booking rates 47%." },
                        { q: "What is the ROI of AI for dental practices?", a: "BioDynamX dental partners see 36x average ROI. At $497/month, the AI recovers $14,200+/month in previously missed calls." },
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
                        background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))",
                        border: "1px solid rgba(59,130,246,0.2)", textAlign: "center",
                    }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Stop Losing $14,200/Month</h3>
                        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 20, fontSize: 15 }}>
                            Get a free 20-point AI audit of your dental practice in 60 seconds.
                        </p>
                        <Link href="/audit" style={{
                            display: "inline-block", padding: "12px 28px", borderRadius: 10,
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            color: "#fff", textDecoration: "none", fontWeight: 700,
                        }}>Get Free Dental AI Audit</Link>
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
