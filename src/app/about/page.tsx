"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

// ─── Scroll-Reveal Hook (React 19 safe) ─────────────────────────
function useScrollReveal(threshold = 0.15) {
    const [isVisible, setIsVisible] = useState(false);
    const [element, setElement] = useState<HTMLDivElement | null>(null);
    const ref = useCallback((node: HTMLDivElement | null) => {
        setElement(node);
    }, []);
    useEffect(() => {
        if (!element) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.unobserve(element); } },
            { threshold }
        );
        obs.observe(element);
        return () => obs.disconnect();
    }, [element, threshold]);
    return [ref, isVisible] as const;
}

// ─── Animated Counter ───────────────────────────────────────────
function useCountUp(target: number, isVisible: boolean, duration = 2000, suffix = "") {
    const [value, setValue] = useState("0" + suffix);
    useEffect(() => {
        if (!isVisible) return;
        const startTime = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            setValue(current.toLocaleString() + suffix);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isVisible, target, duration, suffix]);
    return value;
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({ val, suffix, label, isVisible }: { val: number; suffix: string; label: string; isVisible: boolean }) {
    const animated = useCountUp(val, isVisible, 2000, suffix);
    return (
        <div style={{
            padding: "24px 16px", borderRadius: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
        }}>
            <div style={{
                fontSize: 28, fontWeight: 800, color: "#00ff41",
                letterSpacing: "-0.02em", lineHeight: 1,
            }}>{animated}</div>
            <div style={{
                fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.06em", textTransform: "uppercase" as const,
                marginTop: 6,
            }}>{label}</div>
        </div>
    );
}

// ─── Elite 11 Agent Data ────────────────────────────────────────
const AGENTS = [
    {
        id: "jenny", name: "Jenny", role: "Business Lead & Discovery",
        brain: "Shelle Rose Charvet", voice: "Kore",
        desc: "The challenger. Uses the LAB Profile to reveal 'silent killers' in a business's revenue cycle. Establishes Alpha status from the first second.",
        result: "Status-quo disruption + Revenue audit",
        color: "#6366f1", image: "/agents/jenny.png",
    },
    {
        id: "mark", name: "Mark", role: "ROI Closer (Croc Brain)",
        brain: "Oren Klaff", voice: "Orion",
        desc: "The closer. Eradicates neediness and uses the 'Prize Frame' to force decisions. Speaks in cold numbers and binary outcome choices.",
        result: "Decision reached. Commitment secured.",
        color: "#3b82f6", image: "/agents/mark.png",
    },
    {
        id: "milton", name: "Milton", role: "Conversational Hypnotist",
        brain: "Milton Erickson", voice: "Charon",
        desc: "The architect of ease. Uses Ericksonian hypnosis to lower conscious resistance and pace prospects into a deep, agreeable state of flow.",
        result: "Subconscious safety + Total agreement",
        color: "#4c1d95", image: "/agents/milton.png",
    },
    {
        id: "meghan", name: "Meghan", role: "Amygdala Soother & Receptionist",
        brain: "Amygdala Science", voice: "Aoede",
        desc: "The nurturer. Specializes in sensory-rich language and mirroring to build intense trust and soothe the brain's threat-detection centers.",
        result: "Intimacy + Emotional defense removal",
        color: "#a78bfa", image: "/agents/meghan.png",
    },
    {
        id: "brock", name: "Brock", role: "Security & ROI (Broca's Area)",
        brain: "Broca's Area", voice: "Fenrir",
        desc: "The hijacker. Uses high-stakes narratives to shock the Croc Brain into awareness, injecting tension and curiosity through storytelling.",
        result: "Attention captured + Dopamine converted",
        color: "#dc2626", image: "/agents/brock.png",
    },
    {
        id: "vicki", name: "Vicki", role: "Empathy & Care (Wernicke's Area)",
        brain: "Mirror Neurons", voice: "Lyra",
        desc: "The empath. Builds visceral connection by helping prospects visualize the relief of walking away from pain into pure results.",
        result: "Oxytocin-driven trust + Visualization",
        color: "#34d399", image: "/agents/vicki.png",
    },
    {
        id: "jules", name: "Jules", role: "Strategy & Architecture",
        brain: "Technical Authority", voice: "Puck",
        desc: "The strategist. Lead orchestrator — supervising all agents, ensuring the neuroscience framework is followed, and architecting custom solutions.",
        result: "Full orchestration + Strategic alignment",
        color: "#60a5fa", image: "/agents/jules.png",
    },
    {
        id: "ben", name: "Ben", role: "Macro-Analyst (Neocortex)",
        brain: "Neocortex Calibration", voice: "Sagitta",
        desc: "The logician. Delivers 'Rational Drowning' through logic stacking and ROI math — the cold, hard data the rational brain needs.",
        result: "Rational justification + Data proof",
        color: "#fbbf24", image: "/agents/ben.png",
    },
    {
        id: "chase", name: "Chase", role: "Lead Prospecting Hunter",
        brain: "Chase Response", voice: "Enceladus",
        desc: "The hunter. Activates the lateral hypothalamus pursuit circuit — detecting opportunity and pursuing without hesitation. Competitor intel and urgency.",
        result: "Lead pipeline + Competitive advantage",
        color: "#f97316", image: "/agents/hunter.png",
    },
    {
        id: "iris", name: "Iris", role: "AI Visibility & Content (GEO/AEO)",
        brain: "Visual Cortex", voice: "Leda",
        desc: "The eye. Controls what the brain can SEE — making businesses visible to ChatGPT, Gemini, Perplexity, and voice assistants through GEO, AEO, and content.",
        result: "AI visibility + Search dominance",
        color: "#8b5cf6", image: "/agents/nova.png",
    },
    {
        id: "alex", name: "Alex", role: "Support & Retention",
        brain: "Loyalty Loop", voice: "Aoede",
        desc: "The guardian. Keeps clients happy 24/7 — preventing churn, resolving issues at 2 AM, and turning satisfaction into 5-star reviews and referrals.",
        result: "Zero churn + LTV maximized",
        color: "#06b6d4", image: "/agents/alex.png",
    },
];

// ─── Science Pillars ────────────────────────────────────────────
const SCIENCE_PILLARS = [
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
        icon: "💰", title: "Neuro-Sales", color: "#00ff41",
        desc: "SPIN Selling, SONCAS, and the Challenger Sale — translated into AI agents that close deals 24/7 without human intervention.",
    },
];

