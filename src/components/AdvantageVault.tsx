"use client";
// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX ADVANTAGE VAULT — 21 Swarm-Activated Flip Cards
// ──────────────────────────────────────────────────────────────────
// The 21 cards are now an Active Swarm Dashboard:
//  - Individual IntersectionObserver per card (threshold 0.85)
//  - As each card scrolls into view → assigned agent auto-flips it
//  - Dock status broadcasts the agent working on that card
//  - Haptic collab ping fires on mobile for each auto-flip
//  - Hover / tap still works for manual flip
//  - "Reveal All" toggle preserved
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from "react";
import { NeuralMemory } from "@/lib/neural-memory";
import { hapticCollabPing } from "@/lib/haptic";

// Agent assignment mirrors the Ironclaw team:
// Each card is "owned" by the most relevant specialist.
const CARDS = [
    { icon: "🎙️", title: "Interface", pain: "Antiquated Chatbots (Typing)", gain: "100% Live Voice AI (Speaking)", agent: "Jenny", agentTask: "activating voice neural interface" },
    { icon: "🔱", title: "Architecture", pain: "Single-Path Chatbots", gain: "IronClaw Multi-Agent Core", agent: "Jules", agentTask: "deploying multi-agent architecture" },
    { icon: "🧠", title: "Visuals", pain: "Static Stock Photos", gain: "Dual-Coding Visual Engine", agent: "Iris", agentTask: "running dual-coding visual sync" },
    { icon: "⚡", title: "Response", pain: "15–30 Second Latency", gain: "< 1 Second (Native Audio)", agent: "Brock", agentTask: "benchmarking sub-second latency" },
    { icon: "🛡️", title: "Branding", pain: "'Powered by Vendor' Logos", gain: "Absolute Brand Secrecy", agent: "Brock", agentTask: "verifying brand secrecy protocol" },
    { icon: "💡", title: "Psychology", pain: "Generic Prompting", gain: "Neurobiology & SPIN Native", agent: "Jenny", agentTask: "encoding neuro-sales triggers" },
    { icon: "💰", title: "Pricing", pain: "15% Revenue / Usage Tax", gain: "$1,497 / 90-Day Trial", agent: "Mark", agentTask: "calculating ROI advantage" },
    { icon: "🤖", title: "Autonomy", pain: "Semi-Automated Bots", gain: "Fully Agentic / Self-Nav", agent: "Jules", agentTask: "initializing autonomous agent logic" },
    { icon: "🔒", title: "Trust", pain: "No Guarantees", gain: "Triple-Lock 5X ROI Guarantee", agent: "Mark", agentTask: "locking in 5x ROI guarantee terms" },
    { icon: "🌐", title: "Availability", pain: "Human (9–5 / M–F)", gain: "Universal (24/7/365)", agent: "Alex", agentTask: "scheduling 24/7 coverage deployment" },
    { icon: "🎵", title: "Latency", pain: "Text-to-Speech Lag", gain: "Live Flash Native Audio", agent: "Jenny", agentTask: "streaming native audio benchmark" },
    { icon: "📍", title: "Local SEO", pain: "Manual Updates", gain: "Free AI GMB Optimization", agent: "Ben", agentTask: "optimizing GMB local search rank" },
    { icon: "📱", title: "Social Media", pain: "Expensive Agencies", gain: "24/7 AI Social Admin (Iris)", agent: "Iris", agentTask: "scheduling AI social content" },
    { icon: "🔍", title: "AI Visibility", pain: "Zero Presence", gain: "GEO/AEO Indexing Ready", agent: "Iris", agentTask: "indexing GEO/AEO signals" },
    { icon: "⭐", title: "Reviews", pain: "Forgotten Customers", gain: "AI List Reactivation", agent: "Ben", agentTask: "reactivating review pipeline" },
    { icon: "📲", title: "Inbound", pain: "Voicemail / Missed", gain: "Instant AI Textback/Callback", agent: "Meghan", agentTask: "routing inbound AI textback" },
    { icon: "🔐", title: "Security", pain: "Standard Encryption", gain: "AES-256 Military Grade", agent: "Brock", agentTask: "running AES-256 security audit" },
    { icon: "🎯", title: "Strategy", pain: "Reactive Support", gain: "Quarterly Neuro-Audits", agent: "Mark", agentTask: "scheduling quarterly neuro-audit" },
    { icon: "🧬", title: "Intelligence", pain: "Basic LLM Wrappers", gain: "Vertex AI Enterprise Logic", agent: "Jules", agentTask: "deploying Vertex AI enterprise logic" },
    { icon: "⚙️", title: "Integration", pain: "Manual Data Entry", gain: "1,000+ API Direct Syncs", agent: "Jules", agentTask: "syncing 1,000+ API endpoints" },
    { icon: "🌌", title: "Experience", pain: "Boring UI/UX", gain: "Web 4.0 Immersive Vault", agent: "Iris", agentTask: "rendering Web 4.0 immersive layer" },
];

// Agent → color mapping for glow effects
const AGENT_COLORS: Record<string, string> = {
    Jenny: "#00ff41",
    Mark: "#3b82f6",
    Jules: "#06b6d4",
    Ben: "#fbbf24",
    Iris: "#8b5cf6",
    Brock: "#dc2626",
    Meghan: "#a78bfa",
    Vicki: "#34d399",
    Alex: "#06b6d4",
    Chase: "#f97316",
};

