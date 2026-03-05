"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

function useScrollReveal(): [React.RefObject<HTMLElement | null>, boolean] {
    const ref = useRef<HTMLElement | null>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
}

export default function AboutPage() {
    const [heroRef, heroVisible] = useScrollReveal();
    const [storyRef, storyVisible] = useScrollReveal();
    const [scienceRef, scienceVisible] = useScrollReveal();
    const [teamRef, teamVisible] = useScrollReveal();
    const [missionRef, missionVisible] = useScrollReveal();

    return (
        <main style={{
            minHeight: "100vh",
            background: "#050508",
            color: "#fff",
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            {/* ── Navigation Bar ─────────────── */}
            <nav style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                <Link href="/" style={{ textDecoration: "none", color: "#fff", fontWeight: 800, fontSize: 18 }}>
                    BioDynamX
                </Link>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Link href="/#pricing" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Pricing</Link>
                    <Link href="/audit" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Free Audit</Link>
                    <Link href="/" style={{
                        background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                        color: "#fff", padding: "8px 16px", borderRadius: 8,
                        textDecoration: "none", fontSize: 13, fontWeight: 600,
                    }}>Talk to Jenny — Free</Link>
                </div>
            </nav>

            {/* ── Hero Section ─────────────── */}
            <section
                ref={heroRef as React.RefObject<HTMLElement>}
                style={{
                    textAlign: "center", padding: "80px 24px 60px",
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                }}
            >
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 16px", background: "rgba(139,92,246,0.12)",
                    border: "1px solid rgba(139,92,246,0.25)", borderRadius: 100,
                    fontSize: 12, fontWeight: 700, color: "#a78bfa",
                    letterSpacing: "0.04em", marginBottom: 20,
                }}>
                    🧠 The Neuroscience Behind BioDynamX
                </div>
                <h1 style={{
                    fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800,
                    lineHeight: 1.1, marginBottom: 20,
                    background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                    We Don&apos;t Sell to People.<br />
                    <span style={{ WebkitTextFillColor: "#a78bfa" }}>We Sell to the Mind.</span>
                </h1>
                <p style={{
                    fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.6)",
                    maxWidth: 700, margin: "0 auto", lineHeight: 1.6,
                }}>
                    BioDynamX is the world&apos;s first AI platform built on the <strong style={{ color: "#fff" }}>Neurobiology of Choice</strong> — a scientific framework that engineers how customers make buying decisions, so your business grows on autopilot.
                </p>
            </section>

            {/* ── Billy's Story ─────────────── */}
            <section
                ref={storyRef as React.RefObject<HTMLElement>}
                style={{
                    padding: "60px 24px", maxWidth: 900, margin: "0 auto",
                    opacity: storyVisible ? 1 : 0,
                    transform: storyVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                }}
            >
                <div style={{
                    display: "flex", gap: 40, alignItems: "flex-start",
                    flexWrap: "wrap", justifyContent: "center",
                }}>
                    <div style={{
                        width: 180, height: 180, borderRadius: "50%",
                        background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                        padding: 3, flexShrink: 0,
                    }}>
                        <img
                            src="/billy-headshot.png"
                            alt="Billy De La Taurus — Founder & CEO of BioDynamX"
                            width={174} height={174}
                            style={{ borderRadius: "50%", objectFit: "cover", display: "block" }}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{
                            fontSize: 11, fontWeight: 700, color: "#8b5cf6",
                            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
                        }}>Founder & CEO</div>
                        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
                            Billy De La Taurus
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 16 }}>
                            2x Amazon best-selling author, recognized expert in AI automation, and the architect behind BioDynamX&apos;s neuroscience framework. Billy leads a community of <strong style={{ color: "#fff" }}>4,000+ business owners</strong> leveraging AI for revenue recovery.
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 20 }}>
                            His books — <em>&ldquo;The AI Business Revolution&rdquo;</em> and <em>&ldquo;The Business Owner&apos;s Guide to AI Automation Excellence&rdquo;</em> — both reached <strong style={{ color: "#ffa726" }}>#1 on Amazon</strong>. Billy&apos;s mission: make the science of persuasion accessible to every business through AI.
                        </p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {["2x Amazon Best-Seller", "4,000+ Partners", "$2.4M Recovered in Q1", "Neurobiology of Choice Pioneer"].map((badge) => (
                                <span key={badge} style={{
                                    padding: "5px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                                    color: "#c4b5fd",
                                }}>
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── The Science ─────────────── */}
            <section
                ref={scienceRef as React.RefObject<HTMLElement>}
                style={{
                    padding: "60px 24px", maxWidth: 900, margin: "0 auto",
                    opacity: scienceVisible ? 1 : 0,
                    transform: scienceVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                    borderTop: "1px solid rgba(139,92,246,0.1)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{
                        fontSize: 11, fontWeight: 700, color: "#3b82f6",
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
                    }}>Our Scientific Framework</div>
                    <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
                        The Neurobiology of Choice
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 650, margin: "0 auto", lineHeight: 1.6 }}>
                        85% of buying decisions happen subconsciously. We reverse-engineer the neurobiological pathways of decision-making — dopamine loops, loss aversion triggers, and cognitive load thresholds — to build AI that naturally guides prospects to &ldquo;yes.&rdquo;
                    </p>
                </div>

                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 20,
                }}>
                    {[
                        {
                            icon: "🧬", title: "Neuroscience", color: "#ef4444",
                            desc: "We study how neurons fire during purchase decisions to design AI conversations that align with natural brain chemistry.",
                        },
                        {
                            icon: "🧠", title: "Neurobiology", color: "#8b5cf6",
                            desc: "Our Triune Brain model addresses the Reptilian (survival), Limbic (emotion), and Neocortex (logic) to create complete persuasion.",
                        },
                        {
                            icon: "🎯", title: "Neuromarketing", color: "#3b82f6",
                            desc: "Loss aversion, anchoring, hippocampal activation, and neurological pricing are embedded in every AI interaction.",
                        },
                        {
                            icon: "💰", title: "Neuro-Sales", color: "#ffa726",
                            desc: "SPIN Selling, SONCAS, and the Challenger Sale — translated into AI agents that close deals 24/7 without human intervention.",
                        },
                    ].map((item) => (
                        <div key={item.title} style={{
                            padding: 24, borderRadius: 16,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                        }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: item.color }}>{item.title}</h3>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── AI Team ─────────────── */}
            <section
                ref={teamRef as React.RefObject<HTMLElement>}
                style={{
                    padding: "60px 24px", maxWidth: 900, margin: "0 auto",
                    opacity: teamVisible ? 1 : 0,
                    transform: teamVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                    borderTop: "1px solid rgba(59,130,246,0.1)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{
                        fontSize: 11, fontWeight: 700, color: "#8b5cf6",
                        textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
                    }}>Neuroscience-Trained</div>
                    <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
                        The AI Team
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
                        Every agent is trained on the Triune Brain model, SPIN selling, and neuromarketing frameworks. They don&apos;t read scripts — they engineer buying behavior.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    {[
                        { name: "Jenny", role: "Diagnostic Consultant", emoji: "👩‍💼", desc: "Uses neuroscience-based questions to uncover revenue leaks in 60 seconds" },
                        { name: "Mark", role: "Technical Closer", emoji: "👨‍💻", desc: "Builds ROI using anchoring, loss aversion, and the Challenger Sale method" },
                        { name: "Aria", role: "AI Receptionist", emoji: "🎧", desc: "Answers every call in under 1 second, 24/7/365" },
                        { name: "Sarah", role: "Success Manager", emoji: "📊", desc: "Ensures every client hits the guaranteed 5x ROI target" },
                        { name: "Billy AI", role: "Chief Strategist", emoji: "🧠", desc: "Oversees strategy, handles complex escalations with founder-level insight" },
                    ].map((agent) => (
                        <div key={agent.name} style={{
                            padding: 20, borderRadius: 16,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            textAlign: "center",
                        }}>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>{agent.emoji}</div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{agent.name}</h3>
                            <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>{agent.role}</div>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{agent.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Mission / CTA ─────────────── */}
            <section
                ref={missionRef as React.RefObject<HTMLElement>}
                style={{
                    padding: "80px 24px", textAlign: "center",
                    opacity: missionVisible ? 1 : 0,
                    transform: missionVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                    background: "linear-gradient(180deg, transparent, rgba(139,92,246,0.05))",
                }}
            >
                <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
                    Our Mission
                </h2>
                <p style={{
                    fontSize: 20, color: "rgba(255,255,255,0.7)", maxWidth: 650,
                    margin: "0 auto 32px", lineHeight: 1.6,
                }}>
                    Make the science of persuasion accessible to every business — through AI that sells smarter, recovers revenue faster, and grows companies while their owners sleep.
                </p>
                <blockquote style={{
                    maxWidth: 600, margin: "0 auto 40px", padding: "20px 24px",
                    borderLeft: "3px solid #8b5cf6",
                    background: "rgba(139,92,246,0.05)", borderRadius: "0 12px 12px 0",
                    fontStyle: "italic", color: "rgba(255,255,255,0.8)", fontSize: 17, lineHeight: 1.6,
                }}>
                    &ldquo;We don&apos;t just automate your business. We engineer the neurobiology of choice — so your customers say yes before they know why.&rdquo;
                    <div style={{ marginTop: 12, fontStyle: "normal", fontSize: 13, color: "#a78bfa", fontWeight: 600 }}>
                        — Billy De La Taurus, Founder
                    </div>
                </blockquote>
                <Link href="/" style={{
                    display: "inline-block", padding: "14px 32px", borderRadius: 12,
                    background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                    color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 16,
                }}>
                    Talk to Jenny — See the Science in Action
                </Link>
            </section>

            {/* ── Footer ─────────────── */}
            <footer style={{
                padding: "32px 24px", textAlign: "center",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.3)", fontSize: 13,
            }}>
                © {new Date().getFullYear()} BioDynamX Engineering Group. The Neurobiology of Choice.
            </footer>
        </main>
    );
}
