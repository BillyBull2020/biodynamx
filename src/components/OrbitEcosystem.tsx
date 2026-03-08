"use client";

// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — IMMERSIVE 3D ORBITING ECOSYSTEM v3
// 11-Agent auto-relay: faces orbit the core, voices speak in sequence
// starting with Milton. Auto-starts on scroll-into-view + user gesture.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import "./OrbitEcosystem.css";

// ── 11-AGENT RELAY — matches SERVICES order exactly ─────────────────
const SERVICES = [
    {
        image: "/agents/milton.png",
        label: "MILTON: Conversational AI",
        color: "#7c3aed",
        voice: "milton",
        script: "Imagine if your team never sleeps, never quits, and never misses a close.",
    },
    {
        image: "/agents/ben.png",
        label: "BEN: Revenue Audit",
        color: "#fbbf24",
        voice: "ben",
        script: "Welcome to BioDynamX Engineering Group — the world's first neurobiology-powered AI.",
    },
    {
        image: "/agents/hunter.png",
        label: "CHASE: Lead Prospecting",
        color: "#ef4444",
        voice: "chase",
        script: "We deploy voice AI using neuro-sales frameworks to trigger the Old Brain.",
    },
    {
        image: "/agents/nova.png",
        label: "IRIS: AI Visibility & Content",
        color: "#f97316",
        voice: "iris",
        script: "From building your website to dominating AEO and GEO — we handle it all.",
    },
    {
        image: "/agents/alex.png",
        label: "ALEX: Support Lead",
        color: "#34d399",
        voice: "alex",
        script: "Whether on ChatGPT, Perplexity, or Gemini — we make sure you are indexed.",
    },
    {
        image: "/agents/mark.png",
        label: "MARK: Revenue Closer",
        color: "#3b82f6",
        voice: "mark",
        script: "Scale your revenue without the overhead, the drama, or the high tax of extra employees.",
    },
    {
        image: "/agents/meghan.png",
        label: "MEGHAN: AI Receptionist",
        color: "#a78bfa",
        voice: "megan",
        script: "We want to prove the math. Our growth strategist Jenny is standing by.",
    },
    {
        image: "/agents/brock.png",
        label: "BROCK: Security & ROI",
        color: "#06b6d4",
        voice: "brock",
        script: "Jenny is armed with our Neuro-Audit tool to find exactly where your revenue leaks.",
    },
    {
        image: "/agents/vicki.png",
        label: "VICKI: Empathy & Care",
        color: "#10b981",
        voice: "vicki",
        script: "Stop the $600-a-day hemorrhage. Find the Talk to Jenny button on this page.",
    },
    {
        image: "/agents/jules.png",
        label: "JULES: Strategy & Architecture",
        color: "#60a5fa",
        voice: "jules",
        script: "Step past antiquated chatbots into the new gold standard of autonomous growth.",
    },
    {
        image: "/agents/jenny.png",
        label: "JENNY: Lead Discovery",
        color: "#00ff41",
        voice: "jenny",
        script: "I'm right here. Click the button — let's look at your numbers together.",
    },
];

const SEGMENT_MS = 6000;   // ms per agent while speaking (orbit slows)
const ORBIT_SPEED_NORMAL = 0.008;  // radians/frame normal
const ORBIT_SPEED_SLOW = 0.002;  // radians/frame when agent is speaking

