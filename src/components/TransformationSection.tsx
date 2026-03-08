"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

// ── 11-AGENT RELAY DATA ──────────────────────────────────────────────────────

const RELAY = [
    {
        name: "Milton", color: "#7c3aed",
        script: "Imagine if your team never sleeps, never quits, and never misses a close. A workforce that identifies pain and handles objections in real-time.",
        file: "milton",
    },
    {
        name: "Ben", color: "#fbbf24",
        script: "Welcome to BioDynamX Engineering Group. You're looking at the world's first neurobiology-powered AI, built specifically for the transition to Web 4.0.",
        file: "ben",
    },
    {
        name: "Chase", color: "#f97316",
        script: "We don't just build bots; we deploy voice AI systems using proven neuro-sales frameworks to trigger the 'Old Brain' and drive immediate decision-making.",
        file: "chase",
    },
    {
        name: "Iris", color: "#8b5cf6",
        script: "From building your high-conversion website to dominating AEO and GEO—we ensure your brand is the top recommendation on AI search engines.",
        file: "iris",
    },
    {
        name: "Alex", color: "#06b6d4",
        script: "Whether it's ChatGPT, Perplexity, or Gemini, we ensure you are indexed and visible where the future of search is actually happening.",
        file: "alex",
    },
    {
        name: "Mark", color: "#3b82f6",
        script: "This is how you scale your revenue without the overhead, the drama, or the high tax of additional employees. We handle the friction; you take back your freedom.",
        file: "mark",
    },
    {
        name: "Megan", color: "#a78bfa",
        script: "But we don't expect you to take our word for it. We want to prove the math to you. Right now, our growth strategist Jenny is standing by.",
        file: "megan",
    },
    {
        name: "Brock", color: "#ef4444",
        script: "She's armed with our proprietary Neuro-Audit tool to find exactly where your revenue is leaking and how our $1,497 system plugs that hole forever.",
        file: "brock",
    },
    {
        name: "Vicki", color: "#34d399",
        script: "Stop the $600-a-day hemorrhage. Look for the 'Talk to Jenny' button on this page to initiate your free, zero-risk Neural Revenue Audit.",
        file: "vicki",
    },
    {
        name: "Jules", color: "#60a5fa",
        script: "It's time to move past antiquated chatbots and step into the new gold standard of autonomous business growth. Jenny is ready when you are.",
        file: "jules",
    },
    {
        name: "Jenny", color: "#6366f1",
        script: "I'm right here. Click the button to start your audit, and let's look at your numbers together. It's time to scale your revenue—and then some.",
        file: "jenny",
    },
];

const SEGMENT_MS = 5500; // time per agent in ms

// ── ORBITING AGENT DOTS ───────────────────────────────────────────────────────

