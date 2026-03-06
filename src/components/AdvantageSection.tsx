"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const ROWS = [
    { label: "Interface", comp: "Antiquated Chatbots (Typing)", us: "100% Live Voice AI (Speaking)", icon: "🎙️" },
    { label: "Architecture", comp: "Single-Path Chatbots", us: "IronClaw Multi-Agent Core", icon: "🔱" },
    { label: "Visuals", comp: "Static Stock Photos", us: "Nana Banana 2 (Dual-Coding)", icon: "🧠" },
    { label: "Response", comp: "15-30 Second Latency", us: "< 1 Second (Native Audio)", icon: "⚡" },
    { label: "Branding", comp: "'Powered by Vendor' Logos", us: "Absolute Brand Secrecy", icon: "🛡️" },
    { label: "Psychology", comp: "Generic Prompting", us: "Neurobiology & SPIN Native", icon: "💡" },
    { label: "Pricing", comp: "15% Revenue / Usage Tax", us: "$1,497 / 90-Day Trial", icon: "💰" },
    { label: "Autonomy", comp: "Semi-Automated Bots", us: "Fully Agentic / Self-Nav", icon: "🤖" },
    { label: "Trust", comp: "No Guarantees", us: "Triple-Lock 5X ROI Guarantee", icon: "🔒" },
    { label: "Availability", comp: "Human (9-5/M-F)", us: "Universal (24/7/365)", icon: "🌐" },
    { label: "Latency", comp: "Text-to-Speech Lag", us: "Live Flash Native Audio", icon: "🎵" },
    { label: "Local SEO", comp: "Manual Updates", us: "Free AI GMB Optimization", icon: "📍" },
    { label: "Social Media", comp: "Expensive Agencies", us: "24/7 AI Social Admin (Iris)", icon: "📱" },
    { label: "AI Visibility", comp: "Zero Presence", us: "GEO/AEO Indexing Ready", icon: "🔍" },
    { label: "Reviews", comp: "Forgotten Customers", us: "AI List Reactivation", icon: "⭐" },
    { label: "Inbound", comp: "Voicemail / Missed", us: "Instant AI Textback/Callback", icon: "📲" },
    { label: "Security", comp: "Standard Encryption", us: "AES-256 Military Grade", icon: "🔐" },
    { label: "Strategy", comp: "Reactive Support", us: "Quarterly Neuro-Audits", icon: "🎯" },
    { label: "Intelligence", comp: "Basic LLM Wrappers", us: "Vertex AI Enterprise Logic", icon: "🧬" },
    { label: "Integration", comp: "Manual Data Entry", us: "1,000+ API Direct Syncs", icon: "⚙️" },
    { label: "Experience", comp: "Boring UI/UX", us: "Web 4.0 Immersive Vault", icon: "🌌" },
];