// ─────────────────────────────────────────────────────────────────────────────
// FlipCard — Swarm-Controlled
// ─────────────────────────────────────────────────────────────────────────────

function FlipCardControlled({
    card,
    index,
    visible,
    forceFlipped,
    autoFlipped,
}: {
    card: typeof CARDS[0];
    index: number;
    visible: boolean;
    forceFlipped: boolean;
    autoFlipped: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const [tapped, setTapped] = useState(false);
    const isFlipped = forceFlipped || hovered || tapped || autoFlipped;
    const agentColor = AGENT_COLORS[card.agent] ?? "#FFD700";

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
                    transition: "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
                    cursor: "pointer",
                }}
            >
                {/* ── FRONT (pain — RED) ─────────────────────────────── */}
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

                {/* ── BACK (BioDynamX solution — GOLD) ─────────────── */}
                <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    borderRadius: 18,
                    background: "linear-gradient(145deg, rgba(18,14,2,0.97), rgba(10,8,0,0.98))",
                    border: `1px solid rgba(255,215,0,0.35)`,
                    boxShadow: `0 0 30px rgba(255,215,0,0.12), 0 4px 24px rgba(0,0,0,0.5)${autoFlipped ? `, 0 0 16px ${agentColor}30` : ""}`,
                    padding: "20px 18px",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    transition: "box-shadow 0.5s ease",
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

                    {/* Agent tag — shown on auto-flip */}
                    {autoFlipped && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 5,
                            marginTop: 6,
                            animation: "av-agent-in 0.3s ease",
                        }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: agentColor,
                                boxShadow: `0 0 6px ${agentColor}`,
                                animation: "av-blink 1.8s ease-in-out infinite",
                            }} />
                            <span style={{
                                fontSize: 8, fontWeight: 700,
                                color: agentColor,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                opacity: 0.7,
                            }}>
                                {card.agent} · {card.agentTask}
                            </span>
                        </div>
                    )}

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
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AdvantageVault() {
    const gridRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [allFlipped, setAllFlipped] = useState(false);
    // Set of card indices that have been auto-flipped by the swarm
    const [autoFlippedSet, setAutoFlippedSet] = useState<Set<number>>(new Set());
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    // ── Grid entrance — IntersectionObserver ─────────────────────────
    useEffect(() => {
        const el = gridRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.05 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // ── Per-card IntersectionObserver — Swarm Auto-Flip ─────────────
    // Each card fires independently when scrolled into view (threshold 0.85).
    // On flip: broadcasts agent task to the Agent Dock via NeuralMemory.
    const setupCardObserver = useCallback((el: HTMLDivElement | null, index: number) => {
        if (!el) return;
        cardRefs.current[index] = el;

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                // Stagger the auto-flip slightly so it feels "alive", not mechanical
                setTimeout(() => {
                    const card = CARDS[index];

                    setAutoFlippedSet(prev => {
                        if (prev.has(index)) return prev;
                        const next = new Set(prev);
                        next.add(index);
                        return next;
                    });

                    // Broadcast to Agent Dock (status strip updates)
                    NeuralMemory.update({
                        scrollSection: "agents",
                        // Patch: we use agentDockOverride as a custom key
                    });
                    // Fire a custom event so AgentDock can pick it up
                    window.dispatchEvent(new CustomEvent("bdx:swarm-card-flip", {
                        detail: {
                            agentName: card.agent,
                            agentTask: card.agentTask,
                            cardTitle: card.title,
                            cardIndex: index,
                        },
                    }));

                    // Subtle haptic ping on mobile — subconscious confirmation
                    hapticCollabPing();

                }, index * 60); // 60ms stagger between cards

                obs.disconnect();
            },
            { threshold: 0.82 }
        );
        obs.observe(el);
    }, []);

    return (
        <section
            data-dock-section="agents"
            style={{ padding: "80px 0 80px", position: "relative" }}
        >
            {/* Ambient glow */}
            <div style={{
                position: "absolute", top: "30%", left: "50%",
                transform: "translateX(-50%)",
                width: 800, height: 500,
                background: "radial-gradient(ellipse, rgba(255,215,0,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* ── HEADER ─────────────────────────────────────────────── */}
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
                    <span style={{ color: "rgba(255,215,0,0.5)" }}>
                        Scroll to watch the Swarm validate each one in real time.
                    </span>
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

            {/* ── 21 FLIP CARDS GRID ────────────────────────────────── */}
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
                    <div
                        key={card.title}
                        ref={el => setupCardObserver(el, i)}
                    >
                        <FlipCardControlled
                            card={card}
                            index={i}
                            visible={visible}
                            forceFlipped={allFlipped}
                            autoFlipped={autoFlippedSet.has(i)}
                        />
                    </div>
                ))}
            </div>

            {/* ── SCORE STRIP ──────────────────────────────────────── */}
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
                    <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
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
                @keyframes av-agent-in {
                    from { opacity: 0; transform: translateY(4px); }
                    to   { opacity: 1; transform: none; }
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
