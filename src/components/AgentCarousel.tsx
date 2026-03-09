"use client";

/**
 * AgentCarousel  ·  BioDynamX Elite 11 · ACTIVE SWARM DASHBOARD
 * ─────────────────────────────────────────────────────────────────
 * Web 4.0 Autonomous Interface — every agent in the background is
 * "working" while the user browses. GSAP-powered glass scanner panel
 * reveals when clicking TALK TO, showing Ironclaw's live logic stream.
 *
 * Features
 *   • 11-agent coverflow with holographic shimmer + neural-particle canvas
 *   • IRONCLAW SWARM: idle agents flicker with real background tasks every 1.5s
 *   • GREEN GLOW box-shadow pulse when task fires on idle card
 *   • Monospace STATUS LABEL updates per-agent with task text
 *   • NEURAL DASHBOARD panel — slides in when user selects an agent
 *   • Live logic stream scrolls: "Bypassing Neocortex Skepticism..."
 *   • IRONCLAW STATUS BAR — always-visible bottom-center hacker bar
 *   • Agent "leaves swarm" on TALK TO — enters dedicated 1:1 state
 *   • Orb flash event dispatched on agent selection (color sync)
 *   • Keyboard ←→, touch/swipe, dot-pill nav, arrows
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { triggerFullHandoff, triggerNeuralPing } from "@/lib/neural-audio";
import { hapticAgentWake, hapticSwipe } from "@/lib/haptic";

// ─── AGENT DATA ──────────────────────────────────────────────────────────────

interface Agent {
    id: string; name: string; role: string;
    chip1: string; chip2: string;
    desc: string; result: string;
    color: string; image: string;
    expertise: string; // Ironclaw task domain
}

const AGENTS: Agent[] = [
    {
        id: "jenny_lead", name: "Jenny", role: "Business Lead & Discovery",
        chip1: "Lead Audit", chip2: "Frame Control · Aoede",
        desc: "The challenger. Jenny bypasses small talk to reveal micro-frictions in your business model — and establishes high-status leadership from the very first second. Web 4.0's most exciting opener.",
        result: "Immediate status-quo disruption + Revenue Audit launched.",
        color: "#6366f1", image: "/agents/jenny.png",
        expertise: "Revenue Leak Analysis",
    },
    {
        id: "nova_strategy", name: "Nova", role: "AI Strategy & Conversion",
        chip1: "Neuro-Funnel", chip2: "Conversion · Leda",
        desc: "The converter. Nova analyzes your entire funnel — from first touch to close — deploying precision neuro-triggers that transform cold prospects into committed, paying clients.",
        result: "Funnel optimized + Conversion rate multiplied.",
        color: "#ec4899", image: "/agents/nova_v2.png",
        expertise: "Neuro-Funnel Optimization",
    },
    {
        id: "iris_visibility", name: "Iris", role: "AI Visibility & Content (GEO/AEO)",
        chip1: "Triple Crown SEO", chip2: "AI Search · Despina",
        desc: "The eye. Iris controls what the world can SEE — making your business visible to ChatGPT, Gemini, Perplexity, and voice assistants through GEO, AEO, and strategic content.",
        result: "AI visibility + Generative search dominance.",
        color: "#8b5cf6", image: "/agents/iris.png",
        expertise: "GEO/AEO Indexing",
    },
    {
        id: "megan_soother", name: "Megan", role: "AI Receptionist & Trust Builder",
        chip1: "Intimacy Anchor", chip2: "Trust Engine · Sulafat",
        desc: "The nurturer. Megan uses sensory-rich language and deep mirroring to build intense trust instantly — soothing the brain's threat-detection centers before any objection can form.",
        result: "Intense trust + Emotional defenses removed.",
        color: "#a78bfa", image: "/agents/meghan.png",
        expertise: "Trust Signal Encoding",
    },
    {
        id: "vicki_empathy", name: "Vicki", role: "Empathy & Care (Wernicke)",
        chip1: "Mirror Neurons", chip2: "Oxytocin · Kore",
        desc: "The empath. Vicki builds visceral connection by helping prospects visualize the relief of walking away from pain into a field of pure results. Oxytocin-driven trust at scale.",
        result: "Visceral visualization + Deep emotional commitment.",
        color: "#34d399", image: "/agents/vicki.png",
        expertise: "Oxytocin Loop Activation",
    },
    {
        id: "alex_retention", name: "Alex", role: "Support & Retention",
        chip1: "Churn Prevention", chip2: "24/7 Guardian · Algieba",
        desc: "The guardian. Alex keeps clients happy around the clock — preventing churn, resolving issues at 2 AM, and turning customer satisfaction into 5-star reviews and referral pipelines.",
        result: "Zero churn + Lifetime value maximized.",
        color: "#06b6d4", image: "/agents/alex.png",
        expertise: "Churn Prevention Matrix",
    },
    {
        id: "zara_hunter", name: "Zara", role: "Lead Prospecting & Competitive Intel",
        chip1: "Competitive Intel", chip2: "Hunter · Vindemiatrix",
        desc: "The hunter. Zara activates the pursuit circuit — detecting opportunity and chasing without hesitation. Competitor weakness analysis, market gaps, and relentless pipeline activation.",
        result: "Competitive advantage + Lead pipeline ignited.",
        color: "#f97316", image: "/agents/zara.png",
        expertise: "Competitor Weakness Scan",
    },
    {
        id: "ava_growth", name: "Ava", role: "Content & Growth Strategy",
        chip1: "Brand Authority", chip2: "Growth Engine · Albeaba",
        desc: "The amplifier. Ava builds brand authority that makes competitors irrelevant — crafting content that dominates AI search, social feeds, and email inboxes simultaneously.",
        result: "Brand dominance + Inbound pipeline activated.",
        color: "#f59e0b", image: "/agents/ava.png",
        expertise: "Brand Authority Build",
    },
    {
        id: "titan_closer", name: "Titan", role: "ROI Closer (Hard Close)",
        chip1: "Binary Decision", chip2: "Hard Close · Charon",
        desc: "The executioner. Titan speaks in cold numbers, binary outcomes, and zero tolerance for hesitation. You either commit today, or you pay the compounding cost of inaction tomorrow.",
        result: "Decision forced. Revenue commitment locked.",
        color: "#3b82f6", image: "/agents/titan.png",
        expertise: "ROI Bridge Calculation",
    },
    {
        id: "jules_architect", name: "Jules", role: "Strategy & Architecture",
        chip1: "Technical Lead", chip2: "Orchestrator · Puck",
        desc: "The strategist. Jules is the lead orchestrator — energetically supervising all agents, architecting custom AI ecosystems, and ensuring the neuroscience framework fires on all cylinders.",
        result: "Full orchestration + Strategic alignment delivered.",
        color: "#60a5fa", image: "/agents/jules.png",
        expertise: "AI Ecosystem Design",
    },
    {
        id: "ben_analyst", name: "Ben", role: "Macro-Analyst (Neocortex)",
        chip1: "Rational Drowning", chip2: "Logic Math · Gacrux",
        desc: "The logician. Ben delivers the cold, hard ROI math that the rational brain needs to justify the emotional decision already made. Every number designed to make inaction feel idiotic.",
        result: "ROI justified + Map ranking roadmap built.",
        color: "#fbbf24", image: "/agents/ben.png",
        expertise: "Macro ROI Analysis",
    },
];

// ─── SWARM TASK POOL ──────────────────────────────────────────────────────────

const SWARM_TASKS = [
    "Auditing Revenue Leaks...",
    "Optimizing GEO Indexing...",
    "Syncing CRM Data...",
    "Scanning GMB Reviews...",
    "Encoding Neuro-Sales Triggers...",
    "Neutralizing Latency...",
    "Mapping Dopamine Reward Loops...",
    "Calculating Loss Aversion...",
    "Activating Lead Pipeline...",
    "Compiling 5x ROI Proof...",
    "Bypassing Neocortex Skepticism...",
    "Encoding Bio-Logical Proof...",
    "Monitoring Competitor Signals...",
    "Updating Trust Anchors...",
    "Deploying Conversion Triggers...",
];

// Logic stream for the Neural Dashboard panel
const LOGIC_STREAM = [
    "> Bypassing Neocortex Skepticism...",
    "> Mapping Dopamine Reward Loops...",
    "> Calculating Loss Aversion Variance...",
    "> Encoding Bio-Logical Proof...",
    "> Finalizing 5X ROI Guarantee...",
    "> Activating Autonomic Trust Response...",
    "> Neutralizing Objection Pathways...",
    "> Deploying Urgency Architecture...",
    "> Syncing Ironclaw Neural Core...",
    "> Revenue Recovery Sequence: LIVE...",
];

// ─── LIVE TICKER DATA ──────────────────────────────────────────────────────────

const TICKER = [
    "🟢  Jenny uncovered $18K/mo in revenue leaks for a Phoenix dental group",
    "⚡  Titan closed a $52K enterprise deal — 4 minutes ago",
    "🧠  Zara identified 3 competitor weaknesses for a Miami real estate team",
    "📊  Ben delivered a 42x ROI projection for a SoCal med-spa",
    "🎯  Iris ranked a client #1 on Perplexity AI in 72 hours",
    "✅  0 calls missed across all active client accounts today",
    "🔒  Megan handled HIPAA-compliant intake for 14 patients",
    "🚀  Ava generated 3,200 inbound leads this week for a dental group",
    "💬  Vicki achieved 100% 5-star reviews for a Palm Springs spa",
    "🌐  Nova converted a 9-month cold lead in a single conversation",
    "🔥  11 Elite Agents. 24/7 Active. One Platform. Web 4.0 is HERE.",
];

// ─── NEURAL PARTICLE CANVAS ──────────────────────────────────────────────────

function NeuralCanvas({ color }: { color: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 600, y: 300 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0, h = 0, raf = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.offsetWidth;
            h = canvas.offsetHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const hex = color.replace("#", "");
        const cr = parseInt(hex.slice(0, 2), 16);
        const cg = parseInt(hex.slice(2, 4), 16);
        const cb = parseInt(hex.slice(4, 6), 16);

        const N = 55;
        const pts = Array.from({ length: N }, () => ({
            x: Math.random() * 1200,
            y: Math.random() * 600,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            r: Math.random() * 1.6 + 0.4,
            o: Math.random() * 0.5 + 0.25,
        }));

        interface Sig { i: number; j: number; t: number; spd: number }
        const sigs: Sig[] = [];

        const spawnSig = () => {
            if (sigs.length >= 6) return;
            const i = Math.floor(Math.random() * N);
            const j = Math.floor(Math.random() * N);
            if (i !== j) sigs.push({ i, j, t: 0, spd: 0.007 + Math.random() * 0.013 });
        };
        const sigTimer = setInterval(spawnSig, 900);

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            pts.forEach(p => {
                const dx = mx - p.x, dy = my - p.y;
                const d = Math.hypot(dx, dy);
                if (d < 200 && d > 0) { p.vx += (dx / d) * 0.035; p.vy += (dy / d) * 0.035; }
                p.vx *= 0.982; p.vy *= 0.982;
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
                if (p.x > w) { p.x = w; p.vx = -Math.abs(p.vx); }
                if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
                if (p.y > h) { p.y = h; p.vy = -Math.abs(p.vy); }
            });
            for (let i = 0; i < N; i++) {
                for (let j = i + 1; j < N; j++) {
                    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
                    if (d < 135) {
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(1 - d / 135) * 0.3})`;
                        ctx.lineWidth = 0.65;
                        ctx.stroke();
                    }
                }
            }
            for (let k = sigs.length - 1; k >= 0; k--) {
                const s = sigs[k];
                const a = pts[s.i], b = pts[s.j];
                const dist = Math.hypot(b.x - a.x, b.y - a.y);
                s.t += s.spd;
                if (s.t >= 1 || dist > 145) { sigs.splice(k, 1); continue; }
                const sx = a.x + (b.x - a.x) * s.t;
                const sy = a.y + (b.y - a.y) * s.t;
                const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 9);
                g.addColorStop(0, `rgba(${cr},${cg},${cb},0.85)`);
                g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
                ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI * 2);
                ctx.fillStyle = g; ctx.fill();
                ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${cr},${cg},${cb},1)`; ctx.fill();
            }
            pts.forEach(p => {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${cr},${cg},${cb},${p.o})`; ctx.fill();
            });
            raf = requestAnimationFrame(draw);
        };
        draw();

        const onMouse = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        window.addEventListener("mousemove", onMouse);

        return () => {
            cancelAnimationFrame(raf);
            clearInterval(sigTimer);
            ro.disconnect();
            window.removeEventListener("mousemove", onMouse);
        };
    }, [color]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.75 }}
        />
    );
}

// ─── LIVE TICKER ─────────────────────────────────────────────────────────────

function LiveTicker() {
    return (
        <div style={{
            overflow: "hidden", height: 38,
            display: "flex", alignItems: "center",
            background: "rgba(0,0,0,0.45)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
            <div style={{
                flexShrink: 0, padding: "0 18px",
                fontSize: 9, fontWeight: 900, color: "#00ff41",
                letterSpacing: "0.18em",
                borderRight: "1px solid rgba(255,255,255,0.07)",
                height: "100%", display: "flex", alignItems: "center",
                animation: "bdx-badge-blink 1.6s ease-in-out infinite",
            }}>● LIVE</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{
                    display: "flex", gap: 80,
                    animation: "bdx-ticker 50s linear infinite",
                    whiteSpace: "nowrap",
                }}>
                    {[...TICKER, ...TICKER].map((item, i) => (
                        <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em" }}>
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── NEURAL DASHBOARD PANEL ───────────────────────────────────────────────────

interface DashboardProps {
    agent: Agent;
    onClose: () => void;
    onStartTalk: () => void;
}

function NeuralDashboard({ agent, onClose, onStartTalk }: DashboardProps) {
    const [logLines, setLogLines] = useState<string[]>([LOGIC_STREAM[0]]);
    const [streamIdx, setStreamIdx] = useState(1);
    const panelRef = useRef<HTMLDivElement>(null);

    // Animate panel in
    useEffect(() => {
        if (!panelRef.current) return;
        gsap.fromTo(panelRef.current,
            { opacity: 0, x: 40, scale: 0.96 },
            { opacity: 1, x: 0, scale: 1, duration: 0.42, ease: "back.out(1.4)" }
        );
    }, []);

    // Scroll logic stream
    useEffect(() => {
        const interval = setInterval(() => {
            setLogLines(prev => {
                const next = [LOGIC_STREAM[streamIdx % LOGIC_STREAM.length], ...prev];
                return next.slice(0, 6);
            });
            setStreamIdx(s => s + 1);
        }, 820);
        return () => clearInterval(interval);
    }, [streamIdx]);

    return (
        <div ref={panelRef} style={{
            position: "absolute",
            right: 20, top: "8%",
            width: "min(310px, 88vw)",
            background: "rgba(0, 12, 0, 0.88)",
            backdropFilter: "blur(20px)",
            border: "1px solid #00ff41",
            borderRadius: 16,
            padding: "18px 18px 14px",
            color: "#00ff41",
            fontFamily: "'Courier New', Courier, monospace",
            zIndex: 500,
            boxShadow: "0 0 60px rgba(0,255,65,0.12), 0 20px 60px rgba(0,0,0,0.6)",
        }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{
                    display: "inline-block", width: 9, height: 9, background: "#00ff41",
                    borderRadius: "50%", boxShadow: "0 0 10px #00ff41",
                    animation: "bdx-blink 1s ease-in-out infinite",
                }} />
                <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    IRONCLAW NEURAL AUDIT — LIVE
                </span>
                <button onClick={onClose} style={{
                    marginLeft: "auto", background: "transparent", border: "none",
                    color: "rgba(0,255,65,0.5)", cursor: "pointer", fontSize: 16, lineHeight: 1,
                    fontFamily: "inherit",
                }}>✕</button>
            </div>

            {/* Agent focus */}
            <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
                padding: "8px 10px",
                background: `${agent.color}12`,
                border: `1px solid ${agent.color}30`,
                borderRadius: 10,
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    overflow: "hidden", position: "relative", flexShrink: 0,
                    border: `1.5px solid ${agent.color}55`,
                }}>
                    <Image src={agent.image} alt={agent.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: agent.color, fontFamily: "inherit" }}>
                        {agent.name}
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(0,255,65,0.6)", letterSpacing: "0.1em" }}>
                        {agent.expertise.toUpperCase()}
                    </div>
                </div>
                <div style={{
                    marginLeft: "auto", fontSize: 8, color: "#00ff41",
                    letterSpacing: "0.1em", padding: "3px 8px",
                    border: "1px solid rgba(0,255,65,0.3)", borderRadius: 20,
                }}>ISOLATED</div>
            </div>

            {/* Logic stream */}
            <div style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(0,255,65,0.15)",
                borderRadius: 8,
                padding: "10px 10px",
                marginBottom: 12,
                minHeight: 100,
                overflow: "hidden",
            }}>
                {logLines.map((line, idx) => (
                    <div key={`${idx}-${line}`} style={{
                        fontSize: 10,
                        color: idx === 0 ? "#00ff41" : `rgba(0,255,65,${0.65 - idx * 0.1})`,
                        marginBottom: 5,
                        animation: idx === 0 ? "bdx-fade-in 0.3s ease" : "none",
                        letterSpacing: "0.04em",
                    }}>
                        {line}
                    </div>
                ))}
            </div>

            {/* CTA */}
            <button
                onClick={onStartTalk}
                style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: `linear-gradient(135deg, ${agent.color}dd 0%, ${agent.color}99 100%)`,
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 10, fontWeight: 800,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: `0 4px 20px ${agent.color}40`,
                }}
            >
                INITIATE 1:1 WITH {agent.name.toUpperCase()} →
            </button>
        </div>
    );
}

