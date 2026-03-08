"use client";
import Link from "next/link";

export default function PricingPage() {
    return (
        <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ═══ NAV — matches landing page ═══ */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 50,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 32px",
                background: "rgba(10,10,10,0.96)",
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 900, color: "#000",
                        boxShadow: "0 0 15px rgba(0,255,65,0.2)",
                    }}>B</div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>BioDynamX</div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#00ff41", letterSpacing: "0.15em", textTransform: "uppercase" }}>Engineering Group</div>
                    </div>
                </Link>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    {[
                        { label: "Free Audit", href: "/audit" },
                        { label: "Security", href: "/security" },
                        { label: "Blog", href: "/blog" },
                        { label: "About", href: "/about" },
                        { label: "Glossary", href: "/glossary" },
                    ].map(link => (
                        <Link key={link.label} href={link.href} style={{
                            fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                            textDecoration: "none", transition: "color 0.2s",
                        }}>{link.label}</Link>
                    ))}
                    <Link href="/" style={{
                        padding: "8px 20px",
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        border: "none", borderRadius: 8,
                        color: "#000", fontSize: 12, fontWeight: 800,
                        textDecoration: "none",
                        boxShadow: "0 0 15px rgba(0,255,65,0.2)",
                    }}>Talk to Jenny</Link>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <section style={{ textAlign: "center", padding: "80px 24px 40px" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 18px",
                    background: "rgba(0,255,65,0.08)",
                    border: "1px solid rgba(0,255,65,0.2)",
                    borderRadius: 100,
                    fontSize: 11, fontWeight: 700, color: "#00ff41",
                    letterSpacing: "0.06em", marginBottom: 24,
                }}>
                    💰 TRANSPARENT PRICING · NO HIDDEN FEES
                </div>
                <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.04em" }}>
                    Two Ways to Grow.<br />
                    <span style={{ background: "linear-gradient(90deg, #00ff41, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>You Choose the Speed.</span>
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "0 auto", fontSize: 16, lineHeight: 1.65 }}>
                    No per-minute charges. No long-term contracts. <strong style={{ color: "#ffa726" }}>Guaranteed 5x ROI or you don&apos;t pay.</strong>
                </p>
            </section>

            {/* ═══ TWO PRICING TIERS — CLEAR DISTINCTION ═══ */}
            <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>

                {/* SELF-SERVICE — You Run It */}
                <div style={{
                    padding: 32, borderRadius: 24,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
                        SELF-SERVICE · YOU RUN IT
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>SaaS Platform Access</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Access the tools. You control the execution.</p>

                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                        <span style={{ fontSize: 48, fontWeight: 800, color: "#fff" }}>$497</span>
                        <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/mo</span>
                    </div>

                    <Link href="/" style={{
                        display: "block", textAlign: "center", padding: "14px 0", borderRadius: 12,
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                        color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, marginBottom: 24,
                    }}>Get Started</Link>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                        {[
                            "Full Elite 11 AI Agent Access",
                            "Unlimited Inbound Call Reception",
                            "AI Visibility (SEO, GEO, & AEO)",
                            "Automatic Social Media Posting",
                            "Self-Managed Dashboard",
                            "Community Support",
                            "5x ROI Guarantee",
                            "Setup in 24-48 hours",
                        ].map((feat, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>
                                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{feat}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                            Best for tech-savvy teams who want to run the platform themselves.
                        </div>
                    </div>
                </div>

                {/* DONE-FOR-YOU — We Do Everything */}
                <div style={{
                    padding: 32, borderRadius: 24,
                    background: "linear-gradient(180deg, rgba(0,255,65,0.06), rgba(59,130,246,0.03))",
                    border: "2px solid rgba(0,255,65,0.25)",
                    position: "relative",
                }}>
                    <div style={{
                        position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                        background: "linear-gradient(135deg, #00ff41, #00cc33)", color: "#000",
                        padding: "5px 20px", borderRadius: 100, fontSize: 11, fontWeight: 800,
                        letterSpacing: "0.05em", whiteSpace: "nowrap",
                    }}>⚡ MOST POPULAR</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#00ff41", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
                        DONE-FOR-YOU · WE DO EVERYTHING
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Managed AI Growth Engine</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>We run it all. You don&apos;t lift a finger.</p>

                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 20, textDecoration: "line-through", color: "rgba(255,255,255,0.3)" }}>$2,497</span>
                        <span style={{ fontSize: 48, fontWeight: 800, color: "#fff" }}>$1,497</span>
                        <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/mo</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#ff6b6b", marginBottom: 24 }}>
                        ⚠️ Introductory rate — Locks in for first 3 months. Price goes to $2,497/mo after.
                    </div>

                    <Link href="/" style={{
                        display: "block", textAlign: "center", padding: "14px 0", borderRadius: 12,
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        color: "#000", textDecoration: "none", fontWeight: 800, fontSize: 15, marginBottom: 24,
                        boxShadow: "0 4px 30px rgba(0,255,65,0.3)",
                    }}>Lock in $1,497/mo Now</Link>

                    <div style={{ borderTop: "1px solid rgba(0,255,65,0.15)", paddingTop: 20 }}>
                        {[
                            "Everything in Self-Service, plus:",
                            "Full Strategy, Setup & Optimization",
                            "Custom Content, Video & SEO",
                            "SPIN-Native Outbound Lead Hunting",
                            "Custom Persona Training",
                            "Multi-Channel: Voice + SMS + Email",
                            "Advanced ROI Intelligence Dashboard",
                            "Priority Elite Support",
                            "Quarterly Strategy Audits",
                            "Cinematic Commercial Production",
                            "Bird's-Eye Marketing Automation",
                            "We do everything — you grow",
                        ].map((feat, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                <span style={{ color: "#00ff41", flexShrink: 0 }}>✓</span>
                                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: i === 0 ? 700 : 400 }}>{feat}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 10, background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.15)" }}>
                        <div style={{ fontSize: 12, color: "#ff6b6b", textAlign: "center", fontWeight: 700 }}>
                            ⏰ Only {Math.floor(Math.random() * 3) + 3} spots left at this price. Rate locks in at signup.
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ Enterprise Callout ═══ */}
            <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 60px" }}>
                <div style={{
                    padding: 32, borderRadius: 20, textAlign: "center",
                    background: "linear-gradient(135deg, rgba(255,167,38,0.06), rgba(59,130,246,0.06))",
                    border: "1px solid rgba(255,167,38,0.2)",
                }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#ffa726", letterSpacing: "0.12em", marginBottom: 8 }}>ENTERPRISE OS</div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Need Custom AI Infrastructure?</h2>
                    <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>$4,997<span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, maxWidth: 450, margin: "0 auto 20px", lineHeight: 1.6 }}>
                        Unlimited agents, custom logic, whitelabel mode, dedicated Vertex AI infrastructure, multi-location command center, and direct strategy sessions with Billy.
                    </p>
                    <Link href="/" style={{
                        display: "inline-block", padding: "14px 36px", borderRadius: 12,
                        background: "rgba(255,167,38,0.1)", border: "1px solid rgba(255,167,38,0.3)",
                        color: "#ffa726", textDecoration: "none", fontWeight: 700, fontSize: 15,
                    }}>Request Enterprise Demo</Link>
                </div>
            </section>

            {/* ═══ Side-by-Side Comparison ═══ */}
            <section style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 60px" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 32 }}>What&apos;s the Difference?</h2>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {[
                        { feature: "Setup & Strategy", self: "You configure", done: "We handle everything" },
                        { feature: "Content & Video", self: "DIY templates", done: "Cinematic production included" },
                        { feature: "SEO / GEO / AEO", self: "Tools provided", done: "Fully managed by our team" },
                        { feature: "Outbound Lead Hunting", self: "—", done: "SPIN-trained AI outreach" },
                        { feature: "Support Level", self: "Community", done: "Priority Elite + Strategy Audits" },
                        { feature: "Marketing Automation", self: "Basic", done: "Bird's-Eye full automation" },
                        { feature: "Price", self: "$497/mo", done: "$1,497/mo (then $2,497)" },
                    ].map((row, i) => (
                        <div key={i} style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                            padding: "14px 20px",
                            background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            fontSize: 13,
                        }}>
                            <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{row.feature}</div>
                            <div style={{ color: "rgba(255,255,255,0.45)", textAlign: "center" }}>{row.self}</div>
                            <div style={{ color: "#00ff41", fontWeight: 600, textAlign: "center" }}>{row.done}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Guarantee ═══ */}
            <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 40px" }}>
                <div style={{
                    padding: 32, borderRadius: 20, textAlign: "center",
                    background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(255,167,38,0.06))",
                    border: "1px solid rgba(34,197,94,0.15)",
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>The 5x ROI Guarantee</h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
                        If BioDynamX AI doesn&apos;t produce at least <strong style={{ color: "#22c55e" }}>5x your investment</strong> in recovered revenue within 90 days, you don&apos;t pay. Period. We track every call, every booking, every dollar recovered.
                    </p>
                </div>
            </section>

            {/* ═══ FAQ ═══ */}
            <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 60px" }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>Frequently Asked Questions</h2>
                {[
                    { q: "What's the difference between Self-Service and Done-For-You?", a: "Self-Service ($497/mo) gives you access to all 11 AI agents and the platform — you configure and manage it yourself. Done-For-You ($1,497/mo for the first 3 months, then $2,497/mo) means our team handles everything: strategy, setup, content, video, SEO, and ongoing optimization." },
                    { q: "Why is the Done-For-You price lower for the first 3 months?", a: "We want you to see the ROI before you commit to full price. The introductory rate lets you experience the full power of our managed service at a reduced investment. After 90 days, when you've seen the results, the rate moves to $2,497/mo." },
                    { q: "Are there any hidden fees?", a: "None. Your monthly price includes unlimited calls, 24/7 coverage, and all features listed. No per-minute charges, no setup fees, no overage costs." },
                    { q: "Can I cancel anytime?", a: "Yes. Month-to-month, no contracts. Cancel anytime with 30 days notice." },
                    { q: "How fast can I get set up?", a: "Self-Service plans are live within 24 hours. Done-For-You includes custom training and typically goes live within 3-5 business days." },
                    { q: "What's the 5x ROI Guarantee?", a: "If our AI doesn't produce at least 5x your monthly investment in recovered revenue within 90 days, we refund you. We track every metric transparently." },
                ].map((faq) => (
                    <div key={faq.q} style={{ padding: 20, marginBottom: 8, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{faq.q}</h3>
                        <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{faq.a}</p>
                    </div>
                ))}
            </section>

            {/* ═══ FOOTER — matches landing page ═══ */}
            <footer style={{
                padding: "60px 32px 32px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.2)",
            }}>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40,
                    maxWidth: 1200, margin: "0 auto",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 28, height: 28, background: "#00ff41", borderRadius: 6 }} />
                            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>BioDynamX</span>
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                            The world&apos;s first neurobiology-powered AI platform for revenue recovery and scale. Built for Web 4.0.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "0.15em" }}>COMPANY</h4>
                        {[{ l: "About Us", h: "/about" }, { l: "Revenue Dashboard", h: "/dashboard" }, { l: "Success Stories", h: "/testimonials" }].map(lnk => (
                            <a key={lnk.l} href={lnk.h} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 10 }}>{lnk.l}</a>
                        ))}
                    </div>
                    <div>
                        <h4 style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "0.15em" }}>PLATFORM</h4>
                        {[{ l: "Elite Pricing", h: "/pricing" }, { l: "Free 20-Point Audit", h: "/audit" }, { l: "A–Z Glossary", h: "/glossary" }].map(lnk => (
                            <a key={lnk.l} href={lnk.h} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 10 }}>{lnk.l}</a>
                        ))}
                    </div>
                    <div>
                        <h4 style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "0.15em" }}>TRUST & LEGAL</h4>
                        {[{ l: "Security Protocol", h: "/security" }, { l: "Privacy Policy", h: "/privacy" }, { l: "Terms of Service", h: "/terms" }].map(lnk => (
                            <a key={lnk.l} href={lnk.h} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 10 }}>{lnk.l}</a>
                        ))}
                        <div style={{ color: "#00ff41", fontSize: 11, fontWeight: 800, marginTop: 16, letterSpacing: "0.05em" }}>✓ GDPR & SOC 2 READY</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 4 }}>Military-Grade AES-256</div>
                    </div>
                </div>
                <div style={{
                    marginTop: 60, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.08)",
                    textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.02em",
                }}>
                    © 2026 BioDynamX Engineering Group. All rights reserved. Neuroscience for the digital age.
                </div>
            </footer>
        </main>
    );
}
