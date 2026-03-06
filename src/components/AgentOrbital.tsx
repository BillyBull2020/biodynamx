"use client";

/**
 * AgentOrbital — BioDynamX Elite 11 Showcase
 * A standalone section (no shared scroll).
 * 11 agents orbit a glowing center. Auto-rotates every 2.4s.
 * The active agent's details fade in below the orbit.
 * GSAP handles entrance animations when scrolled into view.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const AGENTS = [
    { name: "Jenny", role: "Discovery & Lead Audit", color: "#6366f1", icon: "🧠", voice: "Kore", brain: "Glial Network" },
    { name: "Mark", role: "ROI Closer", color: "#3b82f6", icon: "📈", voice: "Orion", brain: "Croc Brain" },
    { name: "Meghan", role: "Inbound Receptionist", color: "#a78bfa", icon: "💜", voice: "Aoede", brain: "Amygdala" },
    { name: "Milton", role: "Conversational Hypnotist", color: "#7c3aed", icon: "🌀", voice: "Charon", brain: "Broca Region" },
    { name: "Brock", role: "Security & ROI Specialist", color: "#ef4444", icon: "🛡️", voice: "Charon", brain: "Broca Region" },
    { name: "Vicki", role: "Empathy & Care", color: "#34d399", icon: "💚", voice: "Aoede", brain: "Wernicke Area" },
    { name: "Ben", role: "GMB & Local SEO", color: "#fbbf24", icon: "📍", voice: "Charon", brain: "Neocortex" },
    { name: "Chase", role: "Lead Hunter (SPIN)", color: "#f97316", icon: "🎯", voice: "Enceladus", brain: "Hypothalamus" },
    { name: "Iris", role: "GEO/AEO Visibility", color: "#8b5cf6", icon: "👁️", voice: "Leda", brain: "Iris Network" },
    { name: "Jules", role: "Technical Architect", color: "#06b6d4", icon: "⚙️", voice: "Puck", brain: "Neocortex" },
    { name: "Alex", role: "Support & Retention", color: "#22c55e", icon: "🤝", voice: "Aoede", brain: "Hippocampus" },
];

export default function AgentOrbital() {
    const sectionRef = useRef<HTMLElement>(null);
    const orbitRef = useRef<HTMLDivElement>(null);
    const headRef = useRef<HTMLDivElement>(null);
    const detailRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const goTo = useCallback((i: number) => {
        setActive(i);
        // flash the detail panel
        if (detailRef.current) {
            gsap.fromTo(detailRef.current,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }
    }, []);

    /* auto-rotate */
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setActive(p => {
                const next = (p + 1) % AGENTS.length;
                if (detailRef.current) {
                    gsap.fromTo(detailRef.current,
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
                    );
                }
                return next;
            });
        }, 2600);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    /* scroll entrance */
    useEffect(() => {
        if (typeof window === "undefined") return;
        const ctx = gsap.context(() => {

            gsap.from(headRef.current, {
                y: 50, opacity: 0, duration: 1.0, ease: "power3.out",
                scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
            });

            gsap.from(orbitRef.current, {
                scale: 0.6, opacity: 0, duration: 1.2, ease: "back.out(1.4)",
                scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
            });

            // Orbit nodes stagger in
            const nodes = orbitRef.current?.querySelectorAll(".ao-node");
            if (nodes) {
                gsap.from(nodes, {
                    scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2)",
                    stagger: { amount: 0.8, from: "start" },
                    scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
                });
            }

        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const agent = AGENTS[active];

    return (
        <section
            ref={sectionRef}
            id="elite-team"
            aria-label="The Elite 11 AI Workforce"
            style={{
                padding: "100px 32px",
                background: "linear-gradient(180deg, #030308 0%, rgba(20,10,50,0.95) 50%, #030308 100%)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background glow orb */}
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: 600, height: 600, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* Neural grid */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.04) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
            }} />

            <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

                {/* Header */}
                <div ref={headRef} style={{ textAlign: "center", marginBottom: 64 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
                        padding: "6px 18px", borderRadius: 100, marginBottom: 20,
                    }}>
                        <span style={{ color: "#818cf8", fontSize: 10, fontWeight: 800, letterSpacing: "0.14em" }}>THE ELITE 11 WORKFORCE</span>
                    </div>
                    <h2 style={{
                        fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, margin: "0 0 16px",
                        background: "linear-gradient(135deg, #fff 40%, #818cf8 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        Not Bots. Neural Specialists.
                    </h2>
                    <p style={{
                        fontSize: "clamp(14px, 1.6vw, 17px)", color: "rgba(255,255,255,0.45)",
                        maxWidth: 600, margin: "0 auto", lineHeight: 1.75
                    }}>
                        Each agent is architected after a brain region, engineered to fire the exact
                        neurochemical response needed to move a prospect from hesitation to commitment.
                    </p>
                </div>

                {/* Orbit + Detail layout */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 380px",
                    gap: 60, alignItems: "center",
                }}>

                    {/* ─── Orbital ring ─────────────────── */}
                    <div
                        ref={orbitRef}
                        style={{
                            position: "relative",
                            width: "min(480px, 90vw)",
                            height: "min(480px, 90vw)",
                            margin: "0 auto",
                        }}
                    >
                        {/* Ring decorations */}
                        {[440, 300, 160].map((d, ri) => (
                            <div
                                key={d}
                                style={{
                                    position: "absolute",
                                    top: "50%", left: "50%",
                                    width: d, height: d,
                                    transform: "translate(-50%, -50%)",
                                    borderRadius: "50%",
                                    border: `1px ${ri === 1 ? "dashed" : "solid"} rgba(99,102,241,${ri === 0 ? 0.08 : ri === 1 ? 0.06 : 0.04})`,
                                    animation: `aoRing ${20 + ri * 8}s linear infinite ${ri % 2 === 0 ? "" : "reverse"}`,
                                }}
                            />
                        ))}

                        {/* Center node */}
                        <div style={{
                            position: "absolute", top: "50%", left: "50%",
                            transform: "translate(-50%,-50%)",
                            width: 90, height: 90, borderRadius: "50%",
                            background: `radial-gradient(circle, ${agent.color}33 0%, rgba(0,0,0,0.8) 70%)`,
                            border: `2px solid ${agent.color}55`,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", gap: 2,
                            zIndex: 5, backdropFilter: "blur(12px)",
                            boxShadow: `0 0 40px ${agent.color}30`,
                            transition: "background 0.4s, border-color 0.4s, box-shadow 0.4s",
                        }}>
                            <span style={{ fontSize: 30, lineHeight: 1 }}>{agent.icon}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>{agent.name}</span>
                        </div>

                        {/* Agent nodes */}
                        {AGENTS.map((a, i) => {
                            const angle = (i / AGENTS.length) * 360 - 90;
                            const rad = (angle * Math.PI) / 180;
                            const radius = 210;
                            const cx = 50 + (Math.cos(rad) * radius / 4.8);
                            const cy = 50 + (Math.sin(rad) * radius / 4.8);
                            const isActive = i === active;

                            return (
                                <button
                                    key={a.name}
                                    className="ao-node"
                                    onClick={() => {
                                        if (timerRef.current) clearInterval(timerRef.current);
                                        goTo(i);
                                        timerRef.current = setInterval(() => {
                                            setActive(p => {
                                                const next = (p + 1) % AGENTS.length;
                                                if (detailRef.current) {
                                                    gsap.fromTo(detailRef.current,
                                                        { opacity: 0, y: 10 },
                                                        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
                                                    );
                                                }
                                                return next;
                                            });
                                        }, 2600);
                                    }}
                                    aria-label={a.name}
                                    style={{
                                        position: "absolute",
                                        top: `${cy}%`, left: `${cx}%`,
                                        transform: "translate(-50%,-50%)",
                                        width: isActive ? 60 : 50,
                                        height: isActive ? 60 : 50,
                                        borderRadius: "50%",
                                        background: isActive
                                            ? `radial-gradient(circle, ${a.color}30 0%, rgba(0,0,0,0.8) 100%)`
                                            : "rgba(255,255,255,0.04)",
                                        border: `${isActive ? 2 : 1}px solid ${isActive ? a.color : "rgba(255,255,255,0.1)"}`,
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", gap: 1,
                                        cursor: "pointer", padding: 0,
                                        boxShadow: isActive ? `0 0 24px ${a.color}50` : "none",
                                        transition: "all 0.3s ease",
                                        zIndex: isActive ? 6 : 4,
                                    }}
                                    onMouseEnter={e => {
                                        const el = e.currentTarget as HTMLButtonElement;
                                        el.style.transform = "translate(-50%,-50%) scale(1.2)";
                                        el.style.borderColor = a.color;
                                        el.style.boxShadow = `0 0 20px ${a.color}50`;
                                        el.style.zIndex = "8";
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget as HTMLButtonElement;
                                        el.style.transform = "translate(-50%,-50%)";
                                        el.style.borderColor = isActive ? a.color : "rgba(255,255,255,0.1)";
                                        el.style.boxShadow = isActive ? `0 0 24px ${a.color}50` : "none";
                                        el.style.zIndex = isActive ? "6" : "4";
                                    }}
                                >
                                    <span style={{ fontSize: isActive ? 20 : 16, lineHeight: 1 }}>{a.icon}</span>
                                    <span style={{ fontSize: 7, fontWeight: 700, color: isActive ? a.color : "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>{a.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ─── Agent detail card ─────────────── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Active card */}
                        <div
                            ref={detailRef}
                            style={{
                                padding: 28,
                                background: `linear-gradient(135deg, ${agent.color}12 0%, rgba(0,0,0,0.4) 100%)`,
                                border: `1px solid ${agent.color}40`,
                                borderRadius: 24,
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: "50%",
                                    background: `${agent.color}20`,
                                    border: `2px solid ${agent.color}50`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 26,
                                }}>
                                    {agent.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{agent.name}</div>
                                    <div style={{ fontSize: 13, color: agent.color, fontWeight: 600 }}>{agent.role}</div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {[
                                    { label: "Brain Region", value: agent.brain },
                                    { label: "Voice Engine", value: agent.voice },
                                    { label: "Status", value: "Active — 24/7/365" },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "8px 0",
                                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                                        fontSize: 13,
                                    }}>
                                        <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                            {item.label}
                                        </span>
                                        <span style={{ color: "#fff", fontWeight: 700 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* All agent chips */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {AGENTS.map((a, i) => (
                                <button
                                    key={a.name}
                                    onClick={() => {
                                        if (timerRef.current) clearInterval(timerRef.current);
                                        goTo(i);
                                        timerRef.current = setInterval(() => {
                                            setActive(p => (p + 1) % AGENTS.length);
                                        }, 2600);
                                    }}
                                    style={{
                                        padding: "6px 14px",
                                        borderRadius: 100,
                                        background: i === active ? `${a.color}20` : "rgba(255,255,255,0.04)",
                                        border: `1px solid ${i === active ? a.color + "60" : "rgba(255,255,255,0.08)"}`,
                                        color: i === active ? a.color : "rgba(255,255,255,0.35)",
                                        fontSize: 11, fontWeight: 700,
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        display: "flex", alignItems: "center", gap: 5,
                                    }}
                                >
                                    <span style={{ fontSize: 13 }}>{a.icon}</span>
                                    {a.name}
                                </button>
                            ))}
                        </div>

                        {/* Stats */}
                        <div style={{
                            padding: "16px 20px",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 16, fontSize: 12,
                            color: "rgba(255,255,255,0.35)", lineHeight: 1.6,
                        }}>
                            All 11 agents run simultaneously · 24/7 · on Vertex AI infrastructure · with IronClaw orchestration.
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes aoRing {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to   { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `}</style>
        </section>
    );
}
