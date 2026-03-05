"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface LogoState {
    glowAlpha: number;
    glowRadius: number;
    blueAlpha: number;
    letterScale: number;
    orbitAngle: number;
    pulseRadius: number;
    dotAlpha: number;
    ringRotation: number;
}

interface AnimatedLogoProps {
    size?: number;
}

export default function AnimatedLogo({ size = 32 }: AnimatedLogoProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // GSAP-driven animation state (synced with favicon style)
        const state: LogoState = {
            glowAlpha: 0.2,
            glowRadius: size * 0.44, // roughly 14 for size 32
            blueAlpha: 0.1,
            letterScale: 1,
            orbitAngle: 0,
            pulseRadius: 0,
            dotAlpha: 0.4,
            ringRotation: 0,
        };

        const tl = gsap.timeline({ repeat: -1, yoyo: false });
        tlRef.current = tl;

        // Same steps as favicon for visual consistency
        tl.to(state, {
            glowAlpha: 0.85,
            glowRadius: size * 0.5,
            letterScale: 1.08,
            dotAlpha: 1,
            duration: 1.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
        });

        tl.to(state, {
            glowAlpha: 1,
            glowRadius: size * 0.47,
            pulseRadius: size * 0.5,
            letterScale: 1.15,
            duration: 0.3,
            ease: "power2.out",
        });

        tl.to(state, {
            glowAlpha: 0.3,
            glowRadius: size * 0.44,
            pulseRadius: 0,
            letterScale: 1,
            dotAlpha: 0.4,
            duration: 0.8,
            ease: "power2.inOut",
        });

        tl.to(state, {
            blueAlpha: 0.4,
            duration: 1,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
        }, "-=1.5");

        gsap.to(state, {
            orbitAngle: Math.PI * 2,
            duration: 4,
            ease: "none",
            repeat: -1,
        });

        gsap.to(state, {
            ringRotation: Math.PI * 2,
            duration: 12,
            ease: "none",
            repeat: -1,
        });

        function render() {
            if (!ctx) return;
            const half = size / 2;
            ctx.clearRect(0, 0, size, size);

            // Background
            ctx.beginPath();
            ctx.arc(half, half, half - 1, 0, Math.PI * 2);
            ctx.fillStyle = "#0a0a0a";
            ctx.fill();

            // Pulse ring
            if (state.pulseRadius > 0.5) {
                ctx.beginPath();
                ctx.arc(half, half, state.pulseRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 255, 65, ${0.3 * (1 - state.pulseRadius / (size / 2))})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Glow ring
            ctx.save();
            ctx.translate(half, half);
            ctx.rotate(state.ringRotation);
            ctx.translate(-half, -half);

            ctx.beginPath();
            ctx.arc(half, half, state.glowRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 65, ${state.glowAlpha})`;
            ctx.lineWidth = 1 + state.glowAlpha;
            ctx.stroke();

            ctx.restore();

            // Inner Blue accent
            ctx.beginPath();
            ctx.arc(half, half, size * 0.34, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(59, 130, 246, ${state.blueAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Letter B
            ctx.save();
            ctx.translate(half, half + 1);
            ctx.scale(state.letterScale, state.letterScale);
            ctx.shadowColor = `rgba(0, 255, 65, ${state.glowAlpha * 0.9})`;
            ctx.shadowBlur = 2 + state.glowAlpha * 6;
            ctx.font = `bold ${size * 0.45}px -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = `rgba(0, 255, 65, ${0.85 + state.glowAlpha * 0.15})`;
            ctx.fillText("B", 0, 0);
            ctx.restore();

            // Orbiting dot
            const dotX = half + Math.cos(state.orbitAngle) * (size * 0.38);
            const dotY = half + Math.sin(state.orbitAngle) * (size * 0.38);
            ctx.beginPath();
            ctx.arc(dotX, dotY, size * 0.04, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 65, ${state.dotAlpha})`;
            ctx.fill();

            rafRef.current = requestAnimationFrame(render);
        }

        rafRef.current = requestAnimationFrame(render);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (tlRef.current) tlRef.current.kill();
            gsap.killTweensOf(state);
        };
    }, [size]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="logo-canvas"
        />
    );
}
