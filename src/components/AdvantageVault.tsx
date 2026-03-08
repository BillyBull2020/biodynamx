"use client";
// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX ADVANTAGE VAULT — GSAP Pinned Horizontal Kinetic Stack
// ALL devices: GSAP ScrollTrigger pin + scrub. Scroll down = cards fly left.
// Intro wiggle on first view. Gold glow. Progress bar. Card counter.
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

export default function AdvantageVault() {
    const sectionRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const hintRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [activeCard, setActiveCard] = useState(0);
    const [hintVisible, setHintVisible] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;
        let gsapCtx: { revert?: () => void } = {};

        (async () => {
            const { default: gsap } = await import("gsap");
            const { ScrollTrigger } = await import("gsap/ScrollTrigger");
            gsap.registerPlugin(ScrollTrigger);

            const section = sectionRef.current;
            const track = trackRef.current;
            if (!section || !track) return;

            // Wait one frame for layout
            await new Promise(r => requestAnimationFrame(r));

            const ctx = gsap.context(() => {
                const totalScroll = track.scrollWidth - window.innerWidth;
                if (totalScroll <= 0) return;

                // ── INTRO WIGGLE: hint that cards move sideways ──────────────────
                gsap.timeline({ delay: 0.6 })
                    .to(track, { x: -90, duration: 0.7, ease: "power2.inOut" })
                    .to(track, { x: 0, duration: 0.7, ease: "power2.inOut" })
                    .to(hintRef.current, { opacity: 1, y: 0, duration: 0.4 }, "<0.3");

                // ── PINNED HORIZONTAL SCRUB ──────────────────────────────────────
                gsap.to(track, {
                    x: -totalScroll,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        pin: true,
                        pinSpacing: true,
                        scrub: 1.4,
                        end: () => `+=${totalScroll}`,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            setProgress(self.progress);
                            setActiveCard(Math.round(self.progress * (CARDS.length - 1)));
                            // Hide the scroll-hint once they start using it
                            if (self.progress > 0.02) setHintVisible(false);
                        },
                    },
                });

                // ── PER-CARD ENTRANCE SCALE ──────────────────────────────────────
                // (happens via the active card state + class)
            }, sectionRef);

            gsapCtx.revert = () => ctx.revert();
        })();

        return () => gsapCtx.revert?.();
    }, []);

    const CARD_W = 300;

    return (
        <section
            ref={sectionRef}
            style={{
                position: "relative",
                overflow: "hidden",
                background: "transparent",
            }}
        >
            {/* ── HEADER ─────────────────────────────────────────────────────── */}
            <div style={{
                textAlign: "center",
                maxWidth: 700,
                margin: "0 auto",
                padding: "80px 24px 48px",
            }}>
                {/* Gold badge */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(255,215,0,0.07)",
                    border: "1px solid rgba(255,215,0,0.25)",
                    borderRadius: 30, padding: "6px 18px", marginBottom: 20,
                    fontSize: 10, fontWeight: 800, color: "#FFD700",
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    backdropFilter: "blur(8px)",
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#FFD700", display: "inline-block",
                        boxShadow: "0 0 8px #FFD700",
                        animation: "bdx-badge-blink 1.4s ease-in-out infinite",
                    }} />
                    The BioDynamX Advantage
                </div>

                <h2 style={{
                    fontSize: "clamp(26px,4vw,44px)", fontWeight: 900,
                    color: "#fff", margin: "0 0 14px", lineHeight: 1.15,
                }}>
                    Why We&apos;re the{" "}
                    <span style={{
                        background: "linear-gradient(135deg,#FFD700 0%,#fbbf24 50%,#f97316 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        New Gold Standard.
                    </span>
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0, lineHeight: 1.7 }}>
                    21 reasons we&apos;re in a category of one. Scroll down to reveal each one.
                </p>
            </div>

            {/* ── SCROLL HINT ─────────────────────────────────────────────────── */}
            <div
                ref={hintRef}
                style={{
                    opacity: hintVisible ? 1 : 0,
                    transform: "translateY(6px)",
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                    textAlign: "center",
                    marginBottom: 32,
                    pointerEvents: "none",
                }}
            >
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: "rgba(255,215,0,0.06)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    borderRadius: 30, padding: "8px 20px",
                    color: "rgba(255,215,0,0.7)", fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.1em",
                    animation: "bdx-hint-pulse 2s ease-in-out infinite",
                }}>
                    <span style={{ animation: "bdx-bounce-down 1.2s ease-in-out infinite" }}>↓</span>
                    SCROLL DOWN — CARDS MOVE SIDEWAYS
                    <span style={{ animation: "bdx-bounce-right 1.2s ease-in-out infinite" }}>→</span>
                </div>
            </div>

            {/* ── CARD TRACK ──────────────────────────────────────────────────── */}
            <div style={{ padding: "0 40px 0", overflow: "visible" }}>
                <div
                    ref={trackRef}
                    style={{
                        display: "flex",
                        gap: 24,
                        willChange: "transform",
                        paddingBottom: 40,
                    }}
                >
                    {CARDS.map((card, i) => {
                        const isActive = i === activeCard;
                        return (
                            <div
                                key={card.title}
                                style={{
                                    minWidth: CARD_W,
                                    maxWidth: CARD_W,
                                    flex: "0 0 auto",
                                    background: isActive
                                        ? "rgba(255,215,0,0.07)"
                                        : "rgba(255,255,255,0.035)",
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                    borderRadius: 20,
                                    border: isActive
                                        ? "1px solid rgba(255,215,0,0.6)"
                                        : "1px solid rgba(255,215,0,0.15)",
                                    padding: "28px 24px",
                                    transform: isActive ? "scale(1.04) translateY(-6px)" : "scale(1)",
                                    boxShadow: isActive
                                        ? "0 0 40px rgba(255,215,0,0.2), 0 12px 48px rgba(0,0,0,0.5)"
                                        : "0 4px 20px rgba(0,0,0,0.25)",
                                    transition: "all 0.5s cubic-bezier(0.175,0.885,0.32,1.275)",
                                }}
                            >
                                {/* Card number */}
                                <div style={{
                                    fontSize: 10, fontWeight: 800, color: "rgba(255,215,0,0.4)",
                                    letterSpacing: "0.12em", marginBottom: 12,
                                }}>
                                    {String(i + 1).padStart(2, "0")} / {CARDS.length}
                                </div>

                                {/* Icon */}
                                <div style={{
                                    fontSize: 30, marginBottom: 12, lineHeight: 1,
                                    filter: isActive ? "drop-shadow(0 0 8px rgba(255,215,0,0.5))" : "none",
                                    transition: "filter 0.4s",
                                }}>
                                    {card.icon}
                                </div>

                                {/* Title */}
                                <h4 style={{
                                    fontSize: 11, fontWeight: 800,
                                    color: isActive ? "#FFD700" : "rgba(255,255,255,0.4)",
                                    letterSpacing: "0.14em", textTransform: "uppercase",
                                    margin: "0 0 18px",
                                    transition: "color 0.4s",
                                }}>
                                    {card.title}
                                </h4>

                                {/* Pain */}
                                <div style={{
                                    display: "block", color: "#ff6b6b",
                                    fontSize: 13, marginBottom: 14,
                                    lineHeight: 1.5, paddingBottom: 14,
                                    borderBottom: "1px solid rgba(255,107,107,0.12)",
                                }}>
                                    <span style={{ fontWeight: 900, marginRight: 6 }}>✗</span>
                                    {card.pain}
                                </div>

                                {/* Gain */}
                                <div style={{
                                    display: "block",
                                    color: isActive ? "#FFD700" : "#d4a500",
                                    fontSize: 15, fontWeight: 800, lineHeight: 1.4,
                                    transition: "color 0.4s",
                                }}>
                                    <span style={{ marginRight: 6 }}>✓</span>
                                    {card.gain}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── PROGRESS BAR ────────────────────────────────────────────────── */}
            <div style={{ padding: "0 40px 48px" }}>
                {/* Counter */}
                <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                }}>
                    <span style={{ fontSize: 11, color: "rgba(255,215,0,0.5)", fontWeight: 700, letterSpacing: "0.1em" }}>
                        THE BIODYNAMX ADVANTAGE
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,215,0,0.7)", fontWeight: 800, letterSpacing: "0.06em" }}>
                        {String(activeCard + 1).padStart(2, "0")} / {CARDS.length}
                    </span>
                </div>

                {/* Track */}
                <div style={{
                    width: "100%", height: 3,
                    background: "rgba(255,215,0,0.1)",
                    borderRadius: 3, overflow: "hidden",
                }}>
                    <div style={{
                        height: "100%",
                        width: `${progress * 100}%`,
                        background: "linear-gradient(90deg, #f97316 0%, #FFD700 100%)",
                        borderRadius: 3,
                        boxShadow: "0 0 10px rgba(255,215,0,0.6)",
                        transition: "width 0.15s linear",
                    }} />
                </div>

                {/* Dot navigation */}
                <div style={{
                    display: "flex", gap: 6, justifyContent: "center",
                    marginTop: 20, flexWrap: "wrap",
                }}>
                    {CARDS.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: i === activeCard ? 20 : 6,
                                height: 6,
                                borderRadius: 3,
                                background: i === activeCard
                                    ? "#FFD700"
                                    : i < activeCard
                                        ? "rgba(255,215,0,0.4)"
                                        : "rgba(255,255,255,0.12)",
                                transition: "all 0.3s ease",
                                boxShadow: i === activeCard ? "0 0 8px #FFD700" : "none",
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* ── CSS ANIMATIONS ──────────────────────────────────────────────── */}
            <style>{`
                @keyframes bdx-hint-pulse {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }
                @keyframes bdx-bounce-down {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(3px); }
                }
                @keyframes bdx-bounce-right {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(3px); }
                }
            `}</style>
        </section>
    );
}
