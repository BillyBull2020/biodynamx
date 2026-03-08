"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Neural 4-Pack Data ──────────────────────────────────────────────────────
const CLUSTERS = [
    {
        id: "nervous",
        icon: "🎙️",
        label: "The Nervous System",
        sublabel: "Speed & Interface",
        color: "#00ff41",
        glow: "rgba(0,255,65,0.25)",
        border: "rgba(0,255,65,0.3)",
        bg: "rgba(0,255,65,0.06)",
        points: [
            { icon: "🎙️", label: "Interface", comp: "Antiquated Chatbots (Typing)", us: "100% Live Voice AI (Speaking)" },
            { icon: "⚡", label: "Response", comp: "15–30 Second Latency", us: "< 1 Second (Native Audio)" },
            { icon: "🎵", label: "Latency", comp: "Text-to-Speech Lag", us: "Live Flash Native Audio" },
            { icon: "📲", label: "Inbound", comp: "Voicemail / Missed", us: "Instant AI Textback / Callback" },
            { icon: "🌐", label: "Availability", comp: "Human (9-5 / M-F)", us: "Universal (24/7/365)" },
        ],
    },
    {
        id: "prefrontal",
        icon: "🧠",
        label: "The Prefrontal Cortex",
        sublabel: "Logic & Strategy",
        color: "#3b82f6",
        glow: "rgba(59,130,246,0.25)",
        border: "rgba(59,130,246,0.3)",
        bg: "rgba(59,130,246,0.06)",
        points: [
            { icon: "🔱", label: "Architecture", comp: "Single-Path Chatbots", us: "IronClaw Multi-Agent Core" },
            { icon: "🧬", label: "Intelligence", comp: "Basic LLM Wrappers", us: "Vertex AI Enterprise Logic" },
            { icon: "🎯", label: "Strategy", comp: "Reactive Support", us: "Quarterly Neuro-Audits" },
            { icon: "⚙️", label: "Integration", comp: "Manual Data Entry", us: "1,000+ API Direct Syncs" },
            { icon: "💡", label: "Psychology", comp: "Generic Prompting", us: "Neurobiology & SPIN Native" },
        ],
    },
    {
        id: "immune",
        icon: "🛡️",
        label: "The Immune System",
        sublabel: "Trust & Security",
        color: "#8b5cf6",
        glow: "rgba(139,92,246,0.25)",
        border: "rgba(139,92,246,0.3)",
        bg: "rgba(139,92,246,0.06)",
        points: [
            { icon: "🔐", label: "Security", comp: "Standard Encryption", us: "AES-256 Military Grade" },
            { icon: "🔒", label: "Trust", comp: "No Guarantees", us: "Triple-Lock 5X ROI Guarantee" },
            { icon: "🛡️", label: "Branding", comp: "'Powered by Vendor' Logos", us: "Absolute Brand Secrecy" },
            { icon: "💰", label: "Pricing", comp: "15% Revenue / Usage Tax", us: "$1,497 / 90-Day Trial" },
            { icon: "🧠", label: "Visuals", comp: "Static Stock Photos", us: "Nana Banana 2 (Dual-Coding)" },
        ],
    },
    {
        id: "autonomic",
        icon: "🌌",
        label: "The Autonomic System",
        sublabel: "Presence & Growth",
        color: "#f59e0b",
        glow: "rgba(245,158,11,0.25)",
        border: "rgba(245,158,11,0.3)",
        bg: "rgba(245,158,11,0.06)",
        points: [
            { icon: "📱", label: "Social Media", comp: "Expensive Agencies", us: "24/7 AI Social Admin (Iris)" },
            { icon: "📍", label: "Local SEO", comp: "Manual Updates", us: "Free AI GMB Optimization" },
            { icon: "🔍", label: "AI Visibility", comp: "Zero Presence", us: "GEO/AEO Indexing Ready" },
            { icon: "⭐", label: "Reviews", comp: "Forgotten Customers", us: "AI List Reactivation" },
            { icon: "🤖", label: "Autonomy", comp: "Semi-Automated Bots", us: "Fully Agentic / Self-Nav" },
            { icon: "🌌", label: "Experience", comp: "Boring UI/UX", us: "Web 4.0 Immersive Vault" },
        ],
    },
];

