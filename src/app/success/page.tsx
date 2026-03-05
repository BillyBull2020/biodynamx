"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";

/* ─── Deployment Status Data ───────────────────────── */
const DEPLOYMENT_STEPS = [
    { label: "Vault Architecture", status: "Initialized", icon: "🏛️" },
    { label: "AEO Schema", status: "Injected", icon: "🧬" },
    { label: "Lead Capture latency", status: "0.4s Response Bound", icon: "⚡" },
    { label: "Nurture Sequence", status: "Active (Stealth Mode)", icon: "👁️" },
    { label: "ROI Bridge", status: "Quantification Online", icon: "📊" },
    { label: "System Protocol", status: "Online", icon: "✅" }
];

export default function SuccessPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const [activeStep, setActiveStep] = useState(0);

    // Agent step ticker
    useEffect(() => {
        const stepTimer = setInterval(() => {
            setActiveStep(prev =>
                prev < DEPLOYMENT_STEPS.length - 1 ? prev + 1 : prev
            );
        }, 800);
        return () => clearInterval(stepTimer);
    }, []);

    // GSAP entrance animations
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.5 }
        );

        tl.fromTo(logRef.current,
            { y: 20, opacity: 0, filter: "blur(4px)" },
            { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8 },
            0.3
        );
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-screen flex flex-col items-center justify-center opacity-0 relative overflow-hidden bg-[#0a0a0a] text-slate-200"
        >
            {/* 1px Grid overlay for consistency with the Vault */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

            <div className="max-w-xl w-full mx-4 text-center relative z-10">
                <div className="mb-8">
                    <h1 className="text-2xl lg:text-4xl font-bold tracking-widest text-[var(--audit-green)] font-mono uppercase mb-2">
                        Deployment Confirmation
                    </h1>
                    <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                        System Control Transferred to BioDynamX Engine
                    </p>
                </div>

                {/* Event Log Window */}
                <div ref={logRef} className="bento-grid-item p-6 mb-8 text-left bg-[rgba(0,0,0,0.6)] border-l-2 border-l-[var(--audit-green)] w-full">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                        <span className="font-mono text-[10px] tracking-widest text-white/50 uppercase">System Status</span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--audit-green)] animate-pulse" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--audit-green)]">Live</span>
                        </div>
                    </div>

                    <div className="space-y-4 font-mono text-xs">
                        {DEPLOYMENT_STEPS.slice(0, activeStep + 1).map((step, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-4 py-1 border-b border-white/5 transition-opacity duration-300 ${i === activeStep && i < DEPLOYMENT_STEPS.length - 1 ? 'opacity-70 animate-pulse' : 'opacity-100'}`}
                            >
                                <span className="text-[14px]">{step.icon}</span>
                                <span className="text-white/60 uppercase tracking-widest flex-1">{step.label}</span>
                                <span className="text-[var(--audit-green)] uppercase font-bold tracking-widest text-[10px]">{step.status}</span>
                            </div>
                        ))}
                    </div>

                    {activeStep === DEPLOYMENT_STEPS.length - 1 && (
                        <div className="mt-8 pt-4 border-t border-white/10 text-center animate-fade-in text-[10px] uppercase font-mono tracking-widest text-white/40">
                            &quot;Go watch your kids. We&apos;ve got the shop covered.&quot;
                        </div>
                    )}
                </div>

                {/* CTA */}
                <Link
                    href="/"
                    className={`inline-block px-12 py-4 bg-[rgba(0,255,65,0.1)] border border-[rgba(0,255,65,0.4)] hover:bg-[rgba(0,255,65,0.2)] text-[var(--audit-green)] font-mono text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)] ${activeStep === DEPLOYMENT_STEPS.length - 1 ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                >
                    Return to War Room
                </Link>
            </div>
        </div>
    );
}
