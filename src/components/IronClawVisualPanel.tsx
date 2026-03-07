"use client";

// ═══════════════════════════════════════════════════════════════════════════
// VISUAL INTELLIGENCE PANEL
// The cinematic "second screen" that responds to the conversation.
// Shows AI-generated images, live stats, navigation prompts.
// Triggered by VisualBridge events from VisualJenny / VoiceOrchestrator.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from "react";
import { VisualBridge, type VisualCommand } from "@/lib/visual-bridge";

// ── Brain Layer Color Map ──────────────────────────────────────────────────
const BRAIN_COLORS: Record<string, { primary: string; secondary: string; glow: string; label: string }> = {
    reptilian: {
        primary: "#ff3b30",
        secondary: "#ff6b35",
        glow: "rgba(255,59,48,0.4)",
        label: "SURVIVAL BRAIN",
    },
    limbic: {
        primary: "#6366f1",
        secondary: "#a78bfa",
        glow: "rgba(99,102,241,0.4)",
        label: "EMOTIONAL BRAIN",
    },
    neocortex: {
        primary: "#00ff88",
        secondary: "#34d399",
        glow: "rgba(0,255,136,0.3)",
        label: "RATIONAL BRAIN",
    },
    close: {
        primary: "#fbbf24",
        secondary: "#f59e0b",
        glow: "rgba(251,191,36,0.4)",
        label: "DECISION MOMENT",
    },
    discovery: {
        primary: "#38bdf8",
        secondary: "#7dd3fc",
        glow: "rgba(56,189,248,0.3)",
        label: "DISCOVERY PHASE",
    },
};

// ── Types ──────────────────────────────────────────────────────────────────
interface VisualState {
    type: "idle" | "image" | "stats" | "loading" | "navigate" | "comparison";
    imageDataUrl?: string;
    brainLayer?: string;
    neuroReason?: string;
    title?: string;
    stats?: Record<string, string | number>;
    sectionId?: string;
    transition?: "fade" | "slide" | "zoom" | "pulse";
}

interface IronClawVisualPanelProps {
    isActive: boolean; // true when voice session is running
    agentName?: string;
    agentColor?: string;
    onManualVisual?: (visual: { imageDataUrl: string; brainLayer: string; neuroReason: string; topic: string }) => void;
}

// ── Panel Component ────────────────────────────────────────────────────────

