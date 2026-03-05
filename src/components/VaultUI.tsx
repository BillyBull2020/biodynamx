"use client";

// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — ENTERPRISE AI DIAGNOSTIC PLATFORM
// "Talk to Our AI" — One button. Instant wow.
// ═══════════════════════════════════════════════════════════════════

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import LeadCaptureModal from "./LeadCaptureModal";
import {
    TeamOrchestrator,
    TeamPhase,
    VaultVisualState,
} from "@/lib/TeamOrchestrator";
import CinematicCanvas from "@/components/CinematicCanvas";
import AnimatedLogo from "./AnimatedLogo";
import OrbitEcosystem from "./OrbitEcosystem";
import "./VaultUI.css";

interface VaultProps {
    apiKey: string;
}

// ─── Scroll-Reveal Hook (React 19 safe — no ref access during render) ───
function useScrollReveal(threshold = 0.15) {
    const [isVisible, setIsVisible] = useState(false);
    const [element, setElement] = useState<HTMLDivElement | null>(null);

    // callback ref — safe to pass as `ref={}` and doesn't violate React 19 rules
    const ref = useCallback((node: HTMLDivElement | null) => {
        setElement(node);
    }, []);

    useEffect(() => {
        if (!element) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.unobserve(element); } },
            { threshold }
        );
        obs.observe(element);
        return () => obs.disconnect();
    }, [element, threshold]);

    return [ref, isVisible] as const;
}

// ─── Animated Counter Hook ───────────────────────────────────
function useCountUp(target: number, isVisible: boolean, duration = 2000, suffix = "") {
    const [value, setValue] = useState("0" + suffix);
    useEffect(() => {
        if (!isVisible) return;
        const startTime = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.round(target * eased);
            setValue(current.toLocaleString() + suffix);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isVisible, target, duration, suffix]);
    return value;
}

// ─── Framework Constants ─────────────────────────────────────
// Note: These are now managed within TRANSLATIONS for localization.

