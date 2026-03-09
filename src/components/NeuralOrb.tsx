"use client";

// ═══════════════════════════════════════════════════════════════════════════
// BIODYNAMX NEURAL ORB — Web 4.0 Voice Visualizer
// ═══════════════════════════════════════════════════════════════════════════
// Multi-layer plasma sphere with:
//  • Real-time audio amplitude → plasma turbulence
//  • Agent-specific color palettes per brand identity
//  • Neural arc lightning that fires on high amplitude spikes
//  • Holographic HUD rings that expand during speech
//  • Particle field that orbits the sphere
//  • Chromatic aberration scanline overlay
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from "react";

interface NeuralOrbProps {
    agentName: string | null;
    amplitude: number;       // 0–1 real-time audio amplitude
    isActive: boolean;
    isSpeaking: boolean;      // agent is currently producing audio
}

// Per-agent color palette
const AGENT_PALETTES: Record<string, { core: string; mid: string; outer: string; particle: string }> = {
    Jenny: { core: "#00ff88", mid: "#00cc66", outer: "#004422", particle: "#00ff8866" },
    Mark: { core: "#3b82f6", mid: "#1d4ed8", outer: "#0a1a4a", particle: "#3b82f666" },
    Maya: { core: "#a78bfa", mid: "#7c3aed", outer: "#2e1065", particle: "#a78bfa66" },
    Alex: { core: "#34d399", mid: "#059669", outer: "#062b1c", particle: "#34d39966" },
    Orion: { core: "#f59e0b", mid: "#d97706", outer: "#451a03", particle: "#f59e0b66" },
    Chase: { core: "#ef4444", mid: "#b91c1c", outer: "#450a0a", particle: "#ef444466" },
    Isabel: { core: "#fbbf24", mid: "#f59e0b", outer: "#451a03", particle: "#fbbf2466" },
    Brock: { core: "#22d3ee", mid: "#0891b2", outer: "#082f49", particle: "#22d3ee66" },
    default: { core: "#00ff41", mid: "#00cc33", outer: "#001a08", particle: "#00ff4166" },
};

