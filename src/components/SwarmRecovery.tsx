"use client";
// ═══════════════════════════════════════════════════════════════════════
// IRONCLAW SWARM RECOVERY — The "Hail Mary" Closer
// ═══════════════════════════════════════════════════════════════════════
//
// Triggers on:
//   A. cursor exits viewport top (intent-to-close tab) — mouseleave
//   B. user spends 45+ seconds without converting (checkout timer)
//   C. window.dispatchEvent(new CustomEvent("bdx:trigger-recovery"))
//
// Design Directive: "Digital Concierge saving a relationship."
//   - Soft-Neural UI: 25px+ radii, gold glow, glassmorphism
//   - Calm, helpful agent tone — NOT desperate
//   - 4-agent coordinated response: Mark → Milton → Jenny → Brock
//   - Stripe link auto-upgraded to VIP bonus URL
//   - One fire per session (sessionStorage gate)
// ═══════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { A2AContext } from "@/lib/a2a-context";

// ─── Recovery Agent Sequence ─────────────────────────────────────────────
const RECOVERY_AGENTS = [
    {
        id: "mark",
        name: "Mark",
        image: "/agents/mark.png",
        color: "#3b82f6",
        role: "Revenue Architect",
        delay: 0,
        line: "I'm authorized to lock in your 5X Guarantee for a full 12 months instead of 3. This removes every last dollar of risk from your decision.",
        shortLine: "12-Month 5X ROI Guarantee — just authorized.",
    },
    {
        id: "milton",
        name: "Milton",
        image: "/agents/milton.png",
        color: "#4c1d95",
        role: "Operations",
        delay: 1400,
        line: "I've already reserved your deployment slot. If you close this tab, that slot will be released to your nearest competitor within the hour.",
        shortLine: "Your deployment slot is still reserved. For now.",
    },
    {
        id: "jenny",
        name: "Jenny",
        image: "/agents/jenny.png",
        color: "#6366f1",
        role: "Growth Strategist",
        delay: 2800,
        line: "Don't let this be another 'what if.' I'm adding my personal 1-on-1 strategy session to your vault — at no charge. This is yours alone.",
        shortLine: "Personal 1-on-1 Strategy Session added to your vault.",
    },
    {
        id: "brock",
        name: "Brock",
        image: "/agents/brock.png",
        color: "#dc2626",
        role: "Security",
        delay: 4200,
        line: "Your VIP bonus package is being held in Supabase right now. It expires the moment this tab closes. I can't hold it after that.",
        shortLine: "VIP Bonus expires on tab close. Brock is holding it.",
    },
];

// VIP upgrade Stripe URL — shows extended guarantee + bonus session
const STRIPE_VIP_URL = "https://buy.stripe.com/biodynamx?promo=VIP12MO";

const SESSION_KEY = "bdx_recovery_triggered";

// ─── Component ────────────────────────────────────────────────────────────

