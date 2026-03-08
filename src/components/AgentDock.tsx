"use client";

/**
 * AgentDock — BioDynamX Persistent Agent Dock · Web 4.1
 * ───────────────────────────────────────────────────────
 * Desktop:  Fixed glassmorphic right sidebar (vertical)
 * Mobile:   Horizontal thumb-zone pill fixed to bottom of screen
 *
 * Features:
 *  - 11 neural nodes with GSAP gold breathing pulse
 *  - Section-aware contextual status text
 *  - NeuralMemory integration — highlights last spoken-to agent
 *  - Mobile haptic feedback on agent node tap
 *  - Desktop: collapses 58px → 238px on hover
 *  - Mobile: horizontal scrollable strip, 60px tall, bottom-center
 */

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { NeuralMemory } from "@/lib/neural-memory";
import { hapticAgentWake } from "@/lib/haptic";

// ── Mini agent data (subset of full data, just what the dock needs) ──
const DOCK_AGENTS = [
    { name: "Jenny", image: "/agents/jenny.png", color: "#6366f1", task: "Finding ways to save you time today." },
    { name: "Nova", image: "/agents/nova_v2.png", color: "#ec4899", task: "Curating the best conversion path for you." },
    { name: "Iris", image: "/agents/iris.png", color: "#8b5cf6", task: "Preparing a custom visibility plan for you." },
    { name: "Megan", image: "/agents/meghan.png", color: "#a78bfa", task: "Making sure you feel heard and informed." },
    { name: "Vicki", image: "/agents/vicki.png", color: "#34d399", task: "Building trust signals tailored for you." },
    { name: "Alex", image: "/agents/alex.png", color: "#06b6d4", task: "Ensuring everything runs smoothly for you." },
    { name: "Zara", image: "/agents/zara.png", color: "#f97316", task: "Scanning your market for opportunities." },
    { name: "Ava", image: "/agents/ava.png", color: "#f59e0b", task: "Crafting your brand story right now." },
    { name: "Titan", image: "/agents/titan.png", color: "#3b82f6", task: "Calculating the clearest path to your goal." },
    { name: "Jules", image: "/agents/jules.png", color: "#60a5fa", task: "Designing your custom AI architecture." },
    { name: "Ben", image: "/agents/ben.png", color: "#fbbf24", task: "Making this information easy to understand for you." },
];

// Section-aware messages shown in the dock status
const SECTION_MESSAGES: Record<string, string> = {
    "hero": "Your AI workforce is ready.",
    "orbit": "Listening for your voice cue...",
    "how-it-works": "Ben is mapping your revenue path.",
    "pricing": "Ben is calculating the right option for your growth goals.",
    "agents": "Your dedicated team is standing by.",
    "testimonials": "Nova is curating social proof relevant to your industry.",
    "audit": "Zara is pre-scanning your market.",
    "default": "Your AI concierge team is active.",
};

