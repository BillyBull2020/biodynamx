"use client";
// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX ADVANTAGE VAULT — 21 Flip Cards
// Front = red (old/competitor pain). Flip = gold BioDynamX solution.
// Hover to flip on desktop. Tap to flip on mobile.
// IntersectionObserver stagger entrance — zero GSAP scroll pinning.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";

const CARDS = [
    { icon: "🎙️", title: "Interface", pain: "Antiquated Chatbots (Typing)", gain: "100% Live Voice AI (Speaking)" },
    { icon: "🔱", title: "Architecture", pain: "Single-Path Chatbots", gain: "IronClaw Multi-Agent Core" },
    { icon: "🧠", title: "Visuals", pain: "Static Stock Photos", gain: "Nano Banana 2 (Dual-Coding)" },
    { icon: "⚡", title: "Response", pain: "15–30 Second Latency", gain: "< 1 Second (Native Audio)" },
    { icon: "🛡️", title: "Branding", pain: "'Powered by Vendor' Logos", gain: "Absolute Brand Secrecy" },
    { icon: "💡", title: "Psychology", pain: "Generic Prompting", gain: "Neurobiology & SPIN Native" },
    { icon: "💰", title: "Pricing", pain: "15% Revenue / Usage Tax", gain: "$1,497 / 90-Day Trial" },
    { icon: "🤖", title: "Autonomy", pain: "Semi-Automated Bots", gain: "Fully Agentic / Self-Nav" },
    { icon: "🔒", title: "Trust", pain: "No Guarantees", gain: "Triple-Lock 5X ROI Guarantee" },
    { icon: "🌐", title: "Availability", pain: "Human (9–5 / M–F)", gain: "Universal (24/7/365)" },
    { icon: "🎵", title: "Latency", pain: "Text-to-Speech Lag", gain: "Live Flash Native Audio" },
    { icon: "📍", title: "Local SEO", pain: "Manual Updates", gain: "Free AI GMB Optimization" },
    { icon: "📱", title: "Social Media", pain: "Expensive Agencies", gain: "24/7 AI Social Admin (Iris)" },
    { icon: "🔍", title: "AI Visibility", pain: "Zero Presence", gain: "GEO/AEO Indexing Ready" },
    { icon: "⭐", title: "Reviews", pain: "Forgotten Customers", gain: "AI List Reactivation" },
    { icon: "📲", title: "Inbound", pain: "Voicemail / Missed", gain: "Instant AI Textback/Callback" },
    { icon: "🔐", title: "Security", pain: "Standard Encryption", gain: "AES-256 Military Grade" },
    { icon: "🎯", title: "Strategy", pain: "Reactive Support", gain: "Quarterly Neuro-Audits" },
    { icon: "🧬", title: "Intelligence", pain: "Basic LLM Wrappers", gain: "Vertex AI Enterprise Logic" },
    { icon: "⚙️", title: "Integration", pain: "Manual Data Entry", gain: "1,000+ API Direct Syncs" },
    { icon: "🌌", title: "Experience", pain: "Boring UI/UX", gain: "Web 4.0 Immersive Vault" },
];

// ─────────────────────────────────────────────────────────────────────────────

