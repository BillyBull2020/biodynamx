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

    useEffect(() => {
        if (typeof window === "undefined") return;

        const ctx = gsap.context(() => {
            const transformTL = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 60%", // Start animation when the section is entering the view
                    end: "bottom center",
                    scrub: 1.5, // High-smoothing for Cognitive Ease
                    onEnter: () => console.log("Neuro-Signal: Transition Initiated.")
                }
            });

            // Animate the Friction side away
            transformTL.to(frictionRef.current, {
                x: -50,
                opacity: 0.3,
                filter: "blur(4px) grayscale(100%)",
                duration: 1
            })
                // Bring the BioDynamX "Flow" side into dominance
                .from(flowRef.current, {
                    x: 50,
                    scale: 0.9,
                    opacity: 0,
                    duration: 1.5
                }, "-=0.5")
                // Trigger the Math Reveal
                .from(mathRef.current, {
                    scale: 1.5,
                    opacity: 0,
                    ease: "elastic.out(1, 0.3)",
                    duration: 1
                });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="transformation-section"
            style={{
                position: "relative",
                padding: "160px 24px 100px",
                backgroundImage: "url('/neural-friction-flow.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                minHeight: "100vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {/* Header / Copy */}
            <div style={{ textAlign: "center", marginBottom: 64, position: "relative", zIndex: 10 }}>
                <h2 style={{
                    fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 900, lineHeight: 1.05,
                    margin: "0 0 16px",
                    color: "#fff",
                    textShadow: "0 4px 24px rgba(0,0,0,0.8)",
                }}>
                    The $600/Day Revenue Hemorrhage
                </h2>
                <p style={{
                    fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.8)",
                    maxWidth: 700, margin: "0 auto", lineHeight: 1.6,
                    textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                }}>
                    Stop losing prospects to human friction. Start closing with Bio-Logical Flow.
                </p>
            </div>

            {/* GSAP Transformation Container */}
            <div style={{ maxWidth: 1080, width: "100%", margin: "0 auto", position: "relative", zIndex: 10 }}>
                <div className="transformation-container" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    backdropFilter: "blur(15px)",
                    WebkitBackdropFilter: "blur(15px)",
                    borderRadius: 24,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    overflow: "hidden",
                    background: "rgba(10,10,14,0.6)",
                }}>

                    {/* The Friction Side */}
                    <div ref={frictionRef} className="friction-side" style={{
                        background: "rgba(255, 0, 0, 0.05)",
                        padding: "40px 32px",
                        filter: "grayscale(0.8)",
                        transition: "all 0.5s ease",
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#ef4444", letterSpacing: "0.1em", marginBottom: 24 }}>
                            ✗ THE BIOLOGICAL FRICTION (Manual)
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 20 }}>
                            <li style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.5 }}>
                                <span style={{ color: "#ef4444", fontWeight: 700 }}>80+ Voicemails:</span> Revenue vanishing into thin air.
                            </li>
                            <li style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.5 }}>
                                <span style={{ color: "#ef4444", fontWeight: 700 }}>3-Hour Lag:</span> Leads die while you&apos;re busy.
                            </li>
                            <li style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.5 }}>
                                <span style={{ color: "#ef4444", fontWeight: 700 }}>Competitor Wins:</span> They close because they&apos;re faster.
                            </li>
                            <li style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.5 }}>
                                <span style={{ color: "#ef4444", fontWeight: 700 }}>9-5 Limits:</span> Your business sleeps; costs don&apos;t.
                            </li>
                        </ul>
                    </div>

                    {/* The Flow Side */}
                    <div ref={flowRef} className="flow-side" style={{
                        background: "rgba(255, 215, 0, 0.08)",
                        padding: "40px 32px",
                        boxShadow: "inset 0 0 50px rgba(255, 215, 0, 0.15)",
                        borderLeft: "2px solid #FFD700",
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#FFD700", letterSpacing: "0.1em", marginBottom: 24 }}>
                            ✓ THE NEURAL FLOW (BioDynamX)
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 20 }}>
                            <li style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "#fff", fontSize: 15, lineHeight: 1.5 }}>
                                <span style={{ color: "#FFD700", fontWeight: 800 }}>1s Response:</span> Every call captured, 24/7/365.
                            </li>
                            <li style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "#fff", fontSize: 15, lineHeight: 1.5 }}>
                                <span style={{ color: "#FFD700", fontWeight: 800 }}>8s Textback:</span> Instant, autonomous engagement.
                            </li>
                            <li style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "#fff", fontSize: 15, lineHeight: 1.5 }}>
                                <span style={{ color: "#FFD700", fontWeight: 800 }}>Total Dominance:</span> AI qualifies and books for you.
                            </li>
                            <li style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "#fff", fontSize: 15, lineHeight: 1.5 }}>
                                <span style={{ color: "#FFD700", fontWeight: 800 }}>Universal Presence:</span> Your highest-converting hours.
                            </li>
                        </ul>
                    </div>
                </div>

                <div ref={mathRef} style={{ marginTop: 48, textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16 }}>
                        The Math of the New Gold Standard
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, alignItems: "center" }}>
                        <div style={{
                            padding: "20px 32px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)"
                        }}>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Human Team</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,100,100,0.8)" }}>$12,400/mo</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>(High Tax / Low Output)</div>
                        </div>

                        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.3)" }}>VS</div>

                        <div style={{
                            padding: "24px 40px", borderRadius: 20,
                            background: "linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(0, 255, 65, 0.15))",
                            border: "1px solid rgba(255, 215, 0, 0.3)",
                            boxShadow: "0 8px 32px rgba(255, 215, 0, 0.2)"
                        }}>
                            <div style={{ fontSize: 13, color: "#FFD700", fontWeight: 700, marginBottom: 8, letterSpacing: "0.1em" }}>BIODYNAMX</div>
                            <div className="math-highlight" style={{
                                fontSize: "2.5rem", fontWeight: 800,
                                background: "linear-gradient(90deg, #FFD700, #fff)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                            }}>
                                $1,497/mo
                            </div>
                            <div style={{ fontSize: 12, color: "#FFD700", opacity: 0.9, marginTop: 8, fontWeight: 600 }}>
                                (96% Less Cost / 10x More Output)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Very dark overlay to ensure text contrast if the image is too bright */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,5,8,0.7), rgba(5,5,8,0.4) 30%, rgba(5,5,8,0.8) 100%)", pointerEvents: "none", zIndex: 5 }} />
        </section>
    );
}