export default function SwarmRecovery() {
    const [visible, setVisible] = useState(false);
    const [activeAgent, setActiveAgent] = useState(0);
    const [typedText, setTypedText] = useState("");
    const [bonusRevealed, setBonusRevealed] = useState(false);
    const [stripeUrl, setStripeUrl] = useState(STRIPE_VIP_URL);
    const overlayRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const typeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const agentTimersRef = useRef<NodeJS.Timeout[]>([]);
    const checkoutTimerRef = useRef<NodeJS.Timeout | null>(null);

    // ── Trigger gate — fires max once per session ───────────────────────
    const trigger = useCallback(() => {
        if (typeof sessionStorage !== "undefined") {
            if (sessionStorage.getItem(SESSION_KEY)) return;
            sessionStorage.setItem(SESSION_KEY, "1");
        }
        // Upgrade Stripe URL with VIP bonus
        const prospectName = A2AContext.get().prospectName;
        const utm = prospectName
            ? `&name=${encodeURIComponent(prospectName)}`
            : "";
        setStripeUrl(`${STRIPE_VIP_URL}${utm}`);
        setVisible(true);
        setActiveAgent(0);
        setTypedText("");
        setBonusRevealed(false);

        // Update A2A — log recovery trigger
        A2AContext.update({
            currentPhase: "recovery",
            buyingSignal: "warm",
        });
    }, []);

    // ── Exit-intent detector (mouseleave top of viewport) ───────────────
    useEffect(() => {
        const onMouseLeave = (e: MouseEvent) => {
            if (e.clientY < 0) trigger();
        };
        document.addEventListener("mouseleave", onMouseLeave);
        return () => document.removeEventListener("mouseleave", onMouseLeave);
    }, [trigger]);

    // ── Checkout 45s timer ───────────────────────────────────────────────
    // Fires when user enters checkout phase and hasn't converted in 45s
    useEffect(() => {
        const onCheckout = () => {
            checkoutTimerRef.current = setTimeout(() => {
                trigger();
            }, 45_000);
        };
        const onClose = () => {
            if (checkoutTimerRef.current) clearTimeout(checkoutTimerRef.current);
        };

        window.addEventListener("bdx:one-call-close", onCheckout);
        // If user navigates back from Stripe (popstate), also trigger
        window.addEventListener("popstate", onClose);
        return () => {
            window.removeEventListener("bdx:one-call-close", onCheckout);
            window.removeEventListener("popstate", onClose);
            if (checkoutTimerRef.current) clearTimeout(checkoutTimerRef.current);
        };
    }, [trigger]);

    // ── Manual trigger via CustomEvent ──────────────────────────────────
    useEffect(() => {
        const handler = () => trigger();
        window.addEventListener("bdx:trigger-recovery", handler);
        return () => window.removeEventListener("bdx:trigger-recovery", handler);
    }, [trigger]);

    // ── GSAP entrance ────────────────────────────────────────────────────
    useEffect(() => {
        if (!visible || !overlayRef.current || !cardRef.current) return;

        // Clear any leftover timers
        agentTimersRef.current.forEach(clearTimeout);
        agentTimersRef.current = [];

        // Overlay dim
        gsap.fromTo(overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.8, ease: "power2.out" }
        );

        // Card entrance — slide up from bottom, gold glow appears
        gsap.fromTo(cardRef.current,
            { y: 60, opacity: 0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.4)" }
        );

        // Stagger agent activations
        RECOVERY_AGENTS.forEach((agent, i) => {
            const t = setTimeout(() => {
                setActiveAgent(i);
                startTypewriter(agent.line, i === RECOVERY_AGENTS.length - 1);
                if (i === RECOVERY_AGENTS.length - 1) {
                    setTimeout(() => setBonusRevealed(true), 1200);
                }
            }, agent.delay);
            agentTimersRef.current.push(t);
        });

        return () => {
            agentTimersRef.current.forEach(clearTimeout);
            if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    // ── Typewriter effect ────────────────────────────────────────────────
    const startTypewriter = (text: string, isFinal: boolean) => {
        if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
        setTypedText("");
        let i = 0;
        const speed = isFinal ? 22 : 18; // slightly slower for Mark (first)

        const tick = () => {
            if (i < text.length) {
                setTypedText(text.slice(0, i + 1));
                i++;
                typeTimerRef.current = setTimeout(tick, speed);
            }
        };
        tick();
    };

    const dismiss = () => {
        if (!overlayRef.current) return;
        gsap.to(overlayRef.current, {
            opacity: 0, duration: 0.4, ease: "power2.in",
            onComplete: () => setVisible(false),
        });
    };

    if (!visible) return null;

    const currentAgent = RECOVERY_AGENTS[activeAgent];

    return (
        <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Ironclaw Recovery — Your Workforce Has One More Move"
            style={{
                position: "fixed", inset: 0, zIndex: 99999,
                background: "rgba(0,0,0,0.88)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "20px 16px",
            }}
        >
            {/* X dismiss */}
            <button
                onClick={dismiss}
                aria-label="Dismiss"
                style={{
                    position: "absolute", top: 20, right: 24,
                    background: "transparent", border: "none",
                    color: "rgba(255,255,255,0.25)", fontSize: 20,
                    cursor: "pointer", lineHeight: 1,
                    transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
            >✕</button>

            {/* Main card */}
            <div
                ref={cardRef}
                style={{
                    background: "linear-gradient(145deg, rgba(10,8,2,0.98), rgba(5,4,1,0.99))",
                    border: "1px solid rgba(255,215,0,0.3)",
                    borderRadius: 28,
                    boxShadow: "0 0 60px rgba(255,215,0,0.12), 0 0 120px rgba(255,215,0,0.05), 0 20px 60px rgba(0,0,0,0.7)",
                    padding: "36px 32px",
                    maxWidth: 540,
                    width: "100%",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Gold top stripe */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: "linear-gradient(90deg, transparent, #FFD700, transparent)",
                    borderRadius: "28px 28px 0 0",
                }} />

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "rgba(255,215,0,0.07)",
                        border: "1px solid rgba(255,215,0,0.2)",
                        borderRadius: 30, padding: "5px 16px", marginBottom: 16,
                        fontSize: 9, fontWeight: 900, color: "#FFD700",
                        letterSpacing: "0.18em", textTransform: "uppercase",
                    }}>
                        <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: "#FFD700", display: "inline-block",
                            boxShadow: "0 0 6px #FFD700",
                            animation: "sr-blink 1.2s ease-in-out infinite",
                        }} />
                        IRONCLAW · RECOVERY PROTOCOL
                    </div>
                    <h2 style={{
                        fontSize: "clamp(18px,3.5vw,26px)", fontWeight: 900,
                        color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em",
                    }}>
                        One moment. The swarm has a{" "}
                        <span style={{ color: "#FFD700" }}>final move.</span>
                    </h2>
                    <p style={{
                        fontSize: 13, color: "rgba(255,255,255,0.35)",
                        margin: 0, lineHeight: 1.5,
                    }}>
                        {A2AContext.get().prospectName
                            ? `${A2AContext.get().prospectName}, your workforce is still standing by.`
                            : "Your workforce is still standing by."}
                    </p>
                </div>

                {/* Agent row — all 4 shown, active one highlighted */}
                <div style={{
                    display: "flex", gap: 10, justifyContent: "center",
                    marginBottom: 24,
                }}>
                    {RECOVERY_AGENTS.map((agent, i) => {
                        const isActive = i === activeAgent;
                        const isPast = i < activeAgent;
                        return (
                            <div
                                key={agent.id}
                                style={{
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", gap: 6,
                                    opacity: isPast ? 0.5 : isActive ? 1 : 0.2,
                                    transition: "opacity 0.4s ease",
                                }}
                            >
                                <div style={{
                                    width: 48, height: 48, borderRadius: "50%",
                                    border: `2px solid ${isActive ? agent.color : "rgba(255,255,255,0.1)"}`,
                                    overflow: "hidden", position: "relative",
                                    boxShadow: isActive ? `0 0 20px ${agent.color}60` : "none",
                                    transition: "all 0.4s ease",
                                    flexShrink: 0,
                                }}>
                                    <Image src={agent.image} alt={agent.name} fill style={{ objectFit: "cover" }} />
                                    {isPast && (
                                        <div style={{
                                            position: "absolute", inset: 0,
                                            background: "rgba(0,255,65,0.15)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 18,
                                        }}>✓</div>
                                    )}
                                </div>
                                <span style={{
                                    fontSize: 9, fontWeight: 800,
                                    color: isActive ? agent.color : "rgba(255,255,255,0.3)",
                                    letterSpacing: "0.06em", transition: "color 0.4s",
                                }}>{agent.name}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Active agent speech bubble */}
                <div style={{
                    background: `rgba(${currentAgent.color === "#3b82f6" ? "59,130,246" : currentAgent.color === "#4c1d95" ? "76,29,149" : currentAgent.color === "#6366f1" ? "99,102,241" : "220,38,38"},0.08)`,
                    border: `1px solid ${currentAgent.color}25`,
                    borderRadius: 18,
                    padding: "18px 20px",
                    marginBottom: 24,
                    minHeight: 90,
                    transition: "all 0.4s ease",
                    position: "relative",
                }}>
                    <div style={{
                        fontSize: 9, fontWeight: 900, color: currentAgent.color,
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
                    }}>
                        <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: currentAgent.color,
                            display: "inline-block",
                            boxShadow: `0 0 6px ${currentAgent.color}`,
                            animation: "sr-blink 1s ease-in-out infinite",
                        }} />
                        {currentAgent.name} · {currentAgent.role}
                    </div>
                    <p style={{
                        fontSize: 14, color: "rgba(255,255,255,0.8)",
                        margin: 0, lineHeight: 1.65, fontStyle: "italic",
                        minHeight: 48,
                    }}>
                        &ldquo;{typedText}<span style={{
                            display: "inline-block", width: 1, height: 14,
                            background: "rgba(255,255,255,0.6)",
                            animation: "sr-cursor 0.8s step-end infinite",
                            verticalAlign: "text-bottom", marginLeft: 2,
                        }} />&rdquo;
                    </p>
                </div>

                {/* VIP Bonus cards — reveals after all agents done */}
                <div style={{
                    opacity: bonusRevealed ? 1 : 0,
                    transform: bonusRevealed ? "translateY(0)" : "translateY(10px)",
                    transition: "opacity 0.6s ease, transform 0.6s ease",
                    marginBottom: 24,
                }}>
                    <div style={{
                        fontSize: 9, fontWeight: 900, color: "#FFD700",
                        letterSpacing: "0.16em", textTransform: "uppercase",
                        textAlign: "center", marginBottom: 12,
                    }}>
                        ⚡ VIP RESCUE PACKAGE — AUTHORIZED
                    </div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                    }}>
                        {[
                            { icon: "🛡️", label: "12-Month 5X ROI Lock", sub: "Upgraded from 90-day" },
                            { icon: "🎯", label: "1-on-1 Strategy Session", sub: "With Jenny — free" },
                            { icon: "⚡", label: "Priority Deployment", sub: "24hr launch window" },
                            { icon: "🔐", label: "VIP Vault Access", sub: "Brock-secured, expires now" },
                        ].map(item => (
                            <div key={item.label} style={{
                                background: "rgba(255,215,0,0.05)",
                                border: "1px solid rgba(255,215,0,0.15)",
                                borderRadius: 14,
                                padding: "12px 14px",
                                display: "flex", alignItems: "flex-start", gap: 10,
                            }}>
                                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", lineHeight: 1.3 }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                                        {item.sub}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{
                    opacity: bonusRevealed ? 1 : 0,
                    transition: "opacity 0.6s ease 0.3s",
                }}>
                    <button
                        id="recovery-stripe-cta"
                        onClick={() => {
                            A2AContext.update({ buyingSignal: "hot", currentPhase: "close" });
                            window.location.href = stripeUrl;
                        }}
                        style={{
                            display: "block", width: "100%",
                            background: "linear-gradient(135deg, #FFD700 0%, #f59e0b 100%)",
                            border: "none", borderRadius: 60,
                            padding: "18px 32px",
                            fontSize: 14, fontWeight: 900, color: "#000",
                            cursor: "pointer", letterSpacing: "-0.01em",
                            boxShadow: "0 0 40px rgba(255,215,0,0.4), 0 0 80px rgba(255,215,0,0.12)",
                            animation: "sr-pulse 2.2s ease-in-out infinite",
                            outline: "none",
                        }}
                    >
                        CLAIM MY VIP PACKAGE → ACTIVATE NOW
                    </button>
                    <p style={{
                        textAlign: "center", fontSize: 9,
                        color: "rgba(255,255,255,0.2)",
                        marginTop: 10, letterSpacing: "0.06em",
                    }}>
                        12-Month Guarantee · Zero Risk · Brock-Certified Secure
                    </p>
                </div>

                {/* Agent status strip */}
                <div style={{
                    marginTop: 20, paddingTop: 16,
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap",
                }}>
                    {RECOVERY_AGENTS.map((agent, i) => (
                        <div key={agent.id} style={{
                            display: "flex", alignItems: "center", gap: 5,
                            opacity: i <= activeAgent ? 1 : 0.25,
                            transition: "opacity 0.3s",
                        }}>
                            <div style={{
                                width: 5, height: 5, borderRadius: "50%",
                                background: i < activeAgent ? "#00ff41" : i === activeAgent ? agent.color : "rgba(255,255,255,0.2)",
                                boxShadow: i === activeAgent ? `0 0 6px ${agent.color}` : i < activeAgent ? "0 0 4px #00ff41" : "none",
                                transition: "all 0.3s",
                            }} />
                            <span style={{
                                fontSize: 8, fontWeight: 700,
                                color: i < activeAgent ? "#00ff41" : i === activeAgent ? agent.color : "rgba(255,255,255,0.2)",
                                letterSpacing: "0.08em", textTransform: "uppercase",
                            }}>
                                {i < activeAgent ? `${agent.name} ✓` : agent.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes sr-blink { 0%,100% { opacity:1 } 50% { opacity:0.25 } }
                @keyframes sr-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
                @keyframes sr-pulse {
                    0%,100% { box-shadow: 0 0 40px rgba(255,215,0,0.4), 0 0 80px rgba(255,215,0,0.1); }
                    50%      { box-shadow: 0 0 60px rgba(255,215,0,0.6), 0 0 120px rgba(255,215,0,0.2); }
                }
            `}</style>
        </div>
    );
}
