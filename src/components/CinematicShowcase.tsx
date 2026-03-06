"use client";

/**
 * CinematicShowcase v2 — BioDynamX Web 4.0
 *
 * CORRECT GSAP horizontal-scroll architecture:
 *   • outerRef = tall container (height = panels × 100vh) — gives scroll room
 *   • stickyRef = position:sticky top:0, height:100vh — what the user sees
 *   • stripRef inside stickyRef — GSAP translates this horizontally
 *
 * 4 cinematic stops:
 *   0. THE PROBLEM       — word-by-word stagger + urgency
 *   1. THE COMPARISON    — animated row-by-row table
 *   2. THE ELITE 11      — orbital agent showcase, one at a time
 *   3. PROOF + CLOSE     — live counters + guarantee CTA
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./CinematicShowcase.css";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ── Data ─────────────────────────────────────────────── */

const PANELS = 4;

const AGENTS = [
    { name: "Milton", role: "Conversational Hypnotist", color: "#7c3aed", icon: "🌀", voice: "Charon", brain: "Broca's Area" },
    { name: "Meghan", role: "Amygdala Soother", color: "#a78bfa", icon: "💜", voice: "Aoede", brain: "Amygdala" },
    { name: "Jenny", role: "Discovery & Sales", color: "#6366f1", icon: "🧠", voice: "Kore", brain: "Glial Network" },
    { name: "Mark", role: "ROI Closer", color: "#3b82f6", icon: "📈", voice: "Orion", brain: "Croc Brain" },
    { name: "Brock", role: "Security & ROI", color: "#ef4444", icon: "🛡️", voice: "Charon", brain: "Broca's Area" },
    { name: "Vicki", role: "Empathy & Care", color: "#34d399", icon: "💚", voice: "Aoede", brain: "Wernicke's Area" },
    { name: "Ben", role: "GMB & Local SEO", color: "#fbbf24", icon: "📍", voice: "Charon", brain: "Neocortex" },
    { name: "Chase", role: "Lead Hunter", color: "#f97316", icon: "🎯", voice: "Enceladus", brain: "Hypothalamus" },
    { name: "Iris", role: "GEO/AEO Visibility", color: "#8b5cf6", icon: "👁️", voice: "Leda", brain: "Iris Network" },
    { name: "Jules", role: "Technical Architect", color: "#06b6d4", icon: "⚙️", voice: "Puck", brain: "Neocortex" },
    { name: "Alex", role: "Support & Retention", color: "#22c55e", icon: "🤝", voice: "Aoede", brain: "Hippocampus" },
];

const STATS = [
    { end: 2.4, unit: "M+", prefix: "$", label: "Revenue Recovered", color: "#00ff41" },
    { end: 8, unit: "s", prefix: "<", label: "Avg Response Time", color: "#3b82f6" },
    { end: 85, unit: "%", prefix: "", label: "Cost Reduction vs Human Team", color: "#a78bfa" },
    { end: 62, unit: "%", prefix: "", label: "Calls Missed Without AI", color: "#ef4444" },
];

const COMP = [
    { icon: "🎙️", cat: "Interface", them: "Chatbots · Typing", us: "100% Live Voice AI" },
    { icon: "⚡", cat: "Response", them: "15-30s Latency", us: "< 1 Second · Native" },
    { icon: "🧠", cat: "Psychology", them: "Generic Prompting", us: "Neurobiology + SPIN" },
    { icon: "🌐", cat: "Availability", them: "9-5 / M-F", us: "24/7/365 · Autonomous" },
    { icon: "🔒", cat: "Trust", them: "No Guarantees", us: "5X ROI Triple-Lock" },
    { icon: "💰", cat: "Pricing", them: "15% Revenue Tax", us: "$1,497 / 90-Day Trial" },
    { icon: "🔍", cat: "AI Visibility", them: "Zero Presence", us: "GEO/AEO Indexed" },
    { icon: "🧬", cat: "Intelligence", them: "Basic LLM Wrappers", us: "Vertex AI Enterprise" },
];

/* ── Component ────────────────────────────────────────── */

