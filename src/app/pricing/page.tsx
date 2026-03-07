"use client";
import Link from "next/link";
import { useState } from "react";

const PLANS = [
    {
        name: "Trial / Rescue", price: 1250, period: "/mo", color: "#22c55e", popular: false,
        tagline: "First 90 Days — 50% Off Elite Access",
        features: [
            "Full Elite 11 Workforce (11 Agents)",
            "Free Business Audit & List Reactivation",
            "Free Google My Business (GMB) Optimization",
            "Unlimited Inbound Call Reception",
            "AI Visibility (SEO, GEO, & AEO)",
            "Automatic Social Media Posting",
            "Triple-Lock 5X ROI Guarantee",
            "Setup in 24-48 hours",
            "50% OFF for first 90 days ($2,500 value)",
        ],
        cta: "Start 90-Day Trial", ctaLink: "/",
    },
    {
        name: "Elite 11", price: 2500, period: "/mo", color: "#3b82f6", popular: true,
        tagline: "Full Autonomous Neuro-Workforce — Done-For-You",
        features: [
            "The Complete Elite 11 AI Team",
            "Everything in Trial, plus:",
            "SPIN-Native Outbound Lead Hunting",
            "Custom Persona Training",
            "Military-Grade Data Security",
            "Multi-Channel: Voice + SMS + Email",
            "Advanced ROI Intelligence Dashboard",
            "Priority Elite Support",
            "Quarterly Strategy Audits",
            "We do everything — you don't lift a finger",
        ],
        cta: "Deploy Elite 11", ctaLink: "/",
    },
    {
        name: "Enterprise OS", price: 4997, period: "/mo", color: "#ffa726", popular: false,
        tagline: "Custom AI Infrastructure for Scale",
        features: [
            "Unlimited Agents + Custom Logic",
            "Everything in Elite 11, plus:",
            "Whitelabel / Brand Secrecy Mode",
            "Dedicated Infrastructure on Vertex AI",
            "Deep CRM / ERP Integrations",
            "Multi-Location Central Command",
            "Custom Neuro-Script Development",
            "Direct Strategy Sessions with Billy",
            "SLA: 99.999% Neural Uptime",
        ],
        cta: "Request Demo", ctaLink: "/",
    },
];

export default function PricingPage() {
    const [annual, setAnnual] = useState(false);

    return (
        <main style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <Link href="/" style={{ textDecoration: "none", color: "#fff", fontWeight: 800, fontSize: 18 }}>BioDynamX</Link>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Link href="/blog" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Blog</Link>
                    <Link href="/about" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>About</Link>
                    <Link href="/" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Talk to Jenny</Link>
                </div>
            </nav>

            <section style={{ textAlign: "center", padding: "60px 24px 32px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Transparent Pricing</div>
                <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
                    AI That Pays for Itself in <span style={{ color: "#22c55e" }}>Week 1</span>
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 550, margin: "0 auto", fontSize: 16, marginBottom: 24 }}>
                    No hidden fees. No per-minute charges. No long-term contracts. <strong style={{ color: "#ffa726" }}>Guaranteed 5x ROI or you don&apos;t pay.</strong>
                </p>

                {/* Annual Toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: !annual ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: 600 }}>Monthly</span>
                    <button onClick={() => setAnnual(!annual)} style={{
                        width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                        background: annual ? "#22c55e" : "rgba(255,255,255,0.15)", position: "relative", transition: "background 0.3s",
                    }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: 10, background: "#fff", position: "absolute", top: 3,
                            left: annual ? 25 : 3, transition: "left 0.3s",
                        }} />
                    </button>
                    <span style={{ fontSize: 14, color: annual ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: 600 }}>Annual</span>
                    {annual && <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(34,197,94,0.1)" }}>Save 20%</span>}
                </div>
            </section>

            {/* Pricing Cards */}
            <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>
                {PLANS.map((plan) => {
                    const price = annual ? Math.round(plan.price * 0.8) : plan.price;
                    return (
                        <div key={plan.name} style={{
                            padding: 28, borderRadius: 20,
                            background: plan.popular ? `linear-gradient(180deg, ${plan.color}08, ${plan.color}03)` : "rgba(255,255,255,0.03)",
                            border: plan.popular ? `2px solid ${plan.color}40` : "1px solid rgba(255,255,255,0.06)",
                            position: "relative",
                        }}>
                            {plan.popular && (
                                <div style={{
                                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                                    background: `linear-gradient(135deg, ${plan.color}, #3b82f6)`, color: "#fff",
                                    padding: "4px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                                }}>Most Popular</div>
                            )}
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: plan.color, marginBottom: 4 }}>{plan.name}</h3>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>{plan.tagline}</p>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                                <span style={{ fontSize: 48, fontWeight: 800 }}>${price}</span>
                                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>{plan.period}</span>
                            </div>
                            <Link href={plan.ctaLink} style={{
                                display: "block", textAlign: "center", padding: "14px 0", borderRadius: 12,
                                background: plan.popular ? `linear-gradient(135deg, ${plan.color}, #3b82f6)` : "rgba(255,255,255,0.06)",
                                border: plan.popular ? "none" : `1px solid ${plan.color}30`,
                                color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15,
                                marginBottom: 24,
                            }}>{plan.cta}</Link>
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                                {plan.features.map((feat, i) => (
                                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                        <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>
                                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Guarantee */}
            <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 40px" }}>
                <div style={{
                    padding: 32, borderRadius: 20, textAlign: "center",
                    background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(255,167,38,0.06))",
                    border: "1px solid rgba(34,197,94,0.15)",
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>The 5x ROI Guarantee</h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
                        If BioDynamX AI doesn&apos;t produce at least <strong style={{ color: "#22c55e" }}>5x your investment</strong> in recovered revenue within 90 days, you don&apos;t pay. Period. We track every call, every booking, every dollar recovered — so you&apos;ll know exactly what your ROI is.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 60px" }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>Frequently Asked Questions</h2>
                {[
                    { q: "Is there a free trial?", a: "Yes. Talk to Jenny on our homepage for a free 60-second demo. For a full trial, contact us and we'll set up your AI agent at no cost for 14 days." },
                    { q: "Are there any hidden fees?", a: "None. Your monthly price includes unlimited calls, 24/7 coverage, and all features listed. No per-minute charges, no setup fees, no overage costs." },
                    { q: "Can I cancel anytime?", a: "Yes. Month-to-month, no contracts. Cancel anytime with 30 days notice. (Annual plans are billed yearly with the 20% discount.)" },
                    { q: "How fast can I get set up?", a: "Starter plans are live within 24 hours. Growth and Enterprise include custom training and typically go live within 3-5 business days." },
                    { q: "What's the 5x ROI Guarantee?", a: "If our AI doesn't produce at least 5x your monthly investment in recovered revenue within 90 days, we refund you. We track every metric transparently." },
                ].map((faq) => (
                    <div key={faq.q} style={{ padding: 20, marginBottom: 8, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{faq.q}</h3>
                        <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{faq.a}</p>
                    </div>
                ))}
            </section>

            <footer style={{ padding: "32px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>© {new Date().getFullYear()} BioDynamX Engineering Group</footer>
        </main>
    );
}