function OrbitRing({ activeIdx }: { activeIdx: number }) {
    const total = RELAY.length;
    return (
        <div style={{ position: "absolute", inset: -50, pointerEvents: "none", zIndex: 3 }}>
            {RELAY.map((agent, i) => {
                const angle = (i / total) * 360;
                const isActive = i === activeIdx;
                const radians = (angle * Math.PI) / 180;
                const radius = 115;
                const x = Math.cos(radians) * radius;
                const y = Math.sin(radians) * radius;
                return (
                    <div
                        key={agent.name}
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            transition: "all 0.5s ease",
                            zIndex: isActive ? 5 : 2,
                        }}
                    >
                        <div style={{
                            width: isActive ? 36 : 20,
                            height: isActive ? 36 : 20,
                            borderRadius: "50%",
                            background: isActive
                                ? `radial-gradient(circle, ${agent.color} 0%, ${agent.color}88 100%)`
                                : `rgba(255,255,255,0.12)`,
                            border: `2px solid ${isActive ? agent.color : "rgba(255,255,255,0.15)"}`,
                            boxShadow: isActive ? `0 0 16px ${agent.color}, 0 0 32px ${agent.color}55` : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.5s ease",
                        }}>
                            {isActive && (
                                <div style={{ fontSize: 8, fontWeight: 900, color: "#fff", lineHeight: 1, textAlign: "center" }}>
                                    {agent.name.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {isActive && (
                            <div style={{
                                position: "absolute",
                                top: "100%",
                                left: "50%",
                                transform: "translateX(-50%)",
                                marginTop: 4,
                                fontSize: 8,
                                fontWeight: 800,
                                color: agent.color,
                                whiteSpace: "nowrap",
                                letterSpacing: "0.08em",
                                textShadow: `0 0 10px ${agent.color}`,
                            }}>
                                {agent.name.toUpperCase()}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function TransformationSection() {
    const [activeIdx, setActiveIdx] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const orbRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const gestureRef = useRef(false);
    const inViewRef = useRef(false);
    const startedRef = useRef(false);
    const activeIdxRef = useRef(0);

    // Preload first voice
    useEffect(() => {
        const pre = new Audio("/assets/voices/milton.mp3");
        pre.preload = "auto";
        pre.load();
    }, []);

    const playAgent = useCallback((idx: number) => {
        const agent = RELAY[idx];
        activeIdxRef.current = idx;
        setActiveIdx(idx);

        // Stop previous
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = "";
        }

        const audio = new Audio(`/assets/voices/${agent.file}.mp3`);
        audio.load();
        audioRef.current = audio;
        audio.play().catch(() => { });

        // Pulse orb with the agent color
        if (orbRef.current) {
            gsap.to(orbRef.current, {
                boxShadow: `0 0 60px ${agent.color}88, 0 0 120px ${agent.color}33, inset 0 0 40px ${agent.color}22`,
                borderColor: agent.color,
                duration: 0.5,
                ease: "power2.out",
            });
        }
    }, []);

    const startRelay = useCallback(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        setHasStarted(true);

        // Play Milton immediately
        playAgent(0);

        // Advance every SEGMENT_MS
        let idx = 0;
        const timer = setInterval(() => {
            idx = (idx + 1) % RELAY.length;
            playAgent(idx);
        }, SEGMENT_MS);

        return () => clearInterval(timer);
    }, [playAgent]);

    // Gate 1: any user gesture
    useEffect(() => {
        const unlock = () => {
            if (gestureRef.current) return;
            gestureRef.current = true;
            if (inViewRef.current) startRelay();
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

    // Gate 2: IntersectionObserver
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !inViewRef.current) {
                    inViewRef.current = true;
                    if (gestureRef.current) startRelay();
                }
            },
            { threshold: 0.05 }
        );
        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, [startRelay]);

    const cur = RELAY[activeIdx];

    return (
        <section
            ref={containerRef}
            style={{
                position: "relative",
                padding: "80px 24px 100px",
                fontFamily: "var(--font-inter)",
                textAlign: "center",
                overflow: "visible",
                width: "100%",
            }}
        >
            {/* Ambient gold-dot grid */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle, rgba(255,215,0,0.04) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
                pointerEvents: "none", zIndex: 0,
            }} />

            {/* Section header */}
            <div style={{ position: "relative", zIndex: 10, marginBottom: 56 }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    background: "rgba(0,255,65,0.07)", border: "1px solid rgba(0,255,65,0.25)",
                    borderRadius: 30, padding: "5px 18px", marginBottom: 20,
                    fontSize: 10, fontWeight: 800, color: "#00ff41",
                    letterSpacing: "0.14em", textTransform: "uppercase",
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#00ff41", boxShadow: "0 0 8px #00ff41",
                        animation: "ts-blink 1.4s ease-in-out infinite",
                        display: "inline-block",
                    }} />
                    {hasStarted ? `${cur.name} is Speaking` : "11 AI Voices · Neural Relay · Auto-Play"}
                </div>
                <h2 style={{
                    fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900,
                    letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 16px",
                    background: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.6) 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                    The World&apos;s First <span style={{ color: cur.color, WebkitTextFillColor: cur.color, transition: "color 0.5s" }}>Autonomous Neuro-Workforce.</span>
                </h2>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
                    Scroll down and listen. Our 11 AI agents introduce themselves — each one engineered to handle a different part of your revenue pipeline.
                </p>
            </div>

            {/* THE ORB — center piece */}
            <div style={{ position: "relative", zIndex: 10, display: "inline-block", marginBottom: 56 }}>

                {/* Orbit dots ring */}
                <OrbitRing activeIdx={activeIdx} />

                {/* Spinning dashed ring */}
                <div style={{
                    position: "absolute",
                    top: -50, left: -50, right: -50, bottom: -50,
                    border: `1px dashed ${cur.color}44`,
                    borderRadius: "50%",
                    animation: "ts-spin 18s linear infinite",
                    transition: "border-color 0.5s",
                    pointerEvents: "none",
                }} />

                {/* The main Orb */}
                <div
                    ref={orbRef}
                    style={{
                        width: 240,
                        height: 240,
                        borderRadius: "50%",
                        background: `radial-gradient(circle at 35% 35%, ${cur.color}22 0%, transparent 70%)`,
                        border: `1.5px solid ${cur.color}66`,
                        boxShadow: `0 0 40px ${cur.color}44, 0 0 80px ${cur.color}22, inset 0 0 20px ${cur.color}11`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        position: "relative",
                        transition: "background 0.5s, border-color 0.5s",
                        cursor: "default",
                        padding: "20px",
                    }}
                >
                    {hasStarted ? (
                        <>
                            {/* Agent name */}
                            <div style={{
                                fontSize: 22, fontWeight: 900,
                                color: cur.color,
                                textShadow: `0 0 20px ${cur.color}`,
                                letterSpacing: "-0.02em",
                                marginBottom: 6,
                                transition: "color 0.5s",
                            }}>
                                {cur.name}
                            </div>
                            {/* Live speaking indicator */}
                            <div style={{
                                display: "flex", gap: 3, alignItems: "flex-end",
                                height: 18, marginBottom: 8,
                            }}>
                                {[1, 2, 3, 4, 3, 2].map((h, i) => (
                                    <div key={i} style={{
                                        width: 3,
                                        height: h * 4,
                                        borderRadius: 2,
                                        background: cur.color,
                                        animation: `ts-bar 0.${6 + i}s ease-in-out infinite alternate`,
                                        boxShadow: `0 0 6px ${cur.color}`,
                                    }} />
                                ))}
                            </div>
                            <div style={{
                                fontSize: 9, fontWeight: 700, color: `${cur.color}cc`,
                                letterSpacing: "0.12em", textTransform: "uppercase",
                            }}>
                                SPEAKING NOW
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>🧠</div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                SCROLL TO HEAR
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* LIVE SCRIPT DISPLAY — shows what the current agent is saying */}
            <div style={{
                maxWidth: 680, margin: "0 auto 56px",
                position: "relative", zIndex: 10,
                minHeight: 100,
            }}>
                {hasStarted ? (
                    <div style={{
                        background: `rgba(0,0,0,0.35)`,
                        border: `1px solid ${cur.color}33`,
                        borderRadius: 20,
                        padding: "24px 32px",
                        backdropFilter: "blur(12px)",
                        transition: "border-color 0.5s",
                    }}>
                        <div style={{
                            fontSize: 11, fontWeight: 800, color: cur.color,
                            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12,
                            transition: "color 0.5s",
                        }}>
                            🎙 {cur.name} says:
                        </div>
                        <p style={{
                            fontSize: 15, color: "rgba(255,255,255,0.85)",
                            lineHeight: 1.75, margin: 0, fontStyle: "italic",
                        }}>
                            &ldquo;{cur.script}&rdquo;
                        </p>
                    </div>
                ) : (
                    <div style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 20,
                        padding: "24px 32px",
                    }}>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6 }}>
                            The agent scripts will appear here as each one speaks...
                        </p>
                    </div>
                )}
            </div>

            {/* Agent name scrollbar — progress through all 11 */}
            <div style={{
                maxWidth: 700, margin: "0 auto 40px",
                display: "flex", gap: 6, justifyContent: "center",
                flexWrap: "wrap",
                position: "relative", zIndex: 10,
            }}>
                {RELAY.map((agent, i) => (
                    <div key={agent.name} style={{
                        fontSize: 9, fontWeight: 800,
                        color: i === activeIdx ? agent.color : "rgba(255,255,255,0.25)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        border: `1px solid ${i === activeIdx ? agent.color + "66" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 20,
                        background: i === activeIdx ? `${agent.color}11` : "transparent",
                        transition: "all 0.5s ease",
                        boxShadow: i === activeIdx ? `0 0 10px ${agent.color}44` : "none",
                    }}>
                        {agent.name}
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div style={{ position: "relative", zIndex: 10 }}>
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    style={{
                        padding: "18px 44px",
                        borderRadius: 100,
                        background: "transparent",
                        border: "2px solid #00ff41",
                        color: "#00ff41",
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        fontFamily: "inherit",
                    }}
                >
                    Talk to Jenny — Free Revenue Audit →
                </button>
            </div>

            <style>{`
                @keyframes ts-spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes ts-blink { 0%,100% { opacity:1 } 50% { opacity:0.35 } }
                @keyframes ts-bar   { from { transform: scaleY(0.4); opacity:0.6; } to { transform: scaleY(1); opacity:1; } }
            `}</style>
        </section>
    );
}
