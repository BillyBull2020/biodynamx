"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function TransformationSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const frictionRef = useRef<HTMLDivElement>(null);
    const flowRef = useRef<HTMLDivElement>(null);
    const visualizerRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLButtonElement>(null);
    const [audioPlaying, setAudioPlaying] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const ctx = gsap.context(() => {
            // 1. Initial Transformation Scrub
            const transformTL = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                    end: "bottom 80%",
                    scrub: 1.5,
                }
            });

            // The Friction side degrades
            transformTL.to(frictionRef.current, {
                x: -40,
                y: 20,
                opacity: 0.2,
                rotationY: -10,
                scale: 0.9,
                filter: "blur(5px) grayscale(100%) sepia(30%) hue-rotate(-20deg) saturate(150%)",
                duration: 1
            }, 0)
                // The Flow side emerges
                .fromTo(flowRef.current, {
                    x: 60,
                    y: 40,
                    opacity: 0,
                    rotationY: 15,
                    scale: 0.85,
                }, {
                    x: 0,
                    y: 0,
                    opacity: 1,
                    rotationY: 0,
                    scale: 1.05,
                    boxShadow: "0 20px 80px rgba(255, 215, 0, 0.25), inset 0 0 40px rgba(255, 215, 0, 0.1)",
                    duration: 1.5,
                    ease: "power2.out"
                }, 0.2);

            // Ambient background visualizer pulse when idle
            gsap.to(visualizerRef.current, {
                scale: 1.05,
                opacity: 0.8,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleActivateBen = () => {
        if (audioPlaying) return;
        setAudioPlaying(true);

        const url = "/assets/voices/ben-audit.mp3";
        const audio = new Audio(url);
        audioRef.current = audio;

        // Visual Sync GSAP Context
        const ctx = gsap.context(() => {
            const benTalkTL = gsap.timeline();

            // Simulate the timeline of the speech based on expected audio length
            // AT ~4s: "80 leads rot in voicemail" -> Pulse red warning on friction side
            benTalkTL.to(frictionRef.current, {
                backgroundColor: "rgba(255,0,0,0.2)",
                boxShadow: "0 0 40px rgba(255,0,0,0.3)",
                duration: 0.3,
                repeat: 3,
                yoyo: true,
                ease: "power1.inOut"
            }, 5.0);

            // AT ~12s: "Under a second" -> Gold flash on Ben's Visualizer
            benTalkTL.to(visualizerRef.current, {
                boxShadow: "0 0 100px #FFD700, inset 0 0 40px #FFD700",
                scale: 1.2,
                duration: 0.5,
                yoyo: true,
                repeat: 1
            }, 13.0);

            // AT ~26s: "Ready to stop the leak?" -> Animate the CTA button
            benTalkTL.to(ctaRef.current, {
                scale: 1.1,
                backgroundColor: "#FFD700",
                color: "#000",
                boxShadow: "0 0 30px rgba(255,215,0,0.6)",
                repeat: -1,
                yoyo: true,
                duration: 0.5
            }, 27.0);

        }, sectionRef);

        audio.onended = () => {
            setAudioPlaying(false);
            ctx.revert(); // clean up animation timeline

            // Clean up visual state manually if needed
            gsap.killTweensOf(frictionRef.current);
            gsap.to(frictionRef.current, { backgroundColor: "rgba(20, 15, 15, 0.4)", duration: 0.5 });
            gsap.killTweensOf(visualizerRef.current);
            gsap.to(visualizerRef.current, { scale: 1, boxShadow: "none", duration: 1 });
            gsap.killTweensOf(ctaRef.current);
            gsap.to(ctaRef.current, { scale: 1, backgroundColor: "transparent", color: "#FFD700", duration: 0.5 });
        };

        audio.play().catch((err) => {
            console.error("Audio playback blocked. Check file /assets/voices/ben-audit.mp3", err);
            setAudioPlaying(false);
            ctx.revert();
        });
    };

    const frictionItems = [
        { label: "80+ Voicemails", desc: "Revenue vanishing into thin air." },
        { label: "3-Hour Lag", desc: "Leads die while you're busy." },
        { label: "Competitor Wins", desc: "They close because they're faster." },
        { label: "$12,400+ Payroll", desc: "High tax for low output." },
    ];

    const flowItems = [
        { label: "100% Capture", desc: "Ben answers in <1s. Every time." },
        { label: "8s Textback", desc: "Instant, autonomous engagement." },
        { label: "Total Dominance", desc: "Ben qualifies and books for you." },
        { label: "$1,497 Total", desc: "96% less cost. 10x more output." },
    ];

    return (
        <section
            ref={sectionRef}
            className="ben-transformation-section"
            style={{
                position: "relative",
                padding: "80px 24px",
                fontFamily: "var(--font-inter)",
            }}
        >
            {/* Ambient Background Grid for Neuro Vibe */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundSize: "60px 60px",
                backgroundImage: "radial-gradient(circle, rgba(255,215,0,0.05) 1px, transparent 1px)",
                opacity: 0.6,
                zIndex: 1, pointerEvents: "none"
            }} />

            {/* Header Content */}
            <div style={{ textAlign: "center", marginBottom: 64, position: "relative", zIndex: 10, maxWidth: 900 }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 12,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                    padding: "8px 24px", borderRadius: 100, marginBottom: 24,
                    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFD700", boxShadow: "0 0 16px #FFD700" }} />
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                        The Ben Revenue Audit (Master Module)
                    </span>
                </div>
                <h2 style={{
                    fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 900, lineHeight: 1.05,
                    margin: "0 0 24px",
                    background: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.6) 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.02em",
                }}>
                    Ben is Not a Chatbot.<br className="md:hidden" />
                    <span style={{ color: "#FFD700", WebkitTextFillColor: "#FFD700" }}> He is Your New Top Producer.</span>
                </h2>
                <p style={{
                    fontSize: "clamp(18px, 2.5vw, 24px)", color: "rgba(255,255,255,0.6)",
                    maxWidth: 700, margin: "0 auto", lineHeight: 1.5, fontWeight: 400,
                }}>
                    Stop the <strong style={{ color: "#ef4444" }}>$600/Day Hemorrhage. </strong>
                    <br className="hidden md:block" />Start the <strong style={{ color: "#fff", fontWeight: 700 }}>Bio-Logical Flow.</strong>
                </p>
            </div>

            {/* The Sphere Visualizer */}
            <div style={{ position: "relative", zIndex: 10, marginBottom: 64 }}>
                <div
                    ref={visualizerRef}
                    className="ben-visualizer"
                    style={{
                        width: 250,
                        height: 250,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)",
                        border: "1px solid rgba(255, 215, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        cursor: "pointer",
                        position: "relative",
                        boxShadow: "0 0 40px rgba(255,215,0,0.2), inset 0 0 20px rgba(255,215,0,0.1)",
                        transition: "all 0.3s ease",
                    }}
                    onClick={handleActivateBen}
                >
                    <div style={{
                        position: "absolute", top: -20, right: -20, bottom: -20, left: -20,
                        border: "1px dashed rgba(255,215,0,0.3)", borderRadius: "50%",
                        animation: "spin 20s linear infinite", pointerEvents: "none"
                    }} />

                    <div style={{
                        textAlign: "center", zIndex: 2
                    }}>
                        {!audioPlaying ? (
                            <>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>🎙️</div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFD700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                    Activate Ben
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ display: "flex", gap: 4, height: 40, alignItems: "center", justifyContent: "center" }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} style={{
                                            width: 4, height: "100%", background: "#FFD700", borderRadius: 4,
                                            animation: `bounce ${0.4 + (i * 0.1)}s ease infinite alternate`
                                        }} />
                                    ))}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", marginTop: 12, letterSpacing: "0.1em" }}>ANALYZING...</div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* GSAP Transformation Container */}
            <div style={{
                maxWidth: 1200, width: "100%", margin: "0 auto", position: "relative", zIndex: 10,
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32,
                transformStyle: "preserve-3d",
            }}>

                {/* ── THE FRICTION SIDE ── */}
                <div ref={frictionRef} className="human-friction-side" style={{
                    background: "rgba(20, 15, 15, 0.4)",
                    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                    borderRadius: 32,
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                    padding: "48px 40px",
                    position: "relative",
                    overflow: "hidden",
                    transformOrigin: "right center",
                }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(225deg, transparent 50%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #ef4444, transparent)" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, position: "relative", zIndex: 2 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: 20 }}>
                            ✗
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "rgba(239,68,68,0.6)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>The Antiquated Way</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Manual Labor</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative", zIndex: 2 }}>
                        {frictionItems.map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                <div style={{ width: 2, height: 40, background: "rgba(239,68,68,0.3)", borderRadius: 2, marginTop: 4 }} />
                                <div>
                                    <div style={{ color: "#ef4444", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{item.label}</div>
                                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.5 }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── THE FLOW SIDE ── */}
                <div ref={flowRef} className="ben-flow-side" style={{
                    background: "rgba(20, 18, 10, 0.75)",
                    backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
                    borderRadius: 32,
                    border: "1px solid rgba(255, 215, 0, 0.4)",
                    padding: "48px 40px",
                    position: "relative",
                    overflow: "hidden",
                    transformOrigin: "left center",
                    boxShadow: "0 20px 80px rgba(255, 215, 0, 0)",
                }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, transparent 40%, rgba(255,215,0,0.05) 100%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #FFD700, #F59E0B)" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, position: "relative", zIndex: 2 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFD700", fontSize: 20, boxShadow: "0 0 20px rgba(255,215,0,0.2)" }}>
                            ✓
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>The Ben Advantage</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", textShadow: "0 0 30px rgba(255,215,0,0.4)", letterSpacing: "-0.02em" }}>Autonomous Growth</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative", zIndex: 2 }}>
                        {flowItems.map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                <div style={{ position: "relative", width: 2, height: 40, background: "rgba(255,215,0,0.2)", borderRadius: 2, marginTop: 4 }}>
                                    <div style={{ position: "absolute", top: 0, left: -2, width: 6, height: 16, background: "#FFD700", borderRadius: 4, boxShadow: "0 0 12px #FFD700" }} />
                                </div>
                                <div>
                                    <div style={{ color: "#FFD700", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{item.label}</div>
                                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.5 }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 64, position: "relative", zIndex: 10, textAlign: "center" }}>
                <button
                    ref={ctaRef}
                    className="activate-ben-btn cta-button"
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                        padding: "20px 48px",
                        borderRadius: 100,
                        background: "transparent",
                        border: "2px solid #FFD700",
                        color: "#FFD700",
                        fontSize: 16,
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                    }}
                >
                    Ready to Stop the Leak?
                </button>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes bounce {
                    from { height: 10px; }
                    to { height: 32px; }
                }
            `}</style>

        </section>
    );
}
