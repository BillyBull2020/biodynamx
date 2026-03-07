"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface GlitchOverlayProps {
    isActive: boolean;
    intensity?: number;
}

export default function GlitchOverlay({ isActive, intensity = 1 }: GlitchOverlayProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const scanline = container.querySelector(".scanline");
        const glitchBox = container.querySelector(".glitch-box");

        const tl = gsap.timeline({ repeat: -1 });

        // Rapid scanline movement
        tl.to(scanline, {
            top: "100%",
            duration: 0.1,
            ease: "none",
            repeat: 20,
        });

        // Occasional glitch bursts
        const glitchInterval = setInterval(() => {
            if (Math.random() > 0.8) {
                gsap.to(glitchBox, {
                    opacity: 0.2 * intensity,
                    x: (Math.random() - 0.5) * 50,
                    skewX: (Math.random() - 0.5) * 20,
                    duration: 0.05,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        gsap.set(glitchBox, { opacity: 0, x: 0, skewX: 0 });
                    }
                });
            }
        }, 200);

        return () => {
            clearInterval(glitchInterval);
            tl.kill();
        };
    }, [isActive, intensity]);

    if (!isActive) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
            style={{ mixBlendMode: 'overlay' }}
        >
            {/* Rapid Horizontal Scanline */}
            <div className="scanline absolute w-full h-[2px] bg-white/10 top-0 left-0" />

            {/* Transient Glitch Box */}
            <div className="glitch-box absolute inset-0 bg-white/5 opacity-0" />

            {/* Static Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