// ─── Countdown Timer for Scarcity (Framework 2: FOMO) ─────
function useCountdown() {
    // Start with a safe static string to avoid hydration mismatch
    const [timeLeft, setTimeLeft] = useState("--h --m --s");
    useEffect(() => {
        const update = () => {
            const now = new Date();
            // Midnight tonight = deadline
            const midnight = new Date(now);
            midnight.setHours(23, 59, 59, 999);
            const diff = midnight.getTime() - now.getTime();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);
    return timeLeft;
}

export default function VaultUI({ apiKey }: VaultProps) {
    const teamRef = useRef<TeamOrchestrator | null>(null);

    const [phase, setPhase] = useState<TeamPhase>("standby");
    const [visual, setVisual] = useState<VaultVisualState>({
        phase: "standby",
        borderColor: "#1a1a1a",
        bgOpacity: 0,
        pulseActive: false,
        activeAgentName: null,
        activeAgentVoice: null,
        waveformMode: "idle",
    });
    const [errorText, setErrorText] = useState<string | null>(null);

    // ─── Language Support ───────────────────────────────────
    const [language, setLanguage] = useState<"en" | "es">("en");

    // ─── Scroll Progress ─────────────────────────────────────
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showStickyBar, setShowStickyBar] = useState(false);
    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
            // Show sticky CTA bar after scrolling past hero (Framework 4: Prompt timing)
            setShowStickyBar(scrollTop > window.innerHeight * 0.6);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Framework 2: Scarcity countdown
    const countdown = useCountdown();
    // Dynamic "spots" — creates FOMO (static for SSR, randomized client-side)
    const [spotsLeft, setSpotsLeft] = useState(5);
    useEffect(() => {
        // Initialize randomized spots on client to avoid hydration mismatch
        // Wrapping in a microtask to avoid synchronous setState warning
        const timer = setTimeout(() => {
            setSpotsLeft(Math.floor(Math.random() * 4) + 3); // 3-6 spots
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const TRANSLATIONS = {
        en: {
            heroHeadline: "Every Missed Call Is a Lost Customer. We Get Them Back.",
            heroTypewriterPrefix: "Built for ",
            heroLossAversion: "Right now, your business is leaking revenue through missed calls, slow follow-up, and leads that slip away. BioDynamX deploys neuroscience-trained AI agents that recover that money — 24/7, while you sleep.",
            heroDiagnosticGap: "Find out exactly how much you're losing. Jenny runs a live audit — free, right now, in under 60 seconds.",
            heroBadge: "🧠 World's First Neurobiology-Powered AI Platform",
            onboardingSpots: `Only ${spotsLeft} spots left today`,
            offerExpires: `Offer expires in ${countdown}`,
            buttonTalkExperts: "Find My Revenue Leaks → Free",
            buttonSub: "60 seconds. No credit card. No login. Real answers.",
            buttonHandoff: "Switching to Mark...",
            buttonHandoffSub: "Building your ROI Bridge",
            buttonJennyActive: "Jenny is Analyzing",
            buttonMarkActive: "Mark is Presenting",
            buttonInterrupt: "Tap to interrupt",
            navPricing: "Pricing",
            navFreeAudit: "Free Audit",
            navHowItWorks: "How It Works",
            navResults: "Results",
            navStartFree: "Start Free",
            statusDiagnostic: "DIAGNOSTIC IN PROGRESS",
            statusROI: "ROI ANALYSIS",
            statusHandoff: "SWITCHING AGENTS",
            statusStitch: "STITCH DESIGN ENGINE",
            jennyAnalyzing: "Jenny is analyzing your operations",
            markQuantifying: "Mark is quantifying the impact",
            preparingMark: "Preparing Mark's analysis...",
            stitchingDesign: "Creating your automated future...",
            liveIndicator: "Live",
            typewriterWords: ["Call Centers", "New Businesses", "Startups", "Med Spas", "SaaS Companies", "Medical Practices", "Real Estate Teams"],
            socialProof: [
                "💰 A dental group in Phoenix recovered $14,200/mo in missed after-hours calls",
                "🔥 A med spa in Scottsdale increased bookings 47% with AI follow-up",
                "💰 A startup in Austin cut $4,200/mo in wasted ad spend",
                "⚡ A real estate team in Miami closed 22 extra deals in 90 days",
                "📈 A dentist in LA went from 40 missed calls/month to zero",
                "📞 A call center in Dallas reduced cost-per-call from $6 to $0.25",
                "⚡ A small business in Denver went live with AI answering in 24 hours",
                "🧪 A marketing agency in NYC found and recovered $22K/mo in revenue leaks",
            ],
            justNow: "Just now",
            challengeTitle: "Think AI Can't Close Deals?",
            challengeDesc: "Jenny will qualify you, calculate your revenue leaks using your own numbers, and move toward close — before you even realize the conversation has shifted. She's live right now. Put her to the test.",
            challengeButton: "Prove Me Wrong — Talk to Jenny",
            spanishTitle: "Talk to us in Spanish",
            spanishDesc: "Test our fluency. We speak over 32 languages, but we specialize in natural, human Spanish syntax.",
            spanishButton: "Hablar en Español",
            toolStackTitle: "The BioDynamX Engineering Suite",
            toolStack: [
                "🎨 STITCH: Automated UI Designer",
                "🤖 JULES: AI Software Architect",
                "📋 LEAD HUNTER: Real-time Lead Finder",
                "📊 ROI CALC: Revenue Leak Diagnostic",
                "💬 NEURAL CHAT: AI Sales Automation",
                "📱 SOCIAL CLONER: Social Content Engine"
            ],
        },
        es: {
            heroHeadline: "Cada Llamada Perdida Es un Cliente Perdido. Nosotros los Recuperamos.",
            heroTypewriterPrefix: "Cualificado para ",
            heroLossAversion: "Ahora mismo, tu negocio está perdiendo dinero: llamadas sin contestar, seguimientos lentos, prospectos que se van. BioDynamX despliega agentes de IA entrenados en neurociencia que recuperan ese dinero — 24/7, mientras duermes.",
            heroDiagnosticGap: "Descubre exactamente cuánto estás perdiendo. Jenny hace una auditoría en vivo — gratis, ahora mismo, en menos de 60 segundos.",
            heroBadge: "🧠 Impulsado por Neurociencia y Neuromarketing",
            onboardingSpots: `Solo quedan ${spotsLeft} plazas hoy`,
            offerExpires: `La oferta expira en ${countdown}`,
            buttonTalkExperts: "Hablar con Jenny — Gratis",
            buttonSub: "60 segundos. Sin tarjeta. Ella encontrará tu oportunidad.",
            buttonHandoff: "Cambiando a Mark...",
            buttonHandoffSub: "Construyendo su puente de ROI",
            buttonJennyActive: "Jenny está analizando",
            buttonMarkActive: "Mark está presentando",
            buttonInterrupt: "Toca para interrumpir",
            navPricing: "Precios",
            navFreeAudit: "Auditoría Gratis",
            navHowItWorks: "Cómo funciona",
            navResults: "Resultados",
            navStartFree: "Empezar Gratis",
            statusDiagnostic: "DIAGNÓSTICO EN CURSO",
            statusROI: "ANÁLISIS DE ROI",
            statusHandoff: "CAMBIANDO DE AGENTE",
            statusStitch: "MOTOR DE DISEÑO",
            jennyAnalyzing: "Jenny está analizando sus operaciones",
            markQuantifying: "Mark está cuantificando el impacto",
            preparingMark: "Preparando el análisis de Mark...",
            stitchingDesign: "Creando su futuro automatizado...",
            liveIndicator: "En vivo",
            typewriterWords: ["Centros de Llamadas", "Nuevos Negocios", "Startups", "Med Spas", "Empresas SaaS", "Consultorios", "Inmobiliarias"],
            socialProof: [
                "💰 Un grupo dental en Phoenix recuperó $14,200/mes en llamadas perdidas",
                "🔥 Un centro de estética en Scottsdale aumentó reservas 47% con seguimiento IA",
                "💰 Una startup en Austin redujo $4,200/mes en gasto publicitario desperdiciado",
                "⚡ Un equipo inmobiliario en Miami cerró 22 tratos adicionales en 90 días",
                "📈 Un dentista en LA pasó de 40 llamadas perdidas/mes a cero",
                "📞 Un centro de llamadas en Dallas redujo costo por llamada de $6 a $0.25",
                "⚡ Una pequeña empresa en Denver activó IA para contestar en 24 horas",
                "🧪 Una agencia en Nueva York encontró y recuperó $22,000/mes en fugas",
            ],
            justNow: "Ahora mismo",
            challengeTitle: "El Desafío IA",
            challengeDesc: "La mayoría no puede distinguir dónde termina el humano y comienza la IA. Habla con Jenny ahora mismo y mira si puede encontrar tus fugas de ingresos.",
            challengeButton: "Empezar el Desafío",
            spanishTitle: "Háblanos en Español",
            spanishDesc: "Prueba nuestra fluidez. Hablamos más de 32 idiomas, pero nos especializamos en español natural y humano.",
            spanishButton: "Hablar ahora",
            toolStackTitle: "BioDynamX Engineering Suite",
            toolStack: [
                "🎨 STITCH: Diseñador UI Automático",
                "🤖 JULES: Arquitecto de IA",
                "📋 LEAD HUNTER: Buscador de Prospectos",
                "📊 ROI CALC: Diagnóstico de Fugas",
                "💬 NEURAL CHAT: Automatización de Ventas",
                "📱 SOCIAL CLONER: Motor de Redes Sociales"
            ],
        }
    };

    const t = TRANSLATIONS[language];


    // ─── Typewriter Effect ───────────────────────────────────
    const [typewriterIndex, setTypewriterIndex] = useState(0);
    const [typewriterText, setTypewriterText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    useEffect(() => {
        const word = t.typewriterWords[typewriterIndex];
        const speed = isDeleting ? 40 : 80;
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setTypewriterText(word.slice(0, typewriterText.length + 1));
                if (typewriterText.length + 1 === word.length) {
                    setTimeout(() => setIsDeleting(true), 1800);
                }
            } else {
                setTypewriterText(word.slice(0, typewriterText.length - 1));
                if (typewriterText.length - 1 === 0) {
                    setIsDeleting(false);
                    setTypewriterIndex((i) => (i + 1) % t.typewriterWords.length);
                }
            }
        }, speed);
        return () => clearTimeout(timeout);
    }, [typewriterText, isDeleting, typewriterIndex, t.typewriterWords]);

    // ─── Social Proof Toast ──────────────────────────────────
    const [toast, setToast] = useState<string | null>(null);
    const toastIndexRef = useRef(0);
    useEffect(() => {
        const show = () => {
            const msg = t.socialProof[toastIndexRef.current % t.socialProof.length];
            toastIndexRef.current++;
            setToast(msg);
            setTimeout(() => setToast(null), 4000);
        };
        const initial = setTimeout(show, 6000);
        const interval = setInterval(show, 15000);
        return () => { clearTimeout(initial); clearInterval(interval); };
    }, [t.socialProof]);

    // ─── Scroll Reveal Refs ──────────────────────────────────
    const [howItWorksRef, howItWorksVisible] = useScrollReveal();
    const [resultsStripRef, resultsStripVisible] = useScrollReveal();
    const [authoritySectionRef, authoritySectionVisible] = useScrollReveal();
    const [aiTeamRef, aiTeamVisible] = useScrollReveal();
    const [auditCtaRef, auditCtaVisible] = useScrollReveal();
    const [finalCtaRef, finalCtaVisible] = useScrollReveal();
    const [neuroScienceRef, neuroScienceVisible] = useScrollReveal();

    // ─── Lead Capture Modal ──────────────────────────────────
    const [showLeadModal, setShowLeadModal] = useState(false);

    // ─── Team Orchestrator ───────────────────────────────────

    const createTeam = useCallback(() => {
        return new TeamOrchestrator(apiKey!, {
            onPhaseChange: (p, v) => { setPhase(p); setVisual(v); },
            onStatusChange: () => { },
            onSpeakerChange: () => { },
            onAuditRequested: (url) => {
                console.log(`[VaultUI] 🔍 Tracking audit: ${url}`);
            },
            onStitchRequested: (prompt) => {
                console.log(`[VaultUI] 🎨 Stitching design: ${prompt}`);
            },
            onIntentDetected: (intent) => {
                console.log("[VaultUI] Voice Intent Detected:", intent);
                if (intent === "capture_lead" || intent === "schedule_appointment" || intent === "escalate") {
                    setShowLeadModal(true);
                }
            },
            onTranscript: () => { },
            onError: (error) => { setErrorText(error); },
            onAnalyserReady: () => { },
        }, language);
    }, [apiKey, language]);

    const handleStart = useCallback(() => {
        // Scroll to top so user sees the active session UI
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (teamRef.current) {
            teamRef.current.bargeIn();
            return;
        }
        if (!apiKey) {
            setErrorText("API key missing");
            return;
        }

        setErrorText(null);
        const team = createTeam();
        teamRef.current = team;
        team.initialize();
    }, [apiKey, createTeam]);

    const handleStartMark = useCallback(() => {
        // Scroll to top so user sees the active session UI
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (teamRef.current) {
            teamRef.current.initializeWithMark();
            return;
        }
        if (!apiKey) {
            setErrorText("API key missing");
            return;
        }

        setErrorText(null);
        const team = createTeam();
        teamRef.current = team;
        team.initializeWithMark();
    }, [apiKey, createTeam]);

    // ─── Spanish CTA Handler ─────────────────────────────────
    // Creates a fresh TeamOrchestrator with language="es" directly,
    // bypassing the stale closure from setLanguage + handleStart.
    const handleStartSpanish = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (teamRef.current) {
            teamRef.current.bargeIn();
            return;
        }
        if (!apiKey) {
            setErrorText("API key missing");
            return;
        }

        setLanguage("es"); // Update UI to Spanish
        setErrorText(null);

        const team = new TeamOrchestrator(apiKey!, {
            onPhaseChange: (p, v) => { setPhase(p); setVisual(v); },
            onStatusChange: () => { },
            onSpeakerChange: () => { },
            onAuditRequested: (url) => {
                console.log(`[VaultUI] 🔍 Tracking audit: ${url}`);
            },
            onStitchRequested: (prompt) => {
                console.log(`[VaultUI] 🎨 Stitching design: ${prompt}`);
            },
            onIntentDetected: (intent) => {
                console.log("[VaultUI] Voice Intent Detected:", intent);
                if (intent === "capture_lead" || intent === "schedule_appointment" || intent === "escalate") {
                    setShowLeadModal(true);
                }
            },
            onTranscript: () => { },
            onError: (error) => { setErrorText(error); },
            onAnalyserReady: () => { },
        }, "es"); // ★ Hardcoded Spanish

        teamRef.current = team;
        team.initialize();
    }, [apiKey]);

    // ─── Derived State ──────────────────────────────────────

    const isActive = phase !== "standby";
    const isHandoff = phase === "handoff";
    const agentName = visual.activeAgentName;

    // Button label — Jobs would make it personal
    // Button label — Expert, not just salesy
    let buttonLabel = t.buttonTalkExperts;
    let buttonSub = t.buttonSub;
    if (isHandoff) {
        buttonLabel = t.buttonHandoff;
        buttonSub = t.buttonHandoffSub;
    } else if (phase === "jenny_active") {
        buttonLabel = t.buttonJennyActive;
        buttonSub = t.buttonInterrupt;
    } else if (phase === "mark_active") {
        buttonLabel = t.buttonMarkActive;
        buttonSub = t.buttonInterrupt;
    }

    // ─── Render ─────────────────────────────────────────────

    return (
        <div className={`vault-container ${isActive ? 'active' : ''}`}>
            {/* ── Scroll Progress Bar ──────────────────────── */}
            {!isActive && (
                <div
                    className="scroll-progress-bar"
                    style={{ '--scroll-width': `${scrollProgress * 100}%` } as React.CSSProperties}
                />
            )}

            {/* ── Social Proof Toast ──────────────────────── */}
            {toast && !isActive && (
                <div className="social-toast">
                    <div className="toast-indicator" />
                    <div className="toast-content">
                        <div className="toast-title">{toast}</div>
                        <div className="toast-time">{t.justNow}</div>
                    </div>
                </div>
            )}
            {/* Cinematic particle background */}
            <div className="particle-overlay">
                <CinematicCanvas
                    isActive={isActive}
                    intensity={isActive ? (phase === "mark_active" ? 0.8 : 0.5) : 0.15}
                />
            </div>

            {/* ── Nav ──────────────────────────────────────── */}
            <nav className="nav-bar">
                <div className="nav-brand">
                    <AnimatedLogo size={32} />
                    <div>
                        <div className="brand-title">BioDynamX</div>
                        <div className="brand-tagline">Engineering Group</div>
                    </div>
                </div>

                <div className="nav-actions">
                    {/* Nav links — visible in standby, hidden on mobile (shown in mobile-nav-row) */}
                    {!isActive && (
                        <div className="nav-links-desktop">
                            {[
                                { label: t.navPricing, href: "/pricing" },
                                { label: t.navFreeAudit, href: "/audit" },
                                { label: t.navHowItWorks, href: "#how-it-works" },
                                { label: t.navResults, href: "#results" },
                                { label: "Blog", href: "/blog" },
                                { label: "About", href: "/about" },
                            ].map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="nav-item"
                                >{link.label}</a>
                            ))}
                        </div>
                    )}

                    {/* Live agent indicator */}
                    {isActive && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 14px",
                            background: "rgba(0,255,65,0.08)",
                            border: "1px solid rgba(0,255,65,0.2)",
                            borderRadius: 100,
                            transition: "all 0.5s ease",
                        }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: "#00ff41",
                                boxShadow: "0 0 8px #00ff41",
                                animation: "pulse 2s ease-in-out infinite",
                            }} />
                            <span style={{
                                fontSize: 11, fontWeight: 600,
                                color: "#00ff41", letterSpacing: "0.05em",
                            }}>
                                {agentName} • Live
                            </span>
                        </div>
                    )}

                    {/* ── Lang toggle: ALWAYS visible, no media-query hiding ── */}
                    {!isActive && (
                        <button className="lang-toggle-btn" onClick={() => setLanguage(l => l === "en" ? "es" : "en")}>
                            🌐 {language === "en" ? "ESP" : "ENG"}
                        </button>
                    )}

                    {/* Start Free — hidden on mobile via CSS, shown in sticky row below instead */}
                    {!isActive && (
                        <button onClick={handleStart} className="nav-start-free-desktop">
                            {t.navStartFree}
                        </button>
                    )}
                </div>
            </nav>

            {/* ── Mobile Start Free sticky row — shown below nav on mobile only ── */}
            {!isActive && (
                <div className="mobile-start-free-row">
                    <button onClick={handleStart} className="mobile-start-free-btn">
                        {t.navStartFree} →
                    </button>
                </div>
            )}

            {/* ── Lead Capture Modal ─────────────────────────── */}
            <LeadCaptureModal
                isOpen={showLeadModal}
                onClose={() => setShowLeadModal(false)}
                source="homepage"
            />

            {/* ── Hero Section ────────────────────────────── */}
            <section className="hero-container" style={{
                minHeight: isActive ? "calc(100vh - 60px)" : "90vh",
            }}>
                {/* Headline — only show when standby */}
                {!isActive && (
                    <div style={{
                        textAlign: "center", marginBottom: 32,
                        animation: "fadeUp 0.8s ease-out",
                    }}>
                        {/* Neuroscience Badge — immediately visible */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 16px',
                            background: 'rgba(139,92,246,0.12)',
                            border: '1px solid rgba(139,92,246,0.25)',
                            borderRadius: 100,
                            fontSize: 12, fontWeight: 700,
                            color: '#a78bfa',
                            letterSpacing: '0.04em',
                            marginBottom: 16,
                            animation: 'pulse 3s ease-in-out infinite',
                        }}>
                            {t.heroBadge}
                        </div>
                        <h1 data-speakable="true" className="hero-headline animated-gradient-text">
                            {t.heroHeadline}
                        </h1>
                        {/* Typewriter — cycles target audiences */}
                        <div style={{
                            fontSize: "clamp(14px, 1.6vw, 17px)",
                            color: "rgba(255,255,255,0.5)",
                            marginBottom: 8,
                            height: 24,
                            fontWeight: 500,
                        }}>
                            {t.heroTypewriterPrefix}
                            <span style={{ color: "#3b82f6", fontWeight: 700 }}>{typewriterText}</span>
                            <span className="cursor-blink">|</span>
                        </div>
                        {/* F2: Loss Aversion — quantify what they're LOSING */}
                        <p data-speakable="true" className="hero-subheadline">
                            {t.heroLossAversion}<br />
                            <span style={{ color: "rgba(255,255,255,0.85)" }}>{t.heroDiagnosticGap}</span>
                        </p>
                        {/* F2: Scarcity — countdown + spots remaining */}
                        <div className="fomo-container">
                            <div className="scarcity-pill">
                                <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>🔴</span>
                                {t.onboardingSpots}
                            </div>
                            <div className="expiry-pill">
                                ⏳ {t.offerExpires}
                            </div>
                        </div>
                    </div>
                )}

                {/* Agent status when active */}
                {isActive && (
                    <div style={{
                        textAlign: "center", marginBottom: 32,
                        animation: "fadeUp 0.5s ease-out",
                    }}>
                        <div style={{
                            fontSize: 12, fontWeight: 600,
                            color: "rgba(255,255,255,0.3)",
                            letterSpacing: "0.1em",
                            marginBottom: 10,
                            textTransform: "uppercase",
                        }}>
                            {phase === "jenny_active" && t.statusDiagnostic}
                            {phase === "mark_active" && t.statusROI}
                            {phase === "handoff" && t.statusHandoff}
                            {phase === "stitching" && t.statusStitch}
                        </div>
                        <div style={{
                            fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700,
                            color: "#fff",
                            letterSpacing: "-0.02em",
                        }}>
                            {agentName === "Jenny" && t.jennyAnalyzing}
                            {agentName === "Mark" && t.markQuantifying}
                            {isHandoff && t.preparingMark}
                            {phase === "stitching" && t.stitchingDesign}
                            {phase === "checkout" && t.toolStackTitle}
                        </div>

                        {phase === "checkout" && (
                            <div className="tool-stack-list animate-fade-in" style={{ marginTop: 24 }}>
                                {t.toolStack.map((tool: string, i: number) => (
                                    <div key={i} className="tool-stack-item">
                                        {tool}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── THE BUTTON ── */}
                <div style={{ position: "relative", marginBottom: 8 }}>
                    {!isActive && (
                        <div style={{
                            position: "absolute",
                            inset: -8,
                            borderRadius: 20,
                            background: "radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)",
                            animation: "breathe 3s ease-in-out infinite",
                            pointerEvents: "none",
                        }} />
                    )}
                    <button
                        onClick={handleStart}
                        disabled={isHandoff}
                        style={{
                            position: "relative",
                            background: isActive
                                ? "rgba(0,255,65,0.05)"
                                : "linear-gradient(135deg, #00ff41 0%, #00cc33 100%)",
                            border: isActive ? "1px solid rgba(0,255,65,0.3)" : "none",
                            color: isActive ? "#00ff41" : "#000",
                            padding: isActive ? "16px 40px" : "20px 56px",
                            fontSize: isActive ? 14 : 18,
                            fontWeight: 800,
                            fontFamily: "inherit",
                            borderRadius: 14,
                            cursor: isHandoff ? "wait" : "pointer",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: isActive
                                ? "0 0 40px rgba(0,255,65,0.1)"
                                : "0 4px 40px rgba(0,255,65,0.35), 0 0 120px rgba(0,255,65,0.12)",
                            transform: isActive ? "scale(0.95)" : "scale(1)",
                            letterSpacing: "-0.01em",
                            opacity: isHandoff ? 0.5 : 1,
                        }}
                    >
                        {buttonLabel}
                    </button>
                </div>

                {/* Sub-label with friction reducer (Framework 4) */}
                <p style={{
                    fontSize: 13, marginTop: 8,
                    color: errorText ? "#ff4444" : "rgba(255,255,255,0.85)",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                }}>
                    {errorText || buttonSub}
                </p>
                {/* F4: Friction reducer badges */}
                {!isActive && (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 16, marginTop: 10, flexWrap: "wrap",
                    }}>
                        {["No credit card", "No login required", "Results in 60s"].map((badge) => (
                            <span key={badge} style={{
                                fontSize: 11, fontWeight: 700,
                                color: "rgba(255,255,255,0.88)",
                                display: "flex", alignItems: "center", gap: 5,
                            }}>
                                <span style={{ color: "#00ff41", fontSize: 13, fontWeight: 900 }}>✓</span>
                                {badge}
                            </span>
                        ))}
                    </div>
                )}

                {/* ── Social Proof ── */}
                {!isActive && (
                    <div style={{
                        marginTop: 40,
                        animation: "fadeUp 1.2s ease-out",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 24,
                    }}>
                        {/* Live recovery counter */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: "#00ff41",
                                animation: "pulse 1.5s ease-in-out infinite",
                            }} />
                            <span style={{
                                fontSize: 13, fontWeight: 600,
                                color: "rgba(255,255,255,0.7)",
                                letterSpacing: "0.02em",
                            }}>
                                <span style={{ color: "#00ff41", fontWeight: 700 }}>$2.4M+</span>
                                {" "}recovered for our partners this quarter
                            </span>
                        </div>

                        {/* Condensed trust — three numbers (responsive grid) */}
                        <div className="hero-stats-row">
                            {[
                                { val: "4,000+", label: "Partners" },
                                { val: "$18k", label: "Avg Recovery" },
                                { val: "6x", label: "ROI Guarantee" },
                            ].map((stat, i) => (
                                <div key={i} className="hero-stat-item">
                                    <span className="hero-stat-val">{stat.val}</span>
                                    <span className="hero-stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Scroll indicator */}
                        <div style={{
                            marginTop: 16,
                            animation: "scrollBounce 2s ease-in-out infinite",
                            opacity: 0.4,
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#fff" }}>
                                <path d="M7 13l5 5 5-5M7 7l5 5 5-5" />
                            </svg>
                        </div>
                    </div>
                )}
            </section>


            {/* ═══════════════════════════════════════════════════════════ */}
            {/* BELOW THE FOLD                                            */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {/* ── Trusted By — Animated Ticker ───────────── */}
            <div className="ticker-wrapper">
                <div className="section-label" style={{ marginBottom: 18 }}>Trusted By Industry Leaders</div>
                {/* fade edges so cut-off items look intentional */}
                <div className="ticker-fade-left" />
                <div className="ticker-fade-right" />
                <div className="ticker-track">
                    {[0, 1].map((copy) => (
                        <div key={copy} className="ticker-slide" aria-hidden={copy === 1 ? "true" : undefined}>
                            {[
                                "Google", "NVIDIA", "Microsoft", "Amazon", "Sony",
                                "Stripe", "Twilio", "Firebase", "Google Cloud",
                                "Gemini", "OpenAI", "Salesforce", "HubSpot", "Meta",
                            ].map((name, i) => (
                                <span key={`${copy}-${name}`} className="ticker-item-wrap">
                                    {i > 0 && <span className="ticker-dot" />}
                                    <span
                                        className="ticker-name"
                                        onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = ""; }}
                                    >{name}</span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 3D Service Ecosystem — WOW factor ────────── */}
            {!isActive && (
                <section className="section-container orbit-section" style={{
                    background: "linear-gradient(180deg, rgba(0,255,65,0.01) 0%, transparent 50%, rgba(59,130,246,0.01) 100%)",
                    paddingTop: 80,
                    paddingBottom: 80,
                    overflow: "visible",
                }}>
                    <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
                        <div className="section-label" style={{ color: "#3b82f6" }}>Full-Stack AI Infrastructure</div>
                        <h2 className="section-title">
                            Not just agents. <span style={{ color: "#00ff41" }}>An entire AI workforce.</span>
                        </h2>
                        <p className="section-desc" style={{ maxWidth: 600, margin: "0 auto 40px" }}>
                            We don&apos;t sell software. We build the AI engine behind your business —
                            voice agents, custom software, video production, SEO domination, reputation management,
                            and AI employees that work 24/7. Everything from A to Z, under one roof.
                        </p>
                        <OrbitEcosystem />
                        <p style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,0.4)",
                            marginTop: 32,
                            fontWeight: 500,
                        }}>
                            We build custom software. We&apos;re not just another AI vendor.
                        </p>
                    </div>
                </section>
            )}

            <section id="how-it-works" ref={howItWorksRef} aria-label="The BioDynamX Diagnostic Framework" className="section-container" style={{
                opacity: howItWorksVisible ? 1 : 0,
                transform: howItWorksVisible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            }}>
                <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label">How It Works</div>
                    <h2 data-speakable="true" className="section-title">
                        Your Customer&apos;s Brain Has 3 Layers.<br />
                        <span style={{ color: "#00ff41" }}>We Have an Agent for Each One.</span>
                    </h2>
                    <p className="section-desc">
                        The Reptilian Brain responds to threats and survival. The Limbic Brain decides based on emotion. The Neocortex justifies with logic. Our AI agents speak to all three — in the right order, every time.
                    </p>

                    <div className="grid-responsive">
                        {[
                            {
                                step: "01",
                                icon: "🎯",
                                title: "Jenny Finds the Leak",
                                desc: "Jenny runs a live revenue audit on your business — in real-time, on this call. Using your own numbers, she calculates exactly how much you're losing to missed calls, slow follow-up, and unqualified leads. The Reptilian Brain sees the threat. The bleeding stops here.",
                                color: "#8b5cf6",
                            },
                            {
                                step: "02",
                                icon: "💰",
                                title: "Mark Makes the ROI Undeniable",
                                desc: "Mark takes what Jenny found and turns it into a financial plan your brain can't argue with. Hard numbers. Real ROI. Your specific situation. The Neocortex gets the data it needs to say yes — while the Limbic Brain is already sold.",
                                color: "#3b82f6",
                            },
                            {
                                step: "03",
                                icon: "🚀",
                                title: "Go Live in 24 Hours",
                                desc: "Your neuroscience-trained AI team goes live in 24 hours. Every call answered in under 1 second. Every lead qualified. Every appointment booked. Revenue recovered while you sleep. This is what BioDynamX does — every single day.",
                                color: "#ffa726",
                            },
                        ].map((item) => (
                            <div key={item.step} className="standard-card"
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = `${item.color}33`;
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    marginBottom: 14,
                                }}>
                                    <span style={{ fontSize: 28 }}>{item.icon}</span>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700,
                                        color: item.color,
                                        letterSpacing: "0.1em",
                                    }}>STEP {item.step}</span>
                                </div>
                                <h3 style={{
                                    fontSize: 22, fontWeight: 700, color: "#fff",
                                    margin: "0 0 8px", letterSpacing: "-0.02em",
                                }}>{item.title}</h3>
                                <p style={{
                                    fontSize: 14, color: "rgba(255,255,255,0.65)",
                                    lineHeight: 1.6, margin: 0,
                                }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Humanity Challenge CTA */}
                    {!isActive && (
                        <div style={{
                            marginTop: 60,
                            padding: "40px 32px",
                            background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 24,
                            textAlign: "center",
                        }}>
                            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.02em" }}>{t.challengeTitle}</h3>
                            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24, maxWidth: 560, margin: "0 auto 28px", lineHeight: 1.6, fontSize: 15 }}>
                                {t.challengeDesc}
                            </p>
                            <button
                                onClick={handleStart}
                                style={{
                                    padding: "16px 36px",
                                    background: "#fff",
                                    color: "#000",
                                    fontWeight: 800,
                                    borderRadius: 100,
                                    border: "none",
                                    fontSize: 15,
                                    cursor: "pointer",
                                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                    boxShadow: "0 10px 30px rgba(255,255,255,0.1)",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 15px 40px rgba(255,255,255,0.2)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,255,255,0.1)"; }}
                            >
                                {t.challengeButton}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section id="results" ref={resultsStripRef} aria-label="BioDynamX Proven Results and Statistics" style={{
                position: "relative", zIndex: 10,
                padding: "60px 32px",
                background: "linear-gradient(180deg, rgba(59,130,246,0.02) 0%, transparent 100%)",
                borderTop: "1px solid rgba(59,130,246,0.12)",
                borderBottom: "1px solid rgba(59,130,246,0.12)",
                opacity: resultsStripVisible ? 1 : 0,
                transform: resultsStripVisible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.8s ease-out 0.1s, transform 0.8s ease-out 0.1s",
            }}>
                <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
                    <div style={{
                        fontSize: 10, fontWeight: 700, color: "#3b82f6",
                        letterSpacing: "0.15em", textTransform: "uppercase",
                        marginBottom: 12,
                    }}>Proven Results</div>
                    <h2 data-speakable="true" style={{
                        fontSize: "clamp(22px, 3vw, 32px)",
                        fontWeight: 800, color: "#fff",
                        letterSpacing: "-0.03em",
                        margin: "0 0 40px",
                    }}>
                        Numbers don&apos;t lie. Neither do our AI partners.
                    </h2>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: 20,
                    }}>
                        {[
                            { val: 2.4, suffix: "M+", label: "Partner Revenue Recovered", sub: "This quarter alone" },
                            { val: 8, suffix: " sec", label: "Response Time", sub: "vs. 14 hr industry avg" },
                            { val: 73, suffix: "%", label: "Error Reduction", sub: "In lead qualification" },
                            { val: 6300, suffix: "x", label: "Faster Processing", sub: "Lead response speed" },
                            { val: 2, suffix: "x", label: "ROI Guaranteed", sub: "Or your money back" },
                            { val: 7500, suffix: "+", label: "Avg Annual Savings", sub: "Median small business" },
                            { val: 35, suffix: " days", label: "Scheduling Time Freed", sub: "Per year, per organization" },
                            { val: 85, suffix: "%", label: "Cost Reduction", sub: "$0.25/call vs $6 human" },
                        ].map((stat, i) => {
                            // Using the useCountUp hook for animation
                            return (
                                <StatItem key={i} stat={stat} isVisible={resultsStripVisible} />
                            );
                        })}
                    </div>
                </div>
            </section>

            <section ref={authoritySectionRef} aria-label="Meet the Founder Billy De La Taurus" className="section-container" style={{
                background: "linear-gradient(180deg, rgba(59,130,246,0.02) 0%, transparent 100%)",
                opacity: authoritySectionVisible ? 1 : 0,
                transform: authoritySectionVisible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            }}>
                <div style={{ maxWidth: 900, margin: "0 auto" }}>
                    <div className="section-label">LEADERSHIP</div>
                    <h2 className="section-title" style={{ margin: "0 0 48px" }}>
                        Built by an author. <span style={{ color: "#3b82f6" }}>Backed by a community.</span>
                    </h2>

                    <div className="grid-2-col-responsive">
                        {/* ── Left: Founder Card ── */}
                        <div className="standard-card">
                            {/* Founder Avatar + Name */}
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                                <a href="https://www.facebook.com/mmapresident" target="_blank" rel="noopener noreferrer" aria-label="Billy De La Taurus on Facebook">
                                    <div style={{ position: "relative", width: 64, height: 64 }}>
                                        <Image
                                            src="/billy-headshot.png"
                                            alt="Billy De La Taurus — Founder & CEO of BioDynamX"
                                            fill
                                            style={{
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                border: "2px solid rgba(59,130,246,0.4)",
                                                boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
                                            }}
                                            className="founder-avatar"
                                        />
                                    </div>
                                </a>
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                                        Billy De La Taurus
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}>
                                        Founder & CEO
                                    </div>
                                </div>
                            </div>

                            <p style={{
                                fontSize: 14, color: "rgba(255,255,255,0.6)",
                                lineHeight: 1.7, margin: "0 0 24px",
                            }}>
                                2x Amazon best-selling author in AI & Business. Billy founded BioDynamX to merge
                                **The Neurobiology of Choice** with enterprise-grade engineering. We don&apos;t just build bots;
                                we architect **Persuasive Design** systems that eliminate choice paralysis and scale revenue.
                            </p>

                            {/* Social Links */}
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <a href="https://www.linkedin.com/in/billy-delataurus-biodynamx" target="_blank" rel="noopener noreferrer" className="social-pill-link">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    LinkedIn
                                </a>
                                <a href="https://www.facebook.com/mmapresident" target="_blank" rel="noopener noreferrer" className="social-pill-link">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    Community
                                </a>
                                <a href="https://a.co/d/04GCeRAh" target="_blank" rel="noopener noreferrer" className="social-pill-link-alt">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.045 18.02c.071-.116.187-.124.348-.022 2.312 1.568 4.898 2.352 7.757 2.352 1.838 0 3.593-.353 5.268-1.06 1.673-.706 3.155-1.699 4.445-2.977.107-.107.178-.075.213.1.024.155-.008.285-.1.392C16.15 18.908 13.685 20 10.792 20c-2.86 0-5.39-.671-7.59-2.012-.198-.123-.275-.063-.234.18l.077.164c.063.09.139.177.228.26C5.59 20.627 8.086 21.5 10.92 21.5c2.837 0 5.258-.782 7.264-2.345l.102-.082.128-.084c.05-.034.1-.068.148-.103.16-.117.24-.068.24.15 0 .095-.028.192-.086.29C16.588 21.77 13.86 23 10.792 23c-3.06 0-5.62-.852-7.678-2.556-.12-.1-.187-.08-.2.06l-.008.108c0 .164.04.282.12.355C5.26 22.989 7.854 24 10.792 24c3.342 0 6.18-1.075 8.512-3.223.134-.12.218-.09.252.087.016.084-.004.184-.06.3-.16.34-.47.68-.934 1.017C16.336 23.808 13.694 25 10.744 25 7.296 25 4.198 23.655 1.45 20.967.486 20 .123 18.855.045 18.02zM21.768 16.127c.108-.053.2-.034.273.056l.053.073c.27.498.306.898.108 1.2-.395.6-1.555.9-3.48.9h-.24c-.468-.009-.97-.078-1.504-.206l-.168-.042c-.233-.066-.383-.03-.447.107l-.037.085c-.11.34.076.622.56.848 1.012.47 2.035.643 3.07.516.8-.096 1.35-.38 1.655-.852.065-.1.198-.105.4-.013.16.073.24.17.24.295 0 .11-.06.224-.178.347-.7.732-1.76 1.1-3.178 1.1-1.434 0-2.57-.4-3.406-1.2-.276-.265-.367-.592-.273-.983.035-.148.14-.237.313-.267z" /></svg>
                                    Books
                                </a>
                            </div>
                        </div>

                        {/* ── Right: Books + Community Cards ── */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Amazon Best-Seller Books (Condensed) */}
                            <a href="https://a.co/d/04GCeRAh" target="_blank" rel="noopener noreferrer" className="book-card">
                                <div style={{ fontSize: 24 }}>📘</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: "#ffa726", letterSpacing: "0.12em" }}>#1 BEST-SELLER</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>The AI Business Revolution</div>
                                </div>
                            </a>

                            {/* Community Card */}
                            <a href="https://www.facebook.com/mmapresident" target="_blank" rel="noopener noreferrer" className="partner-community-card">
                                <div style={{ fontSize: 24 }}>👥</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: "#00ff41", letterSpacing: "0.12em" }}>COMMUNITY</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>4,000+ Business Owners</div>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Spanish Fluency CTA */}
                    {!isActive && (
                        <div className="spanish-cta">
                            <div style={{ flex: "2 1 300px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 20 }}>🇲🇽</span>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0 }}>¿Hablas Español?</h3>
                                </div>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                                    Our AI agents are completely bilingual.
                                </p>
                            </div>
                            <button onClick={handleStartSpanish} className="spanish-cta-btn">
                                Talk in Spanish →
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section ref={aiTeamRef} aria-label="Meet Your AI Team Jenny and Mark" className="section-container" style={{
                opacity: aiTeamVisible ? 1 : 0,
                transform: aiTeamVisible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label" style={{ color: "#a78bfa" }}>Vertex AI &middot; Gemini 2.5 Flash Native Audio &middot; Live Voice</div>
                    <h2 className="section-title">
                        Five specialists. Five brain regions.{" "}
                        <span style={{ color: "#00ff41" }}>One mission: revenue.</span>
                    </h2>
                    <p className="section-desc" style={{ maxWidth: 640, margin: "0 auto 48px" }}>
                        Each agent is engineered to speak to a specific layer of the human brain — Reptilian,
                        Limbic, or Neocortex. Click any card and talk to them live, right now. No login. No credit card.
                        Just watch what neuroscience-trained AI sounds like.
                    </p>

                    <div className="agent-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>

                        {/* Aria */}
                        <div className="agent-card agent-card-aria">
                            <div className="agent-photo-wrap">
                                <img src="/agents/aria.png" alt="Meghan — BioDynamX AI Receptionist" className="agent-photo" width={80} height={80} />
                                <div className="agent-live-dot" style={{ background: "#a78bfa" }} />
                            </div>
                            <div className="agent-name" style={{ color: "#a78bfa" }}>Meghan</div>
                            <div className="agent-role" style={{ color: "#a78bfa" }}>Inbound Receptionist</div>
                            <div className="agent-showcase-chips">
                                <span className="agent-chip">&#127908; Sadaltager</span>
                                <span className="agent-chip">&#129504; Cognitive Ease &middot; Warm Routing</span>
                            </div>
                            <p className="agent-desc">Never lose another lead at hello. Meghan answers every inbound call in under 1 second, 24/7 — and routes them to the right specialist before they hang up and call your competitor.</p>
                            <div className="agent-flow" style={{ color: "#a78bfa" }}>
                                <span style={{ opacity: 0.5 }}>RESULT: </span>
                                <span>Every call answered. Zero leads lost at the door.</span>
                            </div>
                            <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); if (teamRef.current) { teamRef.current.bargeIn(); return; } if (!apiKey) { setErrorText("API key missing"); return; } setErrorText(null); const t = createTeam(); teamRef.current = t; t.initializeWithAgent("aria_receptionist"); }} className="agent-cta agent-cta-aria">TALK TO MEGHAN &rarr;</button>
                        </div>

                        {/* Jenny */}
                        <div className="agent-card agent-card-jenny">
                            <div className="agent-photo-wrap">
                                <img src="/agents/jenny.png" alt="Jenny — BioDynamX AI Consultant" className="agent-photo" width={80} height={80} />
                                <div className="agent-live-dot" style={{ background: "#00ff41" }} />
                            </div>
                            <div className="agent-name" style={{ color: "#00ff41" }}>Jenny</div>
                            <div className="agent-role" style={{ color: "#00ff41" }}>Discovery &amp; Revenue Audit</div>
                            <div className="agent-showcase-chips">
                                <span className="agent-chip">&#127908; Laomedeia</span>
                                <span className="agent-chip">&#129504; Limbic Resonance &middot; Empathy</span>
                            </div>
                            <p className="agent-desc">Jenny speaks to the limbic system, not the ego. She finds your exact revenue leak in 60 seconds and makes you feel understood doing it.</p>
                            <div className="agent-flow" style={{ color: "#00ff41" }}>
                                <span style={{ opacity: 0.5 }}>RESULT: </span>
                                <span>Your revenue gap &mdash; quantified and felt.</span>
                            </div>
                            <button onClick={handleStart} className="agent-cta agent-cta-jenny">TALK TO JENNY &rarr;</button>
                        </div>

                        {/* Mark */}
                        <div className="agent-card agent-card-mark">
                            <div className="agent-photo-wrap">
                                <img src="/agents/mark.png" alt="Mark — BioDynamX AI Revenue Architect" className="agent-photo" width={80} height={80} />
                                <div className="agent-live-dot" style={{ background: "#3b82f6" }} />
                            </div>
                            <div className="agent-name" style={{ color: "#3b82f6" }}>Mark</div>
                            <div className="agent-role" style={{ color: "#3b82f6" }}>ROI Closer &amp; Architect</div>
                            <div className="agent-showcase-chips">
                                <span className="agent-chip">&#127908; Fenrir</span>
                                <span className="agent-chip">&#129504; Neocortex &middot; Data Logic</span>
                            </div>
                            <p className="agent-desc">Mark speaks in numbers. He takes Jenny&apos;s audit and builds your ROI bridge &mdash; precise, data-driven, closes with a single binary choice.</p>
                            <div className="agent-flow" style={{ color: "#3b82f6" }}>
                                <span style={{ opacity: 0.5 }}>RESULT: </span>
                                <span>Custom ROI plan. Ready to deploy in 24 hours.</span>
                            </div>
                            <button onClick={handleStartMark} className="agent-cta agent-cta-mark">TALK TO MARK &rarr;</button>
                        </div>

                        {/* Jules */}
                        <div className="agent-card agent-card-jules">
                            <div className="agent-photo-wrap">
                                <img src="/agents/jules.png" alt="Ryan — BioDynamX AI Technical Strategist" className="agent-photo" width={80} height={80} />
                                <div className="agent-live-dot" style={{ background: "#f59e0b" }} />
                            </div>
                            <div className="agent-name" style={{ color: "#f59e0b" }}>Ryan</div>
                            <div className="agent-role" style={{ color: "#f59e0b" }}>Technical Strategy</div>
                            <div className="agent-showcase-chips">
                                <span className="agent-chip">&#127908; Algenib</span>
                                <span className="agent-chip">&#129504; Authority Frame &middot; Trust</span>
                            </div>
                            <p className="agent-desc">Jules doesn&apos;t speculate &mdash; he architects. Every word triggers the brain stem&apos;s trust center. When Jules speaks, your old brain says &ldquo;safe.&rdquo;</p>
                            <div className="agent-flow" style={{ color: "#f59e0b" }}>
                                <span style={{ opacity: 0.5 }}>RESULT: </span>
                                <span>A technical blueprint your team executes tomorrow.</span>
                            </div>
                            <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); if (teamRef.current) { teamRef.current.bargeIn(); return; } if (!apiKey) { setErrorText("API key missing"); return; } setErrorText(null); const t = createTeam(); teamRef.current = t; t.initializeWithAgent("jules_architect"); }} className="agent-cta agent-cta-jules">TALK TO RYAN &rarr;</button>
                        </div>

                        {/* Support */}
                        <div className="agent-card agent-card-support">
                            <div className="agent-photo-wrap">
                                <img src="/agents/support.png" alt="Sarah — BioDynamX AI Care Specialist" className="agent-photo" width={80} height={80} />
                                <div className="agent-live-dot" style={{ background: "#34d399" }} />
                            </div>
                            <div className="agent-name" style={{ color: "#34d399" }}>Sarah</div>
                            <div className="agent-role" style={{ color: "#34d399" }}>Empathy &amp; Care</div>
                            <div className="agent-showcase-chips">
                                <span className="agent-chip">&#127908; Achernar</span>
                                <span className="agent-chip">&#129504; Oxytocin &middot; Cortisol Reduction</span>
                            </div>
                            <p className="agent-desc">The antidote to friction. Support&apos;s presence alone lowers cortisol. Every sentence is calibrated to rebuild trust and restore total confidence.</p>
                            <div className="agent-flow" style={{ color: "#34d399" }}>
                                <span style={{ opacity: 0.5 }}>RESULT: </span>
                                <span>Clients who feel heard &mdash; and stay for life.</span>
                            </div>
                            <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); if (teamRef.current) { teamRef.current.bargeIn(); return; } if (!apiKey) { setErrorText("API key missing"); return; } setErrorText(null); const t = createTeam(); teamRef.current = t; t.initializeWithAgent("support_specialist"); }} className="agent-cta agent-cta-support">TALK TO SARAH &rarr;</button>
                        </div>

                    </div>

                    <div className="agent-showcase-footer" style={{ marginTop: 40 }}>
                        <span>&#10003; No login required</span>
                        <span>&#10003; No credit card</span>
                        <span>&#10003; Live voice in under 5 seconds</span>
                    </div>
                </div>
            </section>

            {/* ── Client Success Stories ─────────────────── */}
            <section className="section-container" style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(0,255,65,0.02) 50%, transparent 100%)",
            }}>
                <div style={{ maxWidth: 900, margin: "0 auto" }}>
                    <div className="section-label">Real Results From Real Businesses</div>
                    <h2 className="section-title">
                        Here&apos;s what happened <span style={{ color: "#00ff41" }}>after they said yes.</span>
                    </h2>

                    <div className="grid-responsive">
                        {/* Testimonial 1 — Dental */}
                        <div className="testimonial-card">
                            <div className="testimonial-stat-pill stat-pill-green">+$14,200/mo</div>
                            <div className="testimonial-quote">&ldquo;</div>
                            <p className="testimonial-text">
                                We were losing 40+ after-hours calls a month. BioDynamX&apos;s AI answers every single one,
                                books them into our calendar, and follows up with a text. Our new patient numbers jumped 34%
                                in the first month alone.
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar" style={{ background: "linear-gradient(135deg, #22c55e, #15803d)" }}>D</div>
                                <div>
                                    <div className="author-name">Dr. Mike Santana</div>
                                    <div className="author-title">7-Location Dental Group · Phoenix, AZ</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 — Call Center */}
                        <div className="testimonial-card">
                            <div className="testimonial-stat-pill stat-pill-blue">85% cost reduction</div>
                            <div className="testimonial-quote">&ldquo;</div>
                            <p className="testimonial-text">
                                I was paying $6 per call with human agents and our close rate was terrible. BioDynamX
                                handles our entire after-hours intake for $0.25/call. Close rate went from 12% to 31%.
                                I wish I&apos;d found them sooner.
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>R</div>
                                <div>
                                    <div className="author-name">Rachel Torres</div>
                                    <div className="author-title">Operations Director, PrimeConnect · Dallas, TX</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 — Real Estate */}
                        <div className="testimonial-card">
                            <div className="testimonial-stat-pill stat-pill-orange">$22K recovered</div>
                            <div className="testimonial-quote">&ldquo;</div>
                            <p className="testimonial-text">
                                Billy&apos;s team showed me I was losing $22K/month in dead leads. The AI texts back in 8 seconds
                                and books showings automatically. My team went from chasing leads to closing deals.
                                Best investment I&apos;ve made this year.
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>J</div>
                                <div>
                                    <div className="author-name">Jordan Smith</div>
                                    <div className="author-title">Principal Broker, Smith & Co. Realty · Miami, FL</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Before/After Transformation (Framework 5) ─────── */}
            <section className="section-container" style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(255,107,107,0.02) 30%, rgba(0,255,65,0.02) 70%, transparent 100%)",
            }}>
                <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label" style={{ color: "#ff6b6b" }}>The Transformation</div>
                    <h2 className="section-title">
                        This is the gap that&rsquo;s costing you <span style={{ color: "#ff6b6b" }}>$600/day.</span>
                    </h2>

                    <div className="grid-2-col-responsive" style={{ marginTop: 32, textAlign: "left" }}>
                        {/* WITHOUT */}
                        <div style={{
                            padding: 28,
                            background: "rgba(255,107,107,0.04)",
                            border: "1px solid rgba(255,107,107,0.15)",
                            borderRadius: 20,
                        }}>
                            <div style={{
                                fontSize: 11, fontWeight: 800, color: "#ff6b6b",
                                letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16,
                            }}>❌ Without BioDynamX</div>
                            {[
                                "80+ calls/month go to voicemail",
                                "Leads wait 3+ hours for a response",
                                "You respond — your competitor already closed them",
                                "After-hours calls = lost revenue",
                                "No idea which leads are serious",
                                "Revenue silently leaking every month",
                            ].map((item) => (
                                <div key={item} style={{
                                    fontSize: 13, color: "rgba(255,255,255,0.65)",
                                    padding: "8px 0",
                                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                                    display: "flex", gap: 8, alignItems: "flex-start",
                                }}>
                                    <span style={{ color: "#ff6b6b", flexShrink: 0 }}>✗</span>
                                    {item}
                                </div>
                            ))}
                        </div>

                        {/* WITH */}
                        <div style={{
                            padding: 28,
                            background: "rgba(0,255,65,0.04)",
                            border: "1px solid rgba(0,255,65,0.15)",
                            borderRadius: 20,
                        }}>
                            <div style={{
                                fontSize: 11, fontWeight: 800, color: "#00ff41",
                                letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16,
                            }}>✅ With BioDynamX</div>
                            {[
                                "Every call answered in <1 second — 24/7",
                                "Leads texted back in 8 seconds automatically",
                                "AI qualifies, books, and follows up for you",
                                "After-hours = your highest-converting time slot",
                                "Every lead scored, tagged, and prioritized",
                                "Revenue recovered — specific to YOUR business",
                            ].map((item) => (
                                <div key={item} style={{
                                    fontSize: 13, color: "rgba(255,255,255,0.75)",
                                    padding: "8px 0",
                                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                                    display: "flex", gap: 8, alignItems: "flex-start",
                                }}>
                                    <span style={{ color: "#00ff41", flexShrink: 0 }}>✓</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── The Science Behind The Results — Neuroscience Differentiator ── */}
            <section
                id="neuroscience"
                ref={neuroScienceRef}
                aria-label="The Neuroscience Behind BioDynamX Results"
                className="section-container"
                style={{
                    opacity: neuroScienceVisible ? 1 : 0,
                    transform: neuroScienceVisible ? 'translateY(0)' : 'translateY(40px)',
                    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                    background: 'linear-gradient(180deg, rgba(139,92,246,0.03) 0%, rgba(59,130,246,0.03) 50%, transparent 100%)',
                    borderTop: '1px solid rgba(139,92,246,0.12)',
                    borderBottom: '1px solid rgba(59,130,246,0.12)',
                }}
            >
                <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                    <div className="section-label" style={{ color: '#a78bfa' }}>What Makes Us Different</div>
                    <h2 data-speakable="true" className="section-title">
                        The Science Behind{' '}
                        <span className="animated-gradient-text">The Results.</span>
                    </h2>
                    <p className="section-desc" data-speakable="true">
                        Other platforms give you tools. We engineer buying behavior using <strong>Neuroscience</strong>,{' '}
                        <strong>Neurobiology</strong>, <strong>Neuromarketing</strong>, and <strong>Neuro-Sales</strong> —{' '}
                        because 85% of purchasing decisions happen in the subconscious mind.{' '}
                        We don&apos;t sell to people. We sell to the mind.
                    </p>

                    {/* ── Triune Brain Visual ── */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 20,
                        marginTop: 40,
                        textAlign: 'left',
                    }}>
                        {/* Reptilian Brain */}
                        <div className="standard-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                            <div style={{
                                fontSize: 32, marginBottom: 12,
                                filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.4))',
                            }}>🧬</div>
                            <div style={{
                                fontSize: 10, fontWeight: 800, color: '#ef4444',
                                letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8,
                            }}>The Reptilian Brain</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                                Survival &amp; Instinct
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                                We activate the primal brain first — the part that drives immediate action.
                                Our AI agents frame your revenue leak as a <em>threat</em>,
                                triggering the urgency to act <strong>now</strong>.
                            </p>
                        </div>

                        {/* Limbic Brain */}
                        <div className="standard-card" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
                            <div style={{
                                fontSize: 32, marginBottom: 12,
                                filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.4))',
                            }}>💜</div>
                            <div style={{
                                fontSize: 10, fontWeight: 800, color: '#a78bfa',
                                letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8,
                            }}>The Limbic Brain</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                                Emotion &amp; Memory
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                                We connect through stories, empathy, and vision.
                                Our agents paint a picture of your business thriving —
                                creating an <em>emotional bond</em> that makes saying yes feel natural.
                            </p>
                        </div>

                        {/* Neocortex */}
                        <div className="standard-card" style={{ borderColor: 'rgba(59,130,246,0.2)' }}>
                            <div style={{
                                fontSize: 32, marginBottom: 12,
                                filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.4))',
                            }}>🧠</div>
                            <div style={{
                                fontSize: 10, fontWeight: 800, color: '#3b82f6',
                                letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8,
                            }}>The Neocortex</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                                Logic &amp; Justification
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                                Finally, we give your rational brain the data it needs:
                                hard ROI numbers, guaranteed outcomes, and a risk-free path forward.
                                The decision your subconscious already made now feels <strong>logical</strong>.
                            </p>
                        </div>
                    </div>

                    {/* ── Key Neuroscience Techniques ── */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 16,
                        marginTop: 32,
                    }}>
                        {[
                            { icon: '⚡', label: 'Loss Aversion', desc: 'Show what you\'re losing — 2x more powerful than showing gains', color: '#ff6b6b' },
                            { icon: '🎯', label: 'Anchoring Effect', desc: 'Your problem costs $18K/mo. Our solution costs $497/mo.', color: '#ffa726' },
                            { icon: '🔬', label: 'Hippocampal Activation', desc: 'Familiar phrases with a twist — surprises the brain into attention', color: '#a78bfa' },
                            { icon: '💰', label: 'Neurological Pricing', desc: '$497 (not $500) — engages the analytical brain for deeper commitment', color: '#00ff41' },
                        ].map((tech) => (
                            <div key={tech.label} style={{
                                padding: '20px 16px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 16,
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 24, marginBottom: 8 }}>{tech.icon}</div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: tech.color, marginBottom: 6 }}>{tech.label}</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{tech.desc}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Tagline ── */}
                    <div data-speakable="true" style={{
                        marginTop: 40,
                        padding: '24px 32px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
                        border: '1px solid rgba(139,92,246,0.15)',
                        borderRadius: 20,
                    }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.6 }}>
                            &ldquo;We don&apos;t just automate your business.{' '}
                            <span className="animated-gradient-text">We engineer the neurobiology of choice</span>{' '}
                            — so your customers say yes before they know why.&rdquo;
                        </p>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 12, marginBottom: 0 }}>
                            — Billy De La Taurus, Founder &amp; Chief Architect
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Competitor Comparison (Framework 2: Price Anchoring) ── */}
            <section className="section-container">
                <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label">Why Not Just Hire?</div>
                    <h2 className="section-title">
                        BioDynamX vs. hiring a team.{" "}
                        <span style={{ color: "#00ff41" }}>Do the math.</span>
                    </h2>

                    <div style={{
                        marginTop: 32,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 20,
                        overflow: "hidden",
                    }}>
                        {/* Header */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
                            padding: "14px 20px",
                            background: "rgba(255,255,255,0.04)",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            fontSize: 11, fontWeight: 700,
                            color: "rgba(255,255,255,0.5)",
                            letterSpacing: "0.08em", textTransform: "uppercase",
                        }}>
                            <span></span>
                            <span style={{ textAlign: "center" }}>Human Team</span>
                            <span style={{ textAlign: "center", color: "#00ff41" }}>BioDynamX AI</span>
                        </div>

                        {[
                            { feature: "Monthly cost", human: "$12,400+", ai: "$497", highlight: true },
                            { feature: "Response time", human: "3+ hours", ai: "<1 second" },
                            { feature: "Available hours", human: "9am–5pm", ai: "24/7/365" },
                            { feature: "Follow-up consistency", human: "Sporadic", ai: "100% automated" },
                            { feature: "Scale limit", human: "2–3 at a time", ai: "Unlimited" },
                            { feature: "Sick days / turnover", human: "Constant", ai: "Never" },
                            { feature: "Onboarding time", human: "2–6 weeks", ai: "24 hours" },
                            { feature: "Bilingual", human: "Extra $$$", ai: "32 languages free" },
                        ].map((row) => (
                            <div key={row.feature} style={{
                                display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
                                padding: "12px 20px",
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                fontSize: 13,
                            }}>
                                <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{row.feature}</span>
                                <span style={{
                                    textAlign: "center",
                                    color: row.highlight ? "#ff6b6b" : "rgba(255,255,255,0.45)",
                                    fontWeight: row.highlight ? 800 : 400,
                                    textDecoration: row.highlight ? "line-through" : "none",
                                }}>{row.human}</span>
                                <span style={{
                                    textAlign: "center",
                                    color: "#00ff41",
                                    fontWeight: row.highlight ? 800 : 600,
                                }}>{row.ai}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: 20, fontSize: 14, fontWeight: 700,
                        color: "rgba(255,255,255,0.7)",
                    }}>
                        That&rsquo;s <span style={{ color: "#00ff41", fontSize: 18, fontWeight: 800 }}>96% less</span> than hiring — with{" "}
                        <span style={{ color: "#00ff41", fontSize: 18, fontWeight: 800 }}>10x</span> the output.
                    </div>
                </div>
            </section>

            {/* ── What Happens Next (Framework 4: Reduce Perceived Effort) ── */}
            <section className="section-container" style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.02) 50%, transparent 100%)",
            }}>
                <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label" style={{ color: "#3b82f6" }}>3 Steps. That&rsquo;s It.</div>
                    <h2 className="section-title">
                        Here&rsquo;s exactly what happens when you click the button.
                    </h2>
                    <p className="section-desc">
                        No forms. No salespeople. No 45-minute demos. Just results.
                    </p>

                    <div style={{
                        display: "flex", flexDirection: "column", gap: 0,
                        textAlign: "left", marginTop: 24,
                    }}>
                        {[
                            {
                                step: "1",
                                title: "Talk to Jenny (60 seconds)",
                                desc: "She'll ask for your website and instantly run a 20-probe diagnostic on your business. You'll see your revenue leaks in real time.",
                                color: "#00ff41",
                            },
                            {
                                step: "2",
                                title: "Get your custom ROI report",
                                desc: "Jenny hands off to Mark, who shows you exactly how much you're losing and how much you'll recover — with real numbers, not guesses.",
                                color: "#3b82f6",
                            },
                            {
                                step: "3",
                                title: "Go live in 24 hours",
                                desc: "Say yes and your AI team is deployed the next day. Answering calls, texting leads, booking appointments — while you sleep.",
                                color: "#ffa726",
                            },
                        ].map((item, i) => (
                            <div key={item.step} style={{
                                display: "flex", gap: 20, alignItems: "flex-start",
                                padding: "24px 0",
                                borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: `${item.color}15`,
                                    border: `1px solid ${item.color}30`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 18, fontWeight: 900, color: item.color,
                                    flexShrink: 0,
                                }}>{item.step}</div>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{item.title}</div>
                                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="primary-btn-green" style={{ marginTop: 32 }}>
                        Start Step 1 — Free →
                    </button>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 10 }}>
                        No credit card · No login · Takes 60 seconds
                    </div>
                </div>
            </section>

            {/* ── Risk-Free Guarantee ─────────────────────── */}
            < section style={{
                position: "relative", zIndex: 10,
                padding: "64px 32px",
            }}>
                <div style={{
                    maxWidth: 700, margin: "0 auto",
                    textAlign: "center",
                    padding: "48px 32px",
                    background: "linear-gradient(135deg, rgba(0,255,65,0.04) 0%, rgba(59,130,246,0.04) 100%)",
                    border: "1px solid rgba(0,255,65,0.15)",
                    borderRadius: 20,
                }}>
                    <div style={{
                        fontSize: 48, marginBottom: 8,
                    }}>🛡️</div>
                    <div style={{
                        fontSize: 10, fontWeight: 700, color: "#00ff41",
                        letterSpacing: "0.15em", textTransform: "uppercase",
                        marginBottom: 12,
                    }}>The BioDynamX Guarantee</div>
                    <h2 data-speakable="true" style={{
                        fontSize: "clamp(22px, 3vw, 32px)",
                        fontWeight: 800, color: "#fff",
                        letterSpacing: "-0.03em",
                        margin: "0 0 16px",
                        lineHeight: 1.2,
                    }}>
                        5x ROI — or your money back. <span style={{ color: "#00ff41" }}>Period.</span>
                    </h2>
                    <p style={{
                        fontSize: 15, color: "rgba(255,255,255,0.65)",
                        lineHeight: 1.7, margin: "0 0 28px",
                        maxWidth: 520, marginLeft: "auto", marginRight: "auto",
                    }}>
                        If our AI doesn&apos;t deliver at least <strong style={{ color: "#fff" }}>5x your investment</strong> in
                        recovered revenue within 90 days, we&apos;ll refund every penny. No questions.
                        No hoops. We eat the risk so you don&apos;t have to.
                    </p>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 16,
                        marginBottom: 28,
                        textAlign: "left",
                    }}>
                        {[
                            { icon: "⚡", title: "Day 1", desc: "AI deployed and answering your calls" },
                            { icon: "📊", title: "Week 1", desc: "Full diagnostic + custom recovery plan" },
                            { icon: "💰", title: "Day 14", desc: "Measurable revenue recovery begins" },
                            { icon: "🏆", title: "Day 90", desc: "5x ROI achieved — or full refund" },
                        ].map((step) => (
                            <div key={step.title} style={{
                                padding: "16px 14px",
                                background: "rgba(255,255,255,0.03)",
                                borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.06)",
                            }}>
                                <div style={{ fontSize: 20, marginBottom: 6 }}>{step.icon}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{step.title}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{step.desc}</div>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{
                        padding: "16px 40px",
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        border: "none", borderRadius: 14,
                        color: "#000", fontSize: 15, fontWeight: 800,
                        fontFamily: "inherit", cursor: "pointer",
                        transition: "all 0.3s",
                        boxShadow: "0 4px 40px rgba(0,255,65,0.3)",
                    }}>
                        Start Risk-Free Today
                    </button>
                    <div style={{
                        fontSize: 12, color: "rgba(255,255,255,0.5)",
                        marginTop: 10,
                    }}>No contracts · Cancel anytime · Results in 14 days</div>
                </div>
            </section >

            <section ref={auditCtaRef} className="section-container" style={{
                background: "linear-gradient(180deg, rgba(255,167,38,0.02) 0%, transparent 100%)",
                opacity: auditCtaVisible ? 1 : 0,
                transform: auditCtaVisible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            }}>
                <div className="audit-container" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 24, padding: 40 }}>
                    <div className="section-label" style={{ color: "#ffa726" }}>Free Tool</div>
                    <h2 className="audit-title">
                        Not ready to talk? Run a free audit first.
                    </h2>
                    <p className="audit-desc">
                        Whether you run a call center, a local business, or you&apos;re launching something new —
                        our AI scans with 16 diagnostic probes and Gemini generates your custom report.
                    </p>
                    <a href="/audit" className="secondary-btn-orange">
                        Run Free Business Audit →
                    </a>
                    <div className="audit-meta">
                        No login · Results in 60 seconds · Powered by Gemini 2.0
                    </div>
                </div>
            </section>

            {/* ── Enterprise Security & Compliance ──────────── */}
            {!isActive && (
                <section className="section-container" style={{
                    background: "linear-gradient(180deg, rgba(16,185,129,0.02) 0%, transparent 100%)",
                }}>
                    <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
                        <div className="section-label" style={{ color: "#10b981" }}>Enterprise-Grade Security</div>
                        <h2 className="section-title">
                            Your data is <span style={{ color: "#10b981" }}>locked down.</span>
                        </h2>
                        <p className="section-desc" style={{ maxWidth: 600, margin: "0 auto 40px" }}>
                            In 2026, AI governance isn&apos;t optional — it&apos;s the law. BioDynamX is built
                            for enterprise compliance from day one.
                        </p>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: 16,
                            textAlign: "left",
                        }}>
                            {[
                                { icon: "📝", title: "Full Transcripts", desc: "Every word recorded — agent and customer. Timestamped, searchable, legally admissible." },
                                { icon: "🛡️", title: "PII Redaction", desc: "SSNs, credit cards, and personal data auto-redacted in real-time before storage." },
                                { icon: "🔒", title: "Encryption", desc: "AES-256 encryption at rest. TLS 1.3 in transit. Zero-trust architecture." },
                                { icon: "🤖", title: "AI Guardrails", desc: "Agents can't go off-topic, make unauthorized promises, or share confidential data." },
                                { icon: "🚫", title: "Anti-Jailbreak", desc: "Military-grade prompt injection detection. Agents refuse all manipulation attempts." },
                                { icon: "📊", title: "Audit Trail", desc: "Every action logged — tool calls, handoffs, safety flags. Full accountability." },
                                { icon: "⚖️", title: "Compliance Ready", desc: "TCPA, HIPAA, PCI-DSS, GDPR, CCPA frameworks. Consent recording built in." },
                                { icon: "🔐", title: "Role-Based Access", desc: "Admin, manager, viewer permissions. API key rotation. Session-level isolation." },
                            ].map((item) => (
                                <div key={item.title} className="glass-card" style={{
                                    padding: "20px 18px",
                                    borderRadius: 16,
                                    background: "rgba(16,185,129,0.03)",
                                    border: "1px solid rgba(16,185,129,0.1)",
                                    transition: "all 0.3s ease",
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = "rgba(16,185,129,0.25)";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 8px 30px rgba(16,185,129,0.08)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "rgba(16,185,129,0.1)";
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 6 }}>
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                                        {item.desc}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            marginTop: 32,
                            padding: "16px 24px",
                            background: "rgba(16,185,129,0.05)",
                            border: "1px solid rgba(16,185,129,0.15)",
                            borderRadius: 12,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 12,
                        }}>
                            <span style={{ fontSize: 20 }}>🏛️</span>
                            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                                <strong style={{ color: "#10b981" }}>AI Governance First.</strong> Every conversation is recorded,
                                every agent action is logged, and every data point is encrypted. Your customers are protected.
                            </span>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Pricing Section ────────────────── */}
            <section id="pricing" aria-label="BioDynamX AI Growth Engine Pricing" className="section-container" style={{
                background: "linear-gradient(180deg, rgba(0,255,65,0.02) 0%, transparent 100%)",
            }}>
                <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label" style={{ color: "#00ff41" }}>Simple Pricing</div>
                    <h2 className="section-title">
                        One platform. <span style={{ color: "#00ff41" }}>Everything you need to grow.</span>
                    </h2>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: "0 0 36px" }}>
                        Whether you&apos;re recovering lost revenue or building from scratch — one plan covers it all.
                    </p>

                    <div className="pricing-card">
                        <div className="popular-badge">MOST POPULAR</div>

                        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
                            BioDynamX AI Growth Engine
                        </div>

                        <div className="price-container">
                            <span className="price-anchor">$997/mo</span>
                            <span className="price-main">$497</span>
                            <span className="price-suffix">/month</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#00ff41", fontWeight: 600, marginBottom: 24 }}>
                            That&apos;s just $16.56/day — less than a lunch 🍽️
                        </div>

                        <div className="roi-grid">
                            <div>
                                <div className="roi-item-label">You Invest</div>
                                <div className="roi-item-value">$497</div>
                            </div>
                            <div>
                                <div className="roi-item-label">Guaranteed</div>
                                <div className="roi-item-value" style={{ color: "#00ff41" }}>5x+</div>
                            </div>
                            <div>
                                <div className="roi-item-label">ROI</div>
                                <div className="roi-item-value" style={{ color: "#ffa726" }}>Guaranteed</div>
                            </div>
                        </div>

                        <div style={{ textAlign: "left", marginBottom: 28 }}>
                            {[
                                "24/7 AI voice agent — answers every call in <1 second",
                                "Neuro-Sales AI — closes deals using brain science",
                                "Real-time business audit (20-probe diagnostic)",
                                "AI competitor intelligence (live Google Search data)",
                                "Automated lead nurturing via SMS, email & voice",
                                "Custom ROI dashboard with real revenue tracking",
                                "AI social media manager + content calendar",
                                "AI reputation engine (auto-responds to reviews)",
                                "Dedicated onboarding in 24 hours",
                            ].map((f) => (
                                <div key={f} className="pricing-feature">
                                    <span style={{ color: "#00ff41", fontSize: 14, fontWeight: 700 }}>✓</span>
                                    {f}
                                </div>
                            ))}
                        </div>

                        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="primary-btn-green">
                            Start Your Free Diagnostic →
                        </button>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 10 }}>
                            No contracts · Cancel anytime · 5x ROI guaranteed or money back
                        </div>
                    </div>
                </div>
            </section>

            <section ref={finalCtaRef} className="section-container" style={{
                textAlign: "center",
                opacity: finalCtaVisible ? 1 : 0,
                transform: finalCtaVisible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            }}>
                <h2 className="section-title">
                    Your competitors are already using AI. <span style={{ color: "#ff6b6b" }}>Are you?</span>
                </h2>
                <p className="section-desc">
                    Every day you wait, leads go unanswered, opportunities get missed, and competitors get ahead.<br />
                    60 seconds with Jenny and you&apos;ll have a plan.
                </p>
                <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="primary-btn-green" style={{ width: "auto", padding: "18px 48px" }}>
                    Talk to Jenny — Free
                </button>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>
                    ✓ No credit card &nbsp;·&nbsp; ✓ No login &nbsp;·&nbsp; ✓ 5x ROI guaranteed
                </div>
            </section>



            {/* ── Footer ─────────────────── */}
            <footer style={{
                position: "relative",
                zIndex: 10,
                padding: "32px 32px 24px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
                <div className="footer-container">
                    {/* Brand Column */}
                    <div style={{ maxWidth: 240 }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
                        }}>
                            <div style={{
                                width: 24, height: 24,
                                background: "linear-gradient(135deg, #00ff41, #00cc33)",
                                borderRadius: 6,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 900, fontSize: 11, color: "#000",
                            }}>B</div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                                BioDynamX
                            </span>
                        </div>
                        <p style={{
                            fontSize: 12, color: "rgba(255,255,255,0.5)",
                            lineHeight: 1.6, margin: 0,
                        }}>
                            Neuroscience-powered AI platform for sales, marketing, and revenue recovery. We use Neuromarketing, Neurobiology, and Neuro-Sales to help businesses close more deals.
                            Founded by Billy De La Taurus, 2x Amazon best-selling author.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <div style={{
                            fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)",
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            marginBottom: 10,
                        }}>Platform</div>
                        {[
                            { label: "Voice Diagnostic", href: "/" },
                            { label: "Free Business Audit", href: "/audit" },
                            { label: "Pricing", href: "/pricing" },
                            { label: "Blog", href: "/blog" },
                            { label: "Google My Business Setup (Free)", href: "/dashboard/gmb-setup" },
                        ].map((link) => (
                            <a key={link.label} href={link.href} style={{
                                display: "block", fontSize: 13,
                                color: "rgba(255,255,255,0.55)",
                                textDecoration: "none", marginBottom: 8,
                                transition: "color 0.2s",
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#00ff41")}
                                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                            >{link.label}</a>
                        ))}
                    </div>

                    {/* Company */}
                    <div>
                        <div style={{
                            fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)",
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            marginBottom: 10,
                        }}>Company</div>
                        {[
                            { label: "About Us", href: "/about" },
                            { label: "Client Success Stories", href: "/testimonials" },
                            { label: "AI Expert Solutions", href: "https://aiexpert.solutions" },
                            { label: "Partner Community (4,000+)", href: "https://facebook.com/mmapresident" },
                            { label: "Contact Us", href: "tel:3033923700" },
                        ].map((link) => (
                            <a key={link.label} href={link.href} style={{
                                display: "block", fontSize: 13,
                                color: "rgba(255,255,255,0.55)",
                                textDecoration: "none", marginBottom: 8,
                                transition: "color 0.2s",
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#00ff41")}
                                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                            >{link.label}</a>
                        ))}
                    </div>

                    {/* Trust */}
                    <div>
                        <div style={{
                            fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)",
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            marginBottom: 10,
                        }}>Trust</div>
                        {[
                            "Enterprise Grade",
                            "SOC 2 Compliant",
                            "GDPR Ready",
                            "99.9% Uptime SLA",
                        ].map((item) => (
                            <div key={item} style={{
                                fontSize: 12, color: "rgba(255,255,255,0.5)",
                                marginBottom: 8,
                                display: "flex", alignItems: "center", gap: 6,
                            }}>
                                <div style={{
                                    width: 5, height: 5, borderRadius: "50%",
                                    background: "#00ff41", opacity: 0.7,
                                }} />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Copyright Bar */}
                <div style={{
                    maxWidth: 900, margin: "20px auto 0",
                    paddingTop: 16,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", flexWrap: "wrap", gap: 8,
                }}>
                    <span style={{
                        fontSize: 11, color: "rgba(255,255,255,0.4)",
                        letterSpacing: "0.04em",
                    }}>
                        © 2026 BioDynamX Engineering Group × AI Expert Solutions. All rights reserved.
                    </span>
                    <div style={{ display: "flex", gap: 12 }}>
                        {["Privacy", "Terms", "Security"].map((link) => (
                            <a key={link} href="#" style={{
                                fontSize: 11, color: "rgba(255,255,255,0.4)",
                                textDecoration: "none", letterSpacing: "0.04em",
                                transition: "color 0.2s",
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                            >{link}</a>
                        ))}
                    </div>
                </div>
            </footer>

            {/* ── Sticky Floating CTA Bar (Framework 4: Prompt Timing) ── */}
            {
                showStickyBar && !isActive && (
                    <div className="sticky-cta-bar">
                        <span style={{
                            fontSize: 13, fontWeight: 600,
                            color: "rgba(255,255,255,0.7)",
                        }}>
                            🟢 <span style={{ color: "#00ff41" }}>Jenny is live right now</span> — 60 seconds to your custom plan
                        </span>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="primary-btn-green" style={{ width: "auto", padding: "10px 24px" }}>
                            Talk to Jenny →
                        </button>
                        <span style={{
                            fontSize: 11, color: "rgba(255,255,255,0.4)",
                            whiteSpace: "nowrap",
                            display: "none", // Hide on smaller screens
                        }} className="nav-links-desktop">
                            ✓ No CC required
                        </span>
                    </div>
                )
            }
        </div >
    );
}
// ─── Stat Item Sub-component (for countdown/countup) ─────────
interface Stat {
    val: number;
    suffix: string;
    label: string;
    sub: string;
}

function StatItem({ stat, isVisible }: { stat: Stat, isVisible: boolean }) {
    const value = useCountUp(stat.val, isVisible, 2000, stat.suffix);
    return (
        <div className="vault-stat-item">
            <div className="vault-stat-value">{stat.label === "Partner Revenue Recovered" ? "$" + value : value}</div>
            <div className="vault-stat-label">{stat.label}</div>
            <div className="vault-stat-sub">{stat.sub}</div>
        </div>
    );
}
