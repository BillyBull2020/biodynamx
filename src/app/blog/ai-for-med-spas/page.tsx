"use client";
import Link from "next/link";
export default function MedSpaAIArticle() {
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
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#ec4899", padding: "3px 10px", borderRadius: 100, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)" }}>Med Spas</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 12 }}>February 26, 2026 • 5 min read</span>
                </div>
                <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>AI for Med Spas: Increase Bookings 47% With Neuroscience-Powered Automation</h1>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 40 }}>By <Link href="/about" style={{ color: "#8b5cf6", textDecoration: "none" }}>Billy De La Taurus</Link></p>
                <div style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.8)", fontSize: 17 }}>
                    <div style={{ padding: 24, borderRadius: 14, marginBottom: 32, background: "rgba(236,72,153,0.05)", border: "1px solid rgba(236,72,153,0.15)" }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#fff" }}>💆 Med spas lose <strong style={{ color: "#ef4444" }}>$8,400/month</strong> in calls that come in after hours, during treatments, and on weekends — peak booking times.</p>
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>The Med Spa Booking Problem</h2>
                    <p style={{ marginBottom: 20 }}>Med spas have a unique challenge: <strong style={{ color: "#fff" }}>72% of aesthetic service inquiries happen outside business hours</strong>. Prospective clients research Botox, fillers, and body contouring at night, on weekends, and during lunch breaks. When they call and nobody answers, they move to the next spa on Google.</p>
                    <p style={{ marginBottom: 20 }}>The average med spa treatment is worth <strong style={{ color: "#ffa726" }}>$950</strong>, and clients who book one treatment typically return for <strong style={{ color: "#ffa726" }}>3.2 additional treatments</strong> over the next year. That makes each missed call a potential <strong style={{ color: "#ef4444" }}>$3,990 lifetime value</strong> walking out the door.</p>
                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>How AI Transforms Med Spa Bookings</h2>
                    <ul style={{ paddingLeft: 20, marginBottom: 28 }}>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>24/7 booking</strong> — Aria answers at 10 PM on Saturday when clients are browsing Instagram and decide they want Botox</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Treatment consultation</strong> — answers questions about procedures, pricing, downtime, and what to expect</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Smart upselling</strong> — uses neuroscience-based suggestions: &ldquo;Most clients who get Botox also love our vitamin drip — should I add that to your appointment?&rdquo;</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Cancellation recovery</strong> — automatically contacts clients who cancel and offers alternative times</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Follow-up sequences</strong> — reminds clients when it&apos;s time for their next treatment</li>
                    </ul>
                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>The Results</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
                        {[
                            { stat: "47%", label: "More Bookings", color: "#22c55e" },
                            { stat: "0", label: "Missed Calls", color: "#3b82f6" },
                            { stat: "$497", label: "Monthly Cost", color: "#8b5cf6" },
                            { stat: "28x", label: "Average ROI", color: "#ffa726" },
                        ].map((item) => (
                            <div key={item.label} style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: item.color }}>{item.stat}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 48, padding: 32, borderRadius: 16, background: "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(236,72,153,0.15)", textAlign: "center" }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Stop Losing Bookings After Hours</h3>
                        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 20, fontSize: 15 }}>Get a free audit and see exactly how many bookings you&apos;re losing.</p>
                        <Link href="/audit" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg, #ec4899, #8b5cf6)", color: "#fff", textDecoration: "none", fontWeight: 700 }}>Get Free Med Spa Audit</Link>
                    </div>
                </div>
            </article>
            <footer style={{ padding: "32px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>© {new Date().getFullYear()} BioDynamX Engineering Group</footer>
        </main>
    );
}
