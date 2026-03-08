"use client";

/**
 * /success — BioDynamX Post-Payment "Welcome to the Vault" Experience
 * ─────────────────────────────────────────────────────────────────────
 * Web 4.0 Post-Payment Onboarding Protocol:
 *  - Vault-open audio on mount
 *  - 11-agent staggered deployment sequence (every 1.5s)
 *  - GSAP progress bars fill for each agent task
 *  - Orb ambient shifts to gold/emerald
 *  - "Instant Gratification" — no email wait
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { triggerVaultOpen, triggerClosingPing } from "@/lib/neural-audio";

const ONBOARDING_AGENTS = [
    { name: "Milton", image: "/agents/milton.png", color: "#4c1d95", task: "24-hour setup initialized. Deployment roadmap sent to your inbox." },
    { name: "Ben", image: "/agents/ben.png", color: "#fbbf24", task: "Scanning your existing sales scripts for neuro-optimization." },
    { name: "Chase", image: "/agents/alex.png", color: "#f97316", task: "Connecting your AI agents to your CRM and existing tech stack." },
    { name: "Iris", image: "/agents/iris.png", color: "#8b5cf6", task: "Reputation management taken over. Social shield is now active." },
    { name: "Alex", image: "/agents/alex.png", color: "#06b6d4", task: "Customer decision path simplified. Friction points eliminated." },
    { name: "Jenny", image: "/agents/jenny.png", color: "#6366f1", task: "Audit data captured. Building your first 90-day growth sprint." },
    { name: "Mark", image: "/agents/mark.png", color: "#3b82f6", task: "Revenue-recovery tracker started. ROI clock is live." },
    { name: "Megan", image: "/agents/meghan.png", color: "#a78bfa", task: "Drafting the task list you'll never have to do again." },
    { name: "Brock", image: "/agents/brock.png", color: "#dc2626", task: "5X ROI Guarantee officially bonded. Data is 100% sovereign." },
    { name: "Vicki", image: "/agents/vicki.png", color: "#34d399", task: "Local dominance initiated. AEO updates pushing to Gemini now." },
    { name: "Jules", image: "/agents/jules.png", color: "#60a5fa", task: "Full BioDynamX library unlocked. Your journey starts now." },
];

export default function SuccessPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const orbRef = useRef<HTMLDivElement>(null);
    const [deployedCount, setDeployedCount] = useState(0);
    const [allDone, setAllDone] = useState(false);
    const progressRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        // GSAP entrance
        gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 0.97 },
            { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
        );

        // Vault-open audio
        triggerVaultOpen();

        // Orb glow shift to gold
        if (orbRef.current) {
            gsap.to(orbRef.current, {
                boxShadow: "0 0 80px rgba(255,215,0,0.55), 0 0 160px rgba(0,255,65,0.2)",
                duration: 2,
                ease: "power2.out",
            });
        }

        // Stagger 11 agents deploying
        ONBOARDING_AGENTS.forEach((_, i) => {
            setTimeout(() => {
                setDeployedCount(d => d + 1);
                triggerClosingPing();

                // Fill progress bar for this agent
                const bar = progressRefs.current[i];
                if (bar) {
                    gsap.to(bar, {
                        width: "100%",
                        duration: 1.1,
                        ease: "power2.out",
                        backgroundColor: "#00ff41",
                    });
                }

                if (i === ONBOARDING_AGENTS.length - 1) {
                    setTimeout(() => setAllDone(true), 800);
                }
            }, i * 1500);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                minHeight: "100vh",
                background: "#030308",
                color: "#fff",
                fontFamily: "var(--font-inter, system-ui, sans-serif)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "40px 20px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background grid */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
            }} />

            {/* Ambient glow */}
            <div style={{
                position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
                width: 600, height: 400, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* The Vault Orb */}
            <div
                ref={orbRef}
                style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "linear-gradient(135deg, #fbbf24, #00ff41, #3b82f6)",
                    boxShadow: "0 0 30px rgba(255,215,0,0.3)",
                    marginBottom: 24, position: "relative", zIndex: 1,
                    flexShrink: 0,
                    animation: "vault-spin 12s linear infinite",
                }}
            />

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 36, position: "relative", zIndex: 1 }}>
                <div style={{
                    fontSize: 10, fontWeight: 900, letterSpacing: "0.22em",
                    color: "#00ff41", textTransform: "uppercase", marginBottom: 8,
                }}>
                    ✓ VAULT ACTIVATED · WORKFORCE DEPLOYED
                </div>
                <h1 style={{
                    fontSize: "clamp(24px,5vw,42px)", fontWeight: 900,
                    color: "#fff", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1,
                }}>
                    Welcome to the{" "}
                    <span style={{ color: "#fbbf24" }}>BioDynamX Family.</span>
                </h1>
                <p style={{
                    fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 12,
                    maxWidth: 480, margin: "12px auto 0",
                }}>
                    Your 11-agent workforce is deploying right now. You don&apos;t have to do anything — just watch them work.
                </p>
            </div>

            {/* Deployment Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
                width: "100%",
                maxWidth: 780,
                marginBottom: 40,
                position: "relative",
                zIndex: 1,
            }}>
                {ONBOARDING_AGENTS.map((agent, i) => {
                    const deployed = i < deployedCount;
                    return (
                        <div
                            key={agent.name}
                            style={{
                                background: deployed ? `${agent.color}0e` : "rgba(255,255,255,0.02)",
                                border: `1px solid ${deployed ? agent.color + "40" : "rgba(255,255,255,0.06)"}`,
                                borderRadius: 14,
                                padding: "14px 12px",
                                transition: "all 0.4s ease",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: "50%",
                                    border: `1.5px solid ${deployed ? agent.color : "rgba(255,255,255,0.1)"}`,
                                    overflow: "hidden", position: "relative", flexShrink: 0,
                                    boxShadow: deployed ? `0 0 10px ${agent.color}50` : "none",
                                    transition: "all 0.4s ease",
                                }}>
                                    <Image src={agent.image} alt={agent.name} fill style={{ objectFit: "cover", opacity: deployed ? 1 : 0.25, transition: "opacity 0.4s ease" }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: deployed ? agent.color : "rgba(255,255,255,0.2)", transition: "color 0.4s ease" }}>{agent.name}</div>
                                    <div style={{ fontSize: 8, fontWeight: 900, color: deployed ? "#00ff41" : "rgba(255,255,255,0.1)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                                        {deployed ? "✓ ONLINE" : "STANDBY"}
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: deployed ? 8 : 0 }}>
                                <div
                                    ref={el => { progressRefs.current[i] = el; }}
                                    style={{ height: "100%", width: "0%", background: "#fbbf24", borderRadius: 2, transition: "background 0.5s ease" }}
                                />
                            </div>

                            {deployed && (
                                <p style={{ margin: 0, fontSize: 9.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, animation: "vault-fade 0.4s ease" }}>
                                    {agent.task}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Jules final quote + CTA — shown when all done */}
            <div style={{
                opacity: allDone ? 1 : 0,
                transform: allDone ? "none" : "translateY(16px)",
                transition: "all 0.8s ease",
                textAlign: "center",
                position: "relative", zIndex: 1,
            }}>
                <div style={{
                    background: "rgba(255,215,0,0.05)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    borderRadius: 16,
                    padding: "20px 28px",
                    maxWidth: 480,
                    margin: "0 auto 24px",
                }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24", marginBottom: 8, letterSpacing: "0.06em" }}>JULES · THE VAULT</div>
                    <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontStyle: "italic" }}>
                        &ldquo;Welcome home. I&apos;ve unlocked the full BioDynamX library for you. Your journey starts now.&rdquo;
                    </p>
                </div>

                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
                    &ldquo;Go watch your kids. We&apos;ve got the shop covered.&rdquo;
                </p>

                <Link
                    href="/"
                    style={{
                        display: "inline-block",
                        background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                        color: "#000",
                        fontWeight: 900,
                        fontSize: 13,
                        padding: "14px 36px",
                        borderRadius: 50,
                        textDecoration: "none",
                        letterSpacing: "-0.01em",
                        boxShadow: "0 0 24px rgba(251,191,36,0.4)",
                    }}
                >
                    Return to the Vault →
                </Link>
            </div>

            <style>{`
                @keyframes vault-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
                @keyframes vault-fade { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:none } }
            `}</style>
        </div>
    );
}