// ─── Single Point Card ────────────────────────────────────────────────────────
function PointCard({ point, color, glow, idx }: { point: typeof CLUSTERS[0]["points"][0]; color: string; glow: string; idx: number }) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        cardRef.current.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`;
        cardRef.current.style.boxShadow = `0 8px 32px ${glow}, inset 0 1px 0 rgba(255,255,255,0.1)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0)";
        cardRef.current.style.boxShadow = `0 2px 12px rgba(0,0,0,0.3)`;
    };

    return (
        <div
            ref={cardRef}
            className="adv-point-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                minWidth: 280,
                maxWidth: 300,
                flexShrink: 0,
                background: "rgba(10,10,14,0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 20,
                padding: "24px 20px",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                cursor: "default",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                animationDelay: `${idx * 0.05}s`,
            }}
        >
            <div style={{ fontSize: 32 }}>{point.icon}</div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: color, textTransform: "uppercase" }}>{point.label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,80,80,0.06)", border: "1px solid rgba(255,80,80,0.15)",
                    fontSize: 12, color: "rgba(255,130,130,0.8)", display: "flex", gap: 8, alignItems: "center",
                }}>
                    <span style={{ opacity: 0.6 }}>✗</span>
                    <span>{point.comp}</span>
                </div>
                <div style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: `${color}0a`, border: `1px solid ${color}30`,
                    fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", gap: 8, alignItems: "center",
                }}>
                    <span style={{ color }}>✓</span>
                    <span>{point.us}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Cluster Block ────────────────────────────────────────────────────────────
