"use client";

/**
 * ComparisonReveal — BioDynamX
 *
 * Pattern: GSAP "pin within section"
 * The section wraps a tall outer div so the browser gives it scroll room.
 * A sticky inner div stays at height:100vh.
 * Each row of the comparison table is revealed one-by-one as the user scrolls.
 * This gives the feeling of purpose — every scroll reveals an intentional beat.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const ROWS = [
    { icon: "🎙️", cat: "Interface", them: "Chatbots · Typing", us: "100% Live Voice AI" },
    { icon: "⚡", cat: "Response", them: "15–30s Latency", us: "< 1 Second · Native Audio" },
    { icon: "🧠", cat: "Psychology", them: "Generic Prompting", us: "Neurobiology + SPIN Native" },
    { icon: "🌐", cat: "Availability", them: "9-5 / M-F", us: "24/7/365 · Autonomous" },
    { icon: "🔒", cat: "Trust", them: "No Guarantees", us: "Triple-Lock 5X ROI" },
    { icon: "💰", cat: "Pricing", them: "15% Revenue Tax", us: "$1,497 · 90-Day Trial" },
    { icon: "🔍", cat: "AI Visibility", them: "Zero Presence", us: "GEO/AEO Indexed" },
    { icon: "🛡️", cat: "Security", them: "Standard Encryption", us: "AES-256 Military Grade" },
    { icon: "🧬", cat: "Intelligence", them: "Basic LLM Wrappers", us: "Vertex AI Enterprise" },
    { icon: "🤖", cat: "Autonomy", them: "Semi-Automated Bots", us: "Fully Agentic / Self-Nav" },
    { icon: "📍", cat: "Local SEO", them: "Manual Updates", us: "Free AI GMB Optimization" },
];

export default function ComparisonReveal() {
    const outerRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    const labelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const ctx = gsap.context(() => {
            // Each row starts hidden, clips from left
            gsap.set(rowRefs.current, { opacity: 0, x: -40, scale: 0.96 });

            // Pin the sticky inner + reveal rows as scroll progresses
            ScrollTrigger.create({
                trigger: outerRef.current,
                pin: stickyRef.current,
                start: "top top",
                end: `+=${ROWS.length * 120}`,
                scrub: false,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const idx = Math.floor(progress * ROWS.length);
                    // reveal up to current index
                    rowRefs.current.forEach((el, i) => {
                        if (!el) return;
                        if (i <= idx) {
                            gsap.to(el, { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: "power2.out", overwrite: true });
                        }
                    });
                },
                invalidateOnRefresh: true,
                anticipatePin: 1,
            });

            // Header entrance
            gsap.from(labelRef.current, {
                y: 40, opacity: 0, duration: 1, ease: "power3.out",
                scrollTrigger: { trigger: outerRef.current, start: "top 80%", once: true },
            });

        }, outerRef);

        return () => ctx.revert();
    }, []);

    return (
        /* Outer = scroll room: 1 baseline + ROWS × step */
        <div
            ref={outerRef}
            style={{ height: `calc(100vh + ${ROWS.length * 120}px)`, position: "relative" }}
        >
            {/* Sticky viewport */}
            <div
                ref={stickyRef}
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 32px",
                    background: "linear-gradient(180deg, #030308 0%, rgba(0,10,5,0.98) 100%)",
                }}
            >
                {/* Ambient glow */}
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: "radial-gradient(ellipse at 60% 40%, rgba(0,255,65,0.06) 0%, transparent 65%)",
                }} />

                <div style={{ maxWidth: 960, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>

                    {/* Header */}
                    <div ref={labelRef} style={{ textAlign: "center", marginBottom: 32 }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.2)",
                            padding: "6px 18px", borderRadius: 100, marginBottom: 16,
                        }}>
                            <span style={{ color: "#00ff41", fontSize: 10, fontWeight: 800, letterSpacing: "0.14em" }}>THE BIODYNAMX ADVANTAGE</span>
                        </div>
                        <h2 style={{
                            fontSize: "clamp(28px, 4vw, 52px)",
                            fontWeight: 900, margin: "0 0 8px",
                            background: "linear-gradient(135deg, #fff 40%, rgba(0,255,65,0.9))",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        }}>
                            Why We&apos;re Light-Years Ahead.
                        </h2>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                            Scroll to reveal each dimension of superiority.
                        </p>
                    </div>

                    {/* Column headers */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 120px 1fr",
                        padding: "8px 20px 12px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        marginBottom: 4,
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,100,100,0.6)", letterSpacing: "0.12em" }}>THE COMPETITION</div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textAlign: "center" }}>CATEGORY</div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#00ff41", letterSpacing: "0.12em", textAlign: "right" }}>BIODYNAMX 4.1</div>
                    </div>

                    {/* Rows - revealed one by one via GSAP */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {ROWS.map((r, i) => (
                            <div
                                key={r.cat}
                                ref={el => { rowRefs.current[i] = el; }}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 120px 1fr",
                                    alignItems: "center",
                                    padding: "11px 20px",
                                    borderRadius: 12,
                                    background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.2)",
                                    border: "1px solid rgba(255,255,255,0.04)",
                                    willChange: "transform, opacity",
                                    transition: "border-color 0.2s",
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,255,65,0.2)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.04)"; }}
                            >
                                {/* Competition */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,120,120,0.7)" }}>
                                    <span style={{ color: "rgba(255,80,80,0.5)", fontSize: 11 }}>✗</span>
                                    {r.them}
                                </div>

                                {/* Category */}
                                <div style={{
                                    textAlign: "center", fontSize: 10, fontWeight: 700,
                                    color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em",
                                    textTransform: "uppercase", display: "flex", flexDirection: "column",
                                    alignItems: "center", gap: 3,
                                }}>
                                    <span style={{ fontSize: 16 }}>{r.icon}</span>
                                    {r.cat}
                                </div>

                                {/* Us */}
                                <div style={{
                                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                                    gap: 8, fontSize: 13, fontWeight: 700, color: "#fff",
                                }}>
                                    {r.us}
                                    <span style={{ color: "#00ff41", fontSize: 11, flexShrink: 0 }}>✓</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
