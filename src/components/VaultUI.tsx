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
import NeuralOrb from "./NeuralOrb";
import JennySpline from "./JennySpline";
import GlitchOverlay from "./GlitchOverlay";
import TransformationSection from "./TransformationSection";
import AgentCarousel from "./AgentCarousel";
import { VisualJenny } from "@/lib/visual-jenny";
import { VisualBridge, type VisualCommand } from "@/lib/visual-bridge";
import { initGSAPAnimations } from "@/lib/gsap-animations";
import IronClawVisualPanel from "./IronClawVisualPanel";
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
}

interface Stat {
    val: number;
    suffix: string;
    label: string;
    sub: string;
}

function StatItem({ stat, isVisible }: { stat: Stat; isVisible: boolean }) {
    const value = useCountUp(stat.val, isVisible, 2500, stat.suffix);
    return (
        <div className="vault-stat-item" style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20,
            padding: "24px 16px",
            transition: "transform 0.3s ease",
        }}>
            <div className="vault-stat-value" style={{
                fontSize: 32, fontWeight: 900, color: "#fff",
                letterSpacing: "-0.02em", marginBottom: 4,
                textShadow: "0 0 20px rgba(59,130,246,0.3)"
            }}>
                {stat.label.includes("Revenue") ? "$" + value : value}
            </div>
            <div className="vault-stat-label" style={{
                fontSize: 11, fontWeight: 800, color: "#3b82f6",
                textTransform: "uppercase", letterSpacing: "0.1em"
            }}>{stat.label}</div>
            <div className="vault-stat-sub" style={{
                fontSize: 12, color: "rgba(255,255,255,0.4)",
                marginTop: 4
            }}>{stat.sub}</div>
        </div>
    );
}

