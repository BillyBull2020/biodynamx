"use client";

// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — IMMERSIVE 3D ORBITING ECOSYSTEM v2
// Performance-optimized: pauses when off-screen, no per-frame
// filter recalcs, reduced particle count, compositor-friendly.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./OrbitEcosystem.css";

const SERVICES = [
    { image: "/agents/meghan.png", label: "MEGHAN: AI Receptionist", color: "#a78bfa" },
    { image: "/agents/jenny.png", label: "JENNY: Brain Discovery", color: "#00ff41" },
    { image: "/agents/mark.png", label: "MARK: Revenue Closer", color: "#3b82f6" },
    { image: "/agents/oryan.png", label: "O'RYAN: Ops & Workflow", color: "#f59e0b" },
    { image: "/agents/alex.png", label: "ALEX: Support Lead", color: "#10b981" },
    { image: "/agents/hunter.png", label: "HUNTER: Prospecting", color: "#ef4444" },
    { image: "/agents/nova.png", label: "NOVA: Content & Social", color: "#f97316" },
    { image: "/agents/ledger.png", label: "LEDGER: ROI Manager", color: "#06b6d4" },
];

// Reduced from 48 → 20 particles for scroll performance
const STARS = Array.from({ length: 20 }, (_, i) => ({
    angle: (360 / 20) * i,
    radius: 140 + (i % 4) * 55,
    size: 1.5 + (i % 3) * 0.8,
    delay: (i * 0.4) % 5,
    dur: 16 + (i % 6) * 3,
    opacity: 0.15 + (i % 4) * 0.15,
}));

export default function OrbitEcosystem() {
    const containerRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const tiltRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    const angleRef = useRef(0);
    const [isVisible, setIsVisible] = useState(false);
    const rafRef = useRef<number>(0);
    const radiusRef = useRef(240);
    const isInViewRef = useRef(false);

    // Responsive orbit radius
    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w <= 360) radiusRef.current = 105;
            else if (w <= 480) radiusRef.current = 130;
            else if (w <= 768) radiusRef.current = 165;
            else radiusRef.current = 240;
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // Animation loop — ONLY runs when section is in viewport
    useEffect(() => {
        let running = true;

        function tick() {
            if (!running) return;

            // Skip work when off-screen (biggest perf win)
            if (!isInViewRef.current) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            const t = tiltRef.current;
            t.x += (t.targetX - t.x) * 0.05;
            t.y += (t.targetY - t.y) * 0.05;

            angleRef.current += 0.008;

            const container = containerRef.current;
            if (container) {
                container.style.setProperty("--tilt-x", `${8 + t.x}deg`);
                container.style.setProperty("--tilt-y", `${t.y}deg`);
            }

            const R = radiusRef.current;
            const count = SERVICES.length;

            for (let i = 0; i < count; i++) {
                const el = nodeRefs.current[i];
                if (!el) continue;

                const a = angleRef.current + (i / count) * Math.PI * 2;
                const x = Math.cos(a) * R;
                const z = Math.sin(a);
                const yFactor = 0.4;
                const y = Math.sin(a) * R * yFactor;

                const depthScale = 0.7 + (z + 1) * 0.25;
                const depthOpacity = 0.4 + (z + 1) * 0.3;
                const depthZ = Math.round(z * 50);

                // Only transform + opacity (compositor-friendly, no filter)
                el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${depthScale})`;
                el.style.opacity = `${depthOpacity}`;
                el.style.zIndex = `${depthZ + 50}`;
            }

            rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);
        return () => { running = false; cancelAnimationFrame(rafRef.current); };
    }, []);

    // Mouse tracking — only when container is hovered (not global)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            tiltRef.current.targetX = -((e.clientY - cy) / rect.height) * 10;
            tiltRef.current.targetY = ((e.clientX - cx) / rect.width) * 10;
        };

        const handleLeave = () => {
            tiltRef.current.targetX = 0;
            tiltRef.current.targetY = 0;
        };

        // Scoped to container instead of window — no work during scroll
        container.addEventListener("mousemove", handleMove);
        container.addEventListener("mouseleave", handleLeave);
        return () => {
            container.removeEventListener("mousemove", handleMove);
            container.removeEventListener("mouseleave", handleLeave);
        };
    }, []);

    // Intersection observer — controls visibility AND animation pause
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                isInViewRef.current = entry.isIntersecting;
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.1 }
        );
        obs.observe(container);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className={`orbit3d-viewport ${isVisible ? "visible" : ""}`}
        >
            {/* Ambient glow */}
            <div className="orbit3d-ambient" />

            {/* 3D Scene wrapper with perspective tilt */}
            <div className="orbit3d-scene">

                {/* Orbital track ellipses */}
                <div className="orbit3d-track orbit3d-track-1" />
                <div className="orbit3d-track orbit3d-track-2" />
                <div className="orbit3d-track orbit3d-track-3" />

                {/* Central Plasma Core */}
                <div className="orbit3d-core">
                    <div className="core3d-plasma" />
                    <div className="core3d-plasma core3d-plasma-2" />
                    <div className="core3d-plasma core3d-plasma-3" />
                    <div className="core3d-shell" />
                    <div className="core3d-energy-ring core3d-ring-a" />
                    <div className="core3d-energy-ring core3d-ring-b" />
                    <div className="core3d-energy-ring core3d-ring-c" />
                    <div className="core3d-face">
                        <span className="core3d-icon">⚡</span>
                        <span className="core3d-title">BioDynamX</span>
                        <span className="core3d-subtitle">AI Platform</span>
                    </div>
                </div>

                {/* Orbiting Service Nodes (positioned by JS) */}
                {SERVICES.map((svc, i) => (
                    <div
                        key={svc.label}
                        ref={el => { nodeRefs.current[i] = el; }}
                        className="orbit3d-node"
                        style={{
                            "--node-color": svc.color,
                        } as React.CSSProperties}
                    >
                        <div className="node3d-icon" style={{ overflow: 'hidden', position: 'relative' }}>
                            <Image
                                src={svc.image}
                                alt={svc.label}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <span className="node3d-label">{svc.label}</span>
                    </div>
                ))}

                {/* Stardust particles (reduced count) */}
                {STARS.map((star, i) => (
                    <div
                        key={`star-${i}`}
                        className="orbit3d-star"
                        style={{
                            "--star-angle": `${star.angle}deg`,
                            "--star-radius": `${star.radius}px`,
                            "--star-size": `${star.size}px`,
                            "--star-delay": `${star.delay}s`,
                            "--star-dur": `${star.dur}s`,
                            "--star-opacity": `${star.opacity}`,
                        } as React.CSSProperties}
                    />
                ))}
            </div>
        </div>
    );
}
