"use client";
// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX ADVANTAGE VAULT — 21-Card Horizontal Kinetic Stack
// Mobile/Tablet: touch swipe. Desktop: GSAP pinned horizontal scrub.
// Web 4.0 Glassmorphic standard. Gold accent. Dual-coding icons.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";

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
    const gsapCtx = useRef<{ revert?: () => void }>({});

    useEffect(() => {
        // Lazy-load GSAP only on desktop for perf
        if (typeof window === "undefined" || window.innerWidth <= 1024) return;

        let cleanup: (() => void) | undefined;

        (async () => {
            const gsapMod = await import("gsap");
            const stMod = await import("gsap/ScrollTrigger");
            const gsap = gsapMod.default || gsapMod.gsap;
            const ST = stMod.default || stMod.ScrollTrigger;
            gsap.registerPlugin(ST);

            const section = sectionRef.current;
            const track = trackRef.current;
            if (!section || !track) return;

            const cards = gsap.utils.toArray<HTMLElement>(".bdx-vault-card");
            const totalScroll = track.scrollWidth - section.clientWidth;

            const tween = gsap.to(track, {
                x: -totalScroll,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    pin: true,
                    scrub: 1.2,
                    end: () => "+=" + totalScroll,
                    invalidateOnRefresh: true,
                },
            });

            // Subtle scale entrance per card
            cards.forEach((card, i) => {
                gsap.fromTo(card,
                    { scale: 0.92, opacity: 0.5 },
                    {
                        scale: 1, opacity: 1, duration: 0.4,
                        scrollTrigger: {
                            trigger: card,
                            containerAnimation: tween,
                            start: "left center",
                            toggleActions: "play none none reverse",
                        },
                        delay: i * 0.03,
                    }
                );
            });

            gsapCtx.current.revert = () => { tween.scrollTrigger?.kill(); tween.kill(); };
            cleanup = gsapCtx.current.revert;
        })();

        return () => { if (cleanup) cleanup(); };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="biodynamx-advantage-vault"
            style={{ padding: "80px 0", overflow: "hidden", position: "relative" }}
        >
            {/* Background glow */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,215,0,0.03) 0%, transparent 70%)",
            }} />

            {/* Header */}
            <div style={{
                textAlign: "center", maxWidth: 700,
                margin: "0 auto 56px", padding: "0 24px",
            }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.25)",
                    borderRadius: 30, padding: "6px 18px", marginBottom: 20,
                    fontSize: 10, fontWeight: 800, color: "#FFD700",
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    backdropFilter: "blur(8px)",
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#FFD700", display: "inline-block",
                        boxShadow: "0 0 8px #FFD700",
                    }} />
                    The BioDynamX Advantage
                </div>

                <h2 style={{
                    fontSize: "clamp(26px,4vw,42px)", fontWeight: 900,
                    color: "#fff", margin: "0 0 16px",
                    lineHeight: 1.15,
                }}>
                    Why We&apos;re the{" "}
                    <span style={{
                        background: "linear-gradient(135deg, #FFD700 0%, #fbbf24 50%, #f97316 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        New Gold Standard.
                    </span>
                </h2>
                <p style={{
                    color: "rgba(255,255,255,0.55)", fontSize: 15,
                    lineHeight: 1.7, margin: 0,
                }}>
                    Swipe or scroll to compare us against the old way. Every point is provable.
                </p>
            </div>

            {/* Horizontal scroll wrapper */}
            <div
                ref={trackRef}
                className="bdx-vault-track"
                style={{
                    display: "flex",
                    gap: 24,
                    padding: "12px 40px 32px",
                    // Mobile/tablet: native touch swipe
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
                    scrollbarWidth: "none",
                    // GSAP will take over on desktop
                }}
            >
                {CARDS.map((card) => (
                    <div
                        key={card.title}
                        className="bdx-vault-card"
                        style={{
                            minWidth: 300,
                            maxWidth: 340,
                            flex: "0 0 auto",
                            scrollSnapAlign: "center",
                            background: "rgba(255,255,255,0.04)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            borderRadius: 20,
                            border: "1px solid rgba(255,215,0,0.22)",
                            padding: "28px 24px",
                            transition: "border-color 0.4s cubic-bezier(0.175,0.885,0.32,1.275), transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.4s",
                            cursor: "default",
                        }}
                        onMouseEnter={e => {
                            const el = e.currentTarget;
                            el.style.borderColor = "#FFD700";
                            el.style.transform = "scale(1.04) translateY(-4px)";
                            el.style.boxShadow = "0 0 32px rgba(255,215,0,0.18), 0 8px 40px rgba(0,0,0,0.4)";
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget;
                            el.style.borderColor = "rgba(255,215,0,0.22)";
                            el.style.transform = "";
                            el.style.boxShadow = "";
                        }}
                    >
                        {/* Icon */}
                        <div style={{ fontSize: 32, marginBottom: 14, lineHeight: 1 }}>{card.icon}</div>

                        {/* Title */}
                        <h4 style={{
                            fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)",
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            margin: "0 0 18px",
                        }}>
                            {card.title}
                        </h4>

                        {/* Pain */}
                        <div style={{
                            display: "block", color: "#ff6b6b",
                            fontSize: 13, marginBottom: 12,
                            lineHeight: 1.5,
                            paddingBottom: 12,
                            borderBottom: "1px solid rgba(255,107,107,0.15)",
                        }}>
                            <span style={{ marginRight: 6, fontWeight: 900 }}>✗</span>
                            {card.pain}
                        </div>

                        {/* Gain */}
                        <div style={{
                            display: "block", color: "#FFD700",
                            fontSize: 15, fontWeight: 800,
                            lineHeight: 1.4,
                        }}>
                            <span style={{ marginRight: 6 }}>✓</span>
                            {card.gain}
                        </div>
                    </div>
                ))}
            </div>

            {/* Hide scrollbar globally for this element */}
            <style>{`
                .bdx-vault-track::-webkit-scrollbar { display: none; }
                @media (max-width: 1024px) {
                    .bdx-vault-track { overflow-x: auto !important; }
                }
            `}</style>
        </section>
    );
}