function ClusterBlock({ cluster, isActive, onToggle }: {
    cluster: typeof CLUSTERS[0];
    isActive: boolean;
    onToggle: () => void;
}) {
    const trackRef = useRef<HTMLDivElement>(null);
    const scrollX = useRef(0);
    const isDragging = useRef(false);
    const startX = useRef(0);

    // Mouse drag scroll
    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.clientX - scrollX.current;
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !trackRef.current) return;
        scrollX.current = e.clientX - startX.current;
        const max = 0;
        const min = -(trackRef.current.scrollWidth - trackRef.current.parentElement!.clientWidth);
        scrollX.current = Math.max(min, Math.min(max, scrollX.current));
        trackRef.current.style.transform = `translateX(${scrollX.current}px)`;
    };
    const onMouseUp = () => { isDragging.current = false; };

    return (
        <div
            id={`cluster-${cluster.id}`}
            style={{
                borderRadius: 28,
                border: `1px solid ${isActive ? cluster.border : "rgba(255,255,255,0.07)"}`,
                background: isActive ? cluster.bg : "rgba(255,255,255,0.02)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                overflow: "hidden",
                transition: "border-color 0.4s, background 0.4s",
                marginBottom: 16,
            }}
        >
            {/* Cluster Header — clickable toggle */}
            <button
                onClick={onToggle}
                style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "28px 32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    textAlign: "left",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    {/* Animated icon badge */}
                    <div style={{
                        width: 64, height: 64, borderRadius: 18,
                        background: `linear-gradient(135deg, ${cluster.color}20, ${cluster.color}08)`,
                        border: `1px solid ${cluster.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 28,
                        boxShadow: isActive ? `0 0 24px ${cluster.glow}` : "none",
                        transition: "box-shadow 0.4s",
                    }}>
                        {cluster.icon}
                    </div>
                    <div>
                        <div style={{
                            fontSize: "clamp(18px, 2.5vw, 24px)",
                            fontWeight: 900, color: "#fff", letterSpacing: "-0.02em",
                        }}>
                            {cluster.label}
                        </div>
                        <div style={{
                            fontSize: 12, fontWeight: 700,
                            color: cluster.color, letterSpacing: "0.08em",
                            textTransform: "uppercase", marginTop: 4,
                        }}>
                            {cluster.sublabel} · {cluster.points.length} capabilities
                        </div>
                    </div>
                </div>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: `1px solid ${cluster.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: cluster.color, fontSize: 18,
                    transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.35s ease",
                    flexShrink: 0,
                }}>
                    ↓
                </div>
            </button>

            {/* Horizontal scroll track — shown when active */}
            {isActive && (
                <div
                    style={{
                        overflow: "hidden",
                        paddingBottom: 32,
                        cursor: "grab",
                        userSelect: "none",
                    }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                >
                    <div
                        ref={trackRef}
                        style={{
                            display: "flex",
                            gap: 16,
                            padding: "4px 32px 8px",
                            transition: "transform 0.1s ease",
                            willChange: "transform",
                        }}
                    >
                        {cluster.points.map((point, idx) => (
                            <PointCard
                                key={point.label}
                                point={point}
                                color={cluster.color}
                                glow={cluster.glow}
                                idx={idx}
                            />
                        ))}
                    </div>

                    {/* Scroll hint */}
                    <div style={{
                        textAlign: "center", fontSize: 11, fontWeight: 600,
                        color: "rgba(255,255,255,0.25)", marginTop: 8, letterSpacing: "0.08em",
                    }}>
                        ← DRAG TO EXPLORE →
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function AdvantageSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const headRef = useRef<HTMLDivElement>(null);
    const clusterRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeCluster, setActiveCluster] = useState<string>("nervous");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const ctx = gsap.context(() => {
            // Header entrance
            gsap.from(headRef.current, {
                y: 60, opacity: 0, duration: 1.2, ease: "power3.out",
                scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true }
            });

            // Cluster blocks stagger in
            clusterRefs.current.forEach((el, i) => {
                if (!el) return;
                gsap.from(el, {
                    y: 50, opacity: 0, duration: 0.7, ease: "power2.out",
                    delay: i * 0.1,
                    scrollTrigger: { trigger: el, start: "top 90%", once: true },
                });
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const handleToggle = (id: string) => {
        setActiveCluster(prev => prev === id ? "" : id);
    };

    return (
        <section
            ref={sectionRef}
            id="advantage"
            style={{
                padding: "120px 24px 100px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background: neural radial grid */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "radial-gradient(circle, rgba(0,255,65,0.03) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                opacity: 0.6,
            }} />

            {/* Bio-gradient orbs */}
            <div style={{
                position: "absolute", top: "10%", left: "5%",
                width: 480, height: 480, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(0,255,65,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute", bottom: "5%", right: "5%",
                width: 560, height: 560, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 1 }}>

                {/* ── Section Header ── */}
                <div ref={headRef} style={{ textAlign: "center", marginBottom: 72 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.2)",
                        padding: "8px 20px", borderRadius: 100, marginBottom: 24,
                    }}>
                        <span style={{ color: "#00ff41", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em" }}>
                            THE BIODYNAMX ADVANTAGE · NEURAL 4-PACK
                        </span>
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
                        maxWidth: 640, margin: "0 auto 32px", lineHeight: 1.7,
                    }}>
                        21 capabilities. 4 Bio-Clusters. Select a cluster to explore your competitive edge — built on the{" "}
                        <strong style={{ color: "#fff" }}>Neurobiology of Choice™</strong>.
                    </p>

                    {/* Quick-jump cluster tabs */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                        {CLUSTERS.map(c => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    setActiveCluster(prev => prev === c.id ? "" : c.id);
                                    const el = document.getElementById(`cluster-${c.id}`);
                                    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                                }}
                                style={{
                                    padding: "10px 20px", borderRadius: 100,
                                    border: `1px solid ${activeCluster === c.id ? c.border : "rgba(255,255,255,0.1)"}`,
                                    background: activeCluster === c.id ? c.bg : "rgba(255,255,255,0.03)",
                                    color: activeCluster === c.id ? c.color : "rgba(255,255,255,0.5)",
                                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    display: "flex", alignItems: "center", gap: 8,
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                <span>{c.icon}</span>
                                <span>{c.label.split(" ").slice(2).join(" ")}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── 4 Cluster Blocks ── */}
                <div>
                    {CLUSTERS.map((cluster, i) => (
                        <div key={cluster.id} ref={el => { clusterRefs.current[i] = el; }}>
                            <ClusterBlock
                                cluster={cluster}
                                isActive={activeCluster === cluster.id}
                                onToggle={() => handleToggle(cluster.id)}
                            />
                        </div>
                    ))}
                </div>

                {/* ── Bottom CTA ── */}
                <div style={{
                    marginTop: 72, textAlign: "center",
                    padding: "56px 32px",
                    background: "linear-gradient(135deg, rgba(0,255,65,0.06), rgba(59,130,246,0.06))",
                    border: "1px solid rgba(0,255,65,0.15)",
                    borderRadius: 32,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    position: "relative", overflow: "hidden",
                }}>
                    {/* Glow orb inside card */}
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400, height: 200, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(0,255,65,0.08) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{
                            fontSize: 13, fontWeight: 700, color: "#00ff41",
                            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16,
                        }}>
                            The Elite Investment
                        </div>
                        <h3 style={{
                            fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, marginBottom: 12,
                            background: "linear-gradient(135deg, #fff, rgba(0,255,65,0.9))",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        }}>
                            A Full Neural Workforce for $1,497/mo.
                        </h3>
                        <p style={{
                            fontSize: 16, color: "rgba(255,255,255,0.5)",
                            maxWidth: 560, margin: "0 auto 12px", lineHeight: 1.7,
                        }}>
                            Valued at $10,000+/mo in human labor. All 21 capabilities above. All 11 AI agents. Locked in for your first 90 days.
                        </p>
                        <p style={{
                            fontSize: 12, color: "rgba(255,255,255,0.3)",
                            marginBottom: 36, fontStyle: "italic",
                        }}>
                            Full rate is $2,497/mo. Introductory 90-day lock at $1,497/mo — rate locks at signup. 4 spots remaining.
                        </p>
                        <div style={{
                            display: "inline-flex", flexDirection: "column", alignItems: "center",
                            background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.25)",
                            padding: "28px 52px", borderRadius: 24, marginBottom: 24,
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#22c55e", letterSpacing: "0.1em", marginBottom: 8 }}>
                                ⚡ LIMITED — 90-DAY TRIAL RATE
                            </div>
                            <div style={{
                                fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1,
                                display: "flex", alignItems: "flex-start", gap: 4,
                            }}>
                                <span style={{ fontSize: 24, paddingTop: 8, color: "#00ff41" }}>$</span>
                                1,497
                                <span style={{ fontSize: 18, paddingTop: 8, color: "rgba(255,255,255,0.5)" }}>/mo</span>
                            </div>
                            <div style={{
                                fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6,
                                textDecoration: "line-through",
                            }}>
                                $2,497/mo standard rate
                            </div>
                        </div>
                        <br />
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            style={{
                                padding: "18px 48px", borderRadius: 14,
                                background: "linear-gradient(135deg, #00ff41, #22c55e)",
                                color: "#000",
                                fontWeight: 900, fontSize: 17, border: "none", cursor: "pointer",
                                boxShadow: "0 12px 32px rgba(0,255,65,0.35)",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                letterSpacing: "-0.01em",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 20px 48px rgba(0,255,65,0.45)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 32px rgba(0,255,65,0.35)";
                            }}
                        >
                            Claim My 90-Day Trial Offer →
                        </button>
                        <div style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                            Triple-Lock 5X ROI Guarantee · No contracts · Cancel anytime
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .adv-point-card {
                    animation: adv-card-in 0.5s ease both;
                }
                @keyframes adv-card-in {
                    from { opacity: 0; transform: translateY(20px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </section>
    );
}
