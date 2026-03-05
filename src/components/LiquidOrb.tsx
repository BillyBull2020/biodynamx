"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import gsap from "gsap";

export type OrbMode = "idle" | "alpha" | "beta" | "merge";

export interface LiquidOrbHandle {
    feedAudio: (amplitude: number, pitch: number) => void;
    setMode: (mode: OrbMode) => void;
    triggerMerge: () => Promise<void>;
}

const LiquidOrb = forwardRef<LiquidOrbHandle, { onClick?: () => void; label?: string }>(
    ({ onClick, label }, ref) => {
        const svgRef = useRef<SVGSVGElement>(null);
        const glowRef = useRef<HTMLDivElement>(null);
        const labelRef = useRef<HTMLSpanElement>(null);
        const modeRef = useRef<OrbMode>("idle");
        const blobPathsRef = useRef<SVGPathElement[]>([]);

        // Fluid morph state
        const morphState = useRef({
            points: Array.from({ length: 8 }, (_, i) => ({
                angle: (i / 8) * Math.PI * 2,
                radius: 120,
                velocity: 0,
            })),
            amplitude: 0,
            pitch: 0.5,
        });

        useImperativeHandle(ref, () => ({
            feedAudio: (amplitude: number, pitch: number) => {
                morphState.current.amplitude = amplitude;
                morphState.current.pitch = pitch;
            },
            setMode: (mode: OrbMode) => {
                modeRef.current = mode;
            },
            triggerMerge: () => {
                return new Promise<void>((resolve) => {
                    modeRef.current = "merge";

                    // Golden merge animation
                    const tl = gsap.timeline({ onComplete: resolve });
                    tl.to(svgRef.current, {
                        scale: 1.8,
                        duration: 0.6,
                        ease: "power2.in"
                    });
                    tl.to(svgRef.current, {
                        scale: 0.3,
                        opacity: 0,
                        duration: 0.5,
                        ease: "power3.in"
                    });
                    tl.to(glowRef.current, {
                        boxShadow: "0 0 200px 100px rgba(234,179,8,0.8)",
                        duration: 0.4,
                        ease: "power2.out"
                    }, "-=0.5");
                });
            }
        }));

        useEffect(() => {
            if (!svgRef.current) return;
            blobPathsRef.current = Array.from(svgRef.current.querySelectorAll(".blob-layer"));

            let running = true;
            const cx = 150, cy = 150;

            function generateBlobPath(points: typeof morphState.current.points, offset: number): string {
                const pts = points.map(p => {
                    const r = p.radius + offset;
                    return {
                        x: cx + Math.cos(p.angle) * r,
                        y: cy + Math.sin(p.angle) * r,
                    };
                });

                let d = `M ${pts[0].x} ${pts[0].y}`;
                for (let i = 0; i < pts.length; i++) {
                    const curr = pts[i];
                    const next = pts[(i + 1) % pts.length];
                    const cpx = (curr.x + next.x) / 2;
                    const cpy = (curr.y + next.y) / 2;
                    d += ` Q ${curr.x} ${curr.y} ${cpx} ${cpy}`;
                }
                d += " Z";
                return d;
            }

            function tick() {
                if (!running) return;

                const { points, amplitude, pitch } = morphState.current;
                const mode = modeRef.current;
                const time = Date.now() / 1000;

                // Viscosity based on speaker: Alpha = low viscosity (fast), Beta = high viscosity (slow)
                const viscosity = mode === "alpha" ? 0.15 : mode === "beta" ? 0.04 : 0.06;
                const turbulence = mode === "alpha" ? 1.8 : mode === "beta" ? 0.8 : 1.0;

                // Update fluid points
                for (let i = 0; i < points.length; i++) {
                    const baseRadius = 100 + amplitude * 40;
                    const noise = Math.sin(time * (1 + pitch * 3) + i * 1.3) * turbulence * 12
                        + Math.cos(time * 0.7 + i * 2.1) * 6
                        + Math.sin(time * 2.3 + i * 0.9) * amplitude * 15;

                    const target = baseRadius + noise;
                    points[i].velocity += (target - points[i].radius) * viscosity;
                    points[i].velocity *= 0.85;
                    points[i].radius += points[i].velocity;
                }

                // Color configurations
                let colors: string[];
                let glowColor: string;

                if (mode === "alpha") {
                    colors = [
                        "rgba(251,191,36,0.7)",   // amber-400
                        "rgba(245,158,11,0.5)",   // amber-500
                        "rgba(217,119,6,0.3)",    // amber-600
                    ];
                    glowColor = "0 0 80px 30px rgba(245,158,11,0.5), 0 0 200px 60px rgba(251,191,36,0.15)";
                } else if (mode === "beta") {
                    colors = [
                        "rgba(96,165,250,0.7)",   // blue-400
                        "rgba(59,130,246,0.5)",   // blue-500
                        "rgba(37,99,235,0.3)",    // blue-600
                    ];
                    glowColor = "0 0 80px 30px rgba(59,130,246,0.5), 0 0 200px 60px rgba(96,165,250,0.15)";
                } else if (mode === "merge") {
                    colors = [
                        "rgba(234,179,8,0.9)",
                        "rgba(250,204,21,0.6)",
                        "rgba(253,224,71,0.3)",
                    ];
                    glowColor = "0 0 120px 50px rgba(234,179,8,0.7), 0 0 300px 100px rgba(250,204,21,0.2)";
                } else {
                    colors = [
                        "rgba(148,163,184,0.5)",  // slate-400
                        "rgba(100,116,139,0.3)",  // slate-500
                        "rgba(71,85,105,0.2)",    // slate-600
                    ];
                    glowColor = "0 0 40px 15px rgba(148,163,184,0.2), 0 0 100px 30px rgba(100,116,139,0.1)";
                }

                // Update SVG paths
                blobPathsRef.current.forEach((path, i) => {
                    const d = generateBlobPath(points, (i - 1) * 8);
                    path.setAttribute("d", d);
                    path.setAttribute("fill", colors[i] || colors[0]);
                });

                // Update glow
                if (glowRef.current) {
                    glowRef.current.style.boxShadow = glowColor;
                }

                requestAnimationFrame(tick);
            }

            tick();

            // Entrance animation
            gsap.fromTo(svgRef.current,
                { scale: 0.3, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.5, ease: "elastic.out(1, 0.5)" }
            );

            return () => { running = false; };
        }, []);

        return (
            <div className="relative flex items-center justify-center cursor-pointer group" onClick={onClick}>
                {/* Outer glow container */}
                <div
                    ref={glowRef}
                    className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full transition-all duration-300"
                />

                {/* SVG Liquid Blob */}
                <svg
                    ref={svgRef}
                    viewBox="0 0 300 300"
                    className="w-64 h-64 md:w-80 md:h-80 will-change-transform"
                    style={{ filter: "url(#goo)" }}
                >
                    <defs>
                        <filter id="goo">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                            <feColorMatrix in="blur" mode="matrix"
                                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="goo" />
                            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                        </filter>
                        <radialGradient id="inner-light" cx="35%" cy="30%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
                        </radialGradient>
                    </defs>

                    <path className="blob-layer" />
                    <path className="blob-layer" />
                    <path className="blob-layer" />

                    {/* Inner specular highlight */}
                    <circle cx="120" cy="110" r="50" fill="url(#inner-light)" opacity="0.6" />
                </svg>

                {/* Center label */}
                <span
                    ref={labelRef}
                    className="absolute text-white/80 font-semibold tracking-[0.2em] text-xs md:text-sm uppercase select-none drop-shadow-lg text-center z-10 pointer-events-none px-8"
                    style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
                >
                    {label}
                </span>
            </div>
        );
    }
);

LiquidOrb.displayName = "LiquidOrb";

export default LiquidOrb;