export default function VisualIntelligencePanel({ isActive, agentName = "Jenny" }: IronClawVisualPanelProps) {
    const [visual, setVisual] = useState<VisualState>({ type: "idle" });
    const [isAnimating, setIsAnimating] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const [particleKey, setParticleKey] = useState(0);
    const panelRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Handle incoming VisualBridge command ─────────────────────────────
    const handleVisualCommand = useCallback((command: VisualCommand) => {
        setIsAnimating(true);
        setShowPanel(true);
        setParticleKey(k => k + 1);

        switch (command.type) {
            case "show_image":
                setVisual({
                    type: "image",
                    imageDataUrl: command.payload.imageDataUrl || command.payload.imageUrl,
                    brainLayer: command.payload.brainLayer || "limbic",
                    neuroReason: command.payload.neuroReason,
                    title: command.payload.title,
                    transition: command.payload.transition || "fade",
                });
                // Auto-clear after duration
                if (command.payload.duration) {
                    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
                    fadeTimerRef.current = setTimeout(() => {
                        setVisual({ type: "idle" });
                    }, command.payload.duration);
                }
                break;

            case "show_stats_card":
                setVisual({
                    type: "stats",
                    stats: command.payload.stats,
                    title: command.payload.title,
                    brainLayer: command.payload.brainLayer || "neocortex",
                    transition: command.payload.transition || "slide",
                });
                if (command.payload.duration) {
                    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
                    fadeTimerRef.current = setTimeout(() => setVisual({ type: "idle" }), command.payload.duration);
                }
                break;

            case "show_loading":
                setVisual({
                    type: "loading",
                    title: command.payload.title || "Analyzing...",
                    brainLayer: command.payload.brainLayer || "limbic",
                    transition: "pulse",
                });
                break;

            case "navigate_section": {
                const sectionId = command.payload.sectionId;
                setVisual({
                    type: "navigate",
                    sectionId,
                    title: `Navigating to ${sectionId}`,
                });
                // Actually scroll the page to the section
                const el = document.getElementById(sectionId || "");
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                setTimeout(() => setVisual({ type: "idle" }), 3000);
                break;
            }

            case "show_comparison":
                setVisual({
                    type: "comparison",
                    stats: command.payload.stats,
                    title: command.payload.title,
                    brainLayer: "reptilian",
                });
                if (command.payload.duration) {
                    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
                    fadeTimerRef.current = setTimeout(() => setVisual({ type: "idle" }), command.payload.duration);
                }
                break;

            case "clear_visual":
                setVisual({ type: "idle" });
                break;
        }

        setTimeout(() => setIsAnimating(false), 600);
    }, []);

    // ── Subscribe to VisualBridge ────────────────────────────────────────
    useEffect(() => {
        if (!isActive) return;

        const unsub = VisualBridge.onVisualCommand((command: VisualCommand) => {
            handleVisualCommand(command);
        });

        return () => {
            unsub();
            if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
            setShowPanel(false);
        };
    }, [isActive, handleVisualCommand]);

    // ── Neural Particle Canvas ───────────────────────────────────────────
    useEffect(() => {
        if (!isActive || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = canvas.offsetWidth;
        const H = canvas.offsetHeight;
        canvas.width = W;
        canvas.height = H;

        const brainColor = BRAIN_COLORS[visual.brainLayer || "limbic"];
        const particleColor = brainColor?.primary || "#6366f1";

        interface Particle {
            x: number; y: number; vx: number; vy: number;
            size: number; alpha: number; life: number; maxLife: number;
        }

        const particles: Particle[] = [];
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.6 + 0.2,
                life: Math.random() * 200,
                maxLife: 200 + Math.random() * 200,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, W, H);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life++;

                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;

                const lifeRatio = p.life / p.maxLife;
                const alpha = lifeRatio < 0.2 ? lifeRatio / 0.2 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = particleColor + Math.floor(alpha * p.alpha * 180).toString(16).padStart(2, "0");
                ctx.fill();

                // Draw connection lines
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - p.x;
                    const dy = particles[j].y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 80) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = particleColor + Math.floor((1 - dist / 80) * 30).toString(16).padStart(2, "0");
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                if (p.life >= p.maxLife) {
                    p.x = Math.random() * W;
                    p.y = Math.random() * H;
                    p.life = 0;
                }
            }

            animFrameRef.current = requestAnimationFrame(draw);
        };

        animFrameRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [isActive, visual.brainLayer, particleKey]);

    // ── Render nothing when not active ─────────────────────────────────
    if (!isActive) return null;

    const brainInfo = BRAIN_COLORS[visual.brainLayer || "limbic"] || BRAIN_COLORS.limbic;

    return (
        <div
            ref={panelRef}
            style={{
                position: "relative",
                width: "100%",
                borderRadius: 24,
                overflow: "hidden",
                background: "rgba(0,0,0,0.85)",
                border: `1px solid ${brainInfo.primary}33`,
                boxShadow: `0 0 40px ${brainInfo.glow}, 0 0 80px ${brainInfo.glow}44, inset 0 0 60px rgba(0,0,0,0.5)`,
                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                minHeight: showPanel ? 340 : 120,
                backdropFilter: "blur(20px)",
            }}
        >
            {/* Neural particle canvas — always running */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0.5,
                    pointerEvents: "none",
                }}
            />

            {/* Holographic shimmer line */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${brainInfo.primary}, ${brainInfo.secondary}, ${brainInfo.primary}, transparent)`,
                animation: "vp-shimmer 3s linear infinite",
                opacity: 0.8,
            }} />

            {/* Header bar */}
            <div style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: `1px solid ${brainInfo.primary}22`,
                background: "rgba(0,0,0,0.4)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Pulsing live dot */}
                    <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: brainInfo.primary,
                        boxShadow: `0 0 8px ${brainInfo.primary}`,
                        animation: "vp-pulse 1.2s ease-in-out infinite",
                    }} />
                    <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        color: brainInfo.primary,
                        fontFamily: "monospace",
                        textTransform: "uppercase",
                    }}>
                        {agentName.toUpperCase()} · VISUAL INTELLIGENCE
                    </span>
                </div>
                <div style={{
                    fontSize: 10,
                    color: brainInfo.secondary,
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    background: `${brainInfo.primary}22`,
                    border: `1px solid ${brainInfo.primary}44`,
                    padding: "3px 10px",
                    borderRadius: 20,
                }}>
                    {brainInfo.label}
                </div>
            </div>

            {/* Main content area */}
            <div style={{ position: "relative", zIndex: 2, padding: 20 }}>

                {/* IDLE STATE */}
                {visual.type === "idle" && !showPanel && (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px 0",
                        gap: 12,
                    }}>
                        <div style={{
                            fontSize: 36,
                            animation: "vp-float 3s ease-in-out infinite",
                        }}>🧠</div>
                        <p style={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: 13,
                            margin: 0,
                            textAlign: "center",
                            letterSpacing: "0.05em",
                        }}>
                            Listening to your conversation...
                        </p>
                        <p style={{
                            color: "rgba(255,255,255,0.2)",
                            fontSize: 11,
                            margin: 0,
                            textAlign: "center",
                        }}>
                            Visuals appear automatically as you speak
                        </p>
                    </div>
                )}

                {/* IMAGE STATE — AI-generated neuro visual */}
                {visual.type === "image" && visual.imageDataUrl && (
                    <div style={{
                        animation: `vp-${visual.transition || "fade"}-in 0.6s cubic-bezier(0.16,1,0.3,1) forwards`,
                    }}>
                        <div style={{
                            position: "relative",
                            borderRadius: 16,
                            overflow: "hidden",
                            border: `1px solid ${brainInfo.primary}44`,
                            boxShadow: `0 0 30px ${brainInfo.glow}`,
                        }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={visual.imageDataUrl}
                                alt={visual.neuroReason || "AI Visual"}
                                style={{
                                    width: "100%",
                                    height: "240px",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                            {/* Overlay gradient at bottom */}
                            <div style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: "60%",
                                background: `linear-gradient(transparent, rgba(0,0,0,0.85))`,
                                display: "flex",
                                alignItems: "flex-end",
                                padding: "16px",
                            }}>
                                <div>
                                    {visual.title && (
                                        <p style={{
                                            color: brainInfo.primary,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            margin: "0 0 4px 0",
                                            letterSpacing: "0.05em",
                                            textTransform: "uppercase",
                                        }}>
                                            {visual.title.replace(/_/g, " ")}
                                        </p>
                                    )}
                                    {visual.neuroReason && (
                                        <p style={{
                                            color: "rgba(255,255,255,0.7)",
                                            fontSize: 11,
                                            margin: 0,
                                            fontStyle: "italic",
                                        }}>
                                            {visual.neuroReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STATS CARD STATE — Revenue/ROI data */}
                {visual.type === "stats" && visual.stats && (
                    <div style={{ animation: "vp-slide-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}>
                        {visual.title && (
                            <h4 style={{
                                color: brainInfo.primary,
                                fontSize: 14,
                                fontWeight: 700,
                                margin: "0 0 16px 0",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                            }}>
                                {visual.title}
                            </h4>
                        )}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {Object.entries(visual.stats).map(([key, value]) => (
                                <div key={key} style={{
                                    background: `${brainInfo.primary}11`,
                                    border: `1px solid ${brainInfo.primary}33`,
                                    borderRadius: 12,
                                    padding: "14px 16px",
                                    backdropFilter: "blur(8px)",
                                }}>
                                    <div style={{
                                        fontSize: 22,
                                        fontWeight: 800,
                                        color: brainInfo.primary,
                                        lineHeight: 1,
                                        marginBottom: 6,
                                        fontVariantNumeric: "tabular-nums",
                                    }}>
                                        {value}
                                    </div>
                                    <div style={{
                                        fontSize: 10,
                                        color: "rgba(255,255,255,0.5)",
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                    }}>
                                        {key}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* LOADING STATE — audit in progress */}
                {visual.type === "loading" && (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 20,
                        padding: "32px 0",
                    }}>
                        {/* Spinning neural orb */}
                        <div style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            border: `2px solid ${brainInfo.primary}44`,
                            borderTop: `2px solid ${brainInfo.primary}`,
                            animation: "vp-spin 1s linear infinite",
                            boxShadow: `0 0 20px ${brainInfo.glow}`,
                        }} />
                        <div style={{ textAlign: "center" }}>
                            <p style={{
                                color: brainInfo.primary,
                                fontSize: 14,
                                fontWeight: 700,
                                margin: "0 0 8px 0",
                                letterSpacing: "0.08em",
                            }}>
                                {visual.title}
                            </p>
                            {/* Animated dots */}
                            <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        background: brainInfo.secondary,
                                        animation: `vp-dot 1.2s ${i * 0.2}s ease-in-out infinite`,
                                    }} />
                                ))}
                            </div>
                        </div>
                        {/* Linear progress bar */}
                        <div style={{
                            width: "100%",
                            height: 3,
                            background: "rgba(255,255,255,0.08)",
                            borderRadius: 3,
                            overflow: "hidden",
                        }}>
                            <div style={{
                                height: "100%",
                                width: "40%",
                                background: `linear-gradient(90deg, ${brainInfo.primary}, ${brainInfo.secondary})`,
                                borderRadius: 3,
                                animation: "vp-progress 1.8s ease-in-out infinite",
                                boxShadow: `0 0 8px ${brainInfo.glow}`,
                            }} />
                        </div>
                    </div>
                )}

                {/* NAVIGATE STATE */}
                {visual.type === "navigate" && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "20px 0",
                        animation: "vp-fade-in 0.4s ease forwards",
                    }}>
                        <div style={{
                            fontSize: 32,
                            animation: "vp-float 1.5s ease-in-out infinite",
                        }}>🎯</div>
                        <div>
                            <p style={{
                                color: brainInfo.primary,
                                fontSize: 14,
                                fontWeight: 700,
                                margin: "0 0 4px 0",
                                letterSpacing: "0.05em",
                            }}>
                                Navigating you now
                            </p>
                            <p style={{
                                color: "rgba(255,255,255,0.5)",
                                fontSize: 12,
                                margin: 0,
                            }}>
                                Scrolling to → <strong style={{ color: brainInfo.secondary }}>{visual.sectionId}</strong>
                            </p>
                        </div>
                    </div>
                )}

                {/* COMPARISON STATE — competitor data */}
                {visual.type === "comparison" && visual.stats && (
                    <div style={{ animation: "vp-slide-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}>
                        <h4 style={{
                            color: "#ff3b30",
                            fontSize: 13,
                            fontWeight: 700,
                            margin: "0 0 16px 0",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}>
                            ⚡ {visual.title || "Competitive Threat Analysis"}
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {Object.entries(visual.stats).slice(0, 5).map(([key, value]) => (
                                <div key={key} style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "rgba(255,59,48,0.08)",
                                    border: "1px solid rgba(255,59,48,0.2)",
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                }}>
                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{key}</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#ff3b30" }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Bottom status bar */}
            {showPanel && visual.type !== "idle" && (
                <div style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "10px 20px",
                    borderTop: `1px solid ${brainInfo.primary}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(0,0,0,0.3)",
                }}>
                    <span style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.3)",
                        fontFamily: "monospace",
                        letterSpacing: "0.08em",
                    }}>
                        AUTONOMOUS · REAL-TIME · PERSONALIZED
                    </span>
                    <span style={{
                        fontSize: 10,
                        color: brainInfo.primary,
                        fontFamily: "monospace",
                        letterSpacing: "0.08em",
                    }}>
                        AI · LIVE ·{" "}
                        <span style={{ color: brainInfo.secondary }}>
                            {isAnimating ? "PROCESSING..." : "ACTIVE"}
                        </span>
                    </span>
                </div>
            )}

            {/* CSS Keyframe Animations via style tag */}
            <style>{`
                @keyframes vp-shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes vp-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.8); }
                }
                @keyframes vp-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes vp-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes vp-dot {
                    0%, 100% { transform: scale(0.6); opacity: 0.3; }
                    50% { transform: scale(1.2); opacity: 1; }
                }
                @keyframes vp-progress {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(150%); }
                    100% { transform: translateX(-100%); }
                }
                @keyframes vp-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes vp-slide-in {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes vp-zoom-in {
                    from { opacity: 0; transform: scale(0.92); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