function VisualProjection({ activeVisual, fading }: { activeVisual: any, fading: boolean }) {
    if (!activeVisual.type) return null;
    return (
        <div style={{
            position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
            width: "90vw", maxWidth: 400, zIndex: 100,
            opacity: fading ? 0 : 1, transition: "opacity 0.6s ease-in-out"
        }}>
            <div className="glass-card" style={{ padding: 20, borderRadius: 24, border: "1px solid rgba(0,255,65,0.2)", background: "rgba(0,0,0,0.8)" }}>
                {activeVisual.type === "image" && activeVisual.imageUrl && (
                    <div style={{ position: "relative", width: "100%", height: 200, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
                        <Image src={activeVisual.imageUrl} alt={activeVisual.title || "Visual Context"} fill style={{ objectFit: "cover" }} />
                    </div>
                )}
                {activeVisual.type === "stats" && activeVisual.stats && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                        {Object.entries(activeVisual.stats).map(([k, v]) => (
                            <div key={k} style={{ padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 12 }}>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{k}</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: "#00ff41" }}>{v as string}</div>
                            </div>
                        ))}
                    </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{activeVisual.title}</div>
                {activeVisual.neuroReason && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>🧠 {activeVisual.neuroReason}</div>}
            </div>
        </div>
    );
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

    // ─── Visual Jenny State ──────────────────────────────────────
    const visualJennyRef = useRef<VisualJenny | null>(null);
    const [activeVisual, setActiveVisual] = useState<{
        type: "image" | "stats" | "loading" | "comparison" | null;
        imageUrl?: string;
        title?: string;
        subtitle?: string;
        brainLayer?: string;
        neuroReason?: string;
        stats?: Record<string, string | number>;
        transition?: string;
    }>({ type: null });
    const [visualFading, setVisualFading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [amplitude, setAmplitude] = useState(0);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

    // ─── Visual Jenny lifecycle ────────────────────────────────
    useEffect(() => {
        // Subscribe to visual commands from Visual Jenny
        const unsub = VisualBridge.onVisualCommand((cmd: VisualCommand) => {
            switch (cmd.type) {
                case "show_image":
                    setVisualFading(false);
                    setActiveVisual({
                        type: "image",
                        imageUrl: cmd.payload.imageDataUrl || cmd.payload.imageUrl,
                        title: cmd.payload.title,
                        brainLayer: cmd.payload.brainLayer,
                        neuroReason: cmd.payload.neuroReason,
                        transition: cmd.payload.transition,
                    });
                    // Auto-clear after duration
                    if (cmd.payload.duration) {
                        setTimeout(() => {
                            setVisualFading(true);
                            setTimeout(() => setActiveVisual({ type: null }), 600);
                        }, cmd.payload.duration);
                    }
                    break;
                case "show_stats_card":
                    setVisualFading(false);
                    setActiveVisual({
                        type: "stats",
                        title: cmd.payload.title,
                        stats: cmd.payload.stats,
                        brainLayer: cmd.payload.brainLayer,
                        neuroReason: cmd.payload.neuroReason,
                    });
                    if (cmd.payload.duration) {
                        setTimeout(() => {
                            setVisualFading(true);
                            setTimeout(() => setActiveVisual({ type: null }), 600);
                        }, cmd.payload.duration);
                    }
                    break;
                case "show_loading":
                    setVisualFading(false);
                    setActiveVisual({
                        type: "loading",
                        title: cmd.payload.title,
                        subtitle: cmd.payload.subtitle,
                    });
                    break;
                case "show_comparison":
                    setVisualFading(false);
                    setActiveVisual({
                        type: "comparison",
                        title: cmd.payload.title,
                        stats: cmd.payload.stats,
                        brainLayer: cmd.payload.brainLayer,
                    });
                    if (cmd.payload.duration) {
                        setTimeout(() => {
                            setVisualFading(true);
                            setTimeout(() => setActiveVisual({ type: null }), 600);
                        }, cmd.payload.duration);
                    }
                    break;
                case "clear_visual":
                    setVisualFading(true);
                    setTimeout(() => setActiveVisual({ type: null }), 600);
                    break;
                case "navigate_section": {
                    const el = document.getElementById(cmd.payload.sectionId || "");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    break;
                }
            }
        });
        return () => unsub();
    }, []);

    // ─── GSAP Scroll Animations ───────────────────────────────
    useEffect(() => {
        // Run after first paint so GSAP can measure layout
        const id = setTimeout(() => {
            const cleanup = initGSAPAnimations();
            return cleanup;
        }, 300);
        return () => clearTimeout(id);
    }, []);

    // ─── Real-time Amplitude Tracking ────────────────────────
    useEffect(() => {
        if (!analyser || phase === "standby") {
            if (amplitude !== 0) setAmplitude(0);
            return;
        }
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let animId: number;

        const update = () => {
            analyser.getByteTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const v = (dataArray[i] - 128) / 128;
                sum += v * v;
            }
            const rms = Math.sqrt(sum / dataArray.length);
            // Amplify for visual effect
            setAmplitude(Math.min(1.0, rms * 4));
            animId = requestAnimationFrame(update);
        };

        animId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animId);
    }, [analyser, phase]);

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
            heroHeadline: "Imagine If Your Team Never Sleeps, Never Quits, and Never Misses a Close.",
            heroTypewriterPrefix: "Built for ",
            heroLossAversion: "Deploy the BioDynamX voice AI system that doesn't just answer questions—they identify pain, handle objections in real-time, and close deals 24/7 using proven neuro-sales frameworks. Scale your revenue without the overhead of additional employees.",
            heroDiagnosticGap: "From building your new website and dominating AEO & GEO with SEO, to ensuring your brand is the top recommendation on AI search engines like ChatGPT, Perplexity, and Gemini—we handle it all. You take back your freedom. We scale your revenue.",
            heroHook: "Stop working in your business and start working on it. Let our lead agent, Jenny, map out your custom AI growth strategy in exactly 60 seconds—free, live, on your screen right now.",
            heroBadge: "🧠 World's first neurobiology-powered Artificial Intelligence · Built for Web 4.0",
            heroWeb4Badge: "🌐 WEB 4.0 NATIVE",
            onboardingSpots: `🔴 Only 3 free audits left today | 4,000+ Community Members | 5x ROI Guarantee`,
            offerExpires: `⏳ Offer expires in 10h 36m 10s`,
            buttonTalkExperts: "Show Me My AI Growth Strategy →",
            buttonSecondary: "Automate the Tasks I Hate →",
            buttonHandoff: "Switching to Mark...",
            buttonHandoffSub: "Building your ROI Bridge",
            buttonJennyActive: "Jenny is Analyzing",
            buttonMarkActive: "Mark is Presenting",
            buttonInterrupt: "Tap to interrupt",
            navPricing: "Pricing",
            navFreeAudit: "Free Audit",
            navHowItWorks: "Security",
            navResults: "Security",
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
            heroHeadline: "Imagina Si Tu Equipo Nunca Duerme, Nunca Se Rinde y Nunca Pierde un Cierre.",
            heroTypewriterPrefix: "Diseñado para ",
            heroLossAversion: "Implementa el sistema de voz IA de BioDynamX que no solo responde preguntas—identifica el dolor, maneja objeciones en tiempo real y cierra ventas 24/7 usando marcos comprobados de neuro-ventas. Escala tus ingresos sin el costo de empleados adicionales.",
            heroDiagnosticGap: "Desde la creación de su nuevo sitio web y el dominio de AEO & GEO con SEO, hasta garantizar que su marca sea la recomendación principal en motores de búsqueda de IA como ChatGPT, Perplexity y Gemini—nos encargamos de todo. Usted recupera su libertad. Nosotros escalamos sus ingresos.",
            heroHook: "Deje de trabajar en su negocio y comience a trabajar en él. Deje que nuestra agente principal, Jenny, diseñe su estrategia de crecimiento de IA personalizada en exactamente 60 segundos—gratis, en vivo, en su pantalla ahora mismo.",
            heroBadge: "🧠 La primera Inteligencia Artificial impulsada por neurobiología del mundo · Diseñada para Web 4.0",
            heroWeb4Badge: "🌐 WEB 4.0 NATIVO",
            onboardingSpots: `🔴 Solo quedan 3 auditorías gratuitas hoy`,
            offerExpires: `⏳ La oferta expira en 10h 36m 10s`,
            buttonTalkExperts: "Muéstrame Mi Estrategia de Crecimiento de IA →",
            buttonSecondary: "Automatiza las Tareas que Odio →",
            buttonHandoff: "Cambiando a Mark...",
            buttonHandoffSub: "Construyendo su puente de ROI",
            buttonJennyActive: "Jenny está analizando",
            buttonMarkActive: "Mark está presentando",
            buttonInterrupt: "Toca para interrumpir",
            navPricing: "Precios",
            navFreeAudit: "Auditoría Gratis",
            navHowItWorks: "Seguridad",
            navResults: "Seguridad",
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
            onPhaseChange: (p, v) => {
                setPhase(p);
                setVisual(v);
                // Auto-dismiss error card the moment an agent goes active
                if (p.endsWith("_active") || p === "checkout" || p === "stitching") {
                    setErrorText(null);
                }
            },
            onStatusChange: () => { },
            onSpeakerChange: (speaker) => setIsSpeaking(speaker !== "idle"),
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
            onAnalyserReady: (node) => { setAnalyser(node); },
            // ★ IronClaw Visual Intelligence callbacks
            onVisualReady: (v) => {
                console.log(`[VaultUI] 🎨 IronClaw visual: ${v.brainLayer} — ${v.topic}`);
            },
            onNavigate: (sectionId) => {
                const el = document.getElementById(sectionId);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            },
            onStatsCard: (stats, title) => {
                console.log(`[VaultUI] 📊 IronClaw stats: ${title}`, stats);
            },
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
        // NOTE: VisualJenny is now started inside TeamOrchestrator.bootAgent()
        // Do NOT create a second instance here — that was the bug causing no visuals.
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
            onSpeakerChange: (speaker) => setIsSpeaking(speaker !== "idle"),
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
            onAnalyserReady: (node) => { setAnalyser(node); },
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
                        <div className="brand-tagline" style={{
                            fontSize: 10, fontWeight: 900, color: "#00ff41",
                            letterSpacing: "0.15em", textTransform: "uppercase",
                            opacity: 0.9, textShadow: "0 0 10px rgba(0,255,65,0.3)"
                        }}>Engineering Group</div>
                    </div>
                </div>

                <div className="nav-actions">
                    {/* Nav links — visible in standby, hidden on mobile (shown in mobile-nav-row) */}
                    {!isActive && (
                        <div className="nav-links-desktop">
                            {[
                                { label: t.navPricing, href: "/pricing" },
                                { label: t.navFreeAudit, href: "/audit" },
                                { label: "Security", href: "/security" },
                                { label: "Blog", href: "/blog" },
                                { label: "About", href: "/about" },
                                { label: "Glossary", href: "/glossary" },
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

                </div>
            </nav>

            {/* ── Lead Capture Modal ─────────────────────────── */}
            <LeadCaptureModal
                isOpen={showLeadModal}
                onClose={() => setShowLeadModal(false)}
                source="homepage"
            />

            {/* ── Hero Section ────────────────────────────── */}
            <section className="hero-container" style={{
                minHeight: isActive ? "calc(100vh - 60px)" : "90vh",
                display: "flex", flexDirection: "column", justifyContent: "center", position: "relative"
            }}>
                {/* STANDBY UI */}
                {!isActive && (
                    <div style={{
                        textAlign: "center", marginBottom: 32,
                        animation: "fadeUp 0.8s ease-out",
                    }}>
                        {/* New Eyebrow Badge */}
                        <div className="hero-premium-badge">
                            <span className="badge-glow" />
                            <span className="badge-text">{t.heroBadge}</span>
                        </div>

                        <h1 data-speakable="true" className="hero-headline animated-gradient-text" style={{ fontSize: "clamp(32px, 5.5vw, 68px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 28 }}>
                            {t.heroHeadline}
                        </h1>

                        <p data-speakable="true" className="hero-subheadline" style={{ maxWidth: 840, margin: "0 auto 32px", fontSize: "clamp(15px, 1.8vw, 19px)", color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                            {t.heroLossAversion}
                        </p>

                        <p style={{ maxWidth: 840, margin: "0 auto 40px", fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, fontWeight: 500 }}>
                            {t.heroDiagnosticGap}
                        </p>

                        {/* The Hook Hook Card */}
                        <div className="animate-fade-in" style={{
                            padding: "24px 32px",
                            background: "linear-gradient(135deg, rgba(0,255,65,0.08) 0%, rgba(59,130,246,0.08) 100%)",
                            border: "1px solid rgba(0,255,65,0.25)",
                            borderRadius: 24,
                            maxWidth: 640,
                            margin: "0 auto 48px",
                            position: "relative",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                        }}>
                            <div style={{ position: "absolute", inset: 0, opacity: 0.2, background: "radial-gradient(circle at center, #00ff4122 0%, transparent 70%)", pointerEvents: "none" }} />
                            <p data-speakable="true" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.95)", margin: 0, lineHeight: 1.6 }}>
                                {t.heroHook}
                            </p>
                        </div>

                        {/* THE BUTTONS (Double Bind Strategy) */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                            <div style={{ position: "relative", width: "100%", maxWidth: 440 }}>
                                <div style={{ position: "absolute", inset: -10, borderRadius: 24, background: "radial-gradient(ellipse, rgba(0,255,65,0.2) 0%, transparent 70%)", animation: "breathe 3s ease-in-out infinite", pointerEvents: "none" }} />
                                <button onClick={handleStart} className="primary-btn-green hover-lift" style={{ width: "100%", padding: "22px 32px", fontSize: 19, letterSpacing: "-0.01em" }}>
                                    {t.buttonTalkExperts}
                                </button>
                            </div>
                            <button onClick={handleStart} className="button-premium-secondary hover-lift" style={{ fontSize: 16 }}>
                                {t.buttonSecondary}
                            </button>
                        </div>

                        {/* Micro-Trust & Urgency */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 40 }}>
                            <div style={{
                                display: "flex", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "10px 24px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)"
                            }}>
                                {t.onboardingSpots}
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTIVE UI */}
                {isActive && (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        flex: 1, padding: "40px 20px", position: "relative", width: "100%", maxWidth: 860, margin: "0 auto",
                    }}>
                        <div style={{ position: "relative", width: 340, height: 340, marginBottom: 20 }}>
                            {/* Jenny gets the premium 3D Spline experience */}
                            {agentName === "Jenny" ? (
                                <JennySpline
                                    amplitude={amplitude}
                                    isActive={isActive}
                                    agentName={agentName}
                                    isSpeaking={isSpeaking}
                                />
                            ) : (
                                <NeuralOrb
                                    agentName={agentName}
                                    amplitude={amplitude}
                                    isActive={isActive}
                                    isSpeaking={isSpeaking}
                                />
                            )}
                        </div>

                        <div style={{ marginTop: 24, textAlign: "center" }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#00ff41", letterSpacing: "0.2em", marginBottom: 8 }}>{visual.phase === "handoff" ? "HANDOFF IN PROGRESS" : "NEURAL LINK ACTIVE"}</div>
                            <button onClick={handleStart} disabled={isHandoff} style={{
                                background: "rgba(0,255,65,0.08)", border: "1px solid rgba(0,255,65,0.3)", color: "#00ff41", padding: "12px 32px", borderRadius: 100, fontSize: 13, fontWeight: 800, cursor: isHandoff ? "wait" : "pointer"
                            }}>{buttonLabel}</button>
                            {errorText && (
                                <div style={{
                                    marginTop: 16,
                                    background: "rgba(255,68,68,0.08)",
                                    border: "1px solid rgba(255,68,68,0.3)",
                                    borderRadius: 12,
                                    padding: "14px 18px",
                                    textAlign: "left",
                                    maxWidth: 420,
                                    margin: "16px auto 0",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                        <span style={{ fontSize: 16 }}>⚡</span>
                                        <span style={{ color: "#ff6b6b", fontWeight: 700, fontSize: 13 }}>
                                            {errorText.includes("1008") ? "Agent temporarily unavailable" :
                                                errorText.includes("1007") ? "Connection handshake failed" :
                                                    errorText.includes("1006") ? "Network disconnected" :
                                                        "Connection interrupted"}
                                        </span>
                                    </div>
                                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "0 0 10px", lineHeight: 1.5 }}>
                                        {errorText.includes("1008") ? "This agent restarting — try again in a moment." :
                                            errorText.includes("1006") ? "Check your internet connection and try again." :
                                                "Tap retry to reconnect instantly."}
                                    </p>
                                    <button
                                        onClick={() => { setErrorText(null); handleStart(); }}
                                        style={{
                                            background: "rgba(255,68,68,0.15)",
                                            border: "1px solid rgba(255,68,68,0.4)",
                                            color: "#ff6b6b",
                                            padding: "6px 16px",
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            letterSpacing: "0.05em"
                                        }}
                                    >
                                        RETRY →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ★ IRONCLAW VISUAL PANEL — The "second screen" that displays
                             AI-generated images, stats, and navigation prompts
                             autonomously as Jenny speaks. This was the missing UI. */}
                        <div style={{
                            width: "100%",
                            marginTop: 32,
                            animation: "fadeUp 0.6s ease-out",
                        }}>
                            <IronClawVisualPanel
                                isActive={isActive}
                                agentName={agentName || "Jenny"}
                                agentColor={visual.borderColor}
                            />
                        </div>

                        <VisualProjection activeVisual={activeVisual} fading={visualFading} />
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

            {/* ── The BioDynamX Platform — Product Grid ── */}
            <section id="platform" aria-label="BioDynamX Platform Capabilities" className="section-container" style={{
                background: "linear-gradient(180deg, rgba(0,255,65,0.02) 0%, transparent 50%, rgba(59,130,246,0.02) 100%)",
                paddingTop: 60,
                paddingBottom: 60,
            }}>
                <div style={{ maxWidth: 960, margin: "0 auto" }}>
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                        marginBottom: 12,
                    }}>
                        <div style={{
                            fontSize: 10, fontWeight: 700, color: "#00ff41",
                            letterSpacing: "0.15em", textTransform: "uppercase",
                        }}>The Platform</div>
                        <div style={{
                            fontSize: 9, fontWeight: 800, color: "#000",
                            background: "#00ff41", borderRadius: 4,
                            padding: "2px 8px", letterSpacing: "0.08em",
                        }}>NEUROSCIENCE-POWERED</div>
                    </div>
                    <h2 data-speakable="true" className="section-title" style={{ marginBottom: 16 }}>
                        One Platform. <span style={{ color: "#00ff41" }}>Every Growth Lever.</span>
                    </h2>
                    <p className="section-desc" style={{ maxWidth: 640, margin: "0 auto 48px" }}>
                        We don&apos;t just answer calls. We build, automate, and dominate every channel your customers use to find you — powered by the neurobiology of decision-making.
                    </p>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
                        gap: 16,
                    }}>
                        {[
                            {
                                icon: "🎙️",
                                title: "Voice AI Agents",
                                badge: "CORE",
                                badgeColor: "#00ff41",
                                desc: "11 autonomous AI agents answer calls, qualify leads, handle objections, and close deals 24/7 using neuro-sales frameworks.",
                                borderColor: "rgba(0,255,65,0.15)",
                            },
                            {
                                icon: "🎬",
                                title: "Cinematic AI Video",
                                badge: "NEW",
                                badgeColor: "#8b5cf6",
                                desc: "Studio-quality AI commercials, product demos, and brand films — produced in hours, not weeks. Hollywood-grade visuals at startup prices.",
                                borderColor: "rgba(139,92,246,0.15)",
                            },
                            {
                                icon: "⚡",
                                title: "Marketing Automation",
                                badge: null,
                                badgeColor: null,
                                desc: "Email sequences, SMS follow-up, win-back campaigns, and drip nurture — all automated. Like Birdeye, but with neuroscience built in.",
                                borderColor: "rgba(59,130,246,0.15)",
                            },
                            {
                                icon: "🧠",
                                title: "GEO & AEO Domination",
                                badge: "AI SEARCH",
                                badgeColor: "#3b82f6",
                                desc: "We make ChatGPT, Gemini, and Perplexity recommend YOUR business by name. Generative Engine Optimization is the new SEO — and we own it.",
                                borderColor: "rgba(59,130,246,0.15)",
                            },
                            {
                                icon: "📍",
                                title: "Google Business Profile",
                                badge: null,
                                badgeColor: null,
                                desc: "Full GMB setup, optimization, review automation, and local search domination. 46% of Google searches have local intent — we capture them.",
                                borderColor: "rgba(251,191,36,0.15)",
                            },
                            {
                                icon: "⭐",
                                title: "Review Engine",
                                badge: null,
                                badgeColor: null,
                                desc: "AI-powered review collection and reputation management. Automatically request, monitor, and respond to reviews across Google and 200+ platforms.",
                                borderColor: "rgba(255,167,38,0.15)",
                            },
                            {
                                icon: "🌐",
                                title: "Website Builder",
                                badge: "WEB 4.0",
                                badgeColor: "#06b6d4",
                                desc: "Next-gen websites built with neuroscience-driven UX, ambient voice triggers, and conversion architecture. Not templates — engineered sales machines.",
                                borderColor: "rgba(6,182,212,0.15)",
                            },
                            {
                                icon: "📱",
                                title: "Social AI",
                                badge: null,
                                badgeColor: null,
                                desc: "AI agents create, schedule, and monitor social posts tuned for engagement. Content that triggers the Limbic Brain — not just fills a calendar.",
                                borderColor: "rgba(139,92,246,0.15)",
                            },
                            {
                                icon: "📊",
                                title: "Revenue Intelligence",
                                badge: null,
                                badgeColor: null,
                                desc: "Real-time dashboards showing exactly where revenue is leaking and how much your AI workforce is recovering. Full audit trail, zero guesswork.",
                                borderColor: "rgba(59,130,246,0.15)",
                            },
                        ].map((product, i) => (
                            <div key={i} style={{
                                padding: "28px 24px",
                                background: "rgba(255,255,255,0.025)",
                                border: `1px solid ${product.borderColor}`,
                                borderRadius: 16,
                                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                cursor: "default",
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                    e.currentTarget.style.transform = "translateY(-3px)";
                                    e.currentTarget.style.borderColor = product.borderColor.replace("0.15", "0.4");
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.borderColor = product.borderColor;
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                    <span style={{ fontSize: 24 }}>{product.icon}</span>
                                    <h3 style={{
                                        fontSize: 17, fontWeight: 800, color: "#fff",
                                        margin: 0, letterSpacing: "-0.01em", flex: 1,
                                    }}>{product.title}</h3>
                                    {product.badge && (
                                        <span style={{
                                            fontSize: 9, fontWeight: 800,
                                            color: "#000",
                                            background: product.badgeColor || "#fff",
                                            borderRadius: 4,
                                            padding: "2px 8px",
                                            letterSpacing: "0.08em",
                                            flexShrink: 0,
                                        }}>{product.badge}</span>
                                    )}
                                </div>
                                <p style={{
                                    fontSize: 13, color: "rgba(255,255,255,0.6)",
                                    lineHeight: 1.65, margin: 0,
                                }}>{product.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Platform bottom CTA */}
                    <div style={{
                        textAlign: "center", marginTop: 48,
                        padding: "32px 24px",
                        background: "linear-gradient(135deg, rgba(0,255,65,0.04), rgba(59,130,246,0.04))",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 20,
                    }}>
                        <p style={{
                            fontSize: 11, fontWeight: 700, color: "#00ff41",
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            margin: "0 0 20px", textAlign: "center",
                        }}>
                            TWO WAYS TO GROW
                        </p>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: 16,
                        }}>
                            {/* Self-Service Tier */}
                            <div style={{
                                padding: "24px 20px",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 14,
                            }}>
                                <div style={{
                                    fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)",
                                    letterSpacing: "0.1em", textTransform: "uppercase",
                                    marginBottom: 8,
                                }}>SELF-SERVICE · SaaS</div>
                                <div style={{
                                    fontSize: 28, fontWeight: 800, color: "#fff",
                                    letterSpacing: "-0.03em", marginBottom: 6,
                                }}>
                                    $497<span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>/mo</span>
                                </div>
                                <p style={{
                                    fontSize: 13, color: "rgba(255,255,255,0.5)",
                                    lineHeight: 1.6, margin: 0,
                                }}>
                                    Access the platform, tools, and AI agents. <strong style={{ color: "rgba(255,255,255,0.7)" }}>You run it.</strong> Perfect for tech-savvy teams who want control.
                                </p>
                            </div>

                            {/* Done-For-You Tier */}
                            <div style={{
                                padding: "24px 20px",
                                background: "linear-gradient(135deg, rgba(0,255,65,0.06), rgba(59,130,246,0.06))",
                                border: "1px solid rgba(0,255,65,0.2)",
                                borderRadius: 14,
                                position: "relative",
                            }}>
                                <div style={{
                                    position: "absolute", top: -10, right: 16,
                                    fontSize: 9, fontWeight: 800, color: "#000",
                                    background: "#00ff41", borderRadius: 4,
                                    padding: "3px 10px", letterSpacing: "0.06em",
                                }}>MOST POPULAR</div>
                                <div style={{
                                    fontSize: 9, fontWeight: 800, color: "#00ff41",
                                    letterSpacing: "0.1em", textTransform: "uppercase",
                                    marginBottom: 8,
                                }}>DONE-FOR-YOU · MANAGED AI</div>
                                <div style={{
                                    fontSize: 28, fontWeight: 800, color: "#fff",
                                    letterSpacing: "-0.03em", marginBottom: 2,
                                }}>
                                    <span style={{ fontSize: 16, textDecoration: "line-through", color: "rgba(255,255,255,0.3)", marginRight: 8 }}>$2,497</span>
                                    $1,497<span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>/mo</span>
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#ff6b6b", marginBottom: 8 }}>⚠️ LOCK THIS PRICE — Increases to $2,497/mo after 90 days</div>
                                <p style={{
                                    fontSize: 13, color: "rgba(255,255,255,0.5)",
                                    lineHeight: 1.6, margin: 0,
                                }}>
                                    <strong style={{ color: "#00ff41" }}>We do everything.</strong> Strategy, setup, optimization, content, video, SEO — your entire AI growth engine, fully managed. You don&apos;t lift a finger.
                                </p>
                            </div>
                        </div>

                        <p style={{
                            fontSize: 12, color: "rgba(255,255,255,0.35)",
                            margin: "20px 0 0", textAlign: "center",
                        }}>
                            Both tiers include the 5x ROI guarantee. No contracts. Cancel anytime.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── 3D Service Ecosystem — WOW factor ────────── */}
            {
                !isActive && (
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
                            <div className="premium-callout-badge">
                                <span className="badge-glow" />
                                <span className="badge-icon">🧠</span>
                                <span className="badge-text">
                                    We build custom software. We&apos;re not just another AI vendor.
                                </span>
                            </div>
                        </div>
                    </section>
                )
            }

            <section id="how-it-works" ref={howItWorksRef} aria-label="The BioDynamX Diagnostic Framework" className="section-container" style={{
                opacity: howItWorksVisible ? 1 : 0,
                transform: howItWorksVisible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            }}>
                <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
                    <div className="section-label" style={{ color: '#a78bfa' }}>The Foundations</div>
                    <h2 data-speakable="true" className="section-title">
                        Your Customer&apos;s Brain Has 3 Layers.<br />
                        <span style={{ color: "#00ff41" }}>Our AI Platform Speaks to All Three.</span>
                    </h2>
                    <p className="section-desc">
                        The Reptilian Brain responds to threats and survival. The Limbic Brain decides based on emotion. The Neocortex justifies with logic. Every agent in our elite workforce is trained to speak to all three — in the right order, every time.
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
                                Survival &amp; Instinct
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
                                Emotion &amp; Memory
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                                We bridge the gap with empathy. Our agents establish rapport and paint the dopaminergic
                                vision of a frictionless, automated future for your team.
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
                                Logic &amp; Justification
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                                Finally, we provide the ROI math. We give the logical brain the hard data it needs
                                to justify the decision the subconscious has already made.
                            </p>
                        </div>
                    </div>

                    {/* ── Elite 11 Workforce — Agent Showcase ── */}
                    <div style={{ marginTop: 60 }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "rgba(0,255,65,0.07)", border: "1px solid rgba(0,255,65,0.2)",
                            borderRadius: 30, padding: "5px 16px", marginBottom: 20,
                            fontSize: 10, fontWeight: 800, color: "#00ff41",
                            letterSpacing: "0.14em", textTransform: "uppercase",
                            backdropFilter: "blur(8px)",
                        }}>
                            <span style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: "#00ff41", display: "inline-block",
                                boxShadow: "0 0 8px #00ff41",
                                animation: "bdx-badge-blink 1.4s ease-in-out infinite",
                            }} />
                            11 AI Agents · Online Now · Zero Calls Missed
                        </div>
                        <div className="section-label" style={{ color: "#3b82f6" }}>The Elite Team</div>
                        <h2 className="section-title">
                            The Elite 11 <span className="animated-gradient-text">Workforce.</span>
                        </h2>
                        <p className="section-desc">
                            The World&apos;s First Autonomous Neuro-Workforce. Our agents aren&apos;t just bots. They are specialists
                            that operate 24/7 to capture, qualify, and close for your business.
                        </p>

                        <AgentCarousel onTalkTo={(agentId) => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            if (teamRef.current) { teamRef.current.initializeWithAgent(agentId); return; }
                            if (!apiKey) { setErrorText("API key missing"); return; }
                            setErrorText(null);
                            const t = createTeam();
                            teamRef.current = t;
                            t.initializeWithAgent(agentId);
                        }} />
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
                                2x Amazon best-selling author in AI & Business. Billy founded BioDynamX to merge **The Neurobiology of Choice** with enterprise-grade engineering. We architect **Persuasive Design** systems that eliminate choice paralysis and scale revenue.
                            </p>

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <a href="https://www.linkedin.com/in/billy-delataurus-biodynamx" target="_blank" rel="noopener noreferrer" className="social-pill-link">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    LinkedIn
                                </a>
                                <a href="https://www.facebook.com/groups/biodynamx" target="_blank" rel="noopener noreferrer" className="social-pill-link">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 11.123 11.234 3.123v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    Facebook (4,000+ Group)
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
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>The AI Business Revolution</div>
                                </div>
                            </a>

                            <a href="https://a.co/d/04GCeRAh" target="_blank" rel="noopener noreferrer" className="book-card">
                                <div style={{ fontSize: 24 }}>📗</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: "#ffa726", letterSpacing: "0.12em" }}>#1 BEST-SELLER</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>The Business Owner&apos;s Guide to AI Automation</div>
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

            {/* ── The Neuroscience Transformation (Friction vs Flow) ── */}
            <TransformationSection />



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
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>BioDynamX Growth Engine — Done-For-You</div>
                        <div className="price-container">
                            <span className="price-anchor">$2,497</span>
                            <span className="price-main">$1,497</span>
                            <span className="price-suffix">/mo</span>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#ff6b6b", marginTop: 8 }}>⚠️ Price increases to $2,497/mo after 90 days</div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
                            One flat fee. All 11 agents included. We do the work. Unlimited potential.
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
                        <h4 style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "0.15em" }}>COMPANY</h4>
                        <a href="/about" className="footer-link">About Us</a>
                        <a href="/dashboard" className="footer-link">Revenue Dashboard</a>
                        <a href="/testimonials" className="footer-link">Success Stories</a>
                        <a href="/press" className="footer-link">Press</a>
                    </div>
                    <div>
                        <h4 style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "0.15em" }}>PLATFORM</h4>
                        <a href="/pricing" className="footer-link">Elite Pricing</a>
                        <a href="/audit" className="footer-link">Free 20-Point Audit</a>
                        <a href="/llms.txt" className="footer-link">AI Directory (llms.txt)</a>
                        <a href="/partners" className="footer-link">Partner Login</a>
                        <a href="/glossary" className="footer-link">A–Z Glossary</a>
                    </div>
                    <div>
                        <h4 style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "0.15em" }}>TRUST & LEGAL</h4>
                        <a href="/security" className="footer-link">Security Protocol</a>
                        <a href="/privacy" className="footer-link">Privacy Policy</a>
                        <a href="/terms" className="footer-link">Terms of Service</a>
                        <div style={{ color: "#00ff41", fontSize: 11, fontWeight: 800, marginTop: 16, letterSpacing: "0.05em" }}>✓ GDPR & SOC 2 READY</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 4 }}>Military-Grade AES-256</div>
                    </div>
                </div>
                <div style={{
                    marginTop: 60, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.08)",
                    textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.02em"
                }}>
                    © 2026 BioDynamX Engineering Group. All rights reserved. Neuroscience for the digital age.
                </div>
            </footer>
            {/* Global cinematic interference during neural events */}
            <GlitchOverlay isActive={isSpeaking || isHandoff} intensity={isHandoff ? 2 : 0.5} />
        </div >
    );
}