function FlipCard({ card, index, visible }: {
    card: typeof CARDS[0];
    index: number;
    visible: boolean;
}) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div
            style={{
                perspective: "900px",
                height: 200,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.96)",
                transition: `opacity 0.55s ease ${index * 0.045}s, transform 0.55s ease ${index * 0.045}s`,
            }}
            onMouseEnter={() => setFlipped(true)}
            onMouseLeave={() => setFlipped(false)}
            onClick={() => setFlipped(f => !f)}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    transformStyle: "preserve-3d",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)",
                    cursor: "pointer",
                }}
            >
                {/* ── FRONT  (old/competitor — RED) ──────────────────────── */}
                <div
                    style={{
                        position: "absolute", inset: 0,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        borderRadius: 18,
                        background: "linear-gradient(145deg, rgba(20,6,6,0.96) 0%, rgba(12,4,4,0.98) 100%)",
                        border: "1px solid rgba(255,80,80,0.2)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                        padding: "20px 18px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Card number */}
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    }}>
                        <span style={{
                            fontSize: 9, fontWeight: 900,
                            color: "rgba(255,80,80,0.5)", letterSpacing: "0.12em",
                        }}>
                            {String(index + 1).padStart(2, "0")} / {CARDS.length}
                        </span>
                        <span style={{ fontSize: 22 }}>{card.icon}</span>
                    </div>

                    {/* Category */}
                    <div>
                        <div style={{
                            fontSize: 9, fontWeight: 900, color: "rgba(255,80,80,0.6)",
                            letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6,
                        }}>
                            {card.title}
                        </div>

                        {/* Pain line */}
                        <div style={{
                            fontSize: 13, fontWeight: 700, color: "#ff8080",
                            lineHeight: 1.4, marginBottom: 6,
                        }}>
                            ✗ {card.pain}
                        </div>

                        {/* Flip hint */}
                        <div style={{
                            fontSize: 9, fontWeight: 700,
                            color: "rgba(255,255,255,0.15)", letterSpacing: "0.08em",
                        }}>
                            HOVER TO SEE THE SOLUTION →
                        </div>
                    </div>

                    {/* Red top-border glow */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                        background: "linear-gradient(90deg, transparent, rgba(255,80,80,0.6), transparent)",
                        borderRadius: "18px 18px 0 0",
                    }} />
                </div>

                {/* ── BACK  (BioDynamX solution — GOLD) ──────────────────── */}
                <div
                    style={{
                        position: "absolute", inset: 0,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        borderRadius: 18,
                        background: "linear-gradient(145deg, rgba(18,14,2,0.97) 0%, rgba(10,8,0,0.98) 100%)",
                        border: "1px solid rgba(255,215,0,0.35)",
                        boxShadow: "0 0 30px rgba(255,215,0,0.12), 0 4px 24px rgba(0,0,0,0.5)",
                        padding: "20px 18px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Card number */}
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    }}>
                        <span style={{
                            fontSize: 9, fontWeight: 900,
                            color: "rgba(255,215,0,0.45)", letterSpacing: "0.12em",
                        }}>
                            {String(index + 1).padStart(2, "0")} / {CARDS.length}
                        </span>
                        <span style={{ fontSize: 22, filter: "drop-shadow(0 0 8px rgba(255,215,0,0.6))" }}>
                            {card.icon}
                        </span>
                    </div>

                    {/* Category */}
                    <div>
                        <div style={{
                            fontSize: 9, fontWeight: 900, color: "#FFD700",
                            letterSpacing: "0.16em", textTransform: "uppercase",
                            marginBottom: 8,
                        }}>
                            ✓ BioDynamX
                        </div>

                        {/* Gain line */}
                        <div style={{
                            fontSize: 15, fontWeight: 900,
                            color: "#FFD700", lineHeight: 1.35,
                        }}>
                            {card.gain}
                        </div>
                    </div>

                    {/* Gold top-border glow */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                        background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.8), transparent)",
                        borderRadius: "18px 18px 0 0",
                    }} />
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdvantageVault() {
    const gridRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [allFlipped, setAllFlipped] = useState(false);

    // IntersectionObserver — fires when the grid enters the viewport
    useEffect(() => {
        const el = gridRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section style={{ padding: "80px 0 80px", position: "relative" }}>

            {/* Ambient background glow */}
            <div style={{
                position: "absolute", top: "30%", left: "50%",
                transform: "translateX(-50%)",
                width: 800, height: 500,
                background: "radial-gradient(ellipse, rgba(255,215,0,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* ── HEADER ──────────────────────────────────────────────── */}
            <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto", padding: "0 24px 56px" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(255,215,0,0.07)",
                    border: "1px solid rgba(255,215,0,0.25)",
                    borderRadius: 30, padding: "6px 20px", marginBottom: 24,
                    fontSize: 10, fontWeight: 900, color: "#FFD700",
                    letterSpacing: "0.16em", textTransform: "uppercase",
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#FFD700", display: "inline-block",
                        boxShadow: "0 0 8px #FFD700",
                        animation: "av-blink 1.4s ease-in-out infinite",
                    }} />
                    The BioDynamX Advantage
                </div>

                <h2 style={{
                    fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 900,
                    color: "#fff", margin: "0 0 14px", lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                }}>
                    Why We&apos;re the{" "}
                    <span style={{
                        background: "linear-gradient(135deg,#FFD700 0%,#fbbf24 50%,#f97316 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        New Gold Standard.
                    </span>
                </h2>
                <p style={{
                    color: "rgba(255,255,255,0.45)", fontSize: 16,
                    margin: "0 0 28px", lineHeight: 1.7,
                }}>
                    21 reasons we&apos;re in a category of one.{" "}
                    <span style={{ color: "rgba(255,215,0,0.5)" }}>Hover each card to reveal the solution.</span>
                </p>

                {/* Flip all toggle */}
                <button
                    onClick={() => setAllFlipped(f => !f)}
                    style={{
                        background: allFlipped ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                        border: allFlipped ? "1px solid rgba(255,215,0,0.4)" : "1px solid rgba(255,255,255,0.12)",
                        color: allFlipped ? "#FFD700" : "rgba(255,255,255,0.5)",
                        borderRadius: 30, padding: "8px 22px",
                        fontSize: 11, fontWeight: 800, cursor: "pointer",
                        letterSpacing: "0.08em", transition: "all 0.3s",
                        outline: "none",
                    }}
                >
                    {allFlipped ? "↺ Show Old Way" : "⚡ Reveal All Solutions"}
                </button>
            </div>

            {/* ── 21 FLIP CARDS GRID ──────────────────────────────────── */}
            <div
                ref={gridRef}
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 45vw), 1fr))",
                    gap: 16,
                    padding: "0 clamp(12px,4vw,60px)",
                    maxWidth: 1300,
                    margin: "0 auto",
                    WebkitTransform: "translateZ(0)",  /* iOS Safari 3D fix */
                }}
            >
                {CARDS.map((card, i) => (
                    <FlipCardControlled
                        key={card.title}
                        card={card}
                        index={i}
                        visible={visible}
                        forceFlipped={allFlipped}
                    />
                ))}
            </div>

            {/* ── SCORE STRIP ─────────────────────────────────────────── */}
            <div style={{
                margin: "48px clamp(16px,4vw,60px) 0",
                maxWidth: 1300,
                marginLeft: "auto",
                marginRight: "auto",
                background: "rgba(255,215,0,0.04)",
                border: "1px solid rgba(255,215,0,0.15)",
                borderRadius: 16,
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: "#ff6b6b" }}>0</div>
                        <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,107,107,0.6)", letterSpacing: "0.12em" }}>COMPETITORS</div>
                    </div>
                    <div style={{
                        width: 1, height: 40,
                        background: "rgba(255,255,255,0.1)",
                    }} />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: "#FFD700" }}>21</div>
                        <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,215,0,0.6)", letterSpacing: "0.12em" }}>BIODYNAMX WINS</div>
                    </div>
                </div>

                <div style={{
                    fontSize: 13, color: "rgba(255,255,255,0.4)",
                    maxWidth: 420, lineHeight: 1.6,
                }}>
                    Every single dimension of modern AI business infrastructure —
                    BioDynamX wins outright. There is no category of competition.
                </div>

                <a
                    href="/pricing"
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "#FFD700", color: "#000",
                        borderRadius: 12, padding: "12px 24px",
                        fontSize: 13, fontWeight: 900, textDecoration: "none",
                        boxShadow: "0 0 30px rgba(255,215,0,0.3)",
                        letterSpacing: "-0.01em", whiteSpace: "nowrap",
                    }}
                >
                    Join the Standard →
                </a>
            </div>

            <style>{`
                @keyframes av-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                /* Mobile: show TAP instead of HOVER */
                @media (hover: none) {
                    .av-flip-hint::after { content: 'TAP TO FLIP →'; }
                    .av-flip-hint { font-size: 0; }
                    .av-flip-hint::after {
                        font-size: 9px;
                        font-weight: 700;
                        color: rgba(255,215,0,0.3);
                        letter-spacing: 0.08em;
                    }
                }
            `}</style>
        </section>
    );
}

