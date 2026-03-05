"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface SchedulingModalProps {
    isOpen: boolean;
    onClose: () => void;
    prefillData?: {
        name?: string;
        email?: string;
        notes?: string;
    };
}

export default function SchedulingModal({ isOpen, onClose, prefillData }: SchedulingModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // GSAP Blur-in slide from right
            gsap.set(overlayRef.current, { display: "flex" });
            gsap.fromTo(overlayRef.current,
                { opacity: 0, backdropFilter: "blur(0px)" },
                { opacity: 1, backdropFilter: "blur(12px)", duration: 0.4, ease: "power2.out" }
            );
            gsap.fromTo(panelRef.current,
                { x: "100%", opacity: 0, filter: "blur(20px)" },
                { x: "0%", opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out", delay: 0.1 }
            );
        } else {
            // Animate out
            gsap.to(panelRef.current, {
                x: "100%", opacity: 0, filter: "blur(20px)",
                duration: 0.4, ease: "power2.in"
            });
            gsap.to(overlayRef.current, {
                opacity: 0, backdropFilter: "blur(0px)",
                duration: 0.3, delay: 0.2, ease: "power2.in",
                onComplete: () => {
                    gsap.set(overlayRef.current, { display: "none" });
                }
            });
        }
    }, [isOpen]);

    // Build Calendly URL with prefill parameters
    const buildCalendlyUrl = () => {
        const baseUrl = "https://calendly.com/biodynamx/new-meeting-1";
        const params = new URLSearchParams();
        if (prefillData?.name) params.set("name", prefillData.name);
        if (prefillData?.email) params.set("email", prefillData.email);
        if (prefillData?.notes) params.set("a1", prefillData.notes); // Calendly custom answer field
        const query = params.toString();
        return query ? `${baseUrl}?${query}` : baseUrl;
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 items-center justify-end hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div
                ref={panelRef}
                className="relative w-full max-w-lg h-full md:h-[90vh] md:my-auto md:mr-6 md:rounded-2xl overflow-hidden flex flex-col"
                style={{
                    background: "linear-gradient(135deg, rgba(15,15,30,0.98), rgba(10,10,25,0.98))",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    boxShadow: "0 0 60px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-amber-400 tracking-tight">Schedule a Deep Dive</h2>
                        <p className="text-sm text-gray-400 mt-1">Pick a time with our technical lead</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Calendly Embed */}
                <div className="flex-1 overflow-hidden">
                    <iframe
                        src={buildCalendlyUrl()}
                        className="w-full h-full border-0"
                        title="Schedule Meeting"
                        allow="camera; microphone"
                    />
                </div>

                {/* Footer with agent note */}
                <div className="px-6 py-3 border-t border-white/10 bg-amber-900/10">
                    <p className="text-xs text-amber-300/70 text-center">
                        ⚡ Alpha is standing by — your meeting details will sync automatically
                    </p>
                </div>
            </div>
        </div>
    );
}