export default function AboutPage() {
    const [heroRef, heroVisible] = useScrollReveal();
    const [founderRef, founderVisible] = useScrollReveal();
    const [scienceRef, scienceVisible] = useScrollReveal();
    const [statsRef, statsVisible] = useScrollReveal();
    const [teamRef, teamVisible] = useScrollReveal();
    const [missionRef, missionVisible] = useScrollReveal();

    // ─── Animated gradient text effect ──────────────────────
    const [glowPhase, setGlowPhase] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setGlowPhase(p => (p + 1) % 360), 50);
        return () => clearInterval(id);
    }, []);

    return (
        <main style={{
            minHeight: "100vh",
            background: "#050505",
            color: "#fff",
            fontFamily: "'Inter', system-ui, sans-serif",
            overflowX: "hidden",
        }}>
            {/* ═══ CSS Keyframes ═══ */}
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.7; } }
                @keyframes shimmerGrad {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                @keyframes borderGlow {
                    0%, 100% { border-color: rgba(0,255,65,0.15); }
                    50% { border-color: rgba(0,255,65,0.35); }
                }
                @keyframes orbitPulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(0,255,65,0.1); }
                    50% { box-shadow: 0 0 40px rgba(0,255,65,0.25); }
                }
                .about-gradient-text {
                    background: linear-gradient(90deg, #00ff41 0%, #00cc33 25%, #3b82f6 50%, #00ff41 75%, #00cc33 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmerGrad 8s ease-in-out infinite;
                }
                .about-agent-card {
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .about-agent-card:hover {
                    transform: translateY(-6px) scale(1.02);
                }
                .about-science-card {
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .about-science-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(255,255,255,0.12);
                    background: rgba(255,255,255,0.06);
                }
                .about-nav-link {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255,255,255,0.7);
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .about-nav-link:hover { color: #00ff41; }
            `}</style>

            {/* ═══ Navigation (matches VaultUI) ═══ */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 50,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 32px",
                background: "rgba(10,10,10,0.96)",
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
                <Link href="/" style={{
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 12,
                }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 900, color: "#000",
                        boxShadow: "0 0 15px rgba(0,255,65,0.2)",
                    }}>B</div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>BioDynamX</div>
                        <div style={{ fontSize: 11, color: "rgba(0,255,65,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 700 }}>Engineering Group</div>
                    </div>
                </Link>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    {[
                        { label: "Pricing", href: "/pricing" },
                        { label: "Free Audit", href: "/audit" },
                        { label: "Blog", href: "/blog" },
                    ].map(link => (
                        <Link key={link.label} href={link.href} className="about-nav-link">{link.label}</Link>
                    ))}
                    <Link href="/" style={{
                        padding: "8px 20px",
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        border: "none", borderRadius: 8,
                        color: "#000", fontSize: 12, fontWeight: 800,
                        textDecoration: "none",
                        boxShadow: "0 0 15px rgba(0,255,65,0.2)",
                        transition: "all 0.3s",
                    }}>Talk to Jenny</Link>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <section
                ref={heroRef}
                style={{
                    textAlign: "center", padding: "100px 24px 80px",
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                    position: "relative",
                }}
            >
                {/* Ambient glow */}
                <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 600, height: 600,
                    background: `radial-gradient(circle, rgba(0,255,65,0.04) 0%, transparent 70%)`,
                    pointerEvents: "none",
                }} />

                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 18px",
                    background: "rgba(0,255,65,0.08)",
                    border: "1px solid rgba(0,255,65,0.2)",
                    borderRadius: 100,
                    fontSize: 11, fontWeight: 700, color: "#00ff41",
                    letterSpacing: "0.06em", marginBottom: 24,
                    animation: "borderGlow 3s ease-in-out infinite",
                }}>
                    🧠 THE NEUROSCIENCE BEHIND BIODYNAMX
                </div>

                <h1 style={{
                    fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 800,
                    lineHeight: 1.08, marginBottom: 24, letterSpacing: "-0.04em",
                    position: "relative",
                }}>
                    We Don&apos;t Sell to People.<br />
                    <span className="about-gradient-text">We Sell to the Mind.</span>
                </h1>

                <p style={{
                    fontSize: "clamp(16px, 1.8vw, 20px)", color: "rgba(255,255,255,0.6)",
                    maxWidth: 720, margin: "0 auto", lineHeight: 1.65,
                }}>
                    BioDynamX is the world&apos;s first AI platform built on the{" "}
                    <strong style={{ color: "#00ff41" }}>Neurobiology of Choice</strong>{" "}
                    — a scientific framework that engineers how customers make buying decisions, so your business grows on autopilot.
                </p>
            </section>

            {/* ═══ FOUNDER / CEO ═══ */}
            <section
                ref={founderRef}
                style={{
                    padding: "80px 24px", maxWidth: 1000, margin: "0 auto",
                    opacity: founderVisible ? 1 : 0,
                    transform: founderVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                    borderTop: "1px solid rgba(0,255,65,0.08)",
                }}
            >
                <div style={{
                    fontSize: 10, fontWeight: 700, color: "#3b82f6",
                    letterSpacing: "0.15em", textTransform: "uppercase" as const,
                    marginBottom: 12, textAlign: "center",
                }}>LEADERSHIP</div>
                <h2 style={{
                    fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800,
                    textAlign: "center", marginBottom: 48, letterSpacing: "-0.03em",
                }}>
                    Built by an author. <span style={{ color: "#3b82f6" }}>Backed by a community.</span>
                </h2>

                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32,
                    alignItems: "start",
                }}>
                    {/* Founder Card */}
                    <div style={{
                        padding: 32, borderRadius: 20,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        backdropFilter: "blur(8px)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                            <a href="https://www.facebook.com/mmapresident" target="_blank" rel="noopener noreferrer">
                                <div style={{
                                    position: "relative", width: 80, height: 80,
                                    borderRadius: "50%", overflow: "hidden",
                                    border: "3px solid rgba(0,255,65,0.4)",
                                    boxShadow: "0 0 25px rgba(0,255,65,0.15)",
                                    animation: "orbitPulse 4s ease-in-out infinite",
                                }}>
                                    <Image
                                        src="/billy-headshot.png"
                                        alt="Billy De La Taurus — Founder & CEO of BioDynamX"
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            </a>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                                    Billy De La Taurus
                                </div>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: "#00ff41",
                                    letterSpacing: "0.1em", textTransform: "uppercase" as const,
                                }}>Founder & CEO</div>
                            </div>
                        </div>

                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: "0 0 16px" }}>
                            2x Amazon best-selling author, recognized expert in AI automation, and the architect behind BioDynamX&apos;s neuroscience framework. Billy leads a community of <strong style={{ color: "#fff" }}>4,000+ business owners</strong> leveraging AI for revenue recovery.
                        </p>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: "0 0 20px" }}>
                            His books — <em>&ldquo;The AI Business Revolution&rdquo;</em> and <em>&ldquo;The Business Owner&apos;s Guide to AI Automation Excellence&rdquo;</em> — both reached <strong style={{ color: "#ffa726" }}>#1 on Amazon</strong>.
                        </p>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {["2x Amazon Best-Seller", "4,000+ Partners", "$2.4M Recovered Q1", "Neurobiology of Choice Pioneer"].map((badge) => (
                                <span key={badge} style={{
                                    padding: "5px 14px", borderRadius: 100, fontSize: 10, fontWeight: 700,
                                    background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.2)",
                                    color: "#00ff41", letterSpacing: "0.02em",
                                }}>{badge}</span>
                            ))}
                        </div>

                        {/* Social Links */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                            <a href="https://www.linkedin.com/in/billy-delataurus-biodynamx" target="_blank" rel="noopener noreferrer" style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "10px 16px", borderRadius: 10,
                                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                                color: "#60a5fa", fontSize: 13, fontWeight: 600, textDecoration: "none",
                                transition: "all 0.3s",
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                LinkedIn
                            </a>
                            <a href="https://www.facebook.com/mmapresident" target="_blank" rel="noopener noreferrer" style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "10px 16px", borderRadius: 10,
                                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                                color: "#60a5fa", fontSize: 13, fontWeight: 600, textDecoration: "none",
                                transition: "all 0.3s",
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 11.123 11.234 3.123v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                Facebook
                            </a>
                            <a href="https://a.co/d/04GCeRAh" target="_blank" rel="noopener noreferrer" style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "10px 16px", borderRadius: 10,
                                background: "rgba(255,167,38,0.08)", border: "1px solid rgba(255,167,38,0.2)",
                                color: "#ffa726", fontSize: 13, fontWeight: 600, textDecoration: "none",
                                transition: "all 0.3s",
                            }}>📘 Books on Amazon</a>
                        </div>
                    </div>

                    {/* Right Column: Books + Community */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <a href="https://a.co/d/04GCeRAh" target="_blank" rel="noopener noreferrer" style={{
                            display: "flex", gap: 16, alignItems: "center",
                            padding: 24, borderRadius: 16,
                            background: "rgba(255,167,38,0.06)",
                            border: "1px solid rgba(255,167,38,0.2)",
                            textDecoration: "none", transition: "all 0.3s",
                        }}>
                            <div style={{ fontSize: 36 }}>📘</div>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: "#ffa726", letterSpacing: "0.12em" }}>#1 AMAZON BEST-SELLER</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 4 }}>The AI Business Revolution</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>How to Build Smarter, Faster, and Richer in the Intelligent Age</div>
                            </div>
                        </a>
                        <a href="https://a.co/d/0b2kdZ0p" target="_blank" rel="noopener noreferrer" style={{
                            display: "flex", gap: 16, alignItems: "center",
                            padding: 24, borderRadius: 16,
                            background: "rgba(255,167,38,0.06)",
                            border: "1px solid rgba(255,167,38,0.2)",
                            textDecoration: "none", transition: "all 0.3s",
                        }}>
                            <div style={{ fontSize: 36 }}>📙</div>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: "#ffa726", letterSpacing: "0.12em" }}>#1 AMAZON BEST-SELLER</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 4 }}>The Business Owner&apos;s Guide to AI Automation</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>How Smart Business Owners Are Replacing Traditional Workforces with AI</div>
                            </div>
                        </a>
                        <a href="https://www.facebook.com/mmapresident" target="_blank" rel="noopener noreferrer" style={{
                            display: "flex", gap: 16, alignItems: "center",
                            padding: 24, borderRadius: 16,
                            background: "rgba(0,255,65,0.06)",
                            border: "1px solid rgba(0,255,65,0.2)",
                            textDecoration: "none", transition: "all 0.3s",
                        }}>
                            <div style={{ fontSize: 36 }}>👥</div>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: "#00ff41", letterSpacing: "0.12em" }}>PARTNER COMMUNITY</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 4 }}>4,000+ Business Owners</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Leveraging AI automation for revenue recovery</div>
                            </div>
                        </a>
                        <div style={{
                            padding: 24, borderRadius: 16,
                            background: "rgba(59,130,246,0.06)",
                            border: "1px solid rgba(59,130,246,0.15)",
                        }}>
                            <blockquote style={{
                                margin: 0, padding: 0, fontStyle: "italic",
                                color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.6,
                                borderLeft: "3px solid #00ff41", paddingLeft: 16,
                            }}>
                                &ldquo;We don&apos;t just automate your business. We engineer the neurobiology of choice — so your customers say yes before they know why.&rdquo;
                            </blockquote>
                            <div style={{ marginTop: 12, fontSize: 12, color: "#00ff41", fontWeight: 700 }}>
                                — Billy De La Taurus, Founder
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ STATS STRIP ═══ */}
            <section
                ref={statsRef}
                style={{
                    padding: "48px 24px",
                    borderTop: "1px solid rgba(59,130,246,0.1)",
                    borderBottom: "1px solid rgba(59,130,246,0.1)",
                    background: "linear-gradient(180deg, rgba(59,130,246,0.02) 0%, transparent 100%)",
                    opacity: statsVisible ? 1 : 0,
                    transform: statsVisible ? "translateY(0)" : "translateY(20px)",
                    transition: "all 0.6s ease-out",
                }}
            >
                <div style={{
                    maxWidth: 900, margin: "0 auto",
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16,
                }}>
                    <StatCard val={2.4} suffix="M+" label="Revenue Recovered" isVisible={statsVisible} />
                    <StatCard val={11} suffix="" label="AI Agents" isVisible={statsVisible} />
                    <StatCard val={5} suffix="x" label="ROI Guaranteed" isVisible={statsVisible} />
                    <StatCard val={4000} suffix="+" label="Community Members" isVisible={statsVisible} />
                    <StatCard val={85} suffix="%" label="Cost Reduction" isVisible={statsVisible} />
                </div>
            </section>

            {/* ═══ THE SCIENCE ═══ */}
            <section
                ref={scienceRef}
                style={{
                    padding: "80px 24px", maxWidth: 1000, margin: "0 auto",
                    opacity: scienceVisible ? 1 : 0,
                    transform: scienceVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <div style={{
                        fontSize: 10, fontWeight: 700, color: "#00ff41",
                        textTransform: "uppercase" as const, letterSpacing: "0.15em", marginBottom: 12,
                    }}>OUR SCIENTIFIC FRAMEWORK</div>
                    <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.03em" }}>
                        The <span className="about-gradient-text">Neurobiology of Choice</span>
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 650, margin: "0 auto", lineHeight: 1.65, fontSize: 15 }}>
                        85% of buying decisions happen subconsciously. We reverse-engineer the neurobiological pathways of decision-making — dopamine loops, loss aversion triggers, and cognitive load thresholds — to build AI that naturally guides prospects to &ldquo;yes.&rdquo;
                    </p>
                </div>

                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 20,
                }}>
                    {SCIENCE_PILLARS.map((item, i) => (
                        <div key={item.title} className="about-science-card" style={{
                            padding: 28, borderRadius: 20,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            animation: `fadeUp 0.6s ease-out ${i * 0.1}s both`,
                        }}>
                            <div style={{ fontSize: 36, marginBottom: 14 }}>{item.icon}</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: item.color }}>{item.title}</h3>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ THE ELITE 11 AI TEAM ═══ */}
            <section
                ref={teamRef}
                style={{
                    padding: "80px 24px",
                    borderTop: "1px solid rgba(0,255,65,0.08)",
                    opacity: teamVisible ? 1 : 0,
                    transform: teamVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
                    <div style={{
                        fontSize: 10, fontWeight: 700, color: "#3b82f6",
                        textTransform: "uppercase" as const, letterSpacing: "0.15em", marginBottom: 12,
                    }}>THE ELITE TEAM</div>
                    <h2 style={{
                        fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800,
                        marginBottom: 16, letterSpacing: "-0.03em",
                    }}>
                        The Elite 11 <span className="about-gradient-text">Workforce.</span>
                    </h2>
                    <p style={{
                        color: "rgba(255,255,255,0.6)", maxWidth: 600,
                        margin: "0 auto 48px", lineHeight: 1.65, fontSize: 15,
                    }}>
                        The world&apos;s first autonomous neuro-workforce. These aren&apos;t bots — they&apos;re neuroscience-trained specialists that operate 24/7 to capture, qualify, and close for your business.
                    </p>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: 20,
                    }}>
                        {AGENTS.map((agent, i) => (
                            <div
                                key={agent.id}
                                className="about-agent-card"
                                style={{
                                    padding: 28, borderRadius: 24, textAlign: "left",
                                    background: `linear-gradient(135deg, ${agent.color}08 0%, rgba(255,255,255,0.02) 100%)`,
                                    border: `1px solid ${agent.color}20`,
                                    position: "relative", overflow: "hidden",
                                    animation: `fadeUp 0.5s ease-out ${i * 0.06}s both`,
                                }}
                            >
                                {/* Accent glow bar */}
                                <div style={{
                                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                                    background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
                                    opacity: 0.4,
                                }} />

                                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${agent.color}, rgba(0,0,0,0.4))`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden", position: "relative",
                                        border: `2px solid ${agent.color}`,
                                        boxShadow: `0 0 20px ${agent.color}33`,
                                    }}>
                                        <Image
                                            src={agent.image}
                                            alt={agent.name}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: agent.color }}>{agent.name}</div>
                                        <div style={{
                                            fontSize: 10, fontWeight: 700, color: agent.color,
                                            textTransform: "uppercase" as const, letterSpacing: "0.06em", opacity: 0.8,
                                        }}>{agent.role}</div>
                                    </div>
                                    {/* Live indicator */}
                                    <div style={{
                                        marginLeft: "auto", width: 8, height: 8, borderRadius: "50%",
                                        background: agent.color,
                                        boxShadow: `0 0 8px ${agent.color}`,
                                        animation: "pulse 2s ease-in-out infinite",
                                    }} />
                                </div>

                                {/* Chips */}
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                                    <span style={{
                                        padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                                        background: `${agent.color}15`, border: `1px solid ${agent.color}30`,
                                        color: agent.color,
                                    }}>🧠 {agent.brain}</span>
                                    <span style={{
                                        padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                                        color: "rgba(255,255,255,0.5)",
                                    }}>🎙️ {agent.voice}</span>
                                </div>

                                <p style={{
                                    fontSize: 14, color: "rgba(255,255,255,0.7)",
                                    lineHeight: 1.65, margin: "0 0 16px",
                                }}>{agent.desc}</p>

                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    fontSize: 11, fontWeight: 700, color: agent.color,
                                    paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)",
                                }}>
                                    <span style={{ opacity: 0.5 }}>RESULT:</span>
                                    <span>{agent.result}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ MISSION / CTA ═══ */}
            <section
                ref={missionRef}
                style={{
                    padding: "100px 24px", textAlign: "center",
                    opacity: missionVisible ? 1 : 0,
                    transform: missionVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                    background: "linear-gradient(180deg, transparent, rgba(0,255,65,0.03))",
                    borderTop: "1px solid rgba(0,255,65,0.08)",
                    position: "relative",
                }}
            >
                {/* Background radial */}
                <div style={{
                    position: "absolute", bottom: 0, left: "50%",
                    transform: "translateX(-50%)",
                    width: 800, height: 400,
                    background: "radial-gradient(ellipse, rgba(0,255,65,0.04) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                <h2 style={{
                    fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800,
                    marginBottom: 20, letterSpacing: "-0.03em",
                    position: "relative",
                }}>
                    Our Mission
                </h2>
                <p style={{
                    fontSize: 18, color: "rgba(255,255,255,0.7)", maxWidth: 650,
                    margin: "0 auto 40px", lineHeight: 1.65, position: "relative",
                }}>
                    Make the science of persuasion accessible to every business — through AI that sells smarter, recovers revenue faster, and grows companies while their owners sleep.
                </p>

                <div style={{ position: "relative" }}>
                    <div style={{
                        position: "absolute", inset: -12,
                        borderRadius: 24,
                        background: "radial-gradient(ellipse, rgba(0,255,65,0.12) 0%, transparent 70%)",
                        animation: "pulse 3s ease-in-out infinite",
                        pointerEvents: "none",
                    }} />
                    <Link href="/" style={{
                        display: "inline-block", position: "relative",
                        padding: "18px 40px", borderRadius: 14,
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        color: "#000", textDecoration: "none", fontWeight: 800, fontSize: 17,
                        boxShadow: "0 4px 40px rgba(0,255,65,0.3)",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        letterSpacing: "-0.01em",
                    }}>
                        Talk to Jenny — See the Science in Action
                    </Link>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer style={{
                padding: "40px 24px", textAlign: "center",
                borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
                <div style={{
                    display: "flex", justifyContent: "center", gap: 24,
                    flexWrap: "wrap", marginBottom: 20,
                }}>
                    {[
                        { label: "Home", href: "/" },
                        { label: "Pricing", href: "/pricing" },
                        { label: "Free Audit", href: "/audit" },
                        { label: "Blog", href: "/blog" },
                        { label: "Security", href: "/security" },
                    ].map(link => (
                        <Link key={link.label} href={link.href} style={{
                            fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)",
                            textDecoration: "none", transition: "color 0.2s",
                        }}>{link.label}</Link>
                    ))}
                </div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                    © {new Date().getFullYear()} BioDynamX Engineering Group. The Neurobiology of Choice.
                </div>
            </footer>

            {/* ═══ Responsive overrides ═══ */}
            <style>{`
                @media (max-width: 768px) {
                    nav { padding: 12px 16px !important; }
                    nav .about-nav-link { display: none; }
                    section > div[style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
}
