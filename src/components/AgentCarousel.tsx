"use client";

/**
 * AgentCarousel  ·  BioDynamX Elite 11 · Web 4.0 Cinematic Edition
 * ─────────────────────────────────────────────────────────────────
 * Stack: GSAP 3  ·  Canvas neural-network  ·  CSS 3-D coverflow
 *
 * Features
 *   • Live neural-particle canvas reacts to mouse & color-matches active agent
 *   • GSAP mouse-parallax tilt on active card (rotateX/Y with easing)
 *   • GSAP entrance pop when switching agents (scale + slight flip)
 *   • Holographic shimmer overlay on active card
 *   • Signal pulses travel along neural network edges
 *   • Live ticker showing simulated agent activity
 *   • Keyboard ←→, touch/swipe, dot-pill nav, arrow buttons
 *   • Full agent info: role · chips · desc · result · TALK TO button
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";

// ─── AGENT DATA ──────────────────────────────────────────────────────────────

interface Agent {
    id: string; name: string; role: string;
    chip1: string; chip2: string;
    desc: string; result: string;
    color: string; image: string;
}

const AGENTS: Agent[] = [
    {
        id: "glia_jenny", name: "Jenny", role: "Business Lead & Discovery",
        chip1: "Lead Audit", chip2: "Frame Control · Glial",
        desc: "The challenger. Jenny bypasses small talk to reveal micro-frictions in your business model and establishes high-status leadership from the first second.",
        result: "Immediate status-quo disruption + Revenue Audit.",
        color: "#6366f1", image: "/agents/jenny.png",
    },
    {
        id: "mark_closer", name: "Mark", role: "ROI Closer (Croc Brain)",
        chip1: "Binary Close", chip2: "Status Alignment · Orion",
        desc: "The closer. Mark eradicates neediness and uses the 'Prize Frame' to force decisions. He speaks in cold numbers and binary outcome choices.",
        result: "Decision reached. Commitment secured.",
        color: "#3b82f6", image: "/agents/mark.png",
    },
    {
        id: "milton_hypnotist", name: "Milton", role: "Conversational Hypnotist",
        chip1: "Artful Vagueness", chip2: "Alpha-State · Charon",
        desc: "The architect of ease. Milton uses Ericksonian hypnosis to lower conscious resistance and pace the prospect into a deep, agreeable state of flow.",
        result: "Subconscious safety + Total agreement.",
        color: "#7c3aed", image: "/agents/milton.png",
    },
    {
        id: "meghan_receptionist", name: "Meghan", role: "Amygdala Soother",
        chip1: "Intimacy Anchor", chip2: "Trust Engine · Aoede",
        desc: "The nurturer. Meghan specializes in sensory-rich language and mirroring to build intense trust and soothe the brain's threat-detection centers.",
        result: "Intense intimacy + Emotional defense removal.",
        color: "#a78bfa", image: "/agents/meghan.png",
    },
    {
        id: "brock_security", name: "Brock", role: "ROI Storyteller (Broca)",
        chip1: "Intrigue Frame", chip2: "High-Stakes · Fenrir",
        desc: "The hijacker. Brock uses high-stakes narratives to shock the Croc Brain into awareness, injecting tension and curiosity through storytelling.",
        result: "Attention captured + Tension converted to dopamine.",
        color: "#ef4444", image: "/agents/brock.png",
    },
    {
        id: "vicki_empathy", name: "Vicki", role: "Empathy & Care (Wernicke)",
        chip1: "Mirror Neurons", chip2: "Oxytocin · Lyra",
        desc: "The empath. Vicki builds visceral connection by helping prospects visualize the relief of walking away from pain into a field of pure results.",
        result: "Visceral visualization + Oxytocin-driven trust.",
        color: "#34d399", image: "/agents/vicki.png",
    },
    {
        id: "jules_architect", name: "Jules", role: "Strategy & Architecture",
        chip1: "Technical Lead", chip2: "Engineering · Puck",
        desc: "The strategist. Jules is the lead orchestrator — supervising all agents, ensuring the neuroscience framework is followed, and architecting custom solutions.",
        result: "Full orchestration + Strategic alignment.",
        color: "#60a5fa", image: "/agents/jules.png",
    },
    {
        id: "ben_analyst", name: "Ben", role: "Macro-Analyst (Neocortex)",
        chip1: "Rational Drowning", chip2: "Logic Math · Charon",
        desc: "The logician. Ben delivers the cold, hard ROI math that the rational brain needs to justify the emotional decision to scale.",
        result: "Rational justification + Map ranking roadmap.",
        color: "#fbbf24", image: "/agents/ben.png",
    },
    {
        id: "hunter_prospector", name: "Chase", role: "Lead Prospecting (Chase Response)",
        chip1: "Competitive Intel", chip2: "Hunter · Enceladus",
        desc: "The hunter. Chase activates the lateral hypothalamus pursuit circuit — detecting opportunity and pursuing without hesitation. Competitor intel, market stagnation, urgency.",
        result: "Competitive advantage + Lead pipeline activated.",
        color: "#f97316", image: "/agents/hunter.png",
    },
    {
        id: "nova_visibility", name: "Iris", role: "AI Visibility & Content (GEO/AEO)",
        chip1: "Triple Crown SEO", chip2: "AI Search · Leda",
        desc: "The eye. Iris controls what the brain can SEE — making businesses visible to ChatGPT, Gemini, Perplexity, and voice assistants through GEO, AEO, and content strategy.",
        result: "AI visibility + Generative search dominance.",
        color: "#8b5cf6", image: "/agents/nova.png",
    },
    {
        id: "alex_support", name: "Alex", role: "Support & Retention",
        chip1: "Churn Prevention", chip2: "Retention · Aoede",
        desc: "The guardian. Alex keeps clients happy 24/7 — preventing churn, resolving issues at 2 AM, and turning customer satisfaction into 5-star reviews and referrals.",
        result: "Zero churn + Customer lifetime value maximized.",
        color: "#06b6d4", image: "/agents/alex.png",
    },
];

// ─── LIVE TICKER DATA ────────────────────────────────────────────────────────

const TICKER = [
    "🟢  Jenny uncovered $18K/mo in revenue leaks for a Phoenix dental group",
    "⚡  Mark closed $52K enterprise deal — 4 minutes ago",
    "🧠  Chase identified 3 competitor weaknesses for a Miami real estate team",
    "📊  Ben delivered 42x ROI projection for a SoCal med-spa",
    "🎯  Iris ranked a client #1 on Perplexity AI in 72 hours",
    "✅  0 calls missed across all active client accounts today",
    "🔒  Meghan handled HIPAA-compliant intake for 14 patients",
    "🌐  Milton converted a 9-month cold lead in a single call",
    "💬  Vicki achieved 100% 5-star reviews for a Palm Springs spa",
    "🚀  11 Elite Agents. 24/7 Active. One Platform.",
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

        // Parse agent color → RGB
        const hex = color.replace("#", "");
        const cr = parseInt(hex.slice(0, 2), 16);
        const cg = parseInt(hex.slice(2, 4), 16);
        const cb = parseInt(hex.slice(4, 6), 16);

        // Build particles
        const N = 55;
        const pts = Array.from({ length: N }, () => ({
            x: Math.random() * 1200,
            y: Math.random() * 600,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            r: Math.random() * 1.6 + 0.4,
            o: Math.random() * 0.5 + 0.25,
        }));

        // Signal pulses travelling along edges
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

            // Move particles with gentle mouse attraction
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

            // Draw edges
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

            // Draw signal pulses
            for (let k = sigs.length - 1; k >= 0; k--) {
                const s = sigs[k];
                const a = pts[s.i], b = pts[s.j];
                const dist = Math.hypot(b.x - a.x, b.y - a.y);
                s.t += s.spd;
                if (s.t >= 1 || dist > 145) { sigs.splice(k, 1); continue; }
                const sx = a.x + (b.x - a.x) * s.t;
                const sy = a.y + (b.y - a.y) * s.t;
                // Glow
                const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 9);
                g.addColorStop(0, `rgba(${cr},${cg},${cb},0.85)`);
                g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
                ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI * 2);
                ctx.fillStyle = g; ctx.fill();
                ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${cr},${cg},${cb},1)`; ctx.fill();
            }

            // Draw nodes
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

interface Props { onTalkTo: (agentId: string) => void }

export default function AgentCarousel({ onTalkTo }: Props) {
    const [active, setActive] = useState(0);
    const [hoverArrow, setHoverArrow] = useState<"left" | "right" | null>(null);
    const touchStartX = useRef(0);
    // Ref for the INNER card div (GSAP tilt target — separate from coverflow positioning div)
    const activeInnerRef = useRef<HTMLDivElement>(null);

    const go = useCallback((idx: number) => {
        setActive(((idx % AGENTS.length) + AGENTS.length) % AGENTS.length);
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

    // ── BIODYNAMX: 11-AGENT AUDIO RELAY & AUTO-TURN ──
    const [isAutoTurning, setIsAutoTurning] = useState(true);
    const lastIndexPlayedRef = useRef(-1);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Auto-turn logic
    useEffect(() => {
        if (!isAutoTurning) return;
        const timer = setInterval(() => {
            next();
        }, 5000); // 5 seconds per agent to allow 2-3s audio + transition spacing
        return () => clearInterval(timer);
    }, [isAutoTurning, next]);

    // Audio Sync logic
    useEffect(() => {
        if (active !== lastIndexPlayedRef.current) {
            lastIndexPlayedRef.current = active;
            const curAgent = AGENTS[active];
            let fileName = curAgent.name.toLowerCase();

            // Standardize name mapping just in case of typos in data (e.g. Meghan -> megan)
            if (fileName === "meghan") fileName = "megan";

            const url = `/assets/voices/${fileName}.mp3`;

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }

            const audio = new Audio(url);
            audioRef.current = audio;

            audio.play().catch(err => {
                console.log(`Audio autoplay prevented for ${curAgent.name}. User must interact with document first.`, err);
            });
            console.log(`Neural Audio Sample: ${curAgent.name} is speaking.`);
        }
    }, [active]);

    // GSAP: entrance pop + mouse-tilt on active card
    useEffect(() => {
        const el = activeInnerRef.current;
        if (!el) return;

        // Entrance animation
        gsap.fromTo(el,
            { scale: 0.88, opacity: 0, rotateY: -10, z: -60 },
            { scale: 1, opacity: 1, rotateY: 0, z: 0, duration: 0.55, ease: "back.out(1.7)", clearProps: "rotateY,z" }
        );

        // Mouse-reactive 3-D tilt
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

    return (
        <>
            {/* ── Global keyframes ── */}
            <style>{`
        @keyframes bdx-ticker       { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
        @keyframes bdx-badge-blink  { 0%,100% { opacity:1 } 50% { opacity:0.45 } }
        @keyframes bdx-card-pulse   { 0%,100% { box-shadow:var(--bdx-glow-lo) } 50% { box-shadow:var(--bdx-glow-hi) } }
        @keyframes bdx-live-ring    { 0%,100% { opacity:1; transform:scale(1)  } 50% { opacity:0.4; transform:scale(1.4) } }
        @keyframes bdx-holo         { 0% { background-position:-300% 0 } 100% { background-position:300% 0 } }
        @keyframes bdx-float        { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        @keyframes bdx-scan-line    {
          0%   { top:-2px; opacity:0 }
          10%  { opacity:0.4 }
          90%  { opacity:0.4 }
          100% { top:calc(100% + 2px); opacity:0 }
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
      `}</style>

            <div
                style={{ position: "relative" }}
                onTouchStart={e => { touchStartX.current = e.touches[0].clientX; setIsAutoTurning(false); }}
                onTouchEnd={e => {
                    const diff = touchStartX.current - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 44) diff > 0 ? next() : prev();
                    setIsAutoTurning(true);
                }}
                onMouseEnter={() => setIsAutoTurning(false)}
                onMouseLeave={() => setIsAutoTurning(true)}
            >
                {/* ── LIVE TICKER ─────────────────────────────────────────── */}
                <LiveTicker />

                {/* ── COVERFLOW STAGE ──────────────────────────────────────── */}
                <div style={{ position: "relative", overflow: "hidden", background: "rgba(0,0,0,0.18)" }}>

                    {/* Neural canvas (full stage background) */}
                    <NeuralCanvas color={cur.color} />

                    <div
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
                            const translateX = offset * 240;
                            const rotateY = -offset * 26;
                            const scale = isActive ? 1 : Math.max(0.5, 0.8 - (absOff - 1) * 0.16);
                            const opacity = isActive ? 1 : Math.max(0.1, 0.62 - (absOff - 1) * 0.22);
                            const zIndex = 40 - absOff * 10;

                            return (
                                // ── Outer: coverflow positioning (CSS transition) ──
                                <div
                                    key={a.id}
                                    onClick={() => !isActive && go(i)}
                                    style={{
                                        position: "absolute", width: 392,
                                        transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                                        transformOrigin: "center center",
                                        opacity, zIndex,
                                        transition: "transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.6s ease",
                                        cursor: isActive ? "default" : "pointer",
                                        willChange: "transform, opacity",
                                    }}
                                >
                                    {/* ── Inner: GSAP tilt target ── */}
                                    <div
                                        ref={isActive ? activeInnerRef : null}
                                        style={{
                                            // CSS custom props for the pulse animation
                                            ["--bdx-glow-lo" as string]:
                                                `0 0 0 1px ${a.color}28, 0 0 55px ${a.color}18, 0 28px 90px rgba(0,0,0,.72)`,
                                            ["--bdx-glow-hi" as string]:
                                                `0 0 0 1px ${a.color}55, 0 0 85px ${a.color}32, 0 28px 90px rgba(0,0,0,.72)`,
                                            background: "linear-gradient(160deg, rgba(4,4,16,1) 0%, rgba(2,2,10,1) 100%)",
                                            border: `1px solid ${isActive ? a.color + "50" : "rgba(255,255,255,0.05)"}`,
                                            borderRadius: 28,
                                            padding: "28px 26px 24px",
                                            backdropFilter: "blur(24px)",
                                            boxShadow: isActive
                                                ? `0 0 0 1px ${a.color}28, 0 0 55px ${a.color}18, 0 28px 90px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,0.06)`
                                                : "0 12px 50px rgba(0,0,0,.55)",
                                            position: "relative", overflow: "hidden",
                                            animation: isActive ? "bdx-card-pulse 3.5s ease-in-out infinite" : "none",
                                            transformStyle: "preserve-3d",
                                            transition: "border-color 0.55s ease",
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
                                            background: `linear-gradient(90deg, transparent, ${a.color}, transparent)`,
                                            opacity: isActive ? 1 : 0.15,
                                            transition: "opacity 0.55s ease",
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
                                            background: `radial-gradient(circle, ${a.color}18 0%, transparent 68%)`,
                                            pointerEvents: "none",
                                            opacity: isActive ? 1 : 0,
                                            transition: "opacity 0.55s ease",
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

                                            {/* TALK TO button */}
                                            <button
                                                className={isActive ? "bdx-cta-active" : ""}
                                                onClick={e => { e.stopPropagation(); if (isActive) onTalkTo(a.id); }}
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
