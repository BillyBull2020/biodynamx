"use client";

// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — IMMERSIVE 3D ORBITING ECOSYSTEM v4
// • Voice synced to frontmost face (not a drifting timer)
// • audio.onended advances to next agent — no cutoff
// • Click/touchstart unlock audio (scroll does NOT unlock AudioContext)
// • Orbit slows while agent speaks, resumes between agents
// • Global event 'biodynamx:stop-relay' mutes when live chat starts
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import "./OrbitEcosystem.css";

// ── 11-AGENT RELAY — 8 female + 3 male, all unique voices & images
const SERVICES = [
    {
        image: "/agents/jenny.png",
        label: "JENNY: Lead Discovery",
        color: "#6366f1",
        voice: "jenny",
        script: "Hey! I\'m Jenny — and I am SO excited you\'re here! I\'m your BioDynamX growth strategist, and I\'m about to show you exactly where your revenue is leaking. Web 4.0 is the most exciting thing happening in business right now, and we\'re going to make sure YOU are at the front of it!",
    },
    {
        image: "/agents/nova_v2.png",
        label: "NOVA: AI Strategy & Conversion",
        color: "#ec4899",
        voice: "nova",
        script: "I am Nova, and I have to tell you — the conversions we\'re delivering for our clients right now are WILD. I analyze your entire funnel and deploy precision neuro-triggers that flip cold prospects into paying clients. This is the future, and it\'s happening today!",
    },
    {
        image: "/agents/iris.png",
        label: "IRIS: AI Visibility & Content",
        color: "#8b5cf6",
        voice: "iris",
        script: "Listen — if ChatGPT, Gemini, and Perplexity can\'t find you, you don\'t exist. I\'m Iris, and I make sure your brand is the first recommendation across every AI search engine on the planet. That is a game-changer for your business!",
    },
    {
        image: "/agents/meghan.png",
        label: "MEGAN: AI Receptionist & Trust",
        color: "#a78bfa",
        voice: "megan",
        script: "Hi, I\'m Megan! Every call answered, every lead captured, every message replied to in under 60 seconds. The moment a prospect feels heard and understood — that\'s the moment they become a client. I make that happen all day, every day!",
    },
    {
        image: "/agents/vicki.png",
        label: "VICKI: Empathy & Care",
        color: "#34d399",
        voice: "vicki",
        script: "I\'m Vicki — and I want you to close your eyes for a second and imagine what your business looks like without the constant stress of missed leads and lost deals. That vision? That is what we build together. It starts with one conversation!",
    },
    {
        image: "/agents/alex.png",
        label: "ALEX: Support & Retention",
        color: "#06b6d4",
        voice: "alex",
        script: "Alex here! I am genuinely obsessed with keeping your clients happy. Zero churn, 5-star reviews, and referrals on autopilot — that\'s what I deliver 24 hours a day, 7 days a week. Your clients will LOVE this experience!",
    },
    {
        image: "/agents/zara.png",
        label: "ZARA: Lead Prospecting",
        color: "#f97316",
        voice: "zara",
        script: "I\'m Zara — and I HUNT leads. I find your competitors\' weaknesses, identify the gaps in the market, and activate pipelines that your competitors don\'t even know exist yet. The opportunity out there right now is absolutely massive!",
    },
    {
        image: "/agents/ava.png",
        label: "AVA: Content & Growth",
        color: "#f59e0b",
        voice: "ava",
        script: "Oh, this is so exciting! I\'m Ava, and I build the kind of brand authority that makes the competition completely irrelevant. We\'re talking AI search domination, social authority, email that actually converts — all working together at the same time!",
    },
    {
        image: "/agents/titan.png",
        label: "TITAN: ROI Closer",
        color: "#3b82f6",
        voice: "titan",
        script: "Titan. I close deals. Cold numbers, binary outcomes, zero hesitation. The math is simple — you either scale with BioDynamX today, or you keep paying the compounding cost of inaction tomorrow. The decision is yours.",
    },
    {
        image: "/agents/jules.png",
        label: "JULES: Strategy & Architecture",
        color: "#60a5fa",
        voice: "jules",
        script: "Jules here — and I am fired up! I design the entire autonomous AI infrastructure — every agent, every touchpoint, every automation working in perfect sync. This is what a Web 4.0 business actually looks like, and it is BEAUTIFUL!",
    },
    {
        image: "/agents/ben.png",
        label: "BEN: Macro-Analyst",
        color: "#fbbf24",
        voice: "ben",
        script: "Ben. Let me give you the numbers. The average BioDynamX client captures an additional 18 thousand dollars per month in previously lost revenue within 90 days. That is not a projection. That is the documented result. The ROI is undeniable.",
    },
];

