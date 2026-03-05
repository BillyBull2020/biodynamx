"use client";

// ============================================================================
// Animated Favicon — BioDynamX (GSAP-Powered)
// ============================================================================
// Uses GSAP for buttery-smooth favicon animation with timeline sequencing.
// Renders to an off-screen canvas and updates the favicon link element.
// GSAP handles the easing and timing, Canvas handles the rendering.
// ============================================================================

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface FaviconState {
    glowAlpha: number;
    glowRadius: number;
    blueAlpha: number;
    letterScale: number;
    orbitAngle: number;
    pulseRadius: number;
    dotAlpha: number;
    ringRotation: number;
}

export default function AnimatedFavicon() {
    const rafRef = useRef<number>(0);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Find or create favicon link
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            link.type = "image/png";
            document.head.appendChild(link);
        }

        // ── GSAP-driven animation state ──
        const state: FaviconState = {
            glowAlpha: 0.2,
            glowRadius: 28,
            blueAlpha: 0.1,
            letterScale: 1,
            orbitAngle: 0,
            pulseRadius: 0,
            dotAlpha: 0.4,
            ringRotation: 0,
        };

        // ── GSAP Master Timeline ──
        const tl = gsap.timeline({ repeat: -1, yoyo: false });
        tlRef.current = tl;

        // Phase 1: Breathing pulse (green glow ring breathes in and out)
        tl.to(state, {
            glowAlpha: 0.85,
            glowRadius: 32,
            letterScale: 1.08,
            dotAlpha: 1,
            duration: 1.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
        });

        // Phase 2: Quick energy burst
        tl.to(state, {
            glowAlpha: 1,
            glowRadius: 30,
            pulseRadius: 32,
            letterScale: 1.15,
            duration: 0.3,
            ease: "power2.out",
        });

        // Phase 3: Settle back
        tl.to(state, {
            glowAlpha: 0.3,
            glowRadius: 28,
            pulseRadius: 0,
            letterScale: 1,
            dotAlpha: 0.4,
            duration: 0.8,
            ease: "power2.inOut",
        });

        // Phase 4: Blue ring subtle pulse
        tl.to(state, {
            blueAlpha: 0.4,
            duration: 1,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
        }, "-=1.5");

        // Continuous orbit animation (runs independently)
        gsap.to(state, {
            orbitAngle: Math.PI * 2,
            duration: 4,
            ease: "none",
            repeat: -1,
        });

        // Continuous ring rotation
        gsap.to(state, {
            ringRotation: Math.PI * 2,
            duration: 12,
            ease: "none",
            repeat: -1,
        });

        // ── Render Loop ──
        const FPS = 24;
        const INTERVAL = 1000 / FPS;
        let lastTime = 0;

        function render(timestamp: number) {
            if (!ctx || !link) return;

            if (timestamp - lastTime < INTERVAL) {
                rafRef.current = requestAnimationFrame(render);
                return;
            }
            lastTime = timestamp;

            const size = 64;
            const half = size / 2;

            ctx.clearRect(0, 0, size, size);

            // ── Background: Dark circle ──
            ctx.beginPath();
            ctx.arc(half, half, half, 0, Math.PI * 2);
            ctx.fillStyle = "#0a0a0a";
            ctx.fill();

            // ── Pulse ring (energy burst) ──
            if (state.pulseRadius > 0.5) {
                ctx.beginPath();
                ctx.arc(half, half, state.pulseRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 255, 65, ${0.3 * (1 - state.pulseRadius / 32)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // ── Animated glow ring (GSAP-controlled) ──
            ctx.save();
            ctx.translate(half, half);
            ctx.rotate(state.ringRotation);
            ctx.translate(-half, -half);

            ctx.beginPath();
            ctx.arc(half, half, state.glowRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 65, ${state.glowAlpha})`;
            ctx.lineWidth = 2 + state.glowAlpha * 1.5;
            ctx.stroke();

            // ── Dashed accent ring ──
            ctx.setLineDash([4, 8]);
            ctx.beginPath();
            ctx.arc(half, half, state.glowRadius - 4, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 65, ${state.glowAlpha * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.restore();

            // ── Inner ring (blue accent, GSAP-controlled) ──
            ctx.beginPath();
            ctx.arc(half, half, 22, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(59, 130, 246, ${state.blueAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // ── "B" letter (GSAP scales it) ──
            ctx.save();
            ctx.translate(half, half + 1);
            ctx.scale(state.letterScale, state.letterScale);

            // Glow shadow
            ctx.shadowColor = `rgba(0, 255, 65, ${state.glowAlpha * 0.9})`;
            ctx.shadowBlur = 4 + state.glowAlpha * 10;
            ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = `rgba(0, 255, 65, ${0.85 + state.glowAlpha * 0.15})`;
            ctx.fillText("B", 0, 0);

            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.restore();

            // ── Orbiting dot (GSAP-driven angle) ──
            const dotX = half + Math.cos(state.orbitAngle) * 24;
            const dotY = half + Math.sin(state.orbitAngle) * 24;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 65, ${state.dotAlpha})`;
            ctx.fill();

            // ── Second orbiting dot (opposite, blue) ──
            const dot2X = half + Math.cos(state.orbitAngle + Math.PI) * 20;
            const dot2Y = half + Math.sin(state.orbitAngle + Math.PI) * 20;
            ctx.beginPath();
            ctx.arc(dot2X, dot2Y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${state.dotAlpha * 0.6})`;
            ctx.fill();

            // ── Update favicon ──
            link!.href = canvas.toDataURL("image/png");

            rafRef.current = requestAnimationFrame(render);
        }

        // Start after brief delay to not block first paint
        const timeout = setTimeout(() => {
            rafRef.current = requestAnimationFrame(render);
        }, 1500);

        return () => {
            clearTimeout(timeout);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (tlRef.current) tlRef.current.kill();
            gsap.killTweensOf(state);
        };
    }, []);

    return null;
}
