"use client";
import Link from "next/link";

const SECURITY_PILLARS = [
    {
        id: "google-cloud",
        icon: "🏛️",
        color: "#3b82f6",
        title: "Google Cloud Infrastructure",
        subtitle: "SOC 2 Type II · HIPAA-Eligible · GDPR-Ready",
        body: "BioDynamX runs on Google Cloud — the same infrastructure used by Google Workspace, the U.S. Department of Defense, and thousands of healthcare systems. Not a startup server. Not a hobbyist VPS. Google-grade reliability and compliance from day one.",
    },
    {
        id: "no-data-training",
        icon: "🔒",
        color: "#22c55e",
        title: "Your Data Never Trains the Model",
        subtitle: "Enterprise API SLA — No Training on Your Calls",
        body: "Google's enterprise API explicitly prohibits using your conversation data to train or improve its AI models. Every call Jenny handles stays yours. This is one of the most critical differences between BioDynamX and free or consumer-tier AI tools that mine your data by default.",
    },
    {
        id: "prompt-security",
        icon: "🛡️",
        color: "#8b5cf6",
        title: "Server-Side Prompt Security",
        subtitle: "Jailbreak-Proof · Compliance-Locked · Zero Drift",
        body: "All agent instructions are injected server-side — they live in your secure cloud function, never in the browser. A prospect cannot manipulate, jailbreak, or override Jenny or Mark's behavior. What you configure is what runs. 100% of the time.",
    },
    {
        id: "hipaa",
        icon: "🏥",
        color: "#ef4444",
        title: "HIPAA-Eligible Architecture",
        subtitle: "Built for Healthcare, Legal & Financial Services",
        body: "Google Cloud supports Business Associate Agreements (BAA), making BioDynamX eligible for HIPAA-regulated conversations. This means dental practices, medical spas, law firms, and financial services businesses can deploy AI voice agents without creating compliance exposure.",
    },
    {
        id: "your-data",
        icon: "🗄️",
        color: "#ffa726",
        title: "Your Data, Your Database",
        subtitle: "Supabase — You Own It. We Never Do.",
        body: "Lead data, session history, and audit results are stored in your private Supabase database instance. BioDynamX never owns, sells, or accesses your customer data. When you leave, your data goes with you. That's not something most AI agent vendors can say.",
    },
    {
        id: "gdpr",
        icon: "🔑",
        color: "#06b6d4",
        title: "Hardened API Key Management",
        subtitle: "Server-Side Only · Domain-Restricted · Rotatable",
        body: "Unlike DIY setups that expose API keys in client-side JavaScript (a critical vulnerability), BioDynamX routes sensitive operations through server-side cloud functions. Keys are never visible in the browser bundle and can be domain-restricted to biodynamx.com only.",
    },
];

const COMPARISON = [
    { risk: "Trains AI on your customer call data", open: "✅ Often yes (especially free tiers)", bio: "❌ Never — enterprise SLA" },
    { risk: "Prompts exposed in browser / jailbreakable", open: "✅ Common in DIY builds", bio: "❌ Server-side locked" },
    { risk: "HIPAA-eligible architecture", open: "❌ Rarely — requires BAA", bio: "✅ Google Cloud BAA-eligible" },
    { risk: "Data stored on vendor servers you don't control", open: "✅ Typically yes", bio: "❌ Your Supabase instance" },
    { risk: "API keys exposed client-side", open: "✅ Most DIY setups", bio: "❌ Server-side cloud functions only" },
    { risk: "Agent can go off-script / hallucinate pricing", open: "✅ Without guardrails", bio: "❌ Real-time knowledge injection" },
    { risk: "SOC 2 Type II compliant infrastructure", open: "❌ Open-source has no SLA", bio: "✅ Google Cloud standard" },
    { risk: "GDPR-ready data handling", open: "❌ DIY responsibility", bio: "✅ Built into infrastructure" },
];