export default function AdvantageSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const headRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    const progressBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const ctx = gsap.context(() => {
            // Header entrance
            gsap.from(headRef.current, {
                y: 60, opacity: 0, duration: 1.2, ease: "power3.out",
                scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true }
            });

            // Rows stagger in
            rowRefs.current.forEach((el, i) => {
                if (!el) return;
                gsap.from(el, {
                    x: i % 2 === 0 ? -80 : 80,
                    opacity: 0,
                    duration: 0.7,
                    ease: "power2.out",
                    scrollTrigger: { trigger: el, start: "top 92%", once: true },
                    delay: (i % 4) * 0.07,
                });
            });

            // Progress bar tracking scroll through section
            if (progressBarRef.current) {
                gsap.to(progressBarRef.current, {
                    scaleX: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top center",
                        end: "bottom center",
                        scrub: true,
                    }
                });
            }
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="advantage"
            style={{
                padding: "120px 24px",
                background: "linear-gradient(180deg, rgba(0,255,65,0.02) 0%, rgba(0,0,0,0) 40%, rgba(0,255,65,0.015) 100%)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background neural grid */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "radial-gradient(circle, rgba(0,255,65,0.04) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                opacity: 0.5,
            }} />

            {/* Sticky progress bar */}
            <div style={{
                position: "sticky", top: 0, zIndex: 10,
                height: 3, background: "rgba(255,255,255,0.05)",
                marginBottom: 8,
            }}>
                <div
                    ref={progressBarRef}
                    style={{
                        height: "100%",
                        background: "linear-gradient(90deg, #00ff41, #3b82f6)",
                        transformOrigin: "left center",
                        transform: "scaleX(0)",
                        boxShadow: "0 0 12px rgba(0,255,65,0.6)",
                    }}
                />
            </div>

            <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 1 }}>

                {/* Section Header */}
                <div ref={headRef} style={{ textAlign: "center", marginBottom: 72 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.2)",
                        padding: "8px 20px", borderRadius: 100, marginBottom: 24,
                    }}>
                        <span style={{ color: "#00ff41", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em" }}>THE BIODYNAMX ADVANTAGE</span>
                    </div>
                    <h2 style={{
                        fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 900, lineHeight: 1.05,
                        margin: "0 0 20px",
                        background: "linear-gradient(135deg, #fff 30%, rgba(0,255,65,0.9) 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        Why We&apos;re the New Gold Standard.
                    </h2>
                    <p style={{
                        fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.55)",
                        maxWidth: 640, margin: "0 auto", lineHeight: 1.7,
                    }}>
                        Most AI companies give you a chatbot. We give you an autonomous workforce backed by the <strong style={{ color: "#fff" }}>Neurobiology of Choice</strong>. Here is why we are light-years ahead.
                    </p>
                </div>

                {/* Column Headers */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "56px 1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 12,
                    padding: "0 12px",
                }}>
                    <div />
                    <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em", textAlign: "center" }}>CATEGORY</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,100,100,0.6)", letterSpacing: "0.14em", textAlign: "center" }}>THE COMPETITION</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#00ff41", letterSpacing: "0.14em", textAlign: "center" }}>BIODYNAMX 4.1</div>
                </div>

                {/* Comparison Rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ROWS.map((row, i) => (
                        <div
                            key={row.label}
                            ref={el => { rowRefs.current[i] = el; }}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "56px 1fr 1fr 1fr",
                                gap: 8,
                                alignItems: "center",
                                borderRadius: 16,
                                overflow: "hidden",
                                background: i % 2 === 0
                                    ? "rgba(255,255,255,0.02)"
                                    : "rgba(0,0,0,0.2)",
                                border: "1px solid rgba(255,255,255,0.05)",
                                transition: "border-color 0.3s, box-shadow 0.3s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,255,65,0.25)";
                                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,255,65,0.08)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
                                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                            }}
                        >
                            {/* Icon cell */}
                            <div style={{
                                fontSize: 22, textAlign: "center", padding: "18px 0",
                                borderRight: "1px solid rgba(255,255,255,0.05)",
                            }}>
                                {row.icon}
                            </div>

                            {/* Label cell */}
                            <div style={{
                                padding: "14px 16px",
                                fontSize: 11, fontWeight: 800,
                                color: "rgba(255,255,255,0.4)",
                                letterSpacing: "0.1em", textTransform: "uppercase",
                                borderRight: "1px solid rgba(255,255,255,0.05)",
                            }}>
                                {row.label}
                            </div>

                            {/* Competition cell */}
                            <div style={{
                                padding: "14px 16px",
                                fontSize: 13, fontWeight: 500,
                                color: "rgba(255,130,130,0.7)",
                                textAlign: "center",
                                borderRight: "1px solid rgba(255,255,255,0.05)",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            }}>
                                <span style={{ opacity: 0.5 }}>✗</span> {row.comp}
                            </div>

                            {/* BioDynamX cell */}
                            <div style={{
                                padding: "14px 16px",
                                fontSize: 14, fontWeight: 800,
                                color: "#fff",
                                textAlign: "center",
                                background: "rgba(0,255,65,0.03)",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            }}>
                                <span style={{ color: "#00ff41", fontSize: 12 }}>✓</span>
                                <span>{row.us}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div style={{
                    marginTop: 64, textAlign: "center",
                    padding: "48px 32px",
                    background: "linear-gradient(135deg, rgba(0,255,65,0.06), rgba(59,130,246,0.06))",
                    border: "1px solid rgba(0,255,65,0.15)",
                    borderRadius: 32,
                    backdropFilter: "blur(12px)",
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#00ff41", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>The Investment</div>
                    <h3 style={{
                        fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, marginBottom: 16,
                        background: "linear-gradient(135deg, #fff, rgba(0,255,65,0.9))",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        A Full Workforce for $1,497/mo.
                    </h3>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.7 }}>
                        Valued at $10,000+/mo in human labor. Includes all 11 agents, Free GMB Optimization, Social Media Admin, and our Triple-Lock 5X ROI Guarantee.
                    </p>
                    <div style={{
                        display: "inline-flex", flexDirection: "column", alignItems: "center",
                        background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.25)",
                        padding: "28px 48px", borderRadius: 24,
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#22c55e", letterSpacing: "0.1em", marginBottom: 8 }}>LIMITED ELITE OFFER</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>90-Day Trial Deal</div>
                        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", marginTop: 8 }}>
                            Get 50% Off your first 3 months. Only <strong style={{ color: "#fff" }}>$748/mo</strong>.
                        </div>
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            style={{
                                marginTop: 24, padding: "16px 40px", borderRadius: 12,
                                background: "#00ff41", color: "#000",
                                fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer",
                                boxShadow: "0 10px 30px rgba(0,255,65,0.3)",
                                transition: "transform 0.2s, box-shadow 0.2s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 40px rgba(0,255,65,0.4)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 30px rgba(0,255,65,0.3)";
                            }}
                        >
                            Claim My 90-Day Trial Offer →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