export default function AgentDock() {
    const [visible, setVisible] = useState(false);
    const [activeNodeIdx, setActiveNodeIdx] = useState<number>(10); // Ben by default
    const [statusText, setStatusText] = useState("Your AI workforce is ready.");
    const [neuralCtx, setNeuralCtx] = useState(NeuralMemory.get());
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const dockRef = useRef<HTMLDivElement>(null);
    const taskIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMobileRef = useRef(false);

    // Subscribe to neural memory changes
    useEffect(() => {
        return NeuralMemory.subscribe(ctx => setNeuralCtx(ctx));
    }, []);

    // Mobile check
    useEffect(() => {
        const check = () => { isMobileRef.current = window.innerWidth <= 760; };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // ── bdx:swarm-card-flip — AdvantageVault agent auto-flip event ──
    // When a card is auto-flipped by the Ironclaw Swarm, this highlights
    // the relevant agent node and updates the dock status text.
    useEffect(() => {
        const handler = (e: Event) => {
            const { agentName, agentTask } = (e as CustomEvent).detail as {
                agentName: string; agentTask: string; cardTitle: string; cardIndex: number;
            };

            // Update status text in the dock
            setStatusText(`${agentName} is ${agentTask}...`);

            // Highlight the matching agent node
            const agentIdx = DOCK_AGENTS.findIndex(a => a.name === agentName);
            if (agentIdx >= 0) {
                setActiveNodeIdx(agentIdx);
                const nodeEl = nodeRefs.current[agentIdx];
                const agentColor = DOCK_AGENTS[agentIdx].color;
                if (nodeEl) {
                    gsap.to(nodeEl, {
                        backgroundColor: `${agentColor}33`,
                        boxShadow: `0 0 18px ${agentColor}60, 0 0 35px ${agentColor}25`,
                        borderColor: agentColor,
                        duration: 0.5,
                        ease: "power2.out",
                        onComplete: () => {
                            gsap.to(nodeEl, {
                                backgroundColor: "rgba(255,255,255,0.04)",
                                boxShadow: `0 0 14px ${agentColor}40`,
                                borderColor: `${agentColor}60`,
                                duration: 3,
                                ease: "power2.out",
                            });
                        },
                    });
                }
            }
        };

        window.addEventListener("bdx:swarm-card-flip", handler);
        return () => window.removeEventListener("bdx:swarm-card-flip", handler);
    }, []);

    // Show dock after scrolling past hero (~100px) — desktop only
    // Mobile: always visible (handled via CSS opacity: 1)
    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 120 && !isMobileRef.current) {
                setVisible(true);
            } else if (!isMobileRef.current) {
                setVisible(false);
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);


    // GSAP fade in/out dock
    useEffect(() => {
        const el = dockRef.current;
        if (!el) return;
        gsap.to(el, {
            opacity: visible ? 1 : 0,
            x: visible ? 0 : 30,
            duration: 0.7,
            ease: "power2.out",
            pointerEvents: visible ? "auto" : "none",
        });
    }, [visible]);

    // Section observer — detect which section user is in
    useEffect(() => {
        const sections = document.querySelectorAll("[data-dock-section]");
        if (sections.length === 0) return;

        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const key = entry.target.getAttribute("data-dock-section") || "default";
                    const msg = SECTION_MESSAGES[key] || SECTION_MESSAGES["default"];
                    setStatusText(msg);
                    NeuralMemory.update({ scrollSection: key });
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(s => obs.observe(s));
        return () => obs.disconnect();
    }, []);

    // Autonomous task rotation — GSAP warm-gold breathing pulse
    const fireTask = useCallback(() => {
        const totalAgents = DOCK_AGENTS.length;
        // Prefer the agent the user talked to if known
        let targetIdx: number;
        const lastAgent = neuralCtx.lastTalkedTo;
        if (lastAgent) {
            const idx = DOCK_AGENTS.findIndex(a => a.name === lastAgent);
            targetIdx = idx >= 0 ? idx : Math.floor(Math.random() * totalAgents);
        } else {
            targetIdx = Math.floor(Math.random() * totalAgents);
        }

        setActiveNodeIdx(targetIdx);
        setStatusText(DOCK_AGENTS[targetIdx].task);

        const nodeEl = nodeRefs.current[targetIdx];
        if (nodeEl) {
            // Warm-gold breathing pulse — 1.5s in / 1.5s out
            gsap.to(nodeEl, {
                backgroundColor: "rgba(255, 215, 0, 0.45)",
                boxShadow: `0 0 16px rgba(255, 215, 0, 0.35), 0 0 30px rgba(255, 215, 0, 0.12)`,
                borderColor: "rgba(255, 215, 0, 0.65)",
                duration: 1.2,
                ease: "sine.inOut",
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    gsap.to(nodeEl, {
                        backgroundColor: "rgba(255,255,255,0.04)",
                        boxShadow: "none",
                        borderColor: "rgba(255,215,0,0.18)",
                        duration: 0.8,
                        ease: "power2.out",
                    });
                },
            });
        }
    }, [neuralCtx.lastTalkedTo]);

    // Start task interval — 5s rhythm (empathetic, not frantic)
    useEffect(() => {
        if (taskIntervalRef.current) clearInterval(taskIntervalRef.current);
        taskIntervalRef.current = setInterval(fireTask, 5000);
        return () => {
            if (taskIntervalRef.current) clearInterval(taskIntervalRef.current);
        };
    }, [fireTask]);

    // Highlight the agent the user last spoke to
    useEffect(() => {
        if (!neuralCtx.lastTalkedTo) return;
        const idx = DOCK_AGENTS.findIndex(a => a.name === neuralCtx.lastTalkedTo);
        if (idx < 0) return;

        const nodeEl = nodeRefs.current[idx];
        if (!nodeEl) return;

        const agentColor = DOCK_AGENTS[idx].color;
        gsap.to(nodeEl, {
            boxShadow: `0 0 20px ${agentColor}60, 0 0 40px ${agentColor}20`,
            borderColor: agentColor,
            duration: 1,
            ease: "power2.out",
        });
    }, [neuralCtx.lastTalkedTo]);

    const lastTalkedName = neuralCtx.lastTalkedTo;

    // ── Render ──────────────────────────────────────────────────────────
    return (
        <>
            {/* ───────────────────────────────────────────────────────────
                DESKTOP STYLE — vertical right sidebar
                MOBILE STYLE  — horizontal bottom thumb-zone pill
            ─────────────────────────────────────────────────────────── */}
            <style>{`
                /* Desktop: vertical sidebar */
                .bdx-agent-dock {
                    transition: width 0.35s cubic-bezier(0.4,0,0.2,1), padding 0.35s cubic-bezier(0.4,0,0.2,1);
                }
                .bdx-agent-dock:hover { width: 238px !important; padding: 16px 14px !important; align-items: flex-start !important; }
                .bdx-dock-label { opacity: 0; transform: translateX(-6px); transition: opacity 0.25s ease, transform 0.25s ease; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
                .bdx-agent-dock:hover .bdx-dock-label { opacity: 1; transform: none; }
                .bdx-dock-status { display: none; }
                .bdx-agent-dock:hover .bdx-dock-status { display: block; }
                .bdx-dock-header-text { display: none; }
                .bdx-agent-dock:hover .bdx-dock-header-text { display: block; }
                .bdx-node-row { display: flex; align-items: center; gap: 10px; width: 100%; }

                /* Mobile: horizontal bottom bar */
                @media (max-width: 760px) {
                    .bdx-agent-dock {
                        position: fixed !important;
                        bottom: 16px !important;
                        top: auto !important;
                        right: auto !important;
                        left: 50% !important;
                        transform: translateX(-50%) !important;
                        width: min(92vw, 380px) !important;
                        height: 62px !important;
                        flex-direction: row !important;
                        padding: 10px 14px !important;
                        border-radius: 50px !important;
                        gap: 6px !important;
                        align-items: center !important;
                        overflow-x: auto !important;
                        overflow-y: clip !important;
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: none;
                        opacity: 1 !important;
                        pointer-events: auto !important;
                    }
                    .bdx-agent-dock::-webkit-scrollbar { display: none; }
                    .bdx-agent-dock:hover { width: min(92vw, 380px) !important; }
                    .bdx-dock-label { display: none !important; }
                    .bdx-dock-status { display: none !important; }
                    .bdx-dock-header-text { display: none !important; }
                    .bdx-node-row { flex-direction: column !important; align-items: center !important; min-width: 44px; gap: 2px !important; }
                    .bdx-mobile-name {
                        font-size: 7px !important;
                        color: rgba(255,255,255,0.45);
                        text-align: center;
                        white-space: nowrap;
                        display: block !important;
                    }
                }
            `}</style>

            <div
                ref={dockRef}
                className="bdx-agent-dock"
                role="complementary"
                aria-label="BioDynamX Active Workforce"
                style={{
                    position: "fixed",
                    right: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 58,
                    background: "rgba(4, 4, 18, 0.86)",
                    backdropFilter: "blur(22px)",
                    WebkitBackdropFilter: "blur(22px)",
                    border: "1px solid rgba(255, 215, 0, 0.18)",
                    borderRadius: 36,
                    padding: "14px 8px",
                    zIndex: 998,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 9,
                    opacity: 0,
                    pointerEvents: "none",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
            >

                {/* Desktop header — hidden on mobile via CSS */}
                <div className="bdx-node-row" style={{ marginBottom: 4 }}>
                    <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: "#00ff41",
                        boxShadow: "0 0 8px #00ff41",
                        flexShrink: 0,
                        animation: "bdx-dock-blink 2.4s ease-in-out infinite",
                    }} />
                    <span className="bdx-dock-label bdx-dock-header-text" style={{
                        fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.55)",
                        letterSpacing: "0.16em", textTransform: "uppercase",
                    }}>
                        ACTIVE WORKFORCE
                    </span>
                </div>

                {/* Thin divider — desktop only */}
                <div className="bdx-dock-status" style={{
                    width: "100%", height: 1,
                    background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)",
                    marginBottom: 2,
                    display: "block",
                }} />

                {/* Agent Nodes — shared desktop + mobile */}
                {DOCK_AGENTS.map((agent, i) => {
                    const isWorking = i === activeNodeIdx;
                    const isTalked = agent.name === lastTalkedName;
                    return (
                        <div
                            key={agent.name}
                            className="bdx-node-row"
                            title={agent.name}
                            onClick={() => hapticAgentWake()}
                            style={{ cursor: "pointer" }}
                        >
                            {/* Avatar node */}
                            <div
                                ref={el => { nodeRefs.current[i] = el; }}
                                style={{
                                    width: 34, height: 34,
                                    borderRadius: "50%",
                                    border: `1.5px solid ${isTalked ? agent.color : "rgba(255,215,0,0.18)"}`,
                                    background: "rgba(255,255,255,0.04)",
                                    overflow: "hidden",
                                    position: "relative",
                                    flexShrink: 0,
                                    cursor: "default",
                                    transition: "border-color 0.5s ease",
                                    boxShadow: isTalked ? `0 0 14px ${agent.color}50` : "none",
                                }}
                            >
                                <Image
                                    src={agent.image}
                                    alt={agent.name}
                                    fill
                                    style={{ objectFit: "cover", opacity: isWorking ? 1 : 0.65, transition: "opacity 0.5s ease" }}
                                />
                            </div>

                            {/* Desktop: name + working label */}
                            <div className="bdx-dock-label" style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: 11, fontWeight: 700,
                                    color: isTalked ? agent.color : "rgba(255,255,255,0.75)",
                                    letterSpacing: "-0.01em",
                                }}>
                                    {agent.name}
                                    {isTalked && (
                                        <span style={{
                                            marginLeft: 5, fontSize: 8,
                                            color: agent.color,
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                            opacity: 0.7,
                                        }}>you spoke</span>
                                    )}
                                </div>
                                {isWorking && (
                                    <div style={{
                                        fontSize: 8.5,
                                        color: "rgba(255,215,0,0.7)",
                                        letterSpacing: "0.02em",
                                        marginTop: 1,
                                        fontStyle: "italic",
                                        animation: "bdx-dock-fade 0.4s ease",
                                    }}>
                                        {agent.task}
                                    </div>
                                )}
                            </div>

                            {/* Mobile: agent name below avatar */}
                            <span className="bdx-mobile-name" style={{ display: "none" }}>
                                {agent.name}
                            </span>
                        </div>
                    );
                })}

                {/* Bottom status — desktop only on expand */}
                <div className="bdx-dock-status" style={{ width: "100%" }}>
                    <p style={{
                        fontSize: 9,
                        color: "rgba(255,215,0,0.65)",
                        margin: 0,
                        lineHeight: 1.5,
                        letterSpacing: "0.03em",
                        fontStyle: "italic",
                        transition: "color 0.5s ease",
                    }}>
                        {statusText}
                    </p>
                </div>

                <style>{`
                    @keyframes bdx-dock-blink { 0%,100% { opacity:1 } 50% { opacity:0.35 } }
                    @keyframes bdx-dock-fade  { from { opacity:0; transform:translateY(-3px) } to { opacity:1; transform:none } }
                `}</style>
            </div>
        </>
    );
}
