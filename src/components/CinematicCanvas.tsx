"use client";

// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — CINEMATIC HERO CANVAS v3
// Full-screen interactive neural network with DNA helix & HUD overlay
// Makes GoHighLevel resellers look like they're using PowerPoint
// ═══════════════════════════════════════════════════════════════════

import { useRef, useEffect, useCallback, useState } from "react";

interface Particle {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    size: number;
    opacity: number;
    hue: number;
    life: number;
    maxLife: number;
    type: "node" | "helix" | "data";
    helixAngle?: number;
    helixSpeed?: number;
}

interface CinematicCanvasProps {
    isActive: boolean;
    intensity?: number;
}

export default function CinematicCanvas({
    isActive,
    intensity = 0,
}: CinematicCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const intensityRef = useRef(intensity);
    const startTimeRef = useRef(Date.now());
    const isMobileRef = useRef(false);

    // SSR-safe mobile detection — start false (matches server), set real value after mount
    const [isMobileView, setIsMobileView] = useState(false);
    useEffect(() => {
        setIsMobileView(window.innerWidth < 768);
        const onResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener("resize", onResize, { passive: true });
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        intensityRef.current = intensity;
    }, [intensity]);

    const initParticles = useCallback((w: number, h: number) => {
        const isMobile = w < 768;
        isMobileRef.current = isMobile;

        // Dramatically more particles on desktop, lean on mobile
        const nodeCount = isMobile ? 35 : Math.min(120, Math.floor((w * h) / 8000));
        const helixCount = isMobile ? 20 : 50;
        const dataCount = isMobile ? 8 : 25;
        const particles: Particle[] = [];

        // Neural network nodes — spread across the entire viewport
        for (let i = 0; i < nodeCount; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                z: Math.random() * 800,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                vz: (Math.random() - 0.5) * 0.6,
                size: Math.random() * 3 + 1.5,
                opacity: Math.random() * 0.6 + 0.3,
                hue: 120 + Math.random() * 40,
                life: Math.random() * 1000,
                maxLife: 600 + Math.random() * 800,
                type: "node",
            });
        }

        // DNA helix particles — vertical spiral in center
        for (let i = 0; i < helixCount; i++) {
            const angle = (i / helixCount) * Math.PI * 6;
            particles.push({
                x: w * 0.5 + Math.cos(angle) * (isMobile ? 60 : 120),
                y: (i / helixCount) * h,
                z: 200 + Math.sin(angle) * 200,
                vx: 0,
                vy: -0.15,
                vz: 0,
                size: 2.5,
                opacity: 0.7,
                hue: 130 + Math.sin(angle) * 30,
                life: i * 20,
                maxLife: 800,
                type: "helix",
                helixAngle: angle,
                helixSpeed: 0.008 + Math.random() * 0.004,
            });
        }

        // Data stream particles — fast-moving horizontal streaks
        for (let i = 0; i < dataCount; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                z: Math.random() * 400,
                vx: 1.5 + Math.random() * 3,
                vy: (Math.random() - 0.5) * 0.3,
                vz: 0,
                size: 1,
                opacity: 0.5 + Math.random() * 0.3,
                hue: 160 + Math.random() * 60,
                life: Math.random() * 500,
                maxLife: 300 + Math.random() * 400,
                type: "data",
            });
        }

        particlesRef.current = particles;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let w = 0;
        let h = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            initParticles(w, h);
        };

        resize();
        window.addEventListener("resize", resize);

        // Mouse + touch support
        const handleMouse = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX / w, y: e.clientY / h };
        };
        const handleTouch = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseRef.current = {
                    x: e.touches[0].clientX / w,
                    y: e.touches[0].clientY / h,
                };
            }
        };
        window.addEventListener("mousemove", handleMouse, { passive: true });
        window.addEventListener("touchmove", handleTouch, { passive: true });

        function tick() {
            if (!ctx) return;
            ctx.clearRect(0, 0, w, h);

            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const particles = particlesRef.current;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const boost = intensityRef.current;
            const isMobile = isMobileRef.current;

            // ── LAYERED GRADIENT BACKGROUNDS ────────────────────
            // Deep center glow that follows mouse
            const g1 = ctx.createRadialGradient(
                w * mx, h * my, 0,
                w * 0.5, h * 0.5, w * 0.9
            );
            g1.addColorStop(0, `rgba(0, 255, 65, ${0.04 + boost * 0.06})`);
            g1.addColorStop(0.3, `rgba(0, 200, 50, ${0.015 + boost * 0.02})`);
            g1.addColorStop(0.7, "rgba(0, 40, 15, 0.005)");
            g1.addColorStop(1, "transparent");
            ctx.fillStyle = g1;
            ctx.fillRect(0, 0, w, h);

            // Secondary blue accent glow
            const g2 = ctx.createRadialGradient(
                w * 0.8, h * 0.3, 0,
                w * 0.8, h * 0.3, w * 0.4
            );
            g2.addColorStop(0, `rgba(59, 130, 246, ${0.015 + boost * 0.01})`);
            g2.addColorStop(1, "transparent");
            ctx.fillStyle = g2;
            ctx.fillRect(0, 0, w, h);

            // ── SCAN LINE EFFECT (HUD) ──────────────────────────
            if (!isMobile) {
                const scanY = (elapsed * 40) % (h + 60) - 30;
                const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
                scanGrad.addColorStop(0, "transparent");
                scanGrad.addColorStop(0.5, `rgba(0, 255, 65, ${0.03 + boost * 0.04})`);
                scanGrad.addColorStop(1, "transparent");
                ctx.fillStyle = scanGrad;
                ctx.fillRect(0, scanY - 30, w, 60);
            }

            // ── GRID OVERLAY (subtle, futuristic) ────────────────
            if (!isMobile) {
                ctx.strokeStyle = `rgba(0, 255, 65, ${0.012 + boost * 0.008})`;
                ctx.lineWidth = 0.5;
                const gridSize = 80;
                for (let gx = 0; gx < w; gx += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(gx, 0);
                    ctx.lineTo(gx, h);
                    ctx.stroke();
                }
                for (let gy = 0; gy < h; gy += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, gy);
                    ctx.lineTo(w, gy);
                    ctx.stroke();
                }
            }

            // ── UPDATE & DRAW PARTICLES ──────────────────────────
            const connectionDist = isMobile ? 100 : (150 + boost * 60);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                if (p.type === "node") {
                    // Drift toward mouse with more gravity
                    const dx = mx * w - p.x;
                    const dy = my * h - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const pull = 0.015 + boost * 0.02;

                    p.vx += (dx / (dist + 300)) * pull;
                    p.vy += (dy / (dist + 300)) * pull;

                    // Organic orbital motion
                    p.vx += Math.sin(elapsed * 0.4 + i * 0.13) * 0.008;
                    p.vy += Math.cos(elapsed * 0.3 + i * 0.17) * 0.008;

                    p.vx *= 0.993;
                    p.vy *= 0.993;
                    p.vz *= 0.99;

                    p.x += p.vx;
                    p.y += p.vy;
                    p.z += p.vz;

                    // Wrap
                    if (p.x < -40) p.x = w + 40;
                    if (p.x > w + 40) p.x = -40;
                    if (p.y < -40) p.y = h + 40;
                    if (p.y > h + 40) p.y = -40;
                    if (p.z < 0) p.z = 800;
                    if (p.z > 800) p.z = 0;

                } else if (p.type === "helix") {
                    // DNA helix rotation
                    p.helixAngle! += p.helixSpeed!;
                    const radius = isMobile ? 60 : 120;
                    p.x = w * 0.5 + Math.cos(p.helixAngle!) * radius * (1 + boost * 0.5);
                    p.z = 200 + Math.sin(p.helixAngle!) * 200;
                    p.y += p.vy;
                    if (p.y < -20) p.y = h + 20;

                } else if (p.type === "data") {
                    // Fast data streams
                    p.x += p.vx * (1 + boost * 2);
                    p.y += p.vy;
                    if (p.x > w + 20) {
                        p.x = -20;
                        p.y = Math.random() * h;
                    }
                }

                // ── RENDER ──────────────────────────────────────
                const depthScale = 1 - p.z / 1000;
                const renderSize = p.size * depthScale * (1 + boost * 1.5);
                p.life += 1;
                const lifePulse = Math.sin((p.life / p.maxLife) * Math.PI) * 0.5 + 0.5;
                const renderOpacity = p.opacity * depthScale * lifePulse;

                if (p.type === "data") {
                    // Data streams — draw as streaks
                    const streakLen = 15 + boost * 25;
                    const grad = ctx.createLinearGradient(
                        p.x - streakLen, p.y, p.x, p.y
                    );
                    grad.addColorStop(0, "transparent");
                    grad.addColorStop(1, `hsla(${p.hue}, 80%, 60%, ${renderOpacity * 0.6})`);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x - streakLen, p.y);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();

                    // Bright tip
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${renderOpacity})`;
                    ctx.fill();
                } else {
                    // Nodes & helix — draw with glow
                    const glowSize = renderSize * (p.type === "helix" ? 5 : (4 + boost * 4));
                    const glow = ctx.createRadialGradient(
                        p.x, p.y, 0,
                        p.x, p.y, glowSize
                    );
                    glow.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${renderOpacity * 0.9})`);
                    glow.addColorStop(0.3, `hsla(${p.hue}, 100%, 55%, ${renderOpacity * 0.3})`);
                    glow.addColorStop(1, "transparent");
                    ctx.fillStyle = glow;
                    ctx.fillRect(
                        p.x - glowSize, p.y - glowSize,
                        glowSize * 2, glowSize * 2
                    );

                    // Core dot
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, renderSize, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${renderOpacity * 1.2})`;
                    ctx.fill();
                }
            }

            // ── NEURAL CONNECTIONS ──────────────────────────────
            const nodes = particles.filter(p => p.type === "node");
            const helixP = particles.filter(p => p.type === "helix");
            const maxConnChecks = isMobile ? 30 : nodes.length;

            for (let i = 0; i < maxConnChecks; i++) {
                for (let j = i + 1; j < maxConnChecks; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    if (!a || !b) continue;
                    const ddx = a.x - b.x;
                    const ddy = a.y - b.y;
                    const d = Math.sqrt(ddx * ddx + ddy * ddy);

                    if (d < connectionDist) {
                        const alpha = (1 - d / connectionDist) * 0.2 * (1 + boost * 2);
                        const depthAvg = 1 - (a.z + b.z) / 1600;

                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(0, 255, 65, ${alpha * depthAvg})`;
                        ctx.lineWidth = 0.6 + boost * 0.8;
                        ctx.stroke();
                    }
                }
            }

            // ── DNA HELIX CONNECTIONS (cross-links) ──────────────
            for (let i = 0; i < helixP.length - 2; i += 2) {
                const a = helixP[i];
                const b = helixP[i + 1];
                if (a && b) {
                    const alpha = 0.08 + boost * 0.1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(0, 255, 65, ${alpha})`;
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
            }

            // ── ENERGY PULSE WAVES ──────────────────────────────
            const waveCount = Math.ceil(2 + boost * 3);
            for (let wi = 0; wi < waveCount; wi++) {
                const waveT = ((elapsed * 0.3 + wi * 0.25) % 1);
                const waveR = waveT * Math.max(w, h) * 0.6;
                const waveAlpha = (1 - waveT) * (0.025 + boost * 0.04);

                ctx.beginPath();
                ctx.arc(w * 0.5, h * 0.45, waveR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 255, 65, ${waveAlpha})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // ── HUD CORNER BRACKETS (desktop) ────────────────────
            if (!isMobile) {
                const bracketSize = 40;
                const bracketPad = 60;
                ctx.strokeStyle = `rgba(0, 255, 65, ${0.08 + boost * 0.06})`;
                ctx.lineWidth = 1.5;

                // Top-left
                ctx.beginPath();
                ctx.moveTo(bracketPad, bracketPad + bracketSize);
                ctx.lineTo(bracketPad, bracketPad);
                ctx.lineTo(bracketPad + bracketSize, bracketPad);
                ctx.stroke();

                // Top-right
                ctx.beginPath();
                ctx.moveTo(w - bracketPad - bracketSize, bracketPad);
                ctx.lineTo(w - bracketPad, bracketPad);
                ctx.lineTo(w - bracketPad, bracketPad + bracketSize);
                ctx.stroke();

                // Bottom-left
                ctx.beginPath();
                ctx.moveTo(bracketPad, h - bracketPad - bracketSize);
                ctx.lineTo(bracketPad, h - bracketPad);
                ctx.lineTo(bracketPad + bracketSize, h - bracketPad);
                ctx.stroke();

                // Bottom-right
                ctx.beginPath();
                ctx.moveTo(w - bracketPad - bracketSize, h - bracketPad);
                ctx.lineTo(w - bracketPad, h - bracketPad);
                ctx.lineTo(w - bracketPad, h - bracketPad - bracketSize);
                ctx.stroke();

                // Cross-hair at center
                const chSize = 12;
                const cx2 = w * 0.5;
                const cy2 = h * 0.45;
                ctx.strokeStyle = `rgba(0, 255, 65, ${0.06 + boost * 0.05 + Math.sin(elapsed * 2) * 0.02})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx2 - chSize, cy2);
                ctx.lineTo(cx2 + chSize, cy2);
                ctx.moveTo(cx2, cy2 - chSize);
                ctx.lineTo(cx2, cy2 + chSize);
                ctx.stroke();

                // Rotating target ring
                ctx.save();
                ctx.translate(cx2, cy2);
                ctx.rotate(elapsed * 0.3);
                ctx.beginPath();
                ctx.arc(0, 0, 35, 0, Math.PI * 0.5);
                ctx.strokeStyle = `rgba(0, 255, 65, ${0.06 + boost * 0.04})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, 35, Math.PI, Math.PI * 1.5);
                ctx.stroke();
                ctx.restore();

                // HUD text elements
                ctx.font = "10px 'Inter', monospace";
                ctx.fillStyle = `rgba(0, 255, 65, ${0.12 + boost * 0.08})`;
                ctx.textAlign = "left";
                ctx.fillText(`SYS.NEURAL v3.2.1`, bracketPad + 4, bracketPad + bracketSize + 16);
                ctx.fillText(`NODES: ${nodes.length}`, bracketPad + 4, bracketPad + bracketSize + 30);
                ctx.textAlign = "right";
                ctx.fillText(`LATENCY: ${(8 + Math.sin(elapsed) * 3).toFixed(1)}ms`, w - bracketPad - 4, bracketPad + bracketSize + 16);
                ctx.fillText(`STATUS: ${isActive ? "PROCESSING" : "STANDBY"}`, w - bracketPad - 4, bracketPad + bracketSize + 30);
            }

            animRef.current = requestAnimationFrame(tick);
        }

        tick();

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouse);
            window.removeEventListener("touchmove", handleTouch);
        };
    }, [initParticles, isActive]);

    return (
        <>
            {/* Cinematic background image layer */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    backgroundImage: "url(/cinematic-bg.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: isActive ? 0.25 : 0.12,
                    transition: "opacity 1.5s ease",
                    filter: "blur(1px)",
                    willChange: "opacity",
                }}
            />
            {/* Dark overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    background: `radial-gradient(ellipse at 50% 40%, rgba(0,255,65,${isActive ? 0.03 : 0.01}) 0%, rgba(5,5,5,0.25) 70%)`,
                    transition: "all 1s ease",
                }}
            />
            {/* Particle canvas — much dimmer on mobile so text stays readable */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    pointerEvents: "none",
                    opacity: isMobileView
                        ? (isActive ? 0.35 : 0.2)
                        : (isActive ? 1 : 0.7),
                    transition: "opacity 1s ease",
                    willChange: "transform",
                    contain: "strict",
                }}
            />
        </>
    );
}