// ─── IRONCLAW STATUS BAR ──────────────────────────────────────────────────────

function IronclawStatusBar({ task, agentName }: { task: string; agentName: string }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "rgba(0,0,0,0.7)",
            border: "1px solid #00ff41",
            borderRadius: 50, padding: "5px 20px",
            pointerEvents: "none", width: "fit-content", margin: "0 auto",
        }}>
            <span style={{
                width: 7, height: 7, background: "#00ff41", borderRadius: "50%",
                boxShadow: "0 0 8px #00ff41",
                animation: "bdx-blink 1s ease-in-out infinite",
                flexShrink: 0,
                display: "inline-block",
            }} />
            <span style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 10, color: "#00ff41", letterSpacing: "0.08em",
                whiteSpace: "nowrap",
            }}>
                BDX&nbsp;·&nbsp; {agentName}: {task}
            </span>
        </div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

interface Props { onTalkTo: (agentId: string) => void }

export default function AgentCarousel({ onTalkTo }: Props) {
    const [active, setActive] = useState(0);
    const [hoverArrow, setHoverArrow] = useState<"left" | "right" | null>(null);
    const touchStartX = useRef(0);
    const activeInnerRef = useRef<HTMLDivElement>(null);

    // Mobile detection — must be state to avoid SSR hydration mismatch
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 600);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Swarm state — per-agent task labels + glow
    const [swarmTasks, setSwarmTasks] = useState<Record<number, string>>({});
    const [swarmGlow, setSwarmGlow] = useState<Record<number, boolean>>({});

    // Dashboard state
    const [dashboardVisible, setDashboardVisible] = useState(false);
    const [dashboardAgent, setDashboardAgent] = useState<Agent | null>(null);

    // Ironclaw status bar
    const [statusBarTask, setStatusBarTask] = useState(SWARM_TASKS[0]);
    const [statusBarAgent, setStatusBarAgent] = useState(AGENTS[1].name);

    const go = useCallback((idx: number) => {
        setActive(((idx % AGENTS.length) + AGENTS.length) % AGENTS.length);
        setDashboardVisible(false);
    }, []);
    const next = useCallback(() => go(active + 1), [active, go]);
    const prev = useCallback(() => go(active - 1), [active, go]);

    // Keyboard
    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [next, prev]);

    // ── IRONCLAW SWARM: background task flicker every 1.5s ──────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            // Pick a random IDLE agent (not the active front one)
            const idleIdxs = AGENTS.map((_, i) => i).filter(i => i !== active);
            if (idleIdxs.length === 0) return;

            const targetIdx = idleIdxs[Math.floor(Math.random() * idleIdxs.length)];
            const task = SWARM_TASKS[Math.floor(Math.random() * SWARM_TASKS.length)];

            // Update task label
            setSwarmTasks(prev => ({ ...prev, [targetIdx]: task }));

            // Flash glow ON
            setSwarmGlow(prev => ({ ...prev, [targetIdx]: true }));

            // Update status bar
            setStatusBarTask(task);
            setStatusBarAgent(AGENTS[targetIdx].name);

            // Remove glow after 600ms
            setTimeout(() => {
                setSwarmGlow(prev => ({ ...prev, [targetIdx]: false }));
            }, 600);
        }, 1500);

        return () => clearInterval(interval);
    }, [active]);

    // GSAP: entrance pop + mouse-tilt on active card
    useEffect(() => {
        const el = activeInnerRef.current;
        if (!el) return;

        gsap.fromTo(el,
            { scale: 0.88, opacity: 0, rotateY: -10, z: -60 },
            { scale: 1, opacity: 1, rotateY: 0, z: 0, duration: 0.55, ease: "back.out(1.7)", clearProps: "rotateY,z" }
        );

        const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(el, {
                rotateX: -y * 14,
                rotateY: x * 18,
                duration: 0.32,
                ease: "power2.out",
                transformPerspective: 850,
            });
        };
        const onLeave = () => {
            gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.45)" });
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);

        return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
            gsap.set(el, { rotateX: 0, rotateY: 0, scale: 1, opacity: 1 });
        };
    }, [active]);

    const cur = AGENTS[active];

    // Open dashboard — agent "leaves" swarm for 1:1
    const openDashboard = useCallback((agent: Agent) => {
        setDashboardAgent(agent);
        setDashboardVisible(true);
        // ★ Neural Audio: spatial whoosh → neural ping (Web 4.0 handoff signal)
        triggerFullHandoff();
        // ★ Haptic: strong agent-wake burst on mobile
        hapticAgentWake();
        // Dispatch orb flash event with agent color
        window.dispatchEvent(new CustomEvent("biodynamx:orb-flash", { detail: { color: agent.color } }));
        window.dispatchEvent(new Event("biodynamx:stop-relay"));
    }, []);

    const closeDashboard = useCallback(() => {
        setDashboardVisible(false);
        setDashboardAgent(null);
    }, []);

    const handleStartTalk = useCallback(() => {
        if (!dashboardAgent) return;
        // ★ Neural Audio: confirmation ping on INITIATE 1:1
        triggerNeuralPing();
        onTalkTo(dashboardAgent.id);
        setDashboardVisible(false);
    }, [dashboardAgent, onTalkTo]);

    return (
        <>
            {/* ── Global keyframes ── */}
            <style>{`
        @keyframes bdx-ticker       { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
        @keyframes bdx-badge-blink  { 0%,100% { opacity:1 } 50% { opacity:0.45 } }
        @keyframes bdx-card-pulse   { 0%,100% { box-shadow:var(--bdx-glow-lo) } 50% { box-shadow:var(--bdx-glow-hi) } }
        @keyframes bdx-live-ring    { 0%,100% { opacity:1; transform:scale(1)  } 50% { opacity:0.4; transform:scale(1.4) } }
        @keyframes bdx-holo         { 0% { background-position:-300% 0 } 100% { background-position:300% 0 } }
        @keyframes bdx-scan-line    {
          0%   { top:-2px; opacity:0 }
          10%  { opacity:0.4 }
          90%  { opacity:0.4 }
          100% { top:calc(100% + 2px); opacity:0 }
        }
        @keyframes bdx-blink        { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes bdx-fade-in      { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:translateX(0) } }
        @keyframes bdx-swarm-pulse  {
          0%   { box-shadow: 0 0 0px rgba(0,255,65,0) }
          30%  { box-shadow: 0 0 22px rgba(0,255,65,0.65), 0 0 4px rgba(0,255,65,0.3) }
          100% { box-shadow: 0 0 0px rgba(0,255,65,0) }
        }
        .bdx-arrow { transition:all .22s ease }
        .bdx-arrow:hover { transform:translateY(-50%) scale(1.12) !important }
        .bdx-dot   { transition:all .35s cubic-bezier(.4,0,.2,1) }
        .bdx-dot:hover { transform:scaleX(1.4) }
        .bdx-cta-active { transition:all .28s ease }
        .bdx-cta-active:hover {
          filter:brightness(1.18);
          transform:translateY(-2px);
        }
        .bdx-swarm-flash { animation: bdx-swarm-pulse 0.6s ease forwards; }
        /* ── Mobile: single card, stacked layout, no overlap ── */
        @media (max-width: 600px) {
          .bdx-carousel-stage {
            overflow: visible !important;
            height: auto !important;
            min-height: 200px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-start !important;
            perspective: none !important;
            padding: 12px 0 !important;
          }
          /* Force ALL card wrappers to relative + centered on mobile */
          .bdx-carousel-stage > div {
            position: relative !important;
            transform: none !important;
            width: min(320px, 85vw) !important;
            margin: 0 auto !important;
            opacity: 1 !important;
          }
          /* Stage outer wrapper: no overflow clipping on mobile */
          .bdx-carousel-stage + div,
          div:has(> .bdx-carousel-stage) {
            overflow: visible !important;
          }
          .bdx-arrow { display: none !important; }
          /* Neural dash: stacked below card, not overlaid */
          .bdx-neural-dash {
            position: relative !important;
            right: auto !important;
            left: auto !important;
            top: auto !important;
            bottom: auto !important;
            width: 92vw !important;
            max-width: 360px !important;
            max-height: 30vh !important;
            overflow-y: auto !important;
            margin: 12px auto 0 !important;
            background: rgba(5, 5, 10, 0.85) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            backdrop-filter: blur(14px) !important;
            border-radius: 20px !important;
            z-index: 10 !important;
          }
        }
      `}</style>


            <div
                style={{ position: "relative" }}
                onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={e => {
                    const diff = touchStartX.current - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 44) {
                        if (diff > 0) { next(); } else { prev(); }
                        hapticSwipe(); // ★ Tactile swipe tick on mobile
                    }
                }}


            >
                {/* ── LIVE TICKER ─────────────────────────────────────────── */}
                <LiveTicker />

                {/* ── COVERFLOW STAGE ──────────────────────────────────────── */}
                <div style={{ position: "relative", overflow: "hidden", background: "rgba(0,0,0,0.18)" }}>

                    {/* Neural canvas (full stage background) */}
                    <NeuralCanvas color={cur.color} />

                    <div
                        className="bdx-carousel-stage"
                        style={{
                            position: "relative",
                            height: 610,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            perspective: "1500px",
                            perspectiveOrigin: "50% 46%",
                            overflow: "visible",
                        }}
                    >
                        {/* ── LEFT ARROW ── */}
                        <button
                            onClick={prev}
                            onMouseEnter={() => setHoverArrow("left")}
                            onMouseLeave={() => setHoverArrow(null)}
                            className="bdx-arrow"
                            aria-label="Previous agent"
                            style={{
                                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                                zIndex: 100, width: 54, height: 54, borderRadius: "50%",
                                background: hoverArrow === "left" ? `${cur.color}20` : "rgba(255,255,255,0.04)",
                                border: `1px solid ${hoverArrow === "left" ? cur.color + "66" : "rgba(255,255,255,0.1)"}`,
                                color: hoverArrow === "left" ? cur.color : "rgba(255,255,255,0.5)",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                backdropFilter: "blur(12px)",
                                boxShadow: hoverArrow === "left" ? `0 0 24px ${cur.color}25` : "none",
                                fontFamily: "inherit",
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>

                        {/* ── RIGHT ARROW ── */}
                        <button
                            onClick={next}
                            onMouseEnter={() => setHoverArrow("right")}
                            onMouseLeave={() => setHoverArrow(null)}
                            className="bdx-arrow"
                            aria-label="Next agent"
                            style={{
                                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                                zIndex: 100, width: 54, height: 54, borderRadius: "50%",
                                background: hoverArrow === "right" ? `${cur.color}20` : "rgba(255,255,255,0.04)",
                                border: `1px solid ${hoverArrow === "right" ? cur.color + "66" : "rgba(255,255,255,0.1)"}`,
                                color: hoverArrow === "right" ? cur.color : "rgba(255,255,255,0.5)",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                backdropFilter: "blur(12px)",
                                boxShadow: hoverArrow === "right" ? `0 0 24px ${cur.color}25` : "none",
                                fontFamily: "inherit",
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>

                        {/* ── CARDS ── */}
                        {AGENTS.map((a, i) => {
                            let offset = i - active;
                            const total = AGENTS.length;
                            if (offset > total / 2) offset -= total;
                            if (offset < -total / 2) offset += total;

                            const absOff = Math.abs(offset);
                            if (absOff > 3) return null;

                            const isActive = absOff === 0;
                            const isInDash = dashboardAgent?.id === a.id && dashboardVisible;

                            // MOBILE: only show active card, hide all others
                            if (isMobile && !isActive) return null;

                            const translateX = isMobile ? 0 : offset * 240;
                            const rotateY = isMobile ? 0 : -offset * 26;
                            const scale = isActive ? 1 : Math.max(0.5, 0.8 - (absOff - 1) * 0.16);
                            const opacity = isActive ? 1 : Math.max(0.1, 0.62 - (absOff - 1) * 0.22);
                            const zIndex = 40 - absOff * 10;
                            const taskText = swarmTasks[i];
                            const isGlowing = swarmGlow[i];

                            return (
                                <div
                                    key={a.id}
                                    onClick={() => !isActive && go(i)}
                                    className={isGlowing && !isActive ? "bdx-swarm-flash" : ""}
                                    style={{
                                        position: isMobile ? "relative" : "absolute",
                                        width: isMobile ? "min(300px, 85vw)" : "min(392px, 88vw)",
                                        margin: isMobile ? "0 auto" : undefined,
                                        transform: isMobile ? "none" : `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                                        transformOrigin: "center center",
                                        opacity: isInDash ? 0.5 : opacity,
                                        zIndex,
                                        transition: "transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.6s ease",
                                        cursor: isActive ? "default" : "pointer",
                                        willChange: "transform, opacity",
                                        // Green glow pulse when swarm task fires
                                        borderRadius: 28,
                                    }}
                                >
                                    {/* ── Inner: GSAP tilt target ── */}
                                    <div
                                        ref={isActive ? activeInnerRef : null}
                                        style={{
                                            ["--bdx-glow-lo" as string]:
                                                `0 0 0 1px ${a.color}28, 0 0 55px ${a.color}18, 0 28px 90px rgba(0,0,0,.72)`,
                                            ["--bdx-glow-hi" as string]:
                                                `0 0 0 1px ${a.color}55, 0 0 85px ${a.color}32, 0 28px 90px rgba(0,0,0,.72)`,
                                            background: "linear-gradient(160deg, rgba(4,4,16,1) 0%, rgba(2,2,10,1) 100%)",
                                            border: `1px solid ${isActive ? a.color + "50" : isGlowing ? "rgba(0,255,65,0.5)" : "rgba(255,255,255,0.05)"}`,
                                            borderRadius: 28,
                                            padding: "28px 26px 24px",
                                            backdropFilter: "blur(24px)",
                                            boxShadow: isActive
                                                ? `0 0 0 1px ${a.color}28, 0 0 55px ${a.color}18, 0 28px 90px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,0.06)`
                                                : "0 12px 50px rgba(0,0,0,.55)",
                                            position: "relative", overflow: "hidden",
                                            animation: isActive ? "bdx-card-pulse 3.5s ease-in-out infinite" : "none",
                                            transformStyle: "preserve-3d",
                                            transition: "border-color 0.35s ease, box-shadow 0.35s ease",
                                        }}
                                    >
                                        {/* ── Scan line (active only) ── */}
                                        {isActive && (
                                            <div style={{
                                                position: "absolute", left: 0, right: 0, height: 1,
                                                background: `linear-gradient(90deg, transparent, ${a.color}60, transparent)`,
                                                animation: "bdx-scan-line 4s ease-in-out infinite",
                                                pointerEvents: "none", zIndex: 3,
                                            }} />
                                        )}

                                        {/* ── Top accent bar ── */}
                                        <div style={{
                                            position: "absolute", top: 0, left: 0, right: 0, height: 2,
                                            background: isGlowing && !isActive
                                                ? "linear-gradient(90deg, transparent, #00ff41, transparent)"
                                                : `linear-gradient(90deg, transparent, ${a.color}, transparent)`,
                                            opacity: isActive ? 1 : isGlowing ? 0.9 : 0.15,
                                            transition: "opacity 0.35s ease, background 0.35s ease",
                                        }} />

                                        {/* ── Holographic shimmer ── */}
                                        {isActive && (
                                            <div style={{
                                                position: "absolute", inset: 0, borderRadius: 28,
                                                background: `linear-gradient(125deg, transparent 25%, ${a.color}07 42%, rgba(255,255,255,0.05) 50%, ${a.color}07 58%, transparent 75%)`,
                                                backgroundSize: "400% 100%",
                                                animation: "bdx-holo 7s linear infinite",
                                                pointerEvents: "none", zIndex: 1,
                                            }} />
                                        )}

                                        {/* ── Radial glow blob ── */}
                                        <div style={{
                                            position: "absolute", top: -90, right: -90, width: 260, height: 260,
                                            background: `radial-gradient(circle, ${isGlowing && !isActive ? "rgba(0,255,65,0.12)" : a.color + "18"} 0%, transparent 68%)`,
                                            pointerEvents: "none",
                                            opacity: isActive || isGlowing ? 1 : 0,
                                            transition: "opacity 0.35s ease",
                                        }} />

                                        {/* ── Content (above shimmer layer) ── */}
                                        <div style={{ position: "relative", zIndex: 2 }}>

                                            {/* Header */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                                                {/* Photo + live dot */}
                                                <div style={{ position: "relative", flexShrink: 0 }}>
                                                    <div style={{
                                                        width: 70, height: 70, borderRadius: "50%",
                                                        border: `2px solid ${a.color}55`,
                                                        boxShadow: isActive
                                                            ? `0 0 22px ${a.color}45, 0 0 44px ${a.color}18`
                                                            : "none",
                                                        overflow: "hidden", position: "relative",
                                                        background: `linear-gradient(135deg, ${a.color}28, rgba(0,0,0,0.55))`,
                                                        transition: "box-shadow 0.55s ease",
                                                    }}>
                                                        <Image src={a.image} alt={a.name} fill style={{ objectFit: "cover" }} />
                                                    </div>
                                                    <div style={{
                                                        position: "absolute", bottom: 2, right: 2,
                                                        width: 13, height: 13, borderRadius: "50%",
                                                        background: "#00ff41", border: "2.5px solid #0a0a14",
                                                        boxShadow: "0 0 10px #00ff4199",
                                                        animation: isActive ? "bdx-live-ring 1.8s ease-in-out infinite" : "none",
                                                    }} />
                                                </div>

                                                {/* Name / role */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        fontSize: 22, fontWeight: 900, color: a.color,
                                                        letterSpacing: "-0.022em", lineHeight: 1.1,
                                                    }}>{a.name}</div>
                                                    <div style={{
                                                        fontSize: 9, fontWeight: 800, color: a.color + "bb",
                                                        letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 4,
                                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                                    }}>{a.role}</div>

                                                    {/* ── SWARM STATUS LABEL (idle agents only) ── */}
                                                    {!isActive && taskText && (
                                                        <div style={{
                                                            fontSize: 8,
                                                            color: isGlowing ? "#00ff41" : "rgba(0,255,65,0.45)",
                                                            fontFamily: "'Courier New', Courier, monospace",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.1em",
                                                            marginTop: 3,
                                                            transition: "color 0.3s ease",
                                                            animation: isGlowing ? "bdx-fade-in 0.25s ease" : "none",
                                                        }}>
                                                            ▶ {taskText}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Number badge */}
                                                <div style={{
                                                    fontSize: 10, fontWeight: 700,
                                                    color: "rgba(255,255,255,0.2)",
                                                    letterSpacing: "0.06em", flexShrink: 0,
                                                }}>
                                                    {String(i + 1).padStart(2, "0")}&nbsp;/&nbsp;11
                                                </div>
                                            </div>

                                            {/* Chips */}
                                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                                                {[a.chip1, a.chip2].map(chip => (
                                                    <span key={chip} style={{
                                                        fontSize: 9, fontWeight: 700, color: a.color,
                                                        background: a.color + "18", border: `1px solid ${a.color}30`,
                                                        borderRadius: 20, padding: "3px 10px",
                                                        letterSpacing: "0.09em", textTransform: "uppercase",
                                                    }}>{chip}</span>
                                                ))}
                                            </div>

                                            {/* Description */}
                                            <p style={{
                                                fontSize: 13, color: "rgba(255,255,255,0.7)",
                                                lineHeight: 1.78, margin: "0 0 14px",
                                            }}>{a.desc}</p>

                                            {/* Result */}
                                            <div style={{
                                                fontSize: 11, fontWeight: 700, color: a.color,
                                                padding: "9px 12px",
                                                background: a.color + "0f",
                                                border: `1px solid ${a.color}22`,
                                                borderRadius: 10, marginBottom: 22, lineHeight: 1.55,
                                            }}>
                                                <span style={{ opacity: 0.5, fontWeight: 600, marginRight: 4 }}>RESULT:</span>
                                                {a.result}
                                            </div>

                                            {/* TALK TO button — opens Neural Dashboard */}
                                            <button
                                                className={isActive ? "bdx-cta-active" : ""}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    if (isActive) { openDashboard(a); }
                                                }}
                                                style={{
                                                    width: "100%", padding: "14px 20px",
                                                    background: isActive
                                                        ? `linear-gradient(135deg, ${a.color}ee 0%, ${a.color}99 100%)`
                                                        : "rgba(255,255,255,0.03)",
                                                    border: isActive ? "none" : `1px solid ${a.color}28`,
                                                    borderRadius: 14,
                                                    color: isActive ? "#fff" : "rgba(255,255,255,0.2)",
                                                    fontSize: 11, fontWeight: 800,
                                                    letterSpacing: "0.14em", textTransform: "uppercase",
                                                    cursor: isActive ? "pointer" : "default",
                                                    fontFamily: "inherit",
                                                    boxShadow: isActive ? `0 5px 22px ${a.color}35` : "none",
                                                }}
                                            >
                                                TALK TO {a.name.toUpperCase()} →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* ── NEURAL DASHBOARD PANEL ── */}
                        {dashboardVisible && dashboardAgent && (
                            <div className="bdx-neural-dash" style={{
                                position: "absolute",
                                right: 20, top: "8%",
                                zIndex: 600,
                            }}>
                                <NeuralDashboard
                                    agent={dashboardAgent}
                                    onClose={closeDashboard}
                                    onStartTalk={handleStartTalk}
                                />
                            </div>
                        )}
                    </div>

                    {/* ── IRONCLAW STATUS BAR ── */}
                    <div style={{ padding: "10px 20px 14px", textAlign: "center" }}>
                        <IronclawStatusBar task={statusBarTask} agentName={statusBarAgent} />
                    </div>
                </div>

                {/* ── DOT NAV ──────────────────────────────────────────────── */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 7, paddingTop: 20 }}>
                    {AGENTS.map((a, i) => (
                        <button
                            key={a.id}
                            onClick={() => go(i)}
                            className="bdx-dot"
                            aria-label={`Go to ${a.name}`}
                            title={a.name}
                            style={{
                                width: i === active ? 32 : 8, height: 8, borderRadius: 4,
                                background: i === active ? a.color : "rgba(255,255,255,0.15)",
                                border: "none", cursor: "pointer", padding: 0,
                                boxShadow: i === active ? `0 0 12px ${a.color}60` : "none",
                            }}
                        />
                    ))}
                </div>

                {/* ── AGENT NAME ROW ────────────────────────────────────────── */}
                <div style={{
                    textAlign: "center", marginTop: 16,
                    fontSize: 20, fontWeight: 900, color: cur.color,
                    letterSpacing: "-0.01em",
                    transition: "color 0.4s ease",
                    textShadow: `0 0 30px ${cur.color}60`,
                }}>
                    {cur.name}
                    <span style={{
                        marginLeft: 12, fontSize: 11, fontWeight: 700,
                        color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em",
                        textShadow: "none", verticalAlign: "middle",
                    }}>
                        {cur.role.toUpperCase()}
                    </span>
                </div>

                {/* ── KEYBOARD HINT ─────────────────────────────────────────── */}
                <div style={{
                    textAlign: "center", marginTop: 10,
                    fontSize: 9, color: "rgba(255,255,255,0.16)",
                    letterSpacing: "0.14em", textTransform: "uppercase",
                }}>
                    ← → Keys · Swipe · Tap to navigate
                </div>

                {/* ── TRUST FOOTER ──────────────────────────────────────────── */}
                <div className="agent-showcase-footer" style={{ marginTop: 28 }}>
                    <span>✓ No login required</span>
                    <span>✓ No credit card</span>
                    <span>✓ Live voice in under 5 seconds</span>
                </div>
            </div>
        </>
    );
}
