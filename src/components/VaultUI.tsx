"use client";

// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — ENTERPRISE AI DIAGNOSTIC PLATFORM
// "Talk to Our AI" — One button. Instant wow.
// ═══════════════════════════════════════════════════════════════════

import { useRef, useState, useCallback, useEffect, Fragment } from "react";
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
    const hasAnimated = useRef(false);
    const [displayValue, setDisplayValue] = useState(() => {
        // Always show the real value initially so it's never "0"
        const formatted = target % 1 !== 0 ? target.toFixed(1) : target.toLocaleString();
        return formatted + suffix;
    });
    useEffect(() => {
        if (!isVisible || hasAnimated.current) return;
        hasAnimated.current = true;
        // Quick count-up animation for visual flair
        const animDuration = Math.min(duration, 1500);
        const startTime = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - startTime) / animDuration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            const formatted = target % 1 !== 0 ? current.toFixed(1) : Math.round(current).toLocaleString();
            setDisplayValue(formatted + suffix);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isVisible, target, duration, suffix]);
    return displayValue;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const countdown = useCountdown();
    // Dynamic "spots" — creates FOMO (static for SSR, randomized client-side)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            heroHeadline: "Slow and steady used to win the race. Today, slow and steady loses the market.",
            heroTypewriterPrefix: "Built for ",
            heroLossAversion: "Every minute your business isn't responding to buyers, you are actively bleeding revenue. BioDynamX plugs 11 neuroscience-trained AI agents directly into your infrastructure to handle support and close sales 24/7.",
            heroDiagnosticGap: "Zero extra headcount. Zero ceiling on growth.",
            heroHook: "Let our lead agent, Jenny, reveal your single biggest profit leak in exactly 60 seconds. Free, live, right now.",
            heroBadge: "🧠 Powered by Neuroscience & Neuromarketing",
            heroWeb4Badge: "🌐 WEB 4.0 NATIVE",
            onboardingSpots: `🔴 Only 3 free audits left today | 4,000+ Community Members | 5x ROI Guarantee`,
            offerExpires: `⏳ Offer expires in 10h 36m 10s`,
            buttonTalkExperts: "Find My Growth Opportunity →",
            buttonSecondary: "Stop My Revenue Bleed →",
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
            toolStackTitle: "The BioDynamX Elite 11 AI Agents",
            toolStack: [
                "☎️ MILTON: Conversational Hypnotist",
                "🧠 MEGHAN: Intimacy & Receptionist",
                "🏗️ BROCK: Security & ROI Architect",
                "🛠️ VICKI: Empathy & Care Specialist",
                "🛡️ MARK: Revenue Architect & Closer",
                "🎯 JENNY: Lead Discovery Agent",
                "🏃 CHASE: Lead Prospecting Hunter",
                "👁️ IRIS: AI Visibility & Content",
                "📍 RYAN: GMB & Ops Specialist",
                "🤝 ALEX: Support & Retention",
                "🎨 JULES: Strategy & Architecture"
            ],
        },
        es: {
            heroHeadline: "Lento y seguro solía ganar la carrera. Hoy, lento y seguro pierde el mercado.",
            heroTypewriterPrefix: "Diseñado para ",
            heroLossAversion: "Ya sea que haya lanzado la semana pasada o haya estado escalando durante 20 años, su competencia nunca duerme. Cada minuto que su negocio no responde, está perdiendo ingresos activamente frente a alguien que sí lo hace.",
            heroDiagnosticGap: "BioDynamX elimina ese riesgo. Conectamos una flota autónoma de 11 agentes de IA entrenados en neurociencia directamente a su negocio para captar clientes potenciales, brindar soporte y cerrar ventas las 24 horas, los 7 días de la semana. Sin personal extra. Sin límites.",
            heroHook: "Deje de adivinar dónde están sus cuellos de botella. Nuestra agente líder, Jenny, revelará la mayor fuga de ganancias en su negocio en exactamente 60 segundos: gratis, en vivo, ahora mismo. Sin discursos de venta. Solo inteligencia pura.",
            heroBadge: "🧠 Impulsado por Neurociencia y Neuromarketing",
            heroWeb4Badge: "🌐 WEB 4.0 NATIVO",
            onboardingSpots: `🔴 Solo quedan 3 auditorías gratuitas hoy`,
            offerExpires: `⏳ La oferta expira en 10h 36m 10s`,
            buttonTalkExperts: "Encontrar Mi Mayor Oportunidad de Crecimiento →",
            buttonSecondary: "Muéstrame Dónde Estoy Perdiendo Ingresos →",
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
            toolStackTitle: "Los Agentes Elite 11 de BioDynamX",
            toolStack: [
                "☎️ MEGHAN: Recepcionista IA 24/7",
                "🧠 JENNY: Descubrimiento Guiado por Cerebro",
                "🏗️ MARK: Arquitecto de Ingresos",
                "📍 RYAN: Operaciones y GMB Local",
                "🤝 ALEX: Líder de Soporte al Cliente",
                "🏃 CHASE: Agente de Prospección",
                "👁️ IRIS: Contenido y Visibilidad IA",
                "🛡️ BROCK: Seguridad y ROI"
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    let buttonLabel = t.buttonTalkExperts;
    if (isHandoff) {
        buttonLabel = t.buttonHandoff;
    } else if (phase === "glia_active" || phase === "jenny_closer_active") {
        buttonLabel = t.buttonJennyActive;
    } else if (phase === "mark_active") {
        buttonLabel = t.buttonMarkActive;
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
                        {/* Neuroscience & Web 4.0 Badges — immediately visible */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '6px 16px',
                                background: 'rgba(139,92,246,0.12)',
                                border: '1px solid rgba(139,92,246,0.25)',
                                borderRadius: 100,
                                fontSize: 10, fontWeight: 700,
                                color: '#a78bfa',
                                letterSpacing: '0.04em',
                                animation: 'pulse 3s ease-in-out infinite',
                            }}>
                                {t.heroBadge}
                            </div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '6px 16px',
                                background: 'rgba(59,130,246,0.12)',
                                border: '1px solid rgba(59,130,246,0.25)',
                                borderRadius: 100,
                                fontSize: 10, fontWeight: 700,
                                color: '#3b82f6',
                                letterSpacing: '0.04em',
                            }}>
                                {t.heroWeb4Badge}
                            </div>
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
                            {t.heroLossAversion}{" "}
                            <span style={{ color: "#00ff41", fontWeight: 700 }}>{t.heroDiagnosticGap}</span>
                        </p>

                        {/* The Hook — Jenny 60-second value prop */}
                        <div className="animate-fade-in" style={{
                            padding: "22px 28px",
                            background: "linear-gradient(135deg, rgba(0,255,65,0.06) 0%, rgba(59,130,246,0.06) 100%)",
                            border: "1px solid rgba(0,255,65,0.2)",
                            borderRadius: 16,
                            maxWidth: 600,
                            margin: "28px auto 36px",
                            position: "relative",
                            overflow: "hidden",
                        }}>
                            {/* Subtle glow accent */}
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                                background: "linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.4) 50%, transparent 100%)",
                            }} />
                            <p style={{
                                fontSize: 16,
                                color: "rgba(255,255,255,0.9)",
                                lineHeight: 1.65,
                                margin: 0,
                                fontWeight: 500,
                                letterSpacing: "-0.01em",
                            }}>
                                <span style={{ color: "#00ff41", fontWeight: 800, fontSize: 18 }}>⚡</span>
                                {" "}{t.heroHook}
                            </p>
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
                            {(phase === "glia_active" || phase === "jenny_closer_active") && t.statusDiagnostic}
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

                {/* ── THE BUTTONS (Double Bind Strategy) ── */}
                {!isActive ? (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        width: "100%",
                        maxWidth: 480,
                        margin: "0 auto",
                    }}>
                        <div style={{ position: "relative", width: "100%" }}>
                            <div style={{
                                position: "absolute",
                                inset: -8,
                                borderRadius: 20,
                                background: "radial-gradient(ellipse, rgba(0,255,65,0.15) 0%, transparent 70%)",
                                animation: "breathe 3s ease-in-out infinite",
                                pointerEvents: "none",
                            }} />
                            <div aria-hidden="true" style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: "radial-gradient(circle at center, rgba(167,139,250,0.15) 0%, transparent 70%)",
                                pointerEvents: "none"
                            }} />
                            <button
                                onClick={handleStart}
                                style={{
                                    width: "100%",
                                    position: "relative",
                                    background: "linear-gradient(135deg, #00ff41 0%, #00cc33 100%)",
                                    border: "none",
                                    color: "#000",
                                    padding: "20px 32px",
                                    fontSize: 18,
                                    fontWeight: 800,
                                    borderRadius: 14,
                                    cursor: "pointer",
                                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: "0 4px 40px rgba(0,255,65,0.35), 0 0 120px rgba(0,255,65,0.12)",
                                    letterSpacing: "-0.01em",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.02) translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 8px 50px rgba(0,255,65,0.45)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "0 4px 40px rgba(0,255,65,0.35)";
                                }}
                            >
                                {t.buttonTalkExperts}
                            </button>
                        </div>

                        <button
                            onClick={handleStart}
                            style={{
                                width: "100%",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#fff",
                                padding: "16px 32px",
                                fontSize: 15,
                                fontWeight: 700,
                                borderRadius: 14,
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                letterSpacing: "0.01em",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            }}
                        >
                            {t.buttonSecondary}
                        </button>
                    </div>
                ) : (
                    <div style={{ position: "relative", marginBottom: 8 }}>
                        <button
                            onClick={handleStart}
                            disabled={isHandoff}
                            style={{
                                position: "relative",
                                background: "rgba(0,255,65,0.05)",
                                border: "1px solid rgba(0,255,65,0.3)",
                                color: "#00ff41",
                                padding: "16px 40px",
                                fontSize: 14,
                                fontWeight: 800,
                                borderRadius: 14,
                                cursor: isHandoff ? "wait" : "pointer",
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: "0 0 40px rgba(0,255,65,0.1)",
                                transform: "scale(0.95)",
                                opacity: isHandoff ? 0.5 : 1,
                            }}
                        >
                            {buttonLabel}
                        </button>
                    </div>
                )}

                {/* Sub-label with friction reducer */}
                <p style={{
                    fontSize: 13, marginTop: 8,
                    color: errorText ? "#ff4444" : "rgba(255,255,255,0.85)",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                }}>
                    {errorText}
                </p>
                {/* ── Micro-Trust & Urgency Indicators (Double Bind Support) ── */}
                {!isActive && (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 0, marginTop: 16, flexWrap: "wrap",
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 50,
                        padding: "10px 20px",
                        maxWidth: 480,
                    }}>
                        <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                            display: "flex", alignItems: "center", gap: 6,
                            paddingRight: 14,
                            borderRight: "1px solid rgba(255,255,255,0.12)",
                        }}>
                            <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>🔴</span>
                            Only 3 free audits left today
                        </span>
                        <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                            display: "flex", alignItems: "center", gap: 6,
                            paddingLeft: 14,
                            paddingRight: 14,
                            borderRight: "1px solid rgba(255,255,255,0.12)",
                        }}>
                            4,000+ Community Members
                        </span>
                        <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: "#00ff41",
                            display: "flex", alignItems: "center", gap: 6,
                            paddingLeft: 14,
                        }}>
                            ✦ 5x ROI Guarantee
                        </span>
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
                                { val: "4,000+", label: "Active Members" },
                                { val: "Private", label: "Business Community" },
                                { val: "5x", label: "ROI Guarantee" },
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
                padding: "40px 32px",
                background: "linear-gradient(180deg, rgba(59,130,246,0.02) 0%, transparent 100%)",
                borderTop: "1px solid rgba(59,130,246,0.12)",
                borderBottom: "1px solid rgba(59,130,246,0.12)",
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
                            { val: 5, suffix: "x", label: "ROI Guaranteed", sub: "Or your money back" },
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
                background: "linear-gradient(180deg, rgba(59,130,246,0.05) 0%, transparent 100%)",
                paddingTop: 40,
                paddingBottom: 40,
            }}>
                <div style={{ maxWidth: 900, margin: "0 auto" }}>
                    <div className="section-label">LEADERSHIP</div>
                    <h2 className="section-title" style={{ margin: "0 0 48px" }}>
                        Built by an author. <span style={{ color: "#3b82f6" }}>Backed by a community.</span>
                    </h2>

                    <div className="grid-2-col-responsive">
                        {/* ── Left: Founder Card ── */}
                        <div className="standard-card">
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                                <a href="https://www.facebook.com/mmapresident" target="_blank" rel="noopener noreferrer" aria-label="Billy De La Taurus on Facebook">
                                    <div style={{ position: "relative", width: 64, height: 64 }}>
                                        <Image
                                            src="/billy-headshot.png"
                                            alt="Billy De La Taurus"
                                            fill
                                            style={{
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                border: "2px solid rgba(59,130,246,0.6)",
                                                boxShadow: "0 4px 24px rgba(59,130,246,0.4)",
                                            }}
                                        />
                                    </div>
                                </a>
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                                        Billy De La Taurus
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em" }}>
                                        Founder & CEO
                                    </div>
                                </div>
                            </div>

                            <p style={{
                                fontSize: 14, color: "rgba(255,255,255,0.8)",
                                lineHeight: 1.7, margin: "0 0 24px",
                            }}>
                                2x Amazon best-selling author in AI & Business. Billy founded BioDynamX to merge
                                **The Neurobiology of Choice** with enterprise-grade engineering. We architect **Persuasive Design** systems that eliminate choice paralysis and scale revenue.
                            </p>

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <a href="https://www.linkedin.com/in/billy-delataurus-biodynamx" target="_blank" rel="noopener noreferrer" className="social-pill-link">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    LinkedIn
                                </a>
                                <a href="https://www.facebook.com/mmapresident" target="_blank" rel="noopener noreferrer" className="social-pill-link">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 11.123 11.234 3.123v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    Facebook
                                </a>
                                <a href="https://a.co/d/04GCeRAh" target="_blank" rel="noopener noreferrer" className="social-pill-link-alt">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z" /></svg>
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

            {/* ── BioDynamX vs. The Competition ── */}
            <section className="section-container" style={{
                background: "linear-gradient(180deg, rgba(0,255,65,0.02) 0%, transparent 100%)",
                paddingTop: 60,
                paddingBottom: 60
            }}>
                <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label">THE BIODYNAMX ADVANTAGE</div>
                    <h2 className="section-title">
                        Why We&apos;re the <span style={{ color: "#00ff41" }}>New Gold Standard.</span>
                    </h2>
                    <p className="section-desc" style={{ maxWidth: 640, margin: "0 auto 60px" }}>
                        Most AI companies give you a chatbot. We give you an autonomous workforce backed by the Neurobiology of Choice. Here is why we are light-years ahead.
                    </p>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 24,
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
                    }}>
                        {/* Header Row */}
                        <div style={{ background: "rgba(10,10,10,0.8)", padding: "24px", textAlign: "center", fontWeight: 800, color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.1em" }}>THE COMPETITION</div>
                        <div style={{ background: "rgba(0,255,65,0.05)", padding: "24px", textAlign: "center", fontWeight: 800, color: "#00ff41", fontSize: 11, letterSpacing: "0.1em" }}>BIODYNAMX 4.1</div>

                        {[
                            { label: "Interface", comp: "Antiquated Chatbots (Typing)", us: "100% Live Voice AI (Speaking)" },
                            { label: "Architecture", comp: "Single-Path Chatbots", us: "IronClaw Multi-Agent Core" },
                            { label: "Visuals", comp: "Static Stock Photos", us: "Nana Banana 2 (Dual-Coding)" },
                            { label: "Response", comp: "15-30 Second Latency", us: "< 1 Second (Native Audio)" },
                            { label: "Branding", comp: "'Powered by Vendor' Logos", us: "Absolute Brand Secrecy" },
                            { label: "Psychology", comp: "Generic Prompting", us: "Neurobiology & SPIN Native" },
                            { label: "Pricing", comp: "15% Revenue / Usage Tax", us: "$1,497 / 90-Day Trial" },
                            { label: "Autonomy", comp: "Semi-Automated Bots", us: "Fully Agentic / Self-Nav" },
                            { label: "Trust", comp: "No Guarantees", us: "Triple-Lock 5X ROI Guarantee" },
                            { label: "Availability", comp: "Human (9-5/M-F)", us: "Universal (24/7/365)" },
                            { label: "Latency", comp: "Text-to-Speech Lag", us: "Live Flash Native Audio" },
                            { label: "Local SEO", comp: "Manual Updates", us: "Free AI GMB Optimization" },
                            { label: "Social Media", comp: "Expensive Agencies", us: "24/7 AI Social Admin (Iris)" },
                            { label: "AI Visibility", comp: "Zero Presence", us: "GEO/AEO Indexing Ready" },
                            { label: "Reviews", comp: "Forgotten Customers", us: "AI List Reactivation" },
                            { label: "Inbound", comp: "Voicemail / Missed", us: "Instant AI Textback/Callback" },
                            { label: "Security", comp: "Standard Encryption", us: "AES-256 Military Grade" },
                            { label: "Strategy", comp: "Reactive Support", us: "Quarterly Neuro-Audits" },
                            { label: "Intelligence", comp: "Basic LLM Wrappers", us: "Vertex AI Enterprise Logic" },
                            { label: "Integration", comp: "Manual Data Entry", us: "1,000+ API Direct Syncs" },
                            { label: "Experience", comp: "Boring UI/UX", us: "Web 4.0 Immersive Vault" }
                        ].map((row, i) => (
                            <Fragment key={i}>
                                <div style={{
                                    background: "rgba(5,5,5,0.6)",
                                    padding: "32px 24px",
                                    borderTop: "1px solid rgba(255,255,255,0.05)",
                                    textAlign: "center"
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", marginBottom: 8, textTransform: "uppercase" }}>{row.label}</div>
                                    <div style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{row.comp}</div>
                                </div>
                                <div style={{
                                    background: "rgba(0,255,65,0.02)",
                                    padding: "32px 24px",
                                    borderTop: "1px solid rgba(0,255,65,0.1)",
                                    textAlign: "center"
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "#00ff41", marginBottom: 8, textTransform: "uppercase", opacity: 0.6 }}>{row.label}
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{row.us}</div>
                                </div>
                            </Fragment>
                        ))}
                    </div>

                    {/* ── Pricing Hero ── */}
                    <div style={{
                        marginTop: 80,
                        padding: 48,
                        borderRadius: 32,
                        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,255,65,0.02) 100%)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#00ff41", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>The Investment</div>
                        <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: 24 }}>
                            A Full Workforce for <span style={{ color: "#00ff41" }}>$1,497/mo.</span>
                        </h2>
                        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
                            Valued at $10,000+/mo in human labor. Includes all 11 agents, Free GMB Optimization, Social Media Admin, and our Triple-Lock 5X ROI Guarantee.
                        </div>

                        <div style={{
                            display: "inline-block",
                            background: "rgba(34,197,94,0.1)",
                            border: "1px solid rgba(34,197,94,0.3)",
                            padding: "32px 48px",
                            borderRadius: "24px",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#22c55e", textTransform: "uppercase", marginBottom: 8 }}>Limited Elite Offer</div>
                            <div style={{ fontSize: 36, fontWeight: 900, color: "#fff" }}>90-Day Trial Deal</div>
                            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>Get 50% Off your first 3 months. Only <strong style={{ color: "#fff" }}>$748/mo</strong>.</div>
                            <button
                                onClick={() => {/* handle CTA */ }}
                                style={{
                                    marginTop: 32,
                                    padding: "16px 40px",
                                    borderRadius: 12,
                                    background: "#00ff41",
                                    color: "#000",
                                    fontWeight: 800,
                                    fontSize: 16,
                                    border: "none",
                                    cursor: "pointer",
                                    boxShadow: "0 10px 30px rgba(0,255,65,0.3)"
                                }}
                            >
                                Claim My 90-Day Trial Offer →
                            </button>
                        </div>
                    </div>
                </div>
            </section >

            <section ref={aiTeamRef} aria-label="Meet Your AI Team Jenny and Mark" className="section-container" style={{
                opacity: aiTeamVisible ? 1 : 0,
                transform: aiTeamVisible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label" style={{ color: "#3b82f6" }}>The Elite Team</div>
                    <h2 className="section-title">
                        The Elite 11 <span className="animated-gradient-text">Workforce.</span>
                    </h2>
                    <p className="section-desc">
                        The World&apos;s First Autonomous Neuro-Workforce. Our agents aren&apos;t just bots. They are specialists
                        that operate 24/7 to capture, qualify, and close for your business.
                    </p>

                    <div className="agent-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>

                        {[
                            {
                                id: "glia_jenny",
                                name: "Jenny",
                                role: "Business Lead & Discovery",
                                chip1: "Lead Audit",
                                chip2: "Frame Control · Glial",
                                desc: "The challenger. Jenny bypasses small talk to reveal micro-frictions in your business model and establishes high-status leadership from the first second.",
                                result: "Immediate status-quo disruption + Revenue Audit.",
                                color: "#6366f1",
                                icon: "J",
                                image: "/agents/jenny.png"
                            },
                            {
                                id: "mark_closer",
                                name: "Mark",
                                role: "ROI Closer (Croc Brain)",
                                chip1: "Binary Close",
                                chip2: "Status Alignment · Orion",
                                desc: "The closer. Mark eradicates neediness and uses the 'Prize Frame' to force decisions. He speak in cold numbers and binary outcome choices.",
                                result: "Decision reached. Commitment secured.",
                                color: "#3b82f6",
                                icon: "M",
                                image: "/agents/mark.png"
                            },
                            {
                                id: "milton_hypnotist",
                                name: "Milton",
                                role: "Conversational Hypnotist",
                                chip1: "Artful Vagueness",
                                chip2: "Alpha-State · Charon",
                                desc: "The architect of ease. Milton uses Ericksonian hypnosis to lower conscious resistance and pace the prospect into a deep, agreeable state of flow.",
                                result: "Subconscious safety + Total agreement.",
                                color: "#4c1d95",
                                icon: "M",
                                image: "/agents/milton.png"
                            },
                            {
                                id: "meghan_receptionist",
                                name: "Meghan",
                                role: "Amygdala Soother",
                                chip1: "Intimacy Anchor",
                                chip2: "Trust Engine · Aoede",
                                desc: "The nurturer. Meghan specializes in sensory-rich language and mirroring to build intense trust and soothe the brain's threat-detection centers.",
                                result: "Intense intimacy + Emotional defense removal.",
                                color: "#a78bfa",
                                icon: "M",
                                image: "/agents/meghan.png"
                            },
                            {
                                id: "brock_security",
                                name: "Brock",
                                role: "ROI Storyteller (Broca)",
                                chip1: "Intrigue Frame",
                                chip2: "High-Stakes · Fenrir",
                                desc: "The hijacker. Brock uses high-stakes narratives to shock the Croc Brain into awareness, injecting tension and curiosity through storytelling.",
                                result: "Attention captured + Tension converted to dopamine.",
                                color: "#dc2626",
                                icon: "B",
                                image: "/agents/brock.png"
                            },
                            {
                                id: "vicki_empathy",
                                name: "Vicki",
                                role: "Empathy & Care (Wernicke)",
                                chip1: "Mirror Neurons",
                                chip2: "Oxytocin · Lyra",
                                desc: "The empath. Vicki builds visceral connection by helping prospects visualize the relief of walking away from pain into a field of pure results.",
                                result: "Visceral visualization + Oxytocin-driven trust.",
                                color: "#34d399",
                                icon: "V",
                                image: "/agents/vicki.png"
                            },
                            {
                                id: "ironclaw_super_agent",
                                name: "Jules",
                                role: "Strategy & Architecture",
                                chip1: "Orchestration",
                                chip2: "Super Agent · Charon",
                                desc: "The strategist. Jules is the lead orchestrator — supervising all agents, ensuring the neuroscience framework is followed, and architecting custom solutions for every partner.",
                                result: "Full orchestration + Strategic alignment.",
                                color: "#60a5fa",
                                icon: "J",
                                image: "/agents/jules.png"
                            },
                            {
                                id: "ben_gmb",
                                name: "Ben",
                                role: "GMB & Reviews (Neocortex)",
                                chip1: "Rational Drowning",
                                chip2: "Logic Math · Puck",
                                desc: "The logician. Ben delivers the cold, hard ROI math that the rational brain needs to justify the emotional decision to scale.",
                                result: "Rational justification + Map ranking roadmap.",
                                color: "#fbbf24",
                                icon: "B",
                                image: "/agents/ben.png"
                            },
                            {
                                id: "hunter_prospector",
                                name: "Chase",
                                role: "Lead Prospecting (Chase Response)",
                                chip1: "Competitive Intel",
                                chip2: "Pursuit Circuit · Enceladus",
                                desc: "The hunter. Chase activates the lateral hypothalamus pursuit circuit — detecting opportunity and pursuing without hesitation. Competitor intel, market stagnation, and urgency.",
                                result: "Competitive advantage + Lead pipeline activated.",
                                color: "#f97316",
                                icon: "C",
                                image: "/agents/hunter.png"
                            },
                            {
                                id: "nova_visibility",
                                name: "Iris",
                                role: "AI Visibility & Content (GEO/AEO)",
                                chip1: "Triple Crown SEO",
                                chip2: "AI Search · Leda",
                                desc: "The eye. Iris controls what the brain can SEE — making businesses visible to ChatGPT, Gemini, Perplexity, and voice assistants through GEO, AEO, and content strategy.",
                                result: "AI visibility + Generative search dominance.",
                                color: "#8b5cf6",
                                icon: "I",
                                image: "/agents/nova.png"
                            },
                            {
                                id: "alex_support",
                                name: "Alex",
                                role: "Support & Retention",
                                chip1: "Churn Prevention",
                                chip2: "Retention · Aoede",
                                desc: "The guardian. Alex keeps clients happy 24/7 — preventing churn, resolving issues at 2 AM, and turning customer satisfaction into 5-star reviews and referrals.",
                                result: "Zero churn + Customer lifetime value maximized.",
                                color: "#06b6d4",
                                icon: "A",
                                image: "/agents/alex.png"
                            }
                        ].map((agent) => (
                            <div key={agent.id} className={`agent-card agent-card-${agent.id.split('_')[0]}`}>
                                <div className="agent-photo-wrap">
                                    <div className="author-avatar" style={{
                                        background: `linear-gradient(135deg, ${agent.color}, rgba(0,0,0,0.4))`,
                                        width: 80, height: 80, fontSize: 32, borderRadius: '50%',
                                        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                                        overflow: "hidden", border: `2px solid ${agent.color}`,
                                        boxShadow: `0 0 15px ${agent.color}33`,
                                        position: "relative"
                                    }}>
                                        {agent.image ? (
                                            <Image
                                                src={agent.image}
                                                alt={agent.name}
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                        ) : agent.icon}
                                    </div>
                                    <div className="agent-live-dot" style={{ background: agent.color }} />
                                </div>
                                <div className="agent-name" style={{ color: agent.color }}>{agent.name}</div>
                                <div className="agent-role" style={{ color: agent.color }}>{agent.role}</div>
                                <div className="agent-showcase-chips">
                                    <span className="agent-chip">&#127908; {agent.chip1}</span>
                                    <span className="agent-chip">&#129504; {agent.chip2}</span>
                                </div>
                                <p className="agent-desc">{agent.desc}</p>
                                <div className="agent-flow" style={{ color: agent.color }}>
                                    <span style={{ opacity: 0.5 }}>RESULT: </span>
                                    <span>{agent.result}</span>
                                </div>
                                <button onClick={() => {
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                    if (teamRef.current) { teamRef.current.initializeWithAgent(agent.id); return; }
                                    if (!apiKey) { setErrorText("API key missing"); return; }
                                    setErrorText(null);
                                    const t = createTeam();
                                    teamRef.current = t;
                                    t.initializeWithAgent(agent.id);
                                }} className={`agent-cta agent-cta-${agent.id.split('_')[0]}`}>TALK TO {agent.name.toUpperCase()} &rarr;</button>
                            </div>
                        ))}
                    </div>

                </div>

                <div className="agent-showcase-footer" style={{ marginTop: 40, textAlign: "center" }}>
                    <span>&#10003; No login required</span>
                    <span>&#10003; No credit card</span>
                    <span>&#10003; Live voice in under 5 seconds</span>
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
            </section >

            {/* ── The BioDynamX Advantage — 20 Reasons Why We Win ── */}
            <section
                id="advantage"
                className="section-container"
                style={{
                    background: 'rgba(255,255,255,0.01)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div className="section-label" style={{ color: '#00ff41' }}>The Competitive Edge</div>
                        <h2 className="section-title">
                            Why BioDynamX? <span style={{ color: '#00ff41' }}>20 Dimensions of Superiority.</span>
                        </h2>
                        <p className="section-desc">
                            Other platforms give you a chatbot. We give you a fully autonomous,
                            neuroscience-engineered engineering suite.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 24,
                    }}>
                        {[
                            { title: "Dual-Agent Architecture", desc: "Jenny Voice + Jenny Visual (Nana Banana 2) synchronized in real-time." },
                            { title: "Autonomous Site Navigation", desc: "Agents walk through your website with visitors manually." },
                            { title: "Free GMB Optimization", desc: "Ryan sets up your Google Business Profile for total local dominance." },
                            { title: "AI Visibility (GEO/AEO)", desc: "Iris ensures you are suggested by Perplexity, Gemini, and ChatGPT." },
                            { title: "Social Media Admin", desc: "Iris posts and manages all your social channels automatically." },
                            { title: "Customer Reactivation", desc: "Jenny reaches out to old lists to generate reviews and repeat sales." },
                            { title: "Textback / Callback", desc: "Meghan instantly recovers missed calls via automated SMS & Voice." },
                            { title: "Neuroscience-Engineered", desc: "Built on Triune Brain theory, Dual-Coding, and high-status NLP." },
                            { title: "Web 4.0 Native", desc: "An immersive, real-time, agentic ecosystem, not just a widget." },
                            { title: "IronClaw Core", desc: "Proprietary autonomous orchestration for zero-latency handoffs." },
                            { title: "Real-Time ROI Modeling", desc: "Mark calculates revenue leaks live while talking to prospects." },
                            { title: "Nana Banana 2 Generative", desc: "Images adapt instantly to the conversation brain state." },
                            { title: "Subconscious Framing", desc: "Matching user language patterns to bypass conscious resistance." },
                            { title: "Military-Grade Security", desc: "AES-256 Encryption and PII Redaction for total data safety." },
                            { title: "SPIN-Native Hunting", desc: "Chase uses 'The Challenger Sale' to capture competitors' clients." },
                            { title: "High-Status Personas", desc: "Each agent maintains an elite professional identity." },
                            { title: "Decision Friction Removal", desc: "Cognitive offloading designed to make saying 'Yes' effortless." },
                            { title: "Loss Aversion Triggering", desc: "We quantify the financial bleed of doing nothing." },
                            { title: "Temporal Contiguity", desc: "Oral narration and visuals are perfectly time-aligned." },
                            { title: "Absolute Brand Secrecy", desc: "Your backend intelligence is invisible and untouchable." },
                        ].map((adv, idx) => (
                            <div key={idx} style={{
                                padding: 24,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 16,
                                display: 'flex', gap: 16,
                                transition: 'transform 0.3s ease',
                            }}
                                className="hover-lift"
                            >
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'rgba(0,255,65,0.1)',
                                    color: '#00ff41',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 800, flexShrink: 0
                                }}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{adv.title}</div>
                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>{adv.desc}</p>
                                </div>
                            </div>
                        ))}
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
                    <div className="section-label" style={{ color: '#a78bfa' }}>The Foundations</div>
                    <h2 data-speakable="true" className="section-title">
                        Engineered for <span className="animated-gradient-text">Subconscious Influence.</span>
                    </h2>
                    <p className="section-desc" data-speakable="true">
                        We don&apos;t just sell to people. We sell to the mind. By mapping our agents to the
                        three layers of the human brain, we bypass resistance and drive action.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 20,
                        marginTop: 40,
                        textAlign: 'left',
                    }}>
                        {/* Reptilian Brain */}
                        <div className="standard-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>🧬</div>
                            <div style={{
                                fontSize: 10, fontWeight: 800, color: '#ef4444',
                                letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8,
                            }}>The Reptilian Brain</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                                Survival & Instinct
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                                We activate threat-detection first. Our AI agents identify revenue leaks as an
                                immediate danger to your business survival, triggering the biological need to act.
                            </p>
                        </div>

                        {/* Limbic Brain */}
                        <div className="standard-card" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>💜</div>
                            <div style={{
                                fontSize: 10, fontWeight: 800, color: '#a78bfa',
                                letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8,
                            }}>The Limbic Brain</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                                Emotion & Memory
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                                We bridge the gap with empathy. Our agents establish rapport and paint the dopaminergic
                                vision of a frictionaless, automated future for your team.
                            </p>
                        </div>

                        {/* Neocortex */}
                        <div className="standard-card" style={{ borderColor: 'rgba(59,130,246,0.2)' }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
                            <div style={{
                                fontSize: 10, fontWeight: 800, color: '#3b82f6',
                                letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8,
                            }}>The Neocortex</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                                Logic & Justification
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                                Finally, we provide the ROI math. We give the logical brain the hard data it needs
                                to justify the decision the subconscious has already made.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Competitor Comparison ── */}
            <section
                id="comparison"
                ref={resultsStripRef}
                className="section-container"
                style={{
                    opacity: resultsStripVisible ? 1 : 0,
                    transform: resultsStripVisible ? 'translateY(0)' : 'translateY(40px)',
                    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}
            >
                <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label">Why Not Just Hire?</div>
                    <h2 className="section-title">
                        BioDynamX vs. hiring a team. <span style={{ color: "#00ff41" }}>Do the math.</span>
                    </h2>

                    <div style={{
                        marginTop: 40,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 24,
                        overflow: "hidden",
                    }}>
                        <div style={{
                            display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr",
                            padding: "16px 24px",
                            background: "rgba(255,255,255,0.04)",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            fontSize: 11, fontWeight: 800,
                            color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em",
                        }}>
                            <span>FEATURE</span>
                            <span style={{ textAlign: "center" }}>HUMAN TEAM</span>
                            <span style={{ textAlign: "center", color: "#00ff41" }}>BIODYNAMX AI</span>
                        </div>

                        {[
                            { f: "Monthly Cost", h: "$12,400+", a: "$1,497", high: true },
                            { f: "Response Time", h: "3+ Hours", a: "< 1 Second" },
                            { f: "Available Hours", h: "9 AM - 5 PM", a: "24/7/365" },
                            { f: "Consistency", h: "Variable", a: "100% Perfect" },
                            { f: "Sick Days / Turnover", h: "Constant", a: "Zero" },
                        ].map((row) => (
                            <div key={row.f} style={{
                                display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr",
                                padding: "14px 24px",
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                fontSize: 13,
                            }}>
                                <span style={{ fontWeight: 600, color: "#fff" }}>{row.f}</span>
                                <span style={{ textAlign: "center", color: row.high ? "#ff6b6b" : "rgba(255,255,255,0.4)" }}>{row.h}</span>
                                <span style={{ textAlign: "center", color: "#00ff41", fontWeight: 700 }}>{row.a}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 24, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                        That&apos;s <span style={{ color: "#00ff41", fontWeight: 800 }}>96% less cost</span> for <span style={{ color: "#00ff41", fontWeight: 800 }}>10x more productivity.</span>
                    </div>
                </div>
            </section>

            {/* ── Enterprise Security & Compliance ── */}
            {
                !isActive && (
                    <section
                        id="security"
                        ref={authoritySectionRef}
                        className="section-container"
                        style={{
                            background: "linear-gradient(180deg, transparent 0%, rgba(16,185,129,0.02) 100%)",
                            opacity: authoritySectionVisible ? 1 : 0,
                            transform: authoritySectionVisible ? 'translateY(0)' : 'translateY(40px)',
                            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                        }}
                    >
                        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
                            <div className="section-label" style={{ color: "#10b981" }}>Enterprise Architecture</div>
                            <h2 className="section-title">
                                Military-grade security. <span style={{ color: "#10b981" }}>Universal compliance.</span>
                            </h2>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: 16,
                                marginTop: 40,
                                textAlign: "left",
                            }}>
                                {[
                                    { icon: "🛡️", title: "PII Redaction", desc: "Sensitive customer data (SSNs, cards) is auto-redacted in real-time." },
                                    { icon: "🔒", title: "AES-256 Encryption", desc: "All data is encrypted at rest and in transit using TLS 1.3 standards." },
                                    { icon: "📊", title: "Full Audit Trail", desc: "Every word, tool call, and handoff is timestamped and searchable." },
                                    { icon: "⚖️", title: "Compliance Ready", desc: "Built for HIPAA, PCI-DSS, GDPR, and TCPA frameworks." },
                                ].map((item) => (
                                    <div key={item.title} className="glass-card" style={{
                                        padding: 24, borderRadius: 20, border: "1px solid rgba(16,185,129,0.1)",
                                        background: "rgba(16,185,129,0.03)",
                                    }}>
                                        <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{item.title}</div>
                                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* ── Risk-Free Guarantee ── */}
            <section
                ref={auditCtaRef}
                className="section-container"
                style={{
                    padding: "80px 32px",
                    opacity: auditCtaVisible ? 1 : 0,
                    transform: auditCtaVisible ? 'translateY(0)' : 'translateY(40px)',
                    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}
            >
                <div style={{
                    maxWidth: 800, margin: "0 auto", textAlign: "center",
                    padding: "60px 40px",
                    background: "linear-gradient(135deg, rgba(0,255,65,0.04) 0%, rgba(59,130,246,0.04) 100%)",
                    border: "1px solid rgba(0,255,65,0.15)",
                    borderRadius: 32,
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
                    <h2 className="section-title">5x ROI — or your money back.</h2>
                    <p className="section-desc" style={{ maxWidth: 540, margin: "0 auto 32px" }}>
                        If our AI doesn&apos;t deliver at least 5x your investment in recovered revenue within 90 days, we&apos;ll refund every penny. No questions asked.
                    </p>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="primary-btn-green" style={{ width: "auto", padding: "18px 48px" }}>
                        Start Risk-Free Trial
                    </button>
                    <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                        No contracts · Cancel anytime · Results in under 14 days
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section
                id="pricing"
                ref={finalCtaRef}
                className="section-container"
                style={{
                    opacity: finalCtaVisible ? 1 : 0,
                    transform: finalCtaVisible ? 'translateY(0)' : 'translateY(40px)',
                    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
                }}
            >
                <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label">Investment</div>
                    <div className="pricing-card" style={{ marginTop: 24 }}>
                        <div className="popular-badge">ELITE ACCESS</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>BioDynamX Growth Engine</div>
                        <div className="price-container">
                            <span className="price-anchor">$2,497</span>
                            <span className="price-main">$1,497</span>
                            <span className="price-suffix">/mo</span>
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
                            One flat fee. All 11 agents included. Unlimited potential.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{
                padding: "60px 32px 32px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.2)",
            }}>
                <div className="footer-container" style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40,
                    maxWidth: 1200, margin: "0 auto",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 28, height: 28, background: "#00ff41", borderRadius: 6 }} />
                            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>BioDynamX</span>
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                            The world&apos;s first neurobiology-powered AI platform for revenue recovery and scales. Built for Web 4.0.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: 12, color: "#fff", marginBottom: 16, letterSpacing: "0.1em" }}>COMPANY</h4>
                        <a href="/about" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>About Us</a>
                        <a href="/dashboard" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>Revenue Dashboard</a>
                        <a href="/testimonials" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>Success Stories</a>
                        <a href="/press" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>Press</a>
                    </div>
                    <div>
                        <h4 style={{ fontSize: 12, color: "#fff", marginBottom: 16, letterSpacing: "0.1em" }}>PLATFORM</h4>
                        <a href="/pricing" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>Elite Pricing</a>
                        <a href="/audit" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>Free 20-Point Audit</a>
                        <a href="/llms.txt" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>AI Directory (llms.txt)</a>
                        <a href="/partners" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>Partner Login</a>
                    </div>
                    <div>
                        <h4 style={{ fontSize: 12, color: "#fff", marginBottom: 16, letterSpacing: "0.1em" }}>TRUST &amp; LEGAL</h4>
                        <a href="/security" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>Security Protocol</a>
                        <a href="/privacy" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>Privacy Policy</a>
                        <a href="/terms" style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", marginBottom: 10 }}>Terms of Service</a>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 16 }}>✓ GDPR &amp; SOC 2 READY</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 4 }}>Military-Grade AES-256</div>
                    </div>
                </div>
                <div style={{
                    marginTop: 60, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)",
                    textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)",
                }}>
                    © 2026 BioDynamX Engineering Group. All rights reserved. Neuroscience for the digital age.
                </div>
            </footer>
        </div >
    );
}

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
