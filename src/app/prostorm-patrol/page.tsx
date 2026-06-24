import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNavFooter";

export default function ProStormPatrolPage() {
    return (
        <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
            <SiteNav />

            {/* ═══ HERO ═══ */}
            <section style={{ textAlign: "center", padding: "80px 24px 40px" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 18px",
                    background: "rgba(233,69,96,0.08)",
                    border: "1px solid rgba(233,69,96,0.2)",
                    borderRadius: 100,
                    fontSize: 11, fontWeight: 700, color: "#e94560",
                    letterSpacing: "0.06em", marginBottom: 24,
                }}>
                    ⚡ PROSTORM PATROL · PRE-STORM TERRITORY DOMINATION
                </div>
                <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.04em" }}>
                    Own Your Territory<br />
                    <span style={{ background: "linear-gradient(90deg, #e94560, #ff6b35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Before the Storm Hits</span>
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 650, margin: "0 auto", fontSize: 17, lineHeight: 1.65 }}>
                    The only roofing platform that uses <strong style={{ color: "#76b900" }}>NVIDIA Earth-2 AI</strong> weather forecasting running on <strong style={{ color: "#00ff41" }}>A100 GPUs</strong> and <strong style={{ color: "#00ff41" }}>NOAA HRRR live hail data</strong> to give contractors exclusive territory domination before storm chasers even wake up.
                </p>
                <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/storm/signup" style={{
                        display: "inline-block", padding: "14px 32px",
                        background: "linear-gradient(135deg, #e94560, #ff6b35)",
                        color: "#fff", fontSize: 14, fontWeight: 800,
                        borderRadius: 10, textDecoration: "none",
                        boxShadow: "0 0 20px rgba(233,69,96,0.3)",
                        letterSpacing: "0.02em",
                    }}>
                        Claim Your Territory →
                    </Link>
                    <a href="#how-it-works" style={{
                        display: "inline-block", padding: "14px 32px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff", fontSize: 14, fontWeight: 600,
                        borderRadius: 10, textDecoration: "none",
                    }}>
                        See How It Works
                    </a>
                </div>
            </section>

            {/* ═══ LIVE BADGE ═══ */}
            <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 40px", textAlign: "center" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "10px 24px",
                    background: "rgba(118,185,0,0.06)",
                    border: "1px solid rgba(118,185,0,0.2)",
                    borderRadius: 12,
                }}>
                    <span style={{
                        width: 8, height: 8, background: "#76b900",
                        borderRadius: "50%", display: "inline-block",
                        boxShadow: "0 0 8px #76b900",
                        animation: "nav-signal-blink 1.4s ease-in-out infinite",
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#76b900", letterSpacing: "0.04em" }}>
                        NVIDIA EARTH-2 STUDIO · CONFIRMED WORKING ON GOOGLE COLAB PRO A100 · v0.8.1
                    </span>
                    <style>{`@keyframes nav-signal-blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
                </div>
            </section>

            {/* ═══ STATS BAR ═══ */}
            <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 60px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40 }}>
                {[
                    { num: "87,696", label: "Hail Reports Analyzed" },
                    { num: "6,876", label: "ZIP Codes Scored Live" },
                    { num: "5", label: "States Covered" },
                    { num: "40", label: "Gold Territories" },
                    { num: "72hr", label: "AI Forecast Horizon" },
                    { num: "A100", label: "NVIDIA GPU Powered" },
                ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: "#e94560" }}>{s.num}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </section>

            {/* ═══ AI TECHNOLOGY SECTION ═══ */}
            <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "8px 20px",
                        background: "linear-gradient(135deg, rgba(118,185,0,0.1), rgba(75,153,52,0.05))",
                        borderRadius: 8,
                        fontSize: 14, fontWeight: 700, color: "#76b900",
                        marginBottom: 20,
                    }}>
                        ⚡ POWERED BY NVIDIA EARTH-2 AI
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
                        The Secret Weapon: <span style={{ color: "#76b900" }}>NVIDIA Earth-2 Studio</span>
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 650, margin: "0 auto", fontSize: 16, lineHeight: 1.65 }}>
                        ProStorm Patrol AI Pro runs NVIDIA's Earth-2 Studio framework — the same AI weather technology NVIDIA develops for climate science research. <strong style={{ color: "#fff" }}>Confirmed working on Google Colab Pro A100 GPU</strong> running GraphCast Operational at 0.25° resolution.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
                    {[
                        { icon: "🧠", title: "GraphCast Operational", desc: "DeepMind's graph neural network weather model. 0.25° global resolution, 6-hour timestep. Predicts atmospheric state 24-72 hours ahead with ensemble uncertainty quantification." },
                        { icon: "🖥️", title: "A100 GPU Computing", desc: "Each forecast run uses NVIDIA A100-SXM4-40GB GPUs via Google Colab Pro. GraphCast's 40GB VRAM requirement is fully met. 4-step deterministic forecast completes in under 10 minutes." },
                        { icon: "📊", title: "72-Hour Hail Prediction", desc: "HRRR tells you hail risk NOW. Earth-2 tells you hail probability 72 hours AHEAD. You know your territory is getting hit 3 days before storm chasers even know a storm is coming." },
                        { icon: "🔬", title: "Ensemble Forecasting", desc: "50-member perturbation ensemble runs using Brown/BredVector methods. Probabilistic hail forecasts from GraphCast + FourCastNet3 AI models. Confidence intervals, not just point predictions." },
                        { icon: "🌐", title: "GFS Initial Conditions", desc: "Forecasts initialized from NOAA's Global Forecast System — the same data used by NWS. Real atmospheric observations, not synthetic data. Updated every 6 hours (00Z, 06Z, 12Z, 18Z)." },
                        { icon: "📡", title: "Live HRRR Integration", desc: "NOAA's High-Resolution Rapid Refresh model updates hourly. HAILCAST, CAPE, updraft helicity, and composite reflectivity for 6,876 ZIP codes across 5 states. Base tier runs free on your laptop." },
                    ].map((f, i) => (
                        <div key={i} style={{
                            padding: 24, borderRadius: 16,
                            background: "rgba(118,185,0,0.03)",
                            border: "1px solid rgba(118,185,0,0.1)",
                        }}>
                            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                            <h3 style={{ color: "#76b900", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ TWO TIERS ═══ */}
            <section style={{ maxWidth: 960, margin: "0 auto", padding: "60px 24px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Two Ways to Win</h2>
                <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 30, fontSize: 15 }}>Both include 7-day free trial. Lock in your territory now.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>

                    {/* Standard */}
                    <div style={{
                        padding: 32, borderRadius: 24,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
                            STANDARD · LIVE NOW · FREE TIER
                        </div>
                        <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>ProStorm Patrol Standard</h3>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Complete storm response platform with live HRRR data.</p>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                            <span style={{ fontSize: 48, fontWeight: 800, color: "#e94560" }}>$500</span>
                            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/month per ZIP</span>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {[
                                "Exclusive ZIP territory assignment",
                                "10-year hail risk score & history",
                                "Live HRRR hail risk (updates hourly, 6,876 ZIPs)",
                                "Homeowner CRM with status tracking",
                                "Insurance claim pipeline (5-stage kanban)",
                                "Door-knocking route planner + Google Maps",
                                "Live NWS storm alerts (20 states, auto-refresh)",
                                "SPC live storm reports integration",
                                "Yard sign tracking with GPS",
                                "AI message generation (OpenRouter)",
                                "All tools in one dashboard app",
                            ].map((f, i) => (
                                <li key={i} style={{ padding: "6px 0", fontSize: 14, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                                    <span style={{ color: "#00ff41", fontWeight: 700 }}>✓</span> {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* AI Pro */}
                    <div style={{
                        padding: 32, borderRadius: 24,
                        background: "rgba(255,215,0,0.03)",
                        border: "2px solid rgba(255,215,0,0.25)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                                ⚡ AI PRO · PREMIUM TIER
                            </div>
                            <div style={{
                                padding: "3px 10px", borderRadius: 4,
                                background: "rgba(118,185,0,0.15)",
                                border: "1px solid rgba(118,185,0,0.3)",
                                fontSize: 10, fontWeight: 700, color: "#76b900",
                            }}>A100 GPU</div>
                        </div>
                        <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>ProStorm Patrol AI Pro</h3>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Standard + NVIDIA Earth-2 AI forecasting on A100 GPU.</p>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                            <span style={{ fontSize: 48, fontWeight: 800, color: "#FFD700" }}>$2,000</span>
                            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/month per ZIP</span>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {[
                                { text: "Everything in Standard, plus:", bold: true },
                                { text: "NVIDIA Earth-2 AI ensemble forecasting", bold: false },
                                { text: "GraphCast Operational on A100 GPU (confirmed)", bold: false },
                                { text: "72-hour probabilistic hail prediction", bold: false },
                                { text: "50-member ensemble perturbation runs", bold: false },
                                { text: "GFS-initialized deterministic forecasts", bold: false },
                                { text: "Pre-storm homeowner alert automation", bold: false },
                                { text: "AI storm communication templates", bold: false },
                                { text: "Priority territory lock (first refusal)", bold: false },
                                { text: "Quarterly territory performance reports", bold: false },
                                { text: "AI Pro contractor certification badge", bold: false },
                            ].map((f, i) => (
                                <li key={i} style={{ padding: "6px 0", fontSize: 14, color: f.bold ? "#FFD700" : "rgba(255,255,255,0.7)", display: "flex", alignItems: "flex-start", gap: 8, fontWeight: f.bold ? 700 : 400 }}>
                                    <span style={{ color: f.bold ? "#FFD700" : "#00ff41", fontWeight: 700 }}>{f.bold ? "→" : "✓"}</span> {f.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section id="how-it-works" style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>How It Works</h2>
                <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 30, fontSize: 15 }}>From off-season relationship building to post-storm claims.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                    {[
                        { step: "01", color: "#e94560", title: "Off-Season (Oct-Mar): Build Relationships", desc: "We assign you an exclusive ZIP code. You sponsor HOA meetings, offer free roof inspections, build your homeowner list. By storm season, 300+ homeowners already know you." },
                        { step: "02", color: "#76b900", title: "Pre-Storm (T-72hrs): AI Forecast Fires", desc: "ProStorm Patrol AI Pro runs NVIDIA Earth-2 ensemble forecasts on A100 GPU. You get 72-hour hail probability for your ZIP. HRRR updates hourly with live hail risk. You know before anyone else." },
                        { step: "03", color: "#ff6b35", title: "Storm Day: You're Already There", desc: "When hail hits, you're not knocking on doors — you're answering calls from homeowners who already know you. Your crews are pre-mapped. Your claims are pre-filed. Storm chasers see your yard signs and move on." },
                        { step: "04", color: "#00ff41", title: "Post-Storm: Claims Pipeline", desc: "Insurance claims flow through your dashboard. Adjuster scheduling, document tracking, production status. You track every dollar. Pre-storm drone inspections = ironclad insurance proof." },
                    ].map((s, i) => (
                        <div key={i} style={{
                            padding: 24, borderRadius: 16,
                            background: "rgba(255,255,255,0.02)",
                            border: `1px solid ${s.color}22`,
                            borderLeft: `3px solid ${s.color}`,
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: `${s.color}22`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 16, fontWeight: 800, color: s.color, marginBottom: 12,
                            }}>{s.step}</div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.title}</h3>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ STATES AVAILABLE ═══ */}
            <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>
                    States <span style={{ color: "#e94560" }}>Available</span>
                </h2>
                <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 24, fontSize: 15 }}>6,876 ZIP codes scored across 5 tornado alley states.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
                    {[
                        { abbr: "CO", name: "Colorado", zips: 607, gold: 12 },
                        { abbr: "TX", name: "Texas", zips: 3182, gold: 17 },
                        { abbr: "OK", name: "Oklahoma", zips: 1142, gold: 6 },
                        { abbr: "KS", name: "Kansas", zips: 995, gold: 2 },
                        { abbr: "NE", name: "Nebraska", zips: 950, gold: 3 },
                    ].map((st, i) => (
                        <div key={i} style={{
                            padding: 20, borderRadius: 16,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            textAlign: "center",
                        }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "#e94560", marginBottom: 4 }}>{st.abbr}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>{st.name}</div>
                            <div style={{ display: "flex", justifyContent: "space-around", fontSize: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: "#fff" }}>{st.zips.toLocaleString()}</div>
                                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>ZIPs</div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: "#FFD700" }}>{st.gold}</div>
                                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Gold</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ TECHNOLOGY STACK ═══ */}
            <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 30, textAlign: "center" }}>
                    Technology <span style={{ color: "#00ff41" }}>Stack</span>
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                    {[
                        { label: "Earth2Studio", detail: "NVIDIA v0.8.1 · Apache 2.0" },
                        { label: "GraphCast", detail: "DeepMind · 0.25° · 6h step" },
                        { label: "FourCastNet3", detail: "NVIDIA · Neural Operator" },
                        { label: "HRRR", detail: "NOAA · 3km · Hourly" },
                        { label: "GFS", detail: "NOAA · 0.25° · 6h cycles" },
                        { label: "GPU", detail: "NVIDIA A100-SXM4-40GB" },
                        { label: "Platform", detail: "Google Colab Pro" },
                        { label: "AI Assistant", detail: "OpenRouter · Llama 3.3 / Gemini" },
                    ].map((t, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "12px 16px",
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.05)",
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{t.label}</span>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t.detail}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ THE CLOSE ═══ */}
            <section style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
                <div style={{
                    padding: 40, borderRadius: 24,
                    background: "linear-gradient(135deg, rgba(233,69,96,0.05), rgba(0,255,65,0.03))",
                    border: "2px solid rgba(233,69,96,0.3)",
                }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>One Contractor Per ZIP</h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1.65, marginBottom: 20 }}>
                        40 Gold territories across 5 states. 971 Silver territories. Each goes to ONE contractor. Once your ZIP is taken, it's gone. Your competitor is reading this page right now.
                    </p>
                    <div style={{ fontSize: 20, color: "#fff", marginBottom: 24 }}>
                        Lock in your territory today.<br />
                        <span style={{ color: "#e94560" }}>Storm season is here.</span>
                    </div>
                    <Link href="/storm/signup" style={{
                        display: "inline-block",
                        padding: "14px 32px",
                        background: "linear-gradient(135deg, #e94560, #ff6b35)",
                        color: "#fff", fontSize: 14, fontWeight: 800,
                        borderRadius: 10, textDecoration: "none",
                        boxShadow: "0 0 20px rgba(233,69,96,0.3)",
                        letterSpacing: "0.02em",
                    }}>
                        Claim Your Territory →
                    </Link>
                </div>
            </section>

            <SiteFooter />
        </main>
    );
}
