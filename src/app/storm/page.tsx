"use client";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNavFooter";

export default function StormShieldPage() {
    return (
        <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>

            <SiteNav />

            {/* ═══ NEW PAGE BANNER ═══ */}
            <div style={{
                textAlign: "center", padding: "12px 24px",
                background: "linear-gradient(90deg, rgba(118,185,0,0.1), rgba(233,69,96,0.1))",
                borderBottom: "1px solid rgba(118,185,0,0.2)",
            }}>
                <Link href="/prostorm-patrol" style={{
                    fontSize: 13, fontWeight: 700, color: "#76b900",
                    textDecoration: "none",
                }}>
                    ⚡ NEW: ProStorm Patrol AI Pro with NVIDIA Earth-2 · Confirmed on A100 GPU → Learn More
                </Link>
            </div>

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
                <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.04em" }}>
                    Own Your Territory<br />
                    <span style={{ background: "linear-gradient(90deg, #e94560, #ff6b35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Before the Storm Hits</span>
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "0 auto", fontSize: 16, lineHeight: 1.65 }}>
                    The only roofing platform that uses <strong style={{ color: "#e94560" }}>NVIDIA Earth-2 AI</strong> weather forecasting and <strong style={{ color: "#00ff41" }}>NOAA HRRR live hail data</strong> to give contractors exclusive territory domination before the storm chasers even wake up.
                </p>
            </section>

            {/* ═══ STATS BAR ═══ */}
            <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40 }}>
                {[
                    { num: "87,696", label: "Hail Reports Analyzed" },
                    { num: "3,555", label: "ZIP Codes Scored" },
                    { num: "5", label: "States Available" },
                    { num: "40", label: "Gold Territories" },
                    { num: "6.00\"", label: "Max Hail Recorded" },
                ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: "#e94560" }}>{s.num}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </section>

            {/* ═══ STATES AVAILABLE ═══ */}
            <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, textAlign: "center" }}>
                    States <span style={{ color: "#e94560" }}>Available</span>
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
                    {[
                        { abbr: "CO", name: "Colorado", zips: 378, gold: 12 },
                        { abbr: "TX", name: "Texas", zips: 1667, gold: 17 },
                        { abbr: "OK", name: "Oklahoma", zips: 642, gold: 6 },
                        { abbr: "KS", name: "Kansas", zips: 683, gold: 2 },
                        { abbr: "NE", name: "Nebraska", zips: 563, gold: 3 },
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

            {/* ═══ THE PROBLEM ═══ */}
            <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 30, textAlign: "center" }}>
                    Every Roofer Does the <span style={{ color: "#e94560" }}>Same Thing</span>
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                    {[
                        { icon: "⏰", title: "You Wait for the Storm", desc: "Hail hits. You find out when your phone rings. 20 storm chasers are already driving to your area." },
                        { icon: "🚪", title: "You Fight 30 Strangers", desc: "Every roofer shows up. Homeowners are overwhelmed. You compete on price, not trust." },
                        { icon: "📊", title: "You Have No Data", desc: "You don't know which neighborhoods get hit most. You're flying blind against competitors who do." },
                        { icon: "🔄", title: "You Start From Zero", desc: "No relationships. No homeowner list. Every storm season, back to cold knocking." },
                    ].map((p, i) => (
                        <div key={i} style={{
                            padding: 24, borderRadius: 16,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderLeft: "3px solid #e94560",
                        }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{p.icon}</div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{p.title}</h3>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ THE SOLUTION ═══ */}
            <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 30, textAlign: "center" }}>
                    The <span style={{ color: "#00ff41" }}>ProStorm Patrol</span> System
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                    {[
                        { icon: "🎯", title: "Exclusive ZIP Territory", desc: "One contractor per ZIP code. No other ProStorm Patrol contractor can operate in your territory. When you own it, you own it." },
                        { icon: "📊", title: "10-Year Hail Risk Scoring", desc: "87,696 NWS hail reports analyzed. Every ZIP across 5 states ranked 0-100 on hail risk. You know which territories are worth fighting for." },
                        { icon: "🌩️", title: "Live HRRR Hail Risk", desc: "NOAA's HRRR model updates hourly. Real-time hail risk for your ZIP before the storm forms. 6,876 ZIPs scored every hour across all 5 states." },
                        { icon: "🤝", title: "Pre-Storm Relationship Building", desc: "Free off-season inspections. HOA meetings. By May, 300+ homeowners already know you. When hail hits, they call YOU." },
                        { icon: "📱", title: "All-In-One Dashboard", desc: "Homeowner CRM. Insurance claim pipeline. Door-knocking route planner with Google Maps. Live NWS storm alerts. One app." },
                        { icon: "🛡️", title: "Yard Sign Protection", desc: "GPS-tracked yard signs that deter storm chasers. Your homeowners don't get 20 door-knockers bothering them." },
                    ].map((s, i) => (
                        <div key={i} style={{
                            padding: 24, borderRadius: 16,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderLeft: "3px solid #00ff41",
                        }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.title}</h3>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ AI WEAPON ═══ */}
            <section style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "8px 20px",
                    background: "linear-gradient(135deg, #76b900, #4b9934)",
                    borderRadius: 8,
                    fontSize: 14, fontWeight: 700, color: "#fff",
                    marginBottom: 20,
                }}>
                    ⚡ POWERED BY NVIDIA EARTH-2 AI · RUNNING ON A100 GPU
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
                    The Secret Weapon: <span style={{ color: "#76b900" }}>NVIDIA Earth-2</span>
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "0 auto 30px", fontSize: 16, lineHeight: 1.65 }}>
                    ProStorm Patrol AI Pro runs NVIDIA's Earth-2 Studio framework — the same AI weather technology NVIDIA develops for climate science research. <strong style={{ color: "#76b900" }}>Confirmed working on Google Colab Pro A100 GPU</strong> running Earth2Studio v0.8.1 with GraphCast Operational at 0.25° resolution.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, textAlign: "left" }}>
                    <div style={{ padding: 24, borderRadius: 16, background: "rgba(118,185,0,0.05)", border: "1px solid rgba(118,185,0,0.15)" }}>
                        <h3 style={{ color: "#76b900", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>72-Hour Hail Prediction</h3>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>HRRR tells you hail risk NOW. Earth-2 tells you hail probability 72 hours AHEAD. You know your territory is getting hit 3 days before storm chasers even know a storm is coming.</p>
                    </div>
                    <div style={{ padding: 24, borderRadius: 16, background: "rgba(118,185,0,0.05)", border: "1px solid rgba(118,185,0,0.15)" }}>
                        <h3 style={{ color: "#76b900", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>AI Ensemble Forecasting</h3>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>GraphCast and FourCastNet3 AI models run on NVIDIA A100 GPUs. 50-member ensemble runs give probabilistic hail forecasts for your exact ZIP code.</p>
                    </div>
                    <div style={{ padding: 24, borderRadius: 16, background: "rgba(118,185,0,0.05)", border: "1px solid rgba(118,185,0,0.15)" }}>
                        <h3 style={{ color: "#76b900", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>The Marketing Edge</h3>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>"ProStorm Patrol uses NVIDIA's AI weather supercomputer to predict hail before it forms." That statement closes deals. No competitor can match that pitch.</p>
                    </div>
                </div>
            </section>

            {/* ═══ TWO TIERS ═══ */}
            <section style={{ maxWidth: 960, margin: "0 auto", padding: "60px 24px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 30, textAlign: "center" }}>Two Ways to Win</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>

                    {/* Standard */}
                    <div style={{
                        padding: 32, borderRadius: 24,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
                            STANDARD · LIVE NOW
                        </div>
                        <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>ProStorm Patrol Standard</h3>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>The complete storm response platform.</p>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                            <span style={{ fontSize: 48, fontWeight: 800, color: "#e94560" }}>$500</span>
                            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/month per ZIP</span>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {[
                                "Exclusive ZIP territory assignment",
                                "10-year hail risk score & history",
                                "Live HRRR hail risk (updates hourly)",
                                "Homeowner CRM with status tracking",
                                "Insurance claim pipeline (5-stage)",
                                "Door-knocking route planner + Google Maps",
                                "Live NWS storm alerts (auto-refresh)",
                                "Yard sign tracking with GPS",
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
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
                            ⚡ AI PRO · PREMIUM TIER
                        </div>
                        <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>ProStorm Patrol AI Pro</h3>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Standard + NVIDIA Earth-2 AI forecasting.</p>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                            <span style={{ fontSize: 48, fontWeight: 800, color: "#FFD700" }}>$2,000</span>
                            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/month per ZIP</span>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {[
                                "Everything in Standard, plus:",
                                "NVIDIA Earth-2 AI ensemble forecasting",
                                "72-hour probabilistic hail prediction",
                                "50-member ensemble runs on A100 GPU",
                                "GraphCast / FourCastNet3 AI models",
                                "Pre-storm homeowner alert automation",
                                "AI storm communication templates",
                                "Priority territory lock (first refusal)",
                                "Quarterly territory performance reports",
                                "AI Pro contractor certification badge",
                            ].map((f, i) => (
                                <li key={i} style={{ padding: "6px 0", fontSize: 14, color: i === 0 ? "#FFD700" : "rgba(255,255,255,0.7)", display: "flex", alignItems: "flex-start", gap: 8, fontWeight: i === 0 ? 700 : 400 }}>
                                    <span style={{ color: i === 0 ? "#FFD700" : "#00ff41", fontWeight: 700 }}>{i === 0 ? "→" : "✓"}</span> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 20, fontSize: 14, textAlign: "center" }}>
                    Lock in your territory at Standard now. Upgrade to AI Pro when storm season starts. Your ZIP is yours either way.
                </p>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 30, textAlign: "center" }}>How It Works</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                        { step: "01", title: "Off-Season (Oct-Mar): Build Relationships", desc: "We assign you an exclusive ZIP code. You sponsor HOA meetings, offer free roof inspections, build your homeowner list. By storm season, 300+ homeowners know you." },
                        { step: "02", title: "Pre-Storm (T-72hrs): AI Forecast Fires", desc: "ProStorm Patrol AI Pro runs NVIDIA Earth-2 ensemble forecasts. You get 72-hour hail probability for your ZIP. HRRR updates hourly with live hail risk. You know before anyone else." },
                        { step: "03", title: "Storm Day: You're Already There", desc: "When hail hits, you're not knocking on doors — you're answering calls from homeowners who already know you. Your crews are pre-mapped. Your claims are pre-filed. Storm chasers see your yard signs and move on." },
                        { step: "04", title: "Post-Storm: Claims Pipeline", desc: "Insurance claims flow through your dashboard. Adjuster scheduling, document tracking, production status. You track every dollar. 88% claim win rate vs. 12% for storm chasers." },
                    ].map((s, i) => (
                        <div key={i} style={{
                            display: "flex", gap: 20, padding: 20,
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.06)",
                        }}>
                            <div style={{
                                flexShrink: 0, width: 48, height: 48,
                                borderRadius: 12,
                                background: "linear-gradient(135deg, #e94560, #ff6b35)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 18, fontWeight: 800, color: "#fff",
                            }}>{s.step}</div>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{s.title}</h3>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{s.desc}</p>
                            </div>
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
                        40 Gold territories across 5 states. 144 Silver territories. Each goes to ONE contractor. Once your ZIP is taken, it's gone. Your competitor is reading this page right now.
                    </p>
                    <div style={{ fontSize: 20, color: "#fff", marginBottom: 24 }}>
                        Lock in your territory today.<br />
                        <span style={{ color: "#e94560" }}>Storm season starts in May.</span>
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