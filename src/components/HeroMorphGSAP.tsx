"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface HeroMorphGSAPProps {
    onStart: () => void;
    headline: string;
    subheadline: string;
    hookText: string;
    badge: string;
    primaryBtn: string;
    secondaryBtn: string;
    spotsText: string;
}

export default function HeroMorphGSAP({
    onStart, headline, subheadline, hookText,
    badge, primaryBtn, secondaryBtn, spotsText,
}: HeroMorphGSAPProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const scanRef = useRef<HTMLDivElement>(null);
    const maskRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!scanRef.current || !maskRef.current || !ctaRef.current) return;

        // ── Neural Morph Timeline (matches V4.1 spec) ──────────────────
        const tl = gsap.timeline({
            repeat: -1,
            yoyo: true,
            defaults: { ease: "power2.inOut" },
        });

        // Scan line sweeps top→bottom simultaneously with clip reveal
        tl.to(scanRef.current, { top: "100%", duration: 4 })
            .to(maskRef.current, { clipPath: "inset(0 0 0% 0)", duration: 4 }, 0);

        // CTA dopamine pulse
        gsap.to(ctaRef.current, {
            scale: 1.04,
            repeat: -1,
            yoyo: true,
            duration: 1,
            ease: "sine.inOut",
        });

        return () => { tl.kill(); gsap.killTweensOf(ctaRef.current); };
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                padding: "clamp(24px,5vh,72px) clamp(16px,6vw,80px)",
                background: "transparent",
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                animation: "fadeUp 0.8s ease-out",
            }}
        >
            {/* ── Responsive wrapper ── */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "clamp(32px,5vw,72px)",
                width: "100%",
            }}>

                {/* ══ LEFT: Text Column ════════════════════════════════════ */}
                <div id="hmg-text" style={{ flex: "1.2", minWidth: 280, order: 1 }}>

                    {/* Eyebrow */}
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "rgba(0,255,65,0.07)",
                        border: "1px solid rgba(0,255,65,0.2)",
                        borderRadius: 100, padding: "6px 16px",
                        fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
                        color: "rgba(255,255,255,0.8)", marginBottom: 20,
                    }}>
                        {badge}
                    </div>

                    {/* H1 */}
                    <h1
                        data-speakable="true"
                        className="hero-headline animated-gradient-text"
                        style={{
                            fontSize: "clamp(28px, 4vw, 58px)",
                            fontWeight: 900, lineHeight: 1.07,
                            marginBottom: 20, letterSpacing: "-0.02em",
                        }}
                    >
                        {headline}
                    </h1>

                    {/* Sub */}
                    <p
                        data-speakable="true"
                        style={{
                            fontSize: "clamp(14px, 1.4vw, 17px)",
                            color: "rgba(255,255,255,0.7)",
                            lineHeight: 1.65, marginBottom: 24, maxWidth: 580,
                        }}
                    >
                        {subheadline}
                    </p>

                    {/* Jenny callout */}
                    <div style={{
                        padding: "14px 22px",
                        background: "linear-gradient(135deg, rgba(0,255,65,0.06), rgba(59,130,246,0.06))",
                        border: "1px solid rgba(0,255,65,0.2)",
                        borderRadius: 14, marginBottom: 28,
                        backdropFilter: "blur(8px)",
                    }}>
                        <p data-speakable="true" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.88)", margin: 0, lineHeight: 1.6 }}>
                            {hookText}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20, maxWidth: 440 }}>
                        {/* Primary CTA — dopamine pulse target */}
                        <button
                            ref={ctaRef}
                            onClick={onStart}
                            id="hero-primary-cta"
                            style={{
                                background: "#00ff41",
                                color: "#000",
                                padding: "18px 32px",
                                fontWeight: 900,
                                fontSize: "clamp(14px, 1.5vw, 17px)",
                                borderRadius: 12,
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 0 28px rgba(0,255,65,0.35), 0 4px 20px rgba(0,0,0,0.3)",
                                letterSpacing: "-0.01em",
                                width: "100%",
                                transition: "background 0.2s",
                            }}
                        >
                            {primaryBtn}
                        </button>

                        {/* Secondary CTA */}
                        <button
                            onClick={onStart}
                            id="hero-secondary-cta"
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                color: "rgba(255,255,255,0.85)",
                                padding: "14px 28px",
                                fontWeight: 700,
                                fontSize: 15,
                                borderRadius: 10,
                                border: "1px solid rgba(255,255,255,0.15)",
                                cursor: "pointer",
                                backdropFilter: "blur(8px)",
                                width: "100%",
                                transition: "background 0.2s",
                            }}
                        >
                            {secondaryBtn}
                        </button>
                    </div>

                    {/* Scarcity */}
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                        <span style={{ color: "#ff4444", animation: "heart-pulse 2s infinite", fontWeight: 800 }}>
                            🔴 Only 3 free audits left today
                        </span>
                        {" "}| {spotsText}
                    </div>
                </div>

                {/* ══ RIGHT: Morph Visual ══════════════════════════════════ */}
                <div id="hmg-visual" style={{ flex: "0.8", minWidth: 280, position: "relative", order: 2 }}>

                    {/* Morph box */}
                    <div style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: 480,
                        aspectRatio: "1 / 1.25",
                        borderRadius: 30,
                        overflow: "hidden",
                        border: "1px solid rgba(0,255,65,0.2)",
                        boxShadow: "0 0 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,65,0.04)",
                        margin: "0 auto",
                    }}>
                        {/* Robot — bottom layer */}
                        <img
                            src="/assets/hero_robot.png"
                            alt="BioDynamX AI — Autonomous Intelligence"
                            style={{
                                position: "absolute", top: 0, left: 0,
                                width: "100%", height: "100%",
                                objectFit: "cover", objectPosition: "top center",
                                zIndex: 1,
                                filter: "brightness(0.9)",
                            }}
                        />

                        {/* Billy — clip-path reveal layer (controlled by GSAP) */}
                        <div
                            ref={maskRef}
                            style={{
                                position: "absolute", top: 0, left: 0,
                                width: "100%", height: "100%",
                                clipPath: "inset(0 0 100% 0)", // starts fully hidden (bottom clips it)
                                zIndex: 2,
                                willChange: "clip-path",
                            }}
                        >
                            <img
                                src="/assets/hero_man.png"
                                alt="Billy de la Torres — BioDynamX Founder"
                                style={{
                                    position: "absolute", top: 0, left: 0,
                                    width: "100%", height: "100%",
                                    objectFit: "cover", objectPosition: "top center",
                                }}
                            />
                        </div>

                        {/* Neural scan line (GSAP moves top 50%→100%) */}
                        <div
                            ref={scanRef}
                            style={{
                                position: "absolute",
                                top: "0%",
                                left: 0,
                                width: "100%",
                                height: 3,
                                background: "linear-gradient(to right, transparent, #00ff41, transparent)",
                                boxShadow: "0 0 18px #00ff41, 0 0 40px rgba(0,255,65,0.4)",
                                zIndex: 3,
                                willChange: "top",
                            }}
                        />

                        {/* Edge glow overlay */}
                        <div style={{
                            position: "absolute", inset: 0, zIndex: 4,
                            background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)",
                            pointerEvents: "none",
                            borderRadius: 30,
                        }} />
                    </div>

                    {/* Caption badge */}
                    <div style={{
                        textAlign: "center", marginTop: 16,
                        fontSize: 10, fontWeight: 800,
                        letterSpacing: "0.2em", color: "rgba(0,255,65,0.6)",
                        textTransform: "uppercase",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    }}>
                        <div style={{ width: 28, height: 1, background: "linear-gradient(to right, transparent, rgba(0,255,65,0.5))" }} />
                        ⚡ AI × HUMAN INTELLIGENCE
                        <div style={{ width: 28, height: 1, background: "linear-gradient(to left, transparent, rgba(255,215,0,0.5))" }} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes heart-pulse {
                    0%,100% { opacity: 1; }
                    50% { opacity: 0.45; }
                }
                @media (max-width: 1024px) {
                    #hero-morph-wrapper > div:first-child { order: 2 !important; }
                    #hero-morph-wrapper > div:last-child  { order: 1 !important; width: 80% !important; margin: 0 auto !important; }
                }
            `}</style>
        </section>
    );
}
