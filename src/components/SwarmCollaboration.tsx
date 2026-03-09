"use client";

/**
 * SwarmCollaboration — BioDynamX Web 4.0
 * ────────────────────────────────────────
 * Fires during ACTIVE live conversations.
 * Every 15–25 seconds, a background agent posts a Result Ping
 * into a small collaboration feed, proving the 11-agent swarm
 * is working autonomously while the user focuses on their primary agent.
 *
 * Features:
 *  - Small collapsible panel fixed bottom-left
 *  - Entry slides in with GSAP; auto-scrolls the log
 *  - Soft collab ping via NeuralAudio
 *  - Only active when conversationActive === true (NeuralMemory)
 *  - "Digital Concierge" language — no jargon
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { NeuralMemory } from "@/lib/neural-memory";
import { triggerCollabPing } from "@/lib/neural-audio";
import { hapticCollabPing } from "@/lib/haptic";

interface CollabEntry {
    id: number;
    agent: string;
    color: string;
    message: string;
    ts: number;
}

const COLLAB_POOL = [
    { agent: "Vicki", color: "#34d399", message: "Local visibility report ready for your area." },
    { agent: "Mark", color: "#3b82f6", message: "Revenue recovery estimate updated for your niche." },
    { agent: "Chase", color: "#f97316", message: "Prospect timing window identified — flagged for follow-up." },
    { agent: "Isabel", color: "#8b5cf6", message: "Social presence scan complete. Sending insights now." },
    { agent: "Alex", color: "#06b6d4", message: "Decision path simplified — friction points removed." },
    { agent: "Nova", color: "#ec4899", message: "Conversion copy enhancement ready for your review." },
    { agent: "Brock", color: "#dc2626", message: "Session secured. All audit data is fully protected." },
    { agent: "Maya", color: "#a78bfa", message: "Task delegation list updated — 3 new items automated." },
    { agent: "Jules", color: "#60a5fa", message: "Infrastructure blueprint adjusted for your stack." },
    { agent: "Ben", color: "#fbbf24", message: "Sales script analyzed. Friction point on slide 3 flagged." },
    { agent: "Milton", color: "#4c1d95", message: "Operational sequence optimized — 40min/week recovered." },
];

let _collabId = 0;

export default function SwarmCollaboration() {
    const [isActive, setIsActive] = useState(false);
    const [entries, setEntries] = useState<CollabEntry[]>([]);
    const [collapsed, setCollapsed] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Listen for conversation state
    useEffect(() => {
        return NeuralMemory.subscribe(ctx => {
            setIsActive(ctx.conversationActive);
        });
    }, []);

    // Animate panel in/out when active changes
    useEffect(() => {
        if (!panelRef.current) return;
        gsap.to(panelRef.current, {
            opacity: isActive ? 1 : 0,
            y: isActive ? 0 : 20,
            scale: isActive ? 1 : 0.95,
            duration: 0.6,
            ease: "power2.out",
            pointerEvents: isActive ? "auto" : "none",
        });
    }, [isActive]);

    // Fire collab pings during active session
    useEffect(() => {
        if (!isActive) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        const schedule = () => {
            const delay = 15_000 + Math.random() * 10_000; // 15–25s
            timerRef.current = setTimeout(() => {
                const item = COLLAB_POOL[Math.floor(Math.random() * COLLAB_POOL.length)];
                _collabId++;
                const entry: CollabEntry = { id: _collabId, ...item, ts: Date.now() };

                setEntries(prev => [entry, ...prev].slice(0, 6)); // keep last 6
                triggerCollabPing();
                hapticCollabPing(); // subtle 8ms tap on mobile
                setCollapsed(false); // pop open when a pin fires

                // Auto-scroll log to top
                setTimeout(() => {
                    if (logRef.current) logRef.current.scrollTop = 0;
                }, 50);

                schedule(); // recurse
            }, delay);
        };

        // First ping after ~8s so user sees it quickly after conversation starts
        timerRef.current = setTimeout(() => {
            const item = COLLAB_POOL[Math.floor(Math.random() * COLLAB_POOL.length)];
            _collabId++;
            setEntries([{ id: _collabId, ...item, ts: Date.now() }]);
            triggerCollabPing();
            hapticCollabPing();
            schedule();
        }, 8_000);

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [isActive]);

    if (entries.length === 0 && !isActive) return null;

    return (
        <div
            ref={panelRef}
            style={{
                position: "fixed",
                bottom: 24,
                left: 20,
                zIndex: 990,
                width: collapsed ? 48 : 270,
                background: "rgba(4, 4, 18, 0.90)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(0,255,65,0.18)",
                borderRadius: 18,
                overflow: "hidden",
                opacity: 0,
                pointerEvents: "none",
                transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: collapsed ? "10px 12px" : "10px 14px",
                    borderBottom: collapsed ? "none" : "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    gap: 8,
                }}
                onClick={() => setCollapsed(c => !c)}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#00ff41",
                        boxShadow: "0 0 6px #00ff41",
                        flexShrink: 0,
                        animation: "sc-blink 2s ease-in-out infinite",
                    }} />
                    {!collapsed && (
                        <span style={{
                            fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.45)",
                            letterSpacing: "0.16em", textTransform: "uppercase",
                            whiteSpace: "nowrap",
                        }}>
                            WORKFORCE UPDATES
                        </span>
                    )}
                </div>
                {!collapsed && entries.length > 0 && (
                    <span style={{
                        fontSize: 9, background: "rgba(0,255,65,0.12)",
                        border: "1px solid rgba(0,255,65,0.25)",
                        borderRadius: 8, padding: "1px 6px",
                        color: "#00ff41", fontWeight: 800,
                    }}>{entries.length}</span>
                )}
            </div>

            {/* Log */}
            {!collapsed && (
                <div
                    ref={logRef}
                    style={{
                        maxHeight: 180,
                        overflowY: "auto",
                        padding: "8px 0",
                    }}
                >
                    {entries.map((e, i) => (
                        <div
                            key={e.id}
                            style={{
                                padding: "7px 14px",
                                borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                animation: i === 0 ? "sc-slide 0.3s ease-out" : "none",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 800, color: e.color,
                                    letterSpacing: "-0.01em",
                                }}>{e.agent}</span>
                                <span style={{
                                    fontSize: 8, color: "rgba(255,255,255,0.2)",
                                    letterSpacing: "0.06em",
                                }}>
                                    {Math.floor((Date.now() - e.ts) / 1000) < 5 ? "just now" : `${Math.floor((Date.now() - e.ts) / 1000)}s ago`}
                                </span>
                            </div>
                            <p style={{
                                margin: 0, fontSize: 10.5,
                                color: "rgba(255,255,255,0.72)",
                                lineHeight: 1.5, letterSpacing: "-0.01em",
                            }}>
                                {e.message}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes sc-blink { 0%,100%{opacity:1}50%{opacity:0.3} }
                @keyframes sc-slide { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
            `}</style>
        </div>
    );
}
