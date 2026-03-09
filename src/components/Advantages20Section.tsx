"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const ADVANTAGES = [
    { icon: "🎙️", title: "Dual-Agent Architecture", desc: "Jenny Voice + Jenny Visual (Nana Banana 2) synchronized in real-time.", color: "#6366f1" },
    { icon: "🏄", title: "Autonomous Site Navigation", desc: "Agents walk through your website with visitors — no human needed.", color: "#3b82f6" },
    { icon: "📍", title: "Free GMB Optimization", desc: "Ryan sets up your Google Business Profile for total local dominance.", color: "#10b981" },
    { icon: "🔍", title: "AI Visibility (GEO/AEO)", desc: "Iris ensures you are suggested by Perplexity, Gemini, and ChatGPT.", color: "#8b5cf6" },
    { icon: "📱", title: "Social Media Admin", desc: "Iris posts and manages all your social channels automatically.", color: "#ec4899" },
    { icon: "♻️", title: "Customer Reactivation", desc: "Jenny reaches out to old lists to generate reviews and repeat sales.", color: "#f59e0b" },
    { icon: "📲", title: "Textback / Callback", desc: "Meghan instantly recovers missed calls via automated SMS & Voice.", color: "#a78bfa" },
    { icon: "🧬", title: "Neuroscience-Engineered", desc: "Built on Triune Brain theory, Dual-Coding, and high-status NLP.", color: "#ef4444" },
    { icon: "🌌", title: "Web 4.0 Native", desc: "An immersive, real-time, agentic ecosystem — not just a widget.", color: "#06b6d4" },
    { icon: "🔱", title: "BDX Autonomous Core", desc: "Proprietary autonomous orchestration for zero-latency agent handoffs.", color: "#f97316" },
    { icon: "💰", title: "Real-Time ROI Modeling", desc: "Mark calculates revenue leaks live while talking to prospects.", color: "#22c55e" },
    { icon: "🎨", title: "Nana Banana 2 Generative", desc: "Images adapt instantly to the conversation brain state.", color: "#fbbf24" },
    { icon: "💡", title: "Subconscious Framing", desc: "Matching user language patterns to bypass conscious resistance.", color: "#818cf8" },
    { icon: "🛡️", title: "Military-Grade Security", desc: "AES-256 Encryption and PII Redaction for total data safety.", color: "#34d399" },
    { icon: "🎯", title: "SPIN-Native Hunting", desc: "Chase uses 'The Challenger Sale' to capture competitors' clients.", color: "#f43f5e" },
    { icon: "👑", title: "High-Status Personas", desc: "Each agent maintains an elite professional identity at all times.", color: "#c084fc" },
    { icon: "🧠", title: "Decision Friction Removal", desc: "Cognitive offloading designed to make saying 'Yes' effortless.", color: "#38bdf8" },
    { icon: "📉", title: "Loss Aversion Triggering", desc: "We quantify the financial bleed of doing nothing — in real dollars.", color: "#fb923c" },
    { icon: "🎵", title: "Temporal Contiguity", desc: "Oral narration and visuals are perfectly time-aligned for recall.", color: "#4ade80" },
    { icon: "👁️", title: "Absolute Brand Secrecy", desc: "Your backend intelligence is invisible, proprietary, and untouchable.", color: "#a3e635" },
];

export default function Advantages20Section() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const headRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const ctx = gsap.context(() => {
            gsap.from(headRef.current, {
                y: 50, opacity: 0, duration: 1, ease: "power3.out",
                scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
            });

            cardRefs.current.forEach((el, i) => {
                if (!el) return;
                gsap.from(el, {
                    y: 40, opacity: 0, scale: 0.95, duration: 0.6,
                    ease: "power2.out",
                    delay: (i % 4) * 0.08,
                    scrollTrigger: { trigger: el, start: "top 93%", once: true },
                });
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="why-20"
            style={{
                padding: "120px 24px",
                position: "relative",
                background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,5,25,0.6) 50%, rgba(0,0,0,0) 100%)",
                overflow: "hidden",
            }}
        >
            {/* Ambient glow orb */}
            <div style={{
                position: "absolute", top: "20%", left: "50%", transform: "translate(-50%,-50%)",
                width: 800, height: 800, pointerEvents: "none",
                background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)",
                borderRadius: "50%",
            }} />

            <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 1 }}>
                <div ref={headRef} style={{ textAlign: "center", marginBottom: 64 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                        padding: "8px 20px", borderRadius: 100, marginBottom: 24,
                    }}>
                        <span style={{ color: "#818cf8", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em" }}>THE COMPETITIVE EDGE</span>
                    </div>
                    <h2 style={{
                        fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 900, lineHeight: 1.05,
                        margin: "0 0 20px",
                        background: "linear-gradient(135deg, #fff 40%, #818cf8 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        20 Dimensions of Superiority.
                    </h2>
                    <p style={{
                        fontSize: "clamp(14px, 1.8vw, 17px)", color: "rgba(255,255,255,0.5)",
                        maxWidth: 580, margin: "0 auto", lineHeight: 1.75,
                    }}>
                        Other platforms give you a chatbot. We give you a fully autonomous,
                        neuroscience-engineered engineering suite built for the mind.
                    </p>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 16,
                }}>
                    {ADVANTAGES.map((adv, i) => (
                        <div
                            key={adv.title}
                            ref={el => { cardRefs.current[i] = el; }}
                            style={{
                                padding: "24px 20px",
                                background: "rgba(255,255,255,0.02)",
                                border: `1px solid rgba(255,255,255,0.06)`,
                                borderRadius: 20,
                                display: "flex", flexDirection: "column", gap: 10,
                                position: "relative", overflow: "hidden",
                                cursor: "default",
                                transition: "border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
                            }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLDivElement;
                                el.style.borderColor = adv.color + "55";
                                el.style.transform = "translateY(-4px)";
                                el.style.boxShadow = `0 16px 40px ${adv.color}18`;
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLDivElement;
                                el.style.borderColor = "rgba(255,255,255,0.06)";
                                el.style.transform = "translateY(0)";
                                el.style.boxShadow = "none";
                            }}
                        >
                            {/* Number badge */}
                            <div style={{
                                position: "absolute", top: 14, right: 14,
                                fontSize: 10, fontWeight: 900, color: adv.color,
                                opacity: 0.35, letterSpacing: "0.05em",
                            }}>
                                {String(i + 1).padStart(2, "0")}
                            </div>

                            {/* Icon */}
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 22,
                                background: adv.color + "18",
                                border: `1px solid ${adv.color}30`,
                            }}>
                                {adv.icon}
                            </div>

                            {/* Title */}
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>
                                {adv.title}
                            </div>

                            {/* Desc */}
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>
                                {adv.desc}
                            </p>

                            {/* Bottom accent line */}
                            <div style={{
                                position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                                background: `linear-gradient(90deg, transparent, ${adv.color}50, transparent)`,
                                opacity: 0.6,
                            }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