export default function SecurityPage() {
    return (
        <main style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Nav */}
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(5,5,8,0.95)", backdropFilter: "blur(12px)", zIndex: 100 }}>
                <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em" }}>BioDynamX</span>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", background: "linear-gradient(90deg,#00ff41,#3b82f6,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ENGINEERING GROUP</span>
                </Link>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Link href="/blog" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14 }}>Blog</Link>
                    <Link href="/pricing" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14 }}>Pricing</Link>
                    <Link href="/" style={{ background: "linear-gradient(135deg,#00ff41,#3b82f6)", color: "#000", padding: "8px 18px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>Talk to Jenny — Free</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ maxWidth: 860, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
                <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 100, border: "1px solid rgba(0,255,65,0.3)", background: "rgba(0,255,65,0.06)", fontSize: 11, fontWeight: 700, color: "#00ff41", letterSpacing: "0.1em", marginBottom: 24 }}>
                    🔐 ENTERPRISE SECURITY ARCHITECTURE
                </div>
                <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, lineHeight: 1.08, marginBottom: 20, letterSpacing: "-0.03em" }}>
                    Why Businesses Choose BioDynamX<br />
                    <span style={{ background: "linear-gradient(90deg,#00ff41,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Over Open & DIY AI Agents</span>
                </h1>
                <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>
                    The excitement around open-source AI agents is real — but so are the security risks most vendors don't talk about. Here's exactly what separates BioDynamX from the rest.
                </p>
                {/* Trust badges — clickable, scroll to section */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                    {[
                        { label: "Google Cloud", anchor: "google-cloud" },
                        { label: "SOC 2 Type II", anchor: "google-cloud" },
                        { label: "HIPAA-Eligible", anchor: "hipaa" },
                        { label: "GDPR-Ready", anchor: "gdpr" },
                        { label: "No Data Training", anchor: "no-data-training" },
                    ].map((badge) => (
                        <a key={badge.label} href={`#${badge.anchor}`} style={{ padding: "6px 14px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "border-color 0.2s, color 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#00ff41"; e.currentTarget.style.color = "#00ff41"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                        >
                            ✓ {badge.label}
                        </a>
                    ))}
                </div>
            </section>

            {/* 6 Pillars */}
            <section id="pillars" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                    {SECURITY_PILLARS.map((pillar) => (
                        <div key={pillar.title} id={pillar.id} style={{ padding: 28, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${pillar.color}22`, transition: "border-color 0.2s", scrollMarginTop: "80px" }}>
                            <div style={{ fontSize: 32, marginBottom: 14 }}>{pillar.icon}</div>
                            <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, color: "#fff" }}>{pillar.title}</h2>
                            <div style={{ fontSize: 11, fontWeight: 700, color: pillar.color, letterSpacing: "0.06em", marginBottom: 12 }}>{pillar.subtitle}</div>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{pillar.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comparison Table */}
            <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, marginBottom: 12 }}>
                        BioDynamX vs. Open / DIY AI Agents
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Side-by-side on the risks that actually matter to your business and your clients</p>
                </div>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {/* Header */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 220px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>SECURITY RISK</div>
                        <div style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "#ef4444", letterSpacing: "0.08em", textAlign: "center" }}>OPEN / DIY AI</div>
                        <div style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "#00ff41", letterSpacing: "0.08em", textAlign: "center" }}>BIODYNAMX</div>
                    </div>
                    {COMPARISON.map((row, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 220px 220px", borderBottom: i < COMPARISON.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                            <div style={{ padding: "16px 20px", fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{row.risk}</div>
                            <div style={{ padding: "16px 20px", fontSize: 13, color: "rgba(255,100,100,0.9)", textAlign: "center", fontWeight: 600 }}>{row.open}</div>
                            <div style={{ padding: "16px 20px", fontSize: 13, color: "#00ff41", textAlign: "center", fontWeight: 600 }}>{row.bio}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SOP / Script Section */}
            <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
                <div style={{ padding: 40, borderRadius: 20, background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.1em", marginBottom: 16 }}>🤝 OPERATIONAL TRUST</div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>We Follow Your Rules. Always.</h2>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.75, marginBottom: 20 }}>
                        Security isn't just about infrastructure — it's about control. BioDynamX agents are built on top of <strong style={{ color: "#fff" }}>your SOPs, your scripts, and your compliance policies.</strong> We don't come in and override what's working. We start with your proven process, your top producer's approach, and your industry-specific language. Then we layer in neuroscience and NLP to make it perform better.
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.75, margin: 0 }}>
                        Your agent never goes off-script. Never makes unauthorized promises. Never violates your policies. <strong style={{ color: "#fff" }}>What you approve is what runs</strong> — period. That's not just good security. That's the foundation of trust your clients expect.
                    </p>
                </div>
            </section>

            {/* Bottom CTA */}
            <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 100px", textAlign: "center" }}>
                <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
                    Ready for AI That's Actually Enterprise-Safe?
                </h2>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, marginBottom: 36, lineHeight: 1.7 }}>
                    Talk to Jenny for 60 seconds and get a free business audit. No credit card. No commitment. Just results.
                </p>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 12, background: "linear-gradient(135deg,#00ff41,#3b82f6)", color: "#000", textDecoration: "none", fontWeight: 800, fontSize: 15 }}>
                        Talk to Jenny — Free 60s Audit →
                    </Link>
                    <Link href="/pricing" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)", textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
                        See Pricing
                    </Link>
                </div>
                <p style={{ marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                    Google Cloud infrastructure · SOC 2 Type II · HIPAA-Eligible · Built on the Neurobiology of Choice™
                </p>
            </section>

            <footer style={{ padding: "32px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                <div style={{ marginBottom: 8 }}>
                    <Link href="/" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", marginRight: 16 }}>Home</Link>
                    <Link href="/pricing" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", marginRight: 16 }}>Pricing</Link>
                    <Link href="/blog" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", marginRight: 16 }}>Blog</Link>
                    <Link href="/about" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>About</Link>
                </div>
                © {new Date().getFullYear()} BioDynamX Engineering Group · biodynamx.com
            </footer>
        </main>
    );
}
