"use client";

import { useRef, useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load Spline with SSR disabled — prevents crash if module fails
const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => null,
});

interface JennySplineProps {
    amplitude: number;
    isActive: boolean;
    isSpeaking: boolean;
    agentName: string | null;
}

interface SplineApp {
    findObjectByName: (name: string) => {
        scale: { set: (x: number, y: number, z: number) => void };
    } | null;
}

export default function JennySpline({ amplitude, isActive, isSpeaking, agentName }: JennySplineProps) {
    const splineRef = useRef<SplineApp | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    function onLoad(splineApp: any) {
        splineRef.current = splineApp as SplineApp;
        setIsLoading(false);
        console.log("[JennySpline] Spline loaded successfully");
    }

    function onError() {
        setHasError(true);
        setIsLoading(false);
        console.warn("[JennySpline] Spline failed to load — using CSS fallback");
    }

    // React to amplitude/speaking changes
    useEffect(() => {
        if (!splineRef.current) return;
        const obj = splineRef.current.findObjectByName('Core')
            || splineRef.current.findObjectByName('Sphere')
            || splineRef.current.findObjectByName('Neural');

        if (obj) {
            const scale = 1 + amplitude * 1.5;
            obj.scale.set(scale, scale, scale);
        }
    }, [amplitude, isSpeaking]);

    // ─── CSS Neural Core Fallback (immersive, no dependency) ────────
    if (hasError) {
        return (
            <div style={{
                position: "relative", width: "100%", height: "100%", minHeight: 400,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: isActive ? 1 : 0, transition: "opacity 0.7s ease",
            }}>
                {/* Animated Neural Core */}
                <div style={{
                    width: 220, height: 220, borderRadius: "50%",
                    background: "radial-gradient(circle at 40% 40%, rgba(0,255,65,0.25), rgba(59,130,246,0.15), transparent 70%)",
                    boxShadow: isSpeaking
                        ? "0 0 80px rgba(0,255,65,0.4), 0 0 160px rgba(0,255,65,0.15), inset 0 0 60px rgba(0,255,65,0.1)"
                        : "0 0 60px rgba(0,255,65,0.2), 0 0 120px rgba(59,130,246,0.1), inset 0 0 40px rgba(0,255,65,0.05)",
                    animation: "neuralCorePulse 4s ease-in-out infinite, neuralCoreRotate 20s linear infinite",
                    transform: `scale(${1 + amplitude * 0.5})`,
                    transition: "transform 0.15s ease, box-shadow 0.3s ease",
                    position: "relative",
                }}>
                    {/* Inner ring */}
                    <div style={{
                        position: "absolute", inset: 20, borderRadius: "50%",
                        border: "1px solid rgba(0,255,65,0.2)",
                        animation: "neuralCoreRotate 12s linear infinite reverse",
                    }} />
                    {/* Core dot */}
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 16, height: 16, borderRadius: "50%",
                        background: "#00ff41",
                        boxShadow: "0 0 20px #00ff41, 0 0 40px rgba(0,255,65,0.5)",
                        animation: "pulse 2s infinite",
                    }} />
                </div>

                {/* Orbital rings */}
                {[0, 60, 120].map((rotation, i) => (
                    <div key={i} style={{
                        position: "absolute", width: 280 + i * 40, height: 280 + i * 40,
                        border: `1px solid rgba(0,255,65,${0.08 - i * 0.02})`,
                        borderRadius: "50%",
                        transform: `rotateX(70deg) rotateZ(${rotation}deg)`,
                        animation: `neuralCoreRotate ${15 + i * 5}s linear infinite`,
                    }} />
                ))}

                {/* Agent Label */}
                <div style={{
                    position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
                    padding: "6px 16px", background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(12px)", borderRadius: 100,
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", gap: 10,
                }}>
                    <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: isSpeaking ? "#00ff41" : "rgba(0,255,65,0.4)",
                        boxShadow: isSpeaking ? "0 0 8px #00ff41" : "none",
                        animation: isSpeaking ? "pulse 1s infinite" : "none",
                    }} />
                    <span style={{
                        fontSize: 10, fontWeight: 900, letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.6)", textTransform: "uppercase",
                    }}>
                        SYS: {agentName === "Jenny" ? "NEURAL_LINK_JENNY" : "NEURAL_CORE_ACTIVE"}
                    </span>
                </div>

                <style>{`
                    @keyframes neuralCorePulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.08); }
                    }
                    @keyframes neuralCoreRotate {
                        from { transform: rotateX(70deg) rotateZ(0deg); }
                        to { transform: rotateX(70deg) rotateZ(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            position: "relative", width: "100%", height: "100%", minHeight: 400,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: isActive ? 1 : 0, transition: "opacity 0.7s ease",
        }}>
            {isLoading && (
                <div style={{
                    position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center", zIndex: 10,
                }}>
                    <div style={{
                        width: 128, height: 128, borderRadius: "50%",
                        background: "rgba(0,255,65,0.05)",
                        animation: "pulse 2s infinite",
                        filter: "blur(32px)",
                    }} />
                    <div style={{
                        position: "absolute", width: 96, height: 96, borderRadius: "50%",
                        borderTop: "2px solid rgba(0,255,65,0.4)",
                        animation: "spin 1s linear infinite",
                    }} />
                    <div style={{
                        position: "absolute", marginTop: 96,
                        fontSize: 8, fontWeight: 900, letterSpacing: "0.2em",
                        color: "rgba(0,255,65,0.6)", textTransform: "uppercase",
                    }}>
                        Initialising Neural Mesh
                    </div>
                </div>
            )}

            <Suspense fallback={null}>
                <Spline
                    scene="https://prod.spline.design/6Wq1Q7YAnWfEL7uH/scene.splinecode"
                    onLoad={onLoad}
                    onError={onError}
                    style={{ width: '100%', height: '100%' }}
                />
            </Suspense>

            {/* Conditional Speaking Glow */}
            {isSpeaking && (
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    borderRadius: "50%", background: "rgba(0,255,65,0.03)",
                    filter: "blur(80px)", animation: "pulse 2s infinite",
                }} />
            )}

            {/* Agent Label Overlay */}
            <div style={{
                position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
                padding: "6px 16px", background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(12px)", borderRadius: 100,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", gap: 10,
            }}>
                <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: isSpeaking ? "#00ff41" : "rgba(0,255,65,0.4)",
                    boxShadow: isSpeaking ? "0 0 8px #00ff41" : "none",
                    animation: isSpeaking ? "pulse 1s infinite" : "none",
                }} />
                <span style={{
                    fontSize: 10, fontWeight: 900, letterSpacing: "0.2em",
                    color: "rgba(255,255,255,0.6)", textTransform: "uppercase",
                }}>
                    SYS: {agentName === "Jenny" ? "NEURAL_LINK_JENNY" : "STANDBY"}
                </span>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
