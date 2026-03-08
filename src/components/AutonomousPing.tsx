"use client";

/**
 * AutonomousPing — BioDynamX Background Notification Toasts · Web 4.0
 * ─────────────────────────────────────────────────────────────────────
 * Fires soft "your workforce completed a task" notifications every 2-4 mins.
 * Uses empathetic, outcome-focused language — no technical jargon.
 * GSAP slide-in from right, auto-dismisses after 6s.
 * At most one ping visible at a time.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

interface Ping {
    id: number;
    agent: string;
    image: string;
    color: string;
    message: string;
}

const PING_POOL = [
    { agent: "Iris", image: "/agents/iris.png", color: "#8b5cf6", message: "Found 3 ways to grow your visibility online." },
    { agent: "Ben", image: "/agents/ben.png", color: "#fbbf24", message: "Your revenue opportunity estimate is ready." },
    { agent: "Zara", image: "/agents/zara.png", color: "#f97316", message: "Spotted a gap your competitors are missing." },
    { agent: "Nova", image: "/agents/nova_v2.png", color: "#ec4899", message: "Identified a conversion boost for your next step." },
    { agent: "Ava", image: "/agents/ava.png", color: "#f59e0b", message: "Drafted an authority content angle for your brand." },
    { agent: "Alex", image: "/agents/alex.png", color: "#06b6d4", message: "Confirmed: zero client experience gaps detected." },
    { agent: "Vicki", image: "/agents/vicki.png", color: "#34d399", message: "Your trust-building profile is looking strong." },
    { agent: "Jules", image: "/agents/jules.png", color: "#60a5fa", message: "Custom AI architecture outline saved for your session." },
    { agent: "Titan", image: "/agents/titan.png", color: "#3b82f6", message: "ROI projection for your industry is ready." },
];

let _pingCounter = 0;

export default function AutonomousPing() {
    const [ping, setPing] = useState<Ping | null>(null);
    const pingRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const dismissRef = useRef<NodeJS.Timeout | null>(null);
    const hasScrolledRef = useRef(false);

    // Only start pinging after user has scrolled a bit (not on landing)
    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 300) hasScrolledRef.current = true;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const firePing = () => {
        if (!hasScrolledRef.current) return;
        const item = PING_POOL[Math.floor(Math.random() * PING_POOL.length)];
        _pingCounter++;
        setPing({ id: _pingCounter, ...item });
    };

    // Schedule pings every 2–4 minutes (randomized)
    useEffect(() => {
        const schedule = () => {
            const delay = 120_000 + Math.random() * 120_000; // 2–4 min
            timerRef.current = setTimeout(() => {
                firePing();
                schedule();
            }, delay);
        };
        // First ping after ~90s
        timerRef.current = setTimeout(() => {
            firePing();
            schedule();
        }, 90_000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (dismissRef.current) clearTimeout(dismissRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // GSAP animate in when ping changes
    useEffect(() => {
        if (!ping || !pingRef.current) return;
        const el = pingRef.current;

        gsap.killTweensOf(el);
        gsap.fromTo(el,
            { x: 80, opacity: 0, scale: 0.94 },
            { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }
        );

        // Auto-dismiss after 6s
        if (dismissRef.current) clearTimeout(dismissRef.current);
        dismissRef.current = setTimeout(() => dismiss(el), 6000);
    }, [ping]);

    const dismiss = (el: HTMLDivElement | null) => {
        if (!el) return;
        gsap.to(el, {
            x: 80, opacity: 0, scale: 0.94,
            duration: 0.4, ease: "power2.in",
            onComplete: () => setPing(null),
        });
    };

    if (!ping) return null;

    return (
        <div
            ref={pingRef}
            role="status"
            aria-live="polite"
            aria-label={`${ping.agent}: ${ping.message}`}
            style={{
                position: "fixed",
                top: 20,
                right: 22,
                zIndex: 9999,
                display: "flex",
                alignItems: "flex-start",
                gap: 11,
                background: "rgba(4, 4, 18, 0.90)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${ping.color}35`,
                borderRadius: 16,
                padding: "12px 14px 12px 12px",
                minWidth: 260,
                maxWidth: 310,
                boxShadow: `0 0 32px ${ping.color}15, 0 12px 40px rgba(0,0,0,0.6)`,
                cursor: "pointer",
            }}
            onClick={() => dismiss(pingRef.current)}
        >
            {/* Agent avatar */}
            <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `1.5px solid ${ping.color}55`,
                overflow: "hidden", position: "relative", flexShrink: 0,
                background: `linear-gradient(135deg, ${ping.color}28, rgba(0,0,0,0.5))`,
                boxShadow: `0 0 12px ${ping.color}30`,
            }}>
                <Image src={ping.image} alt={ping.agent} fill style={{ objectFit: "cover" }} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{
                        fontSize: 11, fontWeight: 800,
                        color: ping.color,
                        letterSpacing: "-0.01em",
                    }}>{ping.agent}</span>
                    <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "#00ff41",
                        boxShadow: "0 0 6px #00ff41",
                        flexShrink: 0,
                        animation: "bdx-ping-blink 1.5s ease-in-out infinite",
                        display: "inline-block",
                    }} />
                </div>
                <p style={{
                    margin: 0, fontSize: 12,
                    color: "rgba(255,255,255,0.82)",
                    lineHeight: 1.55,
                    letterSpacing: "-0.01em",
                }}>
                    {ping.message}
                </p>
            </div>

            {/* Dismiss x */}
            <button
                onClick={e => { e.stopPropagation(); dismiss(pingRef.current); }}
                style={{
                    background: "transparent", border: "none",
                    color: "rgba(255,255,255,0.25)", cursor: "pointer",
                    fontSize: 14, lineHeight: 1, flexShrink: 0, padding: 0,
                    marginLeft: 2, marginTop: -2, alignSelf: "flex-start",
                }}
                aria-label="Dismiss"
            >✕</button>

            <style>{`
                @keyframes bdx-ping-blink { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
            `}</style>
        </div>
    );
}