export default function CinematicShowcase() {
    const outerRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const stripRef = useRef<HTMLDivElement>(null);
    const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [activeAgent, setActiveAgent] = useState(0);

    /* ── auto-rotate agents ── */
    useEffect(() => {
        const id = setInterval(() => {
            setActiveAgent(p => (p + 1) % AGENTS.length);
        }, 2400);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const outer = outerRef.current;
        const strip = stripRef.current;
        if (!outer || !strip) return;

        const ctx = gsap.context(() => {
            /* ── Core horizontal scrub ── */
            gsap.to(strip, {
                x: () => -(strip.scrollWidth - window.innerWidth),
                ease: "none",
                scrollTrigger: {
                    trigger: outer,
                    start: "top top",
                    end: () => `+=${strip.scrollWidth - window.innerWidth}`,
                    scrub: 1,
                    pin: stickyRef.current,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                },
            });

            /* ── Panel entrance animations ── */
            const panels = strip.querySelectorAll<HTMLElement>(".cx-panel");

            panels.forEach((panel, pi) => {
                // word-stagger for panel 0
                if (pi === 0) {
                    const words = panel.querySelectorAll(".cxw");
                    gsap.fromTo(words,
                        { y: 80, opacity: 0 },
                        {
                            y: 0, opacity: 1, stagger: 0.07, duration: 0.8,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: outer, start: "top top+=1",
                                end: "top top-=1", once: true,
                            }
                        }
                    );
                }

                // table rows animate in when panel enters
                if (pi === 1) {
                    const rows = panel.querySelectorAll(".cxc-row");
                    gsap.fromTo(rows,
                        { x: -60, opacity: 0 },
                        {
                            x: 0, opacity: 1, stagger: 0.06,
                            duration: 0.5, ease: "power2.out",
                            scrollTrigger: {
                                trigger: outer,
                                start: () => `top top-=${strip.scrollWidth * 0.21}`,
                                once: true,
                            }
                        }
                    );
                }

                // counter animation panel 3
                if (pi === 3) {
                    STATS.forEach((stat, i) => {
                        const span = counterRefs.current[i];
                        if (!span) return;
                        const obj = { v: 0 };
                        gsap.to(obj, {
                            v: stat.end, duration: 2, ease: "power2.out",
                            onUpdate: () => {
                                span.textContent = stat.prefix
                                    + (stat.end < 10 ? obj.v.toFixed(1) : Math.round(obj.v).toString())
                                    + stat.unit;
                            },
                            scrollTrigger: {
                                trigger: outer,
                                start: () => `top top-=${strip.scrollWidth * 0.72}`,
                                once: true,
                            }
                        });
                    });
                }
            });

        }, outerRef);

        return () => ctx.revert();
    }, []);

    /* ── Render ─────────────────────────────────────────── */
    return (
        /* Outer: sets scroll height for 4 panels */
        <div
            ref={outerRef}
            style={{ height: `${PANELS * 100}vh`, position: "relative" }}
        >
            {/* Sticky viewport */}
            <div
                ref={stickyRef}
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    overflow: "hidden",
                    background: "#030308",
                }}
            >
                {/* Ambient particle field */}
                <div className="cx-particles" />

                {/* Horizontal strip */}
                <div
                    ref={stripRef}
                    className="cx-strip"
                >
                    {/* ══════════════════════════════════
                        PANEL 0 — THE PROBLEM
                    ══════════════════════════════════ */}
                    <div className="cx-panel cx-panel-0">
                        <div className="cx-panel-bg-glow" style={{ background: "radial-gradient(circle at 30% 50%, rgba(239,68,68,0.12) 0%, transparent 65%)" }} />
                        <div className="cx-panel-inner">
                            <div className="cx-eyebrow" style={{ color: "#ef4444" }}>REPTILIAN THREAT RESPONSE</div>
                            <h2 className="cx-h2">
                                {["Every", "Missed", "Call", "Is", "$600", "Walking", "Out", "The", "Door."].map((w, i) => (
                                    <span
                                        key={i}
                                        className="cxw"
                                        style={{
                                            color: w === "$600" ? "#ef4444" : "#fff",
                                            display: "inline-block",
                                            marginRight: "0.25em",
                                        }}
                                    >
                                        {w}
                                    </span>
                                ))}
                            </h2>
                            <p className="cx-body">
                                62% of calls go unanswered. Your competitor just picked up. Without BioDynamX,
                                every ring that goes to voicemail is a direct deposit into someone else&apos;s account.
                            </p>

                            <div className="cx-trio">
                                <div className="cx-trio-card">
                                    <span className="cx-trio-n" style={{ color: "#ef4444" }}>62%</span>
                                    <span className="cx-trio-l">Calls Missed</span>
                                </div>
                                <div className="cx-trio-card">
                                    <span className="cx-trio-n" style={{ color: "#f97316" }}>3hrs</span>
                                    <span className="cx-trio-l">Response Lag</span>
                                </div>
                                <div className="cx-trio-card">
                                    <span className="cx-trio-n" style={{ color: "#00ff41" }}>&lt; 8s</span>
                                    <span className="cx-trio-l">BioDynamX</span>
                                </div>
                            </div>

                            <div className="cx-scroll-cue">
                                <span className="cx-cue-line" />
                                scroll to enter the system
                                <span className="cx-cue-line" />
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════
                        PANEL 1 — COMPARISON
                    ══════════════════════════════════ */}
                    <div className="cx-panel cx-panel-1">
                        <div className="cx-panel-bg-glow" style={{ background: "radial-gradient(circle at 70% 40%, rgba(0,255,65,0.08) 0%, transparent 65%)" }} />
                        <div className="cx-panel-inner">
                            <div className="cx-eyebrow" style={{ color: "#00ff41" }}>THE BIODYNAMX ADVANTAGE</div>
                            <h2 className="cx-h2">Light-Years <span style={{ color: "#00ff41" }}>Ahead.</span></h2>

                            <div className="cxc-table">
                                {/* Header */}
                                <div className="cxc-thead">
                                    <div className="cxc-th-bad">THE COMPETITION</div>
                                    <div className="cxc-th-cat"></div>
                                    <div className="cxc-th-good">BIODYNAMX 4.1</div>
                                </div>
                                {/* Rows */}
                                {COMP.map((r) => (
                                    <div key={r.cat} className="cxc-row">
                                        <div className="cxc-cell cxc-bad">
                                            <span className="cxc-x">✗</span>
                                            <span>{r.them}</span>
                                        </div>
                                        <div className="cxc-cell cxc-cat">
                                            <span className="cxc-icon">{r.icon}</span>
                                            <span>{r.cat}</span>
                                        </div>
                                        <div className="cxc-cell cxc-good">
                                            <span className="cxc-check">✓</span>
                                            <span>{r.us}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════
                        PANEL 2 — ELITE 11 AGENTS
                    ══════════════════════════════════ */}
                    <div className="cx-panel cx-panel-2">
                        <div className="cx-panel-bg-glow" style={{ background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 65%)" }} />
                        <div className="cx-panel-inner cx-agents-inner">
                            <div className="cx-left-col">
                                <div className="cx-eyebrow" style={{ color: "#818cf8" }}>THE ELITE 11 WORKFORCE</div>
                                <h2 className="cx-h2">
                                    Not Bots.<br />
                                    <span style={{ color: "#818cf8" }}>Neural<br />Specialists.</span>
                                </h2>
                                <p className="cx-body">
                                    Each agent maps to a specific brain region. Their voice, persona,
                                    and script fire the exact neurochemicals needed to move a prospect
                                    from hesitation to committed action.
                                </p>

                                {/* Active agent detail */}
                                <div className="cx-active-detail" style={{ "--accent": AGENTS[activeAgent].color } as React.CSSProperties}>
                                    <div className="cx-active-icon">{AGENTS[activeAgent].icon}</div>
                                    <div>
                                        <div className="cx-active-name">{AGENTS[activeAgent].name}</div>
                                        <div className="cx-active-role">{AGENTS[activeAgent].role}</div>
                                        <div className="cx-active-brain">Brain Region: {AGENTS[activeAgent].brain}</div>
                                        <div className="cx-active-voice">Voice: {AGENTS[activeAgent].voice}</div>
                                    </div>
                                </div>

                                {/* Agent dots nav */}
                                <div className="cx-dots">
                                    {AGENTS.map((a, i) => (
                                        <button
                                            key={a.name}
                                            className={`cx-dot ${i === activeAgent ? "cx-dot-active" : ""}`}
                                            style={{ "--accent": a.color } as React.CSSProperties}
                                            onClick={() => setActiveAgent(i)}
                                            aria-label={a.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Right — orbital ring of agent avatars */}
                            <div className="cx-orbit-wrap">
                                {/* Center ring */}
                                <div className="cx-orbit-ring cx-orbit-outer" />
                                <div className="cx-orbit-ring cx-orbit-mid" />
                                <div className="cx-orbit-center">
                                    <div className="cx-orbit-center-icon">{AGENTS[activeAgent].icon}</div>
                                    <div className="cx-orbit-center-name">{AGENTS[activeAgent].name}</div>
                                </div>
                                {/* Orbiting agent nodes */}
                                {AGENTS.map((a, i) => {
                                    const angle = (i / AGENTS.length) * 360;
                                    const radius = 185;
                                    const rad = (angle * Math.PI) / 180;
                                    const x = Math.cos(rad) * radius;
                                    const y = Math.sin(rad) * radius;
                                    return (
                                        <button
                                            key={a.name}
                                            className={`cx-orbit-node ${i === activeAgent ? "cx-orbit-node-active" : ""}`}
                                            style={{
                                                "--accent": a.color,
                                                transform: `translate(${x}px, ${y}px)`,
                                            } as React.CSSProperties}
                                            onClick={() => setActiveAgent(i)}
                                            title={a.name}
                                        >
                                            <span className="cx-node-icon">{a.icon}</span>
                                            <span className="cx-node-name">{a.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════
                        PANEL 3 — PROOF + CLOSE
                    ══════════════════════════════════ */}
                    <div className="cx-panel cx-panel-3">
                        <div className="cx-panel-bg-glow" style={{ background: "radial-gradient(circle at 30% 40%, rgba(0,255,65,0.1) 0%, transparent 60%)" }} />
                        <div className="cx-panel-inner cx-split">

                            {/* Left: stats */}
                            <div className="cx-proof-left">
                                <div className="cx-eyebrow" style={{ color: "#fbbf24" }}>THE NEOCORTEX PROOF</div>
                                <h2 className="cx-h2">The Math<br /><span style={{ color: "#fbbf24" }}>Never Lies.</span></h2>

                                <div className="cx-counters">
                                    {STATS.map((s, i) => (
                                        <div key={s.label} className="cx-counter" style={{ "--accent": s.color } as React.CSSProperties}>
                                            <div className="cx-counter-num">
                                                <span ref={el => { counterRefs.current[i] = el; }}>{s.prefix}0{s.unit}</span>
                                            </div>
                                            <div className="cx-counter-label">{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="cx-vs-row">
                                    <div className="cx-vs-item cx-vs-bad">
                                        <div>Human Team</div>
                                        <div className="cx-vs-val">$12,400+/mo</div>
                                    </div>
                                    <div className="cx-vs-sep">vs</div>
                                    <div className="cx-vs-item cx-vs-good">
                                        <div>BioDynamX</div>
                                        <div className="cx-vs-val">$1,497/mo</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: CTA */}
                            <div className="cx-close-right">
                                <div className="cx-shield-emoji">🛡️</div>
                                <div className="cx-eyebrow" style={{ color: "#00ff41" }}>TRIPLE-LOCK GUARANTEE</div>
                                <h3 className="cx-close-h3">
                                    5X ROI <br />
                                    <span style={{ color: "#00ff41" }}>or we refund everything.</span>
                                </h3>
                                <p className="cx-body" style={{ maxWidth: 360 }}>
                                    90 days. At least 5× your investment in recovered revenue. If not — full refund. Zero questions.
                                </p>

                                <div className="cx-price">
                                    <span className="cx-price-through">$2,497</span>
                                    <span className="cx-price-big">$748</span>
                                    <span className="cx-price-mo">/mo</span>
                                </div>
                                <div className="cx-price-tag">90-Day Trial · 50% Off · All 11 Agents</div>

                                <button
                                    className="cx-cta-btn"
                                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                >
                                    Claim My Trial — Risk Free →
                                </button>

                                <div className="cx-chips-row">
                                    {["No contracts", "Cancel anytime", "Results in 14 days"].map(t => (
                                        <span key={t} className="cx-chip">✓ {t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel progress indicator */}
                <div className="cx-panel-dots">
                    {Array.from({ length: PANELS }).map((_, i) => (
                        <div key={i} className="cx-panel-dot" id={`cx-pdot-${i}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
