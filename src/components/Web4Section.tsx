"use client";

// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — WEB 4.0 EVOLUTION SECTION
// The statement that sets BioDynamX apart from every competitor.
// We don't just USE Web 4.0 — we ARE Web 4.0.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import "./Web4Section.css";

const WEB_EVOLUTION = [
    {
        era: "Web 1.0",
        year: "1991–2004",
        description: "Static pages. You read. The web did nothing.",
        color: "#4b5563",
        icon: "📄",
        status: "ancient",
    },
    {
        era: "Web 2.0",
        year: "2004–2014",
        description: "Social networks. You posted. The web remembered.",
        color: "#6b7280",
        icon: "💬",
        status: "old",
    },
    {
        era: "Web 3.0",
        year: "2014–2024",
        description: "Semantic & decentralized. The web understood data.",
        color: "#8b5cf6",
        icon: "🔗",
        status: "current",
    },
    {
        era: "Web 4.0",
        year: "2025–∞",
        description: "Ambient intelligence. The web anticipates, feels, and acts.",
        color: "#00ff41",
        icon: "🧠",
        status: "now",
        highlight: true,
    },
];

const WEB4_CAPABILITIES = [
    {
        icon: "🎙️",
        title: "Your Business Answers Every Call",
        description: "Missed calls are missed revenue. Your AI agent answers instantly — 24/7, including nights and weekends — so you never lose a lead to voicemail again.",
        badge: "ACTIVE",
    },
    {
        icon: "🔮",
        title: "Customers Reach Out to YOU First",
        description: "The site reads behavioral signals and proactively engages visitors who are about to leave. Your leads get contacted before they go to a competitor.",
        badge: "LIVE",
    },
    {
        icon: "🌍",
        title: "Every Visitor Gets a Personal Experience",
        description: "Jenny knows where your visitors are from and what they're looking for before the conversation starts. That personalization closes deals faster.",
        badge: "ACTIVE",
    },
    {
        icon: "⚡",
        title: "Your Revenue Leaks Get Found — Automatically",
        description: "In 60 seconds, Jenny runs a full audit of your business and shows you exactly where you're losing money. No forms, no waiting, no sales team.",
        badge: "LIVE",
    },
    {
        icon: "🎨",
        title: "Prospects See Your Business Come to Life",
        description: "During the conversation, Jenny generates cinematic visuals showing exactly what your business could look like with AI — tailored to your industry and goals.",
        badge: "LIVE",
    },
    {
        icon: "🔍",
        title: "AI Recommends Your Business to Buyers",
        description: "When someone asks ChatGPT, Perplexity, or Google AI for help in your industry, your business shows up as the answer — not just a link on page 4.",
        badge: "ACTIVE",
    },
];


export default function Web4Section() {
    const [activeEra, setActiveEra] = useState(3); // Default to Web 4.0
    const [isVisible, setIsVisible] = useState(false);
    const [capIndex, setCapIndex] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        if (sectionRef.current) obs.observe(sectionRef.current);
        return () => obs.disconnect();
    }, []);

    // Auto-advance capability cards
    useEffect(() => {
        if (!isVisible) return;
        const timer = setInterval(() => {
            setCapIndex(i => (i + 1) % WEB4_CAPABILITIES.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [isVisible]);

    return (
        <section
            ref={sectionRef}
            className={`web4-section ${isVisible ? "web4-visible" : ""}`}
            id="web4"
            aria-labelledby="web4-headline"
        >
            {/* Background grid */}
            <div className="web4-grid-bg" aria-hidden="true" />

            {/* Section Label */}
            <div className="web4-label">
                <span className="web4-label-dot" />
                WEB 4.0 NATIVE PLATFORM
            </div>

            <h2 id="web4-headline" className="web4-headline">
                Your Business,{" "}
                <span className="web4-gradient-text">Running on Web 4.0.</span>
            </h2>

            <p className="web4-subheadline">
                Most of your competitors are still using static websites, basic chatbots, and contact forms that go nowhere.
                BioDynamX gives YOUR business an AI team that observes visitors, engages them at the right moment, answers every call, and closes deals — automatically, 24/7.
            </p>

            {/* Evolution Timeline */}
            <div className="web4-timeline">
                {WEB_EVOLUTION.map((era, i) => (
                    <button
                        key={era.era}
                        className={`web4-era ${activeEra === i ? "web4-era-active" : ""} ${era.highlight ? "web4-era-highlight" : ""}`}
                        onClick={() => setActiveEra(i)}
                        style={{ "--era-color": era.color } as React.CSSProperties}
                        aria-pressed={activeEra === i ? "true" : "false"}
                    >
                        <div className="web4-era-icon">{era.icon}</div>
                        <div className="web4-era-label">{era.era}</div>
                        <div className="web4-era-year">{era.year}</div>
                        {activeEra === i && (
                            <div className="web4-era-desc">{era.description}</div>
                        )}
                        {era.highlight && (
                            <div className="web4-era-badge">YOU ARE HERE</div>
                        )}
                    </button>
                ))}
                {/* Animated connector line */}
                <div className="web4-timeline-line" aria-hidden="true">
                    <div
                        className="web4-timeline-progress"
                        style={{ width: `${((activeEra + 1) / WEB_EVOLUTION.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Capability Grid */}
            <div className="web4-capabilities">
                <h3 className="web4-cap-title">What Your Business Gets — Starting Day One</h3>
                <div className="web4-cap-grid">
                    {WEB4_CAPABILITIES.map((cap, i) => (
                        <div
                            key={cap.title}
                            className={`web4-cap-card ${capIndex === i ? "web4-cap-active" : ""}`}
                            onClick={() => setCapIndex(i)}
                        >
                            <div className="web4-cap-icon">{cap.icon}</div>
                            <div className="web4-cap-badge">{cap.badge}</div>
                            <h4 className="web4-cap-name">{cap.title}</h4>
                            <p className="web4-cap-desc">{cap.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="web4-cta">
                <div className="web4-cta-inner">
                    <div className="web4-cta-icon">🌐</div>
                    <div>
                        <div className="web4-cta-headline">
                            Your competitors are on Web 2.0. <span className="web4-gradient-text">Your business could be on Web 4.0 — this week.</span>
                        </div>
                        <div className="web4-cta-sub">
                            Jenny will show you exactly what that looks like for YOUR business, in YOUR industry, in 60 seconds. Free.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