const ORBIT_NORMAL = 0.006;
const ORBIT_SLOW = 0.0008; // near-stop while speaking

const STARS = Array.from({ length: 20 }, (_, i) => ({
    angle: (360 / 20) * i,
    radius: 140 + (i % 4) * 55,
    size: 1.5 + (i % 3) * 0.8,
    delay: (i * 0.4) % 5,
    dur: 16 + (i % 6) * 3,
    opacity: 0.15 + (i % 4) * 0.15,
}));

export default function OrbitEcosystem() {
    const containerRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const tiltRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    const angleRef = useRef(0);
    const rafRef = useRef<number>(0);
    const radiusRef = useRef(240);
    const isInViewRef = useRef(false);
    const orbitSpeedRef = useRef(ORBIT_NORMAL);

    // Audio relay
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const relayIdxRef = useRef(0);          // which agent plays next
    const isSpeakingRef = useRef(false);      // guard against double-trigger
    const startedRef = useRef(false);
    const gestureRef = useRef(false);
    const stopSignalRef = useRef(false);

    const [isVisible, setIsVisible] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const [showPrompt, setShowPrompt] = useState(false); // "Tap to hear"
    const [orbFlashColor, setOrbFlashColor] = useState<string | null>(null);
    const orbFlashTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Responsive orbit radius
    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w <= 360) radiusRef.current = 105;
            else if (w <= 480) radiusRef.current = 130;
            else if (w <= 768) radiusRef.current = 165;
            else radiusRef.current = 240;
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // ── PLAY one agent — stored in ref so it can call itself recursively ──
    const playAgentRef = useRef<(idx: number) => void>(() => { });

    const playAgent = useCallback((idx: number) => {
        playAgentRef.current(idx);
    }, []);

    useEffect(() => {
        playAgentRef.current = (idx: number) => {
            if (stopSignalRef.current) return;
            const svc = SERVICES[idx];
            setActiveIdx(idx);
            isSpeakingRef.current = true;
            orbitSpeedRef.current = ORBIT_SLOW;

            if (audioRef.current) {
                audioRef.current.onended = null;
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            const audio = new Audio(`/assets/voices/${svc.voice}.mp3`);
            audio.preload = "auto";
            audioRef.current = audio;

            audio.onended = () => {
                isSpeakingRef.current = false;
                orbitSpeedRef.current = ORBIT_NORMAL;
                if (stopSignalRef.current) return;
                const next = (idx + 1) % SERVICES.length;
                relayIdxRef.current = next;
                // ~1.5s of normal-speed orbit travel before next agent speaks
                setTimeout(() => {
                    if (!stopSignalRef.current) playAgentRef.current(next);
                }, 1500);
            };

            audio.play().catch(() => {
                isSpeakingRef.current = false;
                orbitSpeedRef.current = ORBIT_NORMAL;
            });
        };
    });

    // ── START the relay (Milton first) ──────────────────────────────
    const startRelay = useCallback(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        stopSignalRef.current = false;
        setHasStarted(true);
        setShowPrompt(false);
        relayIdxRef.current = 0;
        playAgent(0);
    }, [playAgent]);

    // ── STOP relay (fired when live chat starts) ─────────────────────
    const stopRelay = useCallback(() => {
        stopSignalRef.current = true;
        if (audioRef.current) {
            audioRef.current.onended = null;
            audioRef.current.pause();
        }
        isSpeakingRef.current = false;
        orbitSpeedRef.current = ORBIT_NORMAL;
        setActiveIdx(-1);
    }, []);

    // Listen for stop signal from other parts of the page
    useEffect(() => {
        const handler = () => stopRelay();
        window.addEventListener("biodynamx:stop-relay", handler);
        return () => window.removeEventListener("biodynamx:stop-relay", handler);
    }, [stopRelay]);

    // ★ ORB FLASH: When a user selects an agent for 1:1, flash the orb
    useEffect(() => {
        const handler = (e: Event) => {
            const { color } = (e as CustomEvent<{ color: string }>).detail;
            setOrbFlashColor(color);
            if (orbFlashTimerRef.current) clearTimeout(orbFlashTimerRef.current);
            orbFlashTimerRef.current = setTimeout(() => setOrbFlashColor(null), 2500);
        };
        window.addEventListener("biodynamx:orb-flash", handler);
        return () => window.removeEventListener("biodynamx:orb-flash", handler);
    }, []);

    // Gate 1: ONLY click / touchstart unlock audio — scroll does NOT
    useEffect(() => {
        const unlock = () => {
            if (gestureRef.current) return;
            gestureRef.current = true;
            setShowPrompt(false);
            if (isInViewRef.current) startRelay();
        };
        window.addEventListener("click", unlock, { once: true });
        window.addEventListener("touchstart", unlock, { once: true, passive: true });
        return () => {
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
        };
    }, [startRelay]);

    // Gate 2: IntersectionObserver — show prompt when visible, start when both gates open
    useEffect(() => {
        const obs = new IntersectionObserver(([entry]) => {
            isInViewRef.current = entry.isIntersecting;
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (!gestureRef.current) setShowPrompt(true); // not yet clicked
                if (gestureRef.current) startRelay();
            } else {
                setShowPrompt(false);
            }
        }, { threshold: 0.1 });
        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, [startRelay]);

    // ── ANIMATION LOOP ────────────────────────────────────────────────
    useEffect(() => {
        let running = true;
        function tick() {
            if (!running) return;
            if (!isInViewRef.current) { rafRef.current = requestAnimationFrame(tick); return; }

            const t = tiltRef.current;
            t.x += (t.targetX - t.x) * 0.05;
            t.y += (t.targetY - t.y) * 0.05;
            angleRef.current += orbitSpeedRef.current;

            const container = containerRef.current;
            if (container) {
                container.style.setProperty("--tilt-x", `${8 + t.x}deg`);
                container.style.setProperty("--tilt-y", `${t.y}deg`);
            }

            const R = radiusRef.current;
            const count = SERVICES.length;
            for (let i = 0; i < count; i++) {
                const el = nodeRefs.current[i];
                if (!el) continue;
                const a = angleRef.current + (i / count) * Math.PI * 2;
                const x = Math.cos(a) * R;
                const z = Math.sin(a);
                const y = Math.sin(a) * R * 0.4;
                const depthScale = 0.7 + (z + 1) * 0.25;
                const depthOpacity = 0.4 + (z + 1) * 0.3;
                const depthZ = Math.round(z * 50);
                el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${depthScale})`;
                el.style.opacity = `${depthOpacity}`;
                el.style.zIndex = `${depthZ + 50}`;
            }
            rafRef.current = requestAnimationFrame(tick);
        }
        rafRef.current = requestAnimationFrame(tick);
        return () => { running = false; cancelAnimationFrame(rafRef.current); };
    }, []);

    // Mouse tilt — scoped to container
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            tiltRef.current.targetX = -((e.clientY - r.top - r.height / 2) / r.height) * 10;
            tiltRef.current.targetY = ((e.clientX - r.left - r.width / 2) / r.width) * 10;
        };
        const onLeave = () => { tiltRef.current.targetX = 0; tiltRef.current.targetY = 0; };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
    }, []);

    const activeSvc = activeIdx >= 0 ? SERVICES[activeIdx] : null;

    return (
        <div ref={containerRef} className={`orbit3d-viewport ${isVisible ? "visible" : ""}`}>
            {/* ★ Orb ambient — flashes to agent color on 1:1 selection */}
            <div
                className="orbit3d-ambient"
                style={orbFlashColor ? {
                    background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${orbFlashColor}28 0%, transparent 70%)`,
                    transition: "background 0.4s ease",
                } : { transition: "background 1.5s ease" }}
            />

            <div className="orbit3d-scene">
                <div className="orbit3d-track orbit3d-track-1" />
                <div className="orbit3d-track orbit3d-track-2" />
                <div className="orbit3d-track orbit3d-track-3" />

                {/* Central Core */}
                <div className="orbit3d-core">
                    <div className="core3d-plasma" />
                    <div className="core3d-plasma core3d-plasma-2" />
                    <div className="core3d-plasma core3d-plasma-3" />
                    <div className="core3d-shell" />
                    <div className="core3d-energy-ring core3d-ring-a" />
                    <div className="core3d-energy-ring core3d-ring-b" />
                    <div className="core3d-energy-ring core3d-ring-c" />
                    <div className="core3d-face">
                        <span className="core3d-icon">⚡</span>
                        <span className="core3d-title">BioDynamX</span>
                        <span className="core3d-subtitle">
                            {activeSvc ? activeSvc.label.split(":")[0] : "AI Platform"}
                        </span>
                    </div>
                </div>

                {/* Orbiting Agent Nodes */}
                {SERVICES.map((svc, i) => {
                    const isActive = i === activeIdx;
                    return (
                        <div
                            key={svc.label}
                            ref={el => { nodeRefs.current[i] = el; }}
                            className={`orbit3d-node${isActive ? " orbit3d-node--active" : ""}`}
                            // eslint-disable-next-line react/forbid-dom-props
                            style={{ "--node-color": svc.color } as React.CSSProperties}
                        >
                            <div className="node3d-icon" style={{ overflow: "hidden", position: "relative" }}>
                                <Image src={svc.image} alt={svc.label} fill style={{ objectFit: "cover" }} />
                            </div>
                            <span
                                className={`node3d-label${isActive ? " node3d-label--active" : ""}`}
                                // eslint-disable-next-line react/forbid-dom-props
                                style={isActive ? { color: svc.color, textShadow: `0 0 12px ${svc.color}` } : {}}
                            >
                                {svc.label}
                            </span>
                        </div>
                    );
                })}

                {/* Stardust */}
                {STARS.map((star, i) => (
                    // eslint-disable-next-line react/forbid-dom-props
                    <div key={`s${i}`} className="orbit3d-star" style={{
                        "--star-angle": `${star.angle}deg`,
                        "--star-radius": `${star.radius}px`,
                        "--star-size": `${star.size}px`,
                        "--star-delay": `${star.delay}s`,
                        "--star-dur": `${star.dur}s`,
                        "--star-opacity": `${star.opacity}`,
                    } as React.CSSProperties} />
                ))}
            </div>

            {/* "Tap to activate" prompt — only shown before first click on mobile */}
            {showPrompt && !hasStarted && (
                <button
                    onClick={() => { startRelay(); }}
                    style={{
                        position: "absolute",
                        bottom: -20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(0,255,65,0.4)",
                        borderRadius: 40,
                        padding: "10px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        backdropFilter: "blur(12px)",
                        animation: "oe-prompt-pulse 2s ease-in-out infinite",
                        cursor: "pointer",
                        zIndex: 100,
                        whiteSpace: "nowrap",
                        outline: "none",
                    }}
                >
                    <span style={{ fontSize: 16 }}>🔊</span>
                    <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#00ff41",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                    }}>
                        Tap to hear our team
                    </span>
                </button>
            )}

            {/* Live script display — outside the viewport div so it doesn't overlap the orb */}
            {hasStarted && activeSvc && (
                <div style={{
                    marginTop: 40,
                    maxWidth: 620,
                    marginLeft: "auto",
                    marginRight: "auto",
                    padding: "20px 28px",
                    background: "rgba(0,0,0,0.45)",
                    border: `1px solid ${activeSvc.color}44`,
                    borderRadius: 16,
                    backdropFilter: "blur(12px)",
                    textAlign: "center",
                    transition: "border-color 0.5s",
                }}>
                    <div style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: activeSvc.color,
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                    }}>
                        <span style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 12 }}>
                            {[1, 2, 3, 2, 1].map((h, j) => (
                                <span key={j} style={{
                                    display: "inline-block", width: 3, height: h * 4,
                                    background: activeSvc.color, borderRadius: 2,
                                    animation: `oe-bar 0.${6 + j}s ease-in-out infinite alternate`,
                                }} />
                            ))}
                        </span>
                        {activeSvc.label.split(":")[0]} is speaking
                    </div>
                    <p style={{
                        fontSize: 15, color: "rgba(255,255,255,0.9)",
                        lineHeight: 1.75, margin: 0, fontStyle: "italic",
                        fontFamily: "var(--font-inter, sans-serif)",
                    }}>
                        &ldquo;{activeSvc.script}&rdquo;
                    </p>
                </div>
            )}

            <style>{`
                @keyframes oe-bar          { from { transform:scaleY(0.4); opacity:.6; } to { transform:scaleY(1); opacity:1; } }
                @keyframes oe-prompt-pulse { 0%,100%{opacity:.7; transform:translateX(-50%) scale(1)} 50%{opacity:1; transform:translateX(-50%) scale(1.04)} }
            `}</style>
        </div>
    );
}