export default function NeuralOrb({ agentName, amplitude, isActive, isSpeaking }: NeuralOrbProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const stateRef = useRef({
        amplitude: 0,
        targetAmplitude: 0,
        time: 0,
        arcTimer: 0,
        arcs: [] as { x1: number; y1: number; x2: number; y2: number; life: number; maxLife: number }[],
        particles: [] as { angle: number; radius: number; speed: number; size: number; opacity: number; orbitTilt: number }[],
        rings: [] as { radius: number; opacity: number; speed: number }[],
    });

    const getPalette = useCallback(() => {
        const key = agentName || "default";
        return AGENT_PALETTES[key] || AGENT_PALETTES.default;
    }, [agentName]);

    // Smooth amplitude with lerp
    useEffect(() => {
        stateRef.current.targetAmplitude = amplitude;
    }, [amplitude]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) return;

        // Initialize particles
        const state = stateRef.current;
        state.particles = Array.from({ length: 80 }, () => ({
            angle: Math.random() * Math.PI * 2,
            radius: 140 + Math.random() * 40,
            speed: 0.002 + Math.random() * 0.006,
            size: 0.5 + Math.random() * 2,
            opacity: 0.3 + Math.random() * 0.7,
            orbitTilt: (Math.random() - 0.5) * 0.8,
        }));

        state.rings = [
            { radius: 130, opacity: 0.3, speed: 0.4 },
            { radius: 160, opacity: 0.15, speed: -0.3 },
            { radius: 190, opacity: 0.08, speed: 0.2 },
        ];

        function hexToRgb(hex: string) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return { r, g, b };
        }

        function drawPlasmaCore(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, pal: ReturnType<typeof getPalette>, amp: number, _t: number) {
            // Base sphere with plasma gradient
            const grad = ctx.createRadialGradient(
                cx - radius * 0.3, cy - radius * 0.3, radius * 0.05,
                cx, cy, radius
            );
            const core = hexToRgb(pal.core);
            const mid = hexToRgb(pal.mid);

            grad.addColorStop(0, `rgba(255,255,255,${0.85 + amp * 0.15})`);
            grad.addColorStop(0.15, `rgba(${core.r},${core.g},${core.b},${0.9 + amp * 0.1})`);
            grad.addColorStop(0.5, `rgba(${mid.r},${mid.g},${mid.b},${0.7 + amp * 0.15})`);
            grad.addColorStop(0.85, `rgba(${mid.r},${mid.g},${mid.b},0.3)`);
            grad.addColorStop(1, `rgba(0,0,0,0)`);

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        }

        function drawPlasmaLayer(ctx: CanvasRenderingContext2D, cx: number, cy: number, baseRadius: number, pal: ReturnType<typeof getPalette>, amp: number, t: number, layerOffset: number) {
            const pointCount = 64;
            const core = hexToRgb(pal.core);

            ctx.save();
            ctx.beginPath();

            for (let i = 0; i <= pointCount; i++) {
                const angle = (i / pointCount) * Math.PI * 2;

                // Multi-frequency plasma displacement
                const disp =
                    Math.sin(angle * 3 + t * 1.2 + layerOffset) * (8 + amp * 28) +
                    Math.sin(angle * 5 - t * 0.9 + layerOffset * 1.5) * (4 + amp * 14) +
                    Math.sin(angle * 7 + t * 1.8 + layerOffset * 0.7) * (2 + amp * 8) +
                    Math.cos(angle * 2 + t * 0.6) * (3 + amp * 10);

                const r = baseRadius + disp;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.closePath();
            const alpha = 0.12 - layerOffset * 0.02 + amp * 0.08;
            ctx.fillStyle = `rgba(${core.r},${core.g},${core.b},${Math.max(0, alpha)})`;
            ctx.fill();
            ctx.restore();
        }

        function drawHolographicRings(ctx: CanvasRenderingContext2D, cx: number, cy: number, pal: ReturnType<typeof getPalette>, amp: number, t: number) {
            const core = hexToRgb(pal.core);
            state.rings.forEach((ring, i) => {
                ring.radius += ring.speed * 0.3;
                if (ring.radius > 240) ring.radius = 120;

                ctx.save();
                ctx.beginPath();
                ctx.ellipse(cx, cy, ring.radius + amp * 20, (ring.radius + amp * 20) * 0.25, t * ring.speed * 0.5, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${core.r},${core.g},${core.b},${(ring.opacity + amp * 0.1) * (isActive ? 1 : 0.3)})`;
                ctx.lineWidth = 0.5 + amp * 1.5;
                ctx.stroke();

                // Ring glow
                ctx.shadowBlur = 8 + amp * 15;
                ctx.shadowColor = pal.core;
                ctx.stroke();
                ctx.restore();
            });
        }

        function drawParticles(ctx: CanvasRenderingContext2D, cx: number, cy: number, pal: ReturnType<typeof getPalette>, amp: number, t: number) {
            const core = hexToRgb(pal.core);

            state.particles.forEach(p => {
                p.angle += p.speed * (1 + amp * 3);

                const tiltedY = Math.sin(p.angle) * Math.cos(p.orbitTilt);
                const tiltedX = Math.cos(p.angle);
                const depth = Math.sin(p.angle) * Math.sin(p.orbitTilt);
                const scale = 0.5 + 0.5 * (depth + 1);

                const px = cx + tiltedX * (p.radius + amp * 25);
                const py = cy + tiltedY * (p.radius + amp * 25) * 0.4;

                const alpha = p.opacity * scale * (isActive ? 1 : 0.3) * (0.5 + amp * 0.5);

                ctx.save();
                ctx.beginPath();
                ctx.arc(px, py, p.size * scale * (1 + amp), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${core.r},${core.g},${core.b},${alpha})`;
                ctx.shadowBlur = 4 + amp * 8;
                ctx.shadowColor = pal.core;
                ctx.fill();
                ctx.restore();
            });
        }

        function drawNeuralArcs(ctx: CanvasRenderingContext2D, cx: number, cy: number, pal: ReturnType<typeof getPalette>, amp: number) {
            state.arcTimer += amp * 0.3;

            // Spawn new arcs on high amplitude
            if (amp > 0.5 && Math.random() < amp * 0.4 && state.arcs.length < 6) {
                const a1 = Math.random() * Math.PI * 2;
                const a2 = a1 + (Math.random() - 0.5) * Math.PI;
                const r = 90;
                state.arcs.push({
                    x1: cx + Math.cos(a1) * r,
                    y1: cy + Math.sin(a1) * r,
                    x2: cx + Math.cos(a2) * r,
                    y2: cy + Math.sin(a2) * r,
                    life: 0,
                    maxLife: 8 + Math.random() * 10,
                });
            }

            const core = hexToRgb(pal.core);

            state.arcs = state.arcs.filter(arc => {
                arc.life++;
                if (arc.life > arc.maxLife) return false;

                const progress = arc.life / arc.maxLife;
                const alpha = Math.sin(progress * Math.PI) * 0.9;

                // Jagged lightning path
                const segments = 6;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(arc.x1, arc.y1);

                for (let s = 1; s < segments; s++) {
                    const t = s / segments;
                    const mx = arc.x1 + (arc.x2 - arc.x1) * t + (Math.random() - 0.5) * 20;
                    const my = arc.y1 + (arc.y2 - arc.y1) * t + (Math.random() - 0.5) * 20;
                    ctx.lineTo(mx, my);
                }

                ctx.lineTo(arc.x2, arc.y2);
                ctx.strokeStyle = `rgba(${core.r},${core.g},${core.b},${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.shadowBlur = 12;
                ctx.shadowColor = pal.core;
                ctx.stroke();
                ctx.restore();

                return true;
            });
        }

        function drawOuterGlow(ctx: CanvasRenderingContext2D, cx: number, cy: number, pal: ReturnType<typeof getPalette>, amp: number) {
            const glowRadius = 160 + amp * 60;
            const core = hexToRgb(pal.core);

            const grad = ctx.createRadialGradient(cx, cy, 80, cx, cy, glowRadius);
            grad.addColorStop(0, `rgba(${core.r},${core.g},${core.b},${0.08 + amp * 0.12})`);
            grad.addColorStop(0.5, `rgba(${core.r},${core.g},${core.b},${0.04 + amp * 0.06})`);
            grad.addColorStop(1, `rgba(0,0,0,0)`);

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        }

        function drawScanlines(ctx: CanvasRenderingContext2D, width: number, height: number, amp: number) {
            if (!isSpeaking) return;
            ctx.save();
            ctx.globalAlpha = 0.015 + amp * 0.02;
            for (let y = 0; y < height; y += 3) {
                ctx.fillStyle = "rgba(0,0,0,0.5)";
                ctx.fillRect(0, y, width, 1);
            }
            ctx.restore();
        }

        function drawAgentLabel(ctx: CanvasRenderingContext2D, cx: number, cy: number, name: string | null, pal: ReturnType<typeof getPalette>, amp: number) {
            if (!name) return;
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Agent name — large, glowing
            ctx.font = `600 ${18 + amp * 4}px 'Inter', sans-serif`;
            ctx.shadowBlur = 20 + amp * 30;
            ctx.shadowColor = pal.core;
            ctx.fillStyle = `rgba(255,255,255,${0.92 + amp * 0.08})`;
            ctx.fillText(name.toUpperCase(), cx, cy - 4);

            // "LIVE" badge below
            ctx.font = "700 9px 'Inter', sans-serif";
            ctx.letterSpacing = "4px";
            ctx.shadowBlur = 8;
            const core = hexToRgb(pal.core);
            ctx.fillStyle = `rgba(${core.r},${core.g},${core.b},${0.8 + amp * 0.2})`;
            ctx.fillText("● LIVE", cx, cy + 18);
            ctx.restore();
        }

        function draw() {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const W = canvas.width;
            const H = canvas.height;
            const cx = W / 2;
            const cy = H / 2;

            // Smooth amplitude
            const s = stateRef.current;
            s.amplitude += (s.targetAmplitude - s.amplitude) * 0.12;
            const amp = isActive ? s.amplitude : s.amplitude * 0.15;
            s.time += 0.016;
            const t = s.time;

            ctx.clearRect(0, 0, W, H);

            const pal = getPalette();
            const baseRadius = 90 + amp * 20;

            // Outermost glow
            drawOuterGlow(ctx, cx, cy, pal, amp);

            // Holographic orbit rings
            drawHolographicRings(ctx, cx, cy, pal, amp, t);

            // Orbiting particle field
            drawParticles(ctx, cx, cy, pal, amp, t);

            // Plasma displacement layers (outer → inner)
            for (let i = 4; i >= 0; i--) {
                drawPlasmaLayer(ctx, cx, cy, baseRadius + i * 8, pal, amp, t, i);
            }

            // Core sphere
            drawPlasmaCore(ctx, cx, cy, baseRadius, pal, amp, t);

            // Neural arc lightning
            drawNeuralArcs(ctx, cx, cy, pal, amp);

            // Specular highlight
            const spec = ctx.createRadialGradient(
                cx - baseRadius * 0.35, cy - baseRadius * 0.35, 2,
                cx - baseRadius * 0.2, cy - baseRadius * 0.2, baseRadius * 0.6
            );
            spec.addColorStop(0, `rgba(255,255,255,${0.5 + amp * 0.3})`);
            spec.addColorStop(0.3, `rgba(255,255,255,${0.1 + amp * 0.1})`);
            spec.addColorStop(1, "rgba(255,255,255,0)");
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = spec;
            ctx.fill();
            ctx.restore();

            // Agent label
            drawAgentLabel(ctx, cx, cy, agentName, pal, amp);

            // Scanline overlay for speaking
            drawScanlines(ctx, W, H, amp);

            animRef.current = requestAnimationFrame(draw);
        }

        // Set canvas size
        canvas.width = 400;
        canvas.height = 400;

        // Kick off
        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [agentName, isActive, isSpeaking, getPalette]);

    const pal = AGENT_PALETTES[agentName || "default"] || AGENT_PALETTES.default;

    return (
        <div
            style={{
                position: "relative",
                width: 280,
                height: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                filter: `drop-shadow(0 0 ${40 + amplitude * 60}px ${pal.core}66)`,
                transition: "filter 0.15s ease",
            }}
        >
            {/* Ambient background pulse */}
            <div
                style={{
                    position: "absolute",
                    inset: -40,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${pal.core}08 0%, transparent 70%)`,
                    animation: "neuralPulse 3s ease-in-out infinite",
                }}
            />

            {/* Main canvas */}
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                }}
            />
        </div>
    );
}