// Reduced stardust for performance
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
    const [isVisible, setIsVisible] = useState(false);
    const rafRef = useRef<number>(0);
    const radiusRef = useRef(240);
    const isInViewRef = useRef(false);

    // Audio relay state
    const [activeIdx, setActiveIdx] = useState<number>(-1);
    const [hasStarted, setHasStarted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const gestureRef = useRef(false);
    const startedRef = useRef(false);
    const orbitSpeedRef = useRef(ORBIT_SPEED_NORMAL);

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

    // Animation loop — pauses when off-screen
    useEffect(() => {
        let running = true;
        function tick() {
            if (!running) return;
            if (!isInViewRef.current) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }
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
        const container = containerRef.current;
        if (!container) return;
        const handleMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            tiltRef.current.targetX = -((e.clientY - cy) / rect.height) * 10;
            tiltRef.current.targetY = ((e.clientX - cx) / rect.width) * 10;
        };
        const handleLeave = () => { tiltRef.current.targetX = 0; tiltRef.current.targetY = 0; };
        container.addEventListener("mousemove", handleMove);
        container.addEventListener("mouseleave", handleLeave);
        return () => {
            container.removeEventListener("mousemove", handleMove);
            container.removeEventListener("mouseleave", handleLeave);
        };
    }, []);

    // Play one agent, slow the orbit, then advance
    const playAgent = useCallback((idx: number) => {
        const svc = SERVICES[idx];
        setActiveIdx(idx);
        orbitSpeedRef.current = ORBIT_SPEED_SLOW;

        // Stop previous
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = "";
        }
        const audio = new Audio(`/assets/voices/${svc.voice}.mp3`);
        audio.load();
        audioRef.current = audio;
        audio.play().catch(() => { });
    }, []);

    const startRelay = useCallback(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        setHasStarted(true);

        let idx = 0;
        playAgent(0);

        const timer = setInterval(() => {
            orbitSpeedRef.current = ORBIT_SPEED_NORMAL;
            idx = (idx + 1) % SERVICES.length;
            setTimeout(() => playAgent(idx), 400); // brief pause between agents
        }, SEGMENT_MS);

        return () => clearInterval(timer);
    }, [playAgent]);

    // Gate 1: any user gesture
    useEffect(() => {
        const unlock = () => {
            if (gestureRef.current) return;
            gestureRef.current = true;
            if (isInViewRef.current) startRelay();
        };
        window.addEventListener("scroll", unlock, { once: true, passive: true });
        window.addEventListener("touchstart", unlock, { once: true, passive: true });
        window.addEventListener("click", unlock, { once: true });
        return () => {
            window.removeEventListener("scroll", unlock);
            window.removeEventListener("touchstart", unlock);
            window.removeEventListener("click", unlock);
        };
    }, [startRelay]);

    // Gate 2 + Visibility: IntersectionObserver
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                isInViewRef.current = entry.isIntersecting;
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (gestureRef.current) startRelay();
                }
            },
            { threshold: 0.1 }
        );
        obs.observe(container);
        return () => obs.disconnect();
    }, [startRelay]);

    const activeSvc = activeIdx >= 0 ? SERVICES[activeIdx] : null;

    return (
        <div
            ref={containerRef}
            className={`orbit3d-viewport ${isVisible ? "visible" : ""}`}
        >
            {/* Ambient glow */}
            <div className="orbit3d-ambient" />

            {/* 3D Scene */}
            <div className="orbit3d-scene">

                {/* Orbital track ellipses */}
                <div className="orbit3d-track orbit3d-track-1" />
                <div className="orbit3d-track orbit3d-track-2" />
                <div className="orbit3d-track orbit3d-track-3" />

                {/* Central Plasma Core */}
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
                        <span className="core3d-subtitle">AI Platform</span>
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
                            style={{
                                "--node-color": isActive ? svc.color : svc.color,
                                outline: isActive ? `3px solid ${svc.color}` : "none",
                                boxShadow: isActive ? `0 0 24px ${svc.color}99, 0 0 48px ${svc.color}44` : "none",
                                transition: "outline 0.4s, box-shadow 0.4s",
                                borderRadius: "50%",
                            } as React.CSSProperties}
                        >
                            <div className="node3d-icon" style={{ overflow: "hidden", position: "relative" }}>
                                <Image
                                    src={svc.image}
                                    alt={svc.label}
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                            <span
                                className="node3d-label"
                                style={isActive ? { color: svc.color, fontWeight: 900, textShadow: `0 0 10px ${svc.color}` } : {}}
                            >
                                {svc.label}
                            </span>
                        </div>
                    );
                })}

                {/* Stardust particles */}
                {STARS.map((star, i) => (
                    <div
                        key={`star-${i}`}
                        className="orbit3d-star"
                        style={{
                            "--star-angle": `${star.angle}deg`,
                            "--star-radius": `${star.radius}px`,
                            "--star-size": `${star.size}px`,
                            "--star-delay": `${star.delay}s`,
                            "--star-dur": `${star.dur}s`,
                            "--star-opacity": `${star.opacity}`,
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Live script display — below the orbit */}
            {hasStarted && activeSvc && (
                <div
                    style={{
                        marginTop: 32,
                        maxWidth: 600,
                        marginLeft: "auto",
                        marginRight: "auto",
                        padding: "20px 28px",
                        background: "rgba(0,0,0,0.4)",
                        border: `1px solid ${activeSvc.color}44`,
                        borderRadius: 16,
                        backdropFilter: "blur(12px)",
                        transition: "border-color 0.5s",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
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
                        }}
                    >
                        {/* Live bars */}
                        <span style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 12 }}>
                            {[1, 2, 3, 2, 1].map((h, j) => (
                                <span key={j} style={{
                                    display: "inline-block",
                                    width: 3,
                                    height: h * 4,
                                    background: activeSvc.color,
                                    borderRadius: 2,
                                    animation: `oe-bar 0.${6 + j}s ease-in-out infinite alternate`,
                                }} />
                            ))}
                        </span>
                        {activeSvc.label.split(":")[0]} is speaking
                    </div>
                    <p style={{
                        fontSize: 15,
                        color: "rgba(255,255,255,0.88)",
                        lineHeight: 1.7,
                        margin: 0,
                        fontStyle: "italic",
                        fontFamily: "var(--font-inter, sans-serif)",
                    }}>
                        &ldquo;{activeSvc.script}&rdquo;
                    </p>
                </div>
            )}

            {!hasStarted && (
                <div style={{
                    marginTop: 24,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textAlign: "center",
                }}>
                    Scroll to hear the team
                </div>
            )}

            <style>{`
                @keyframes oe-bar {
                    from { transform: scaleY(0.4); opacity: 0.6; }
                    to   { transform: scaleY(1);   opacity: 1;   }
                }
            `}</style>
        </div>
    );
}