// ── Controlled flip card (responds to forceFlipped toggle) ─────────────────
function FlipCardControlled({ card, index, visible, forceFlipped }: {
    card: typeof CARDS[0];
    index: number;
    visible: boolean;
    forceFlipped: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const [tapped, setTapped] = useState(false);
    const isFlipped = forceFlipped || hovered || tapped;

    return (
        <div
            style={{
                perspective: "900px",
                height: 200,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.96)",
                transition: `opacity 0.55s ease ${index * 0.04}s, transform 0.55s ease ${index * 0.04}s`,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => setTapped(t => !t)}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%", height: "100%",
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)",
                    cursor: "pointer",
                }}
            >
                {/* FRONT */}
                <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    borderRadius: 18,
                    background: "linear-gradient(145deg, rgba(20,6,6,0.96), rgba(12,4,4,0.98))",
                    border: "1px solid rgba(255,80,80,0.2)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
                    padding: "20px 18px",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,80,80,0.45)", letterSpacing: "0.12em" }}>
                            {String(index + 1).padStart(2, "0")} / {CARDS.length}
                        </span>
                        <span style={{ fontSize: 22 }}>{card.icon}</span>
                    </div>
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,80,80,0.55)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
                            {card.title}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#ff8080", lineHeight: 1.4, marginBottom: 8 }}>
                            ✗ {card.pain}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.13)", letterSpacing: "0.08em" }} className="av-flip-hint">
                            HOVER TO REVEAL →
                        </div>
                    </div>
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                        background: "linear-gradient(90deg, transparent, rgba(255,80,80,0.5), transparent)",
                        borderRadius: "18px 18px 0 0",
                    }} />
                </div>

                {/* BACK */}
                <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    borderRadius: 18,
                    background: "linear-gradient(145deg, rgba(18,14,2,0.97), rgba(10,8,0,0.98))",
                    border: "1px solid rgba(255,215,0,0.35)",
                    boxShadow: "0 0 30px rgba(255,215,0,0.12), 0 4px 24px rgba(0,0,0,0.5)",
                    padding: "20px 18px",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,215,0,0.4)", letterSpacing: "0.12em" }}>
                            {String(index + 1).padStart(2, "0")} / {CARDS.length}
                        </span>
                        <span style={{ fontSize: 22, filter: "drop-shadow(0 0 8px rgba(255,215,0,0.6))" }}>{card.icon}</span>
                    </div>
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>
                            ✓ BioDynamX
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#FFD700", lineHeight: 1.35 }}>
                            {card.gain}
                        </div>
                    </div>
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                        background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.8), transparent)",
                        borderRadius: "18px 18px 0 0",
                    }} />
                </div>
            </div>
        </div>
    );
}
