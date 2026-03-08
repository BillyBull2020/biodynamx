"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function TransformationSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const frictionRef = useRef<HTMLDivElement>(null);
    const flowRef = useRef<HTMLDivElement>(null);
    const mathRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const ctx = gsap.context(() => {
            const transformTL = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                    end: "bottom 80%",
                    scrub: 1.5,
                }
            });

            // The Friction side degrades and falls back
            transformTL.to(frictionRef.current, {
                x: -40,
                y: 20,
                opacity: 0.15,
                rotationY: -10,
                scale: 0.9,
                filter: "blur(8px) sepia(50%) hue-rotate(-30deg) saturate(150%)",
                duration: 1
            }, 0)

                // The Flow side emerges into dominance
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
                }, 0.2)

                // Background glow flares up
                .to(glowRef.current, {
                    opacity: 0.8,
                    scale: 1.2,
                    duration: 1.5,
                }, 0.2)

                // The Math section slams in
                .fromTo(mathRef.current, {
                    y: 100,
                    scale: 0.9,
                    opacity: 0,
                    filter: "blur(10px)"
                }, {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px)",
                    ease: "elastic.out(1.2, 0.4)",
                    duration: 1.2
                }, 1);

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const frictionItems = [
        { label: "80+ Voicemails", desc: "Revenue vanishing into thin air." },
        { label: "3-Hour Lag", desc: "Leads die while you're busy." },
        { label: "Competitor Wins", desc: "They close because they're faster." },
        { label: "9-5 Limits", desc: "Your business sleeps; costs don't." },
    ];

    const flowItems = [
        { label: "1s Response", desc: "Every call captured, 24/7/365." },
        { label: "8s Textback", desc: "Instant, autonomous engagement." },
        { label: "Total Dominance", desc: "AI qualifies and books for you." },
        { label: "Universal Presence", desc: "Your highest-converting hours." },
    ];

    return (
        <section
            ref={sectionRef}
            className="transformation-section"
            style={{
                position: "relative",
                padding: "160px 24px 120px",
                backgroundImage: "url('/neural-friction-flow.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                minHeight: "100vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                perspective: "1200px",
            }}
        >
            {/* Cinematic Overlays */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #050508 0%, rgba(5,5,8,0.7) 20%, rgba(5,5,8,0.7) 80%, #050508 100%)", zIndex: 1 }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, transparent 0%, rgba(5,5,8,0.95) 90%)", zIndex: 1 }} />

            {/* Ambient Flow Glow */}
            <div ref={glowRef} style={{
                position: "absolute", right: "20%", top: "40%", width: "40vw", height: "40vw",
                background: "radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)",
                filter: "blur(60px)", opacity: 0, zIndex: 1, pointerEvents: "none",
            }} />

            {/* Header Content */}
            <div style={{ textAlign: "center", marginBottom: 80, position: "relative", zIndex: 10, maxWidth: 900 }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 12,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                    padding: "8px 24px", borderRadius: 100, marginBottom: 24,
                    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFD700", boxShadow: "0 0 10px #FFD700" }} />
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                        The Bio-Logical Transformation
                    </span>
                </div>
                <h2 style={{
                    fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.05,
                    margin: "0 0 24px",
                    background: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.4) 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.02em",
                }}>
                    The $600/Day <br className="md:hidden" />
                    <span style={{ color: "#ef4444", textShadow: "0 0 40px rgba(239,68,68,0.4)", WebkitTextFillColor: "#ef4444" }}>Revenue Hemorrhage</span>
                </h2>
                <p style={{
                    fontSize: "clamp(18px, 2.5vw, 24px)", color: "rgba(255,255,255,0.6)",
                    maxWidth: 700, margin: "0 auto", lineHeight: 1.5, fontWeight: 400,
                }}>
                    Stop losing prospects to human friction. <br className="hidden md:block" />Start closing with <strong style={{ color: "#fff", fontWeight: 700 }}>Bio-Logical Flow.</strong>
                </p>
            </div>

            {/* GSAP Transformation Container */}
            <div style={{
                maxWidth: 1200, width: "100%", margin: "0 auto", position: "relative", zIndex: 10,
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32,
                transformStyle: "preserve-3d",
            }}>

                {/* ── THE FRICTION SIDE ── */}
                <div ref={frictionRef} style={{
                    background: "rgba(20, 15, 15, 0.4)",
                    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                    borderRadius: 32,
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                    padding: "48px 40px",
                    position: "relative",
                    overflow: "hidden",
                    transformOrigin: "right center",
                }}>
                    {/* Dark gradient fade for depth */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(225deg, transparent 50%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #ef4444, transparent)" }} />

                    {/* Noise texture */}
                    <div style={{ position: "absolute", inset: 0, background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E\")", pointerEvents: "none" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, position: "relative", zIndex: 2 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: 20 }}>
                            ✗
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>The Manual Trap</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "#ef4444", letterSpacing: "-0.02em" }}>Biological Friction</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative", zIndex: 2 }}>
                        {frictionItems.map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                <div style={{ width: 2, height: 40, background: "rgba(239,68,68,0.3)", borderRadius: 2, marginTop: 4 }} />
                                <div>
                                    <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{item.label}</div>
                                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.5 }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── THE FLOW SIDE ── */}
                <div ref={flowRef} style={{
                    background: "rgba(20, 18, 10, 0.75)",
                    backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
                    borderRadius: 32,
                    border: "1px solid rgba(255, 215, 0, 0.4)",
                    padding: "48px 40px",
                    position: "relative",
                    overflow: "hidden",
                    transformOrigin: "left center",
                    boxShadow: "0 20px 80px rgba(255, 215, 0, 0)", // animated in
                }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, transparent 40%, rgba(255,215,0,0.05) 100%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #FFD700, #F59E0B)" }} />
                    <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, background: "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, position: "relative", zIndex: 2 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFD700", fontSize: 20, boxShadow: "0 0 20px rgba(255,215,0,0.2)" }}>
                            ✓
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "rgba(255,215,0,0.6)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>The BioDynamX Way</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", textShadow: "0 0 30px rgba(255,215,0,0.4)", letterSpacing: "-0.02em" }}>Neural Flow</div>
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

            {/* ── THE MATH HIGHLIGHT ── */}
            <div ref={mathRef} style={{ width: "100%", maxWidth: 1200, margin: "64px auto 0", position: "relative", zIndex: 10 }}>
                <div style={{
                    background: "rgba(10,10,14,0.7)",
                    backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
                    borderRadius: 32,
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "48px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
                        <div style={{ height: 1, width: 40, background: "rgba(255,255,255,0.1)" }} />
                        <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.25em" }}>
                            The Math of the New Gold Standard
                        </div>
                        <div style={{ height: 1, width: 40, background: "rgba(255,255,255,0.1)" }} />
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 24, width: "100%", alignItems: "center" }}>

                        {/* Old Way */}
                        <div style={{ flex: 1, minWidth: 260, padding: "20px" }}>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8, letterSpacing: "0.08em" }}>HUMAN TEAM</div>
                            <div style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "rgba(255,255,255,0.8)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                                $12,400<span style={{ fontSize: "0.5em", color: "rgba(255,255,255,0.3)" }}>/mo</span>
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                                <span style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontSize: 11, fontWeight: 700 }}>High Tax</span>
                                <span style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, fontWeight: 700 }}>Low Output</span>
                            </div>
                        </div>

                        {/* VS Badge */}
                        <div style={{
                            width: 64, height: 64, borderRadius: "50%", background: "rgba(20,20,24,0.8)", border: "1px solid rgba(255,255,255,0.05)",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 14, fontWeight: 800, fontStyle: "italic", flexShrink: 0,
                            boxShadow: "inset 0 4px 10px rgba(0,0,0,0.5)"
                        }}>
                            VS
                        </div>

                        {/* BioDynamX Limitless Widget */}
                        <div style={{
                            flex: 1.5, minWidth: 320,
                            padding: "32px 48px", borderRadius: 24,
                            background: "linear-gradient(135deg, rgba(255, 215, 0, 0.12), rgba(0, 255, 65, 0.04))",
                            border: "1px solid rgba(255, 215, 0, 0.5)",
                            boxShadow: "0 20px 60px rgba(255, 215, 0, 0.15), inset 0 0 30px rgba(255, 215, 0, 0.08)",
                            position: "relative", overflow: "hidden"
                        }}>
                            {/* Circuit Pattern overlay */}
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "url(\"data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFD700' fill-opacity='0.04' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='2'/%3E%3Cpath d='M3 5h2v2H3V5zm0 4h2v2H3V9zm0 4h2v2H3v-2zm0 4h2v2H3v-2zm4-12h2v2H7V5zm0 4h2v2H7V9zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-12h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-12h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z'/%3E%3C/g%3E%3C/svg%3E\")", pointerEvents: "none" }} />

                            {/* Golden Edge Light */}
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }} />

                            <div style={{ position: "relative", zIndex: 2 }}>
                                <div style={{ fontSize: 13, color: "#FFD700", fontWeight: 800, marginBottom: 12, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                                    BioDynamX Web 4.0
                                </div>
                                <div style={{
                                    fontSize: "clamp(48px, 6vw, 76px)", fontWeight: 900, lineHeight: 1,
                                    background: "linear-gradient(135deg, #FFD700 30%, #fff 100%)",
                                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                    filter: "drop-shadow(0 4px 16px rgba(255,215,0,0.4))",
                                    letterSpacing: "-0.02em"
                                }}>
                                    $1,497<span style={{ fontSize: "0.4em", color: "rgba(255,255,255,0.7)", WebkitTextFillColor: "rgba(255,255,255,0.7)", filter: "none" }}>/mo</span>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
                                    <div style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD700", boxShadow: "0 0 8px #FFD700" }} />
                                        <span style={{ color: "#FFD700", fontSize: 13, fontWeight: 800 }}>96% Less Cost</span>
                                    </div>
                                    <div style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(0,255,65,0.12)", border: "1px solid rgba(0,255,65,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff41", boxShadow: "0 0 8px #00ff41" }} />
                                        <span style={{ color: "#00ff41", fontSize: 13, fontWeight: 800 }}>10x More Output</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </section>
    );
}
