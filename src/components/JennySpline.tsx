"use client";

import { useRef, useEffect, useState, Suspense, Component, ReactNode, ErrorInfo } from 'react';
import dynamic from 'next/dynamic';

class SplineErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode, fallback: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[Spline Error]:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <>{this.props.fallback}</>;
        }
        return this.props.children;
    }
}

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

const AGENTS = [
    { name: "Jenny", image: "/agents/jenny.png", color: "#6366f1" },
    { name: "Nova", image: "/agents/nova_v2.png", color: "#ec4899" },
    { name: "Isabel", image: "/agents/iris.png", color: "#8b5cf6" },
    { name: "Maya", image: "/agents/meghan.png", color: "#a78bfa" },
    { name: "Vicki", image: "/agents/vicki.png", color: "#34d399" },
    { name: "Alex", image: "/agents/alex.png", color: "#06b6d4" },
    { name: "Zara", image: "/agents/zara.png", color: "#f97316" },
    { name: "Abby", image: "/agents/ava.png", color: "#f59e0b" },
    { name: "Titan", image: "/agents/titan.png", color: "#3b82f6" },
    { name: "Jules", image: "/agents/jules.png", color: "#06b6d4" },
    { name: "Ben", image: "/agents/ben.png", color: "#fbbf24" },
];

export default function JennySpline({ amplitude, isActive, isSpeaking, agentName }: JennySplineProps) {
    const splineRef = useRef<SplineApp | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    const activeAgent = AGENTS.find(a => a.name === agentName);
    const agentImg = activeAgent?.image;
    const agentColor = activeAgent?.color || "#6366f1";

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

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
        // Spline background is locked in place per user request
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
                {!isMobile && (
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
                )}

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

            <SplineErrorBoundary fallback={
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,255,65,0.4)", fontSize: 10, letterSpacing: "0.2em" }}>
                    [ 3D MESH OFFLINE ]
                </div>
            }>
                <Suspense fallback={null}>
                    <Spline
                        scene="https://prod.spline.design/6Wq1Q7YAnWfEL7uH/scene.splinecode"
                        onLoad={onLoad}
                        onError={onError}
                        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                    />
                </Suspense>
            </SplineErrorBoundary>

            {/* Conditional Speaking Glow */}
            {isSpeaking && (
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    borderRadius: "50%", background: "rgba(0,255,65,0.03)",
                    filter: "blur(80px)", animation: "pulse 2s infinite",
                }} />
            )}

            {/* Agent Label Overlay */}
            {!isMobile && (
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
            )}

            {/* ★ AGENT AVATAR OVERLAY — "The Spirit in the Shell" */}
            {agentImg && (
                <div style={{
                    position: "absolute",
                    inset: isMobile ? "25%" : "30%",
                    borderRadius: "50%",
                    overflow: "hidden",
                    zIndex: 2,
                    opacity: isActive ? (isSpeaking ? 0.35 : 0.2) : 0,
                    transition: "opacity 1s ease, transform 1s ease",
                    transform: `scale(${1 + amplitude * 0.15})`,
                    filter: "grayscale(20%) contrast(110%) brightness(130%)",
                }}>
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(circle, transparent 40%, ${agentColor}22 100%)`,
                        zIndex: 3,
                    }} />
                    <img
                        src={agentImg}
                        alt={agentName || "Agent"}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            maskImage: "radial-gradient(circle, black 50%, transparent 100%)",
                            WebkitMaskImage: "radial-gradient(circle, black 50%, transparent 100%)",
                        }}
                    />
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes neuralCorePulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
                @keyframes neuralCoreRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.3; } 100% { transform: scale(1); opacity: 0.5; } }
            `}</style>
        </div>
    );
}
