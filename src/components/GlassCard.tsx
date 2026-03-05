"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface GlassCardProps {
    text: string;
    onDone: () => void;
}

export default function GlassCard({ text, onDone }: GlassCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;

        // Pop in
        const tl = gsap.timeline();
        tl.fromTo(el,
            { scale: 0.5, opacity: 0, y: 30, filter: "blur(8px)" },
            { scale: 1, opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "back.out(1.5)" }
        );

        // Hold for 4 seconds, then melt away
        tl.to(el, {
            scale: 0.8,
            opacity: 0,
            y: -20,
            filter: "blur(12px)",
            duration: 0.8,
            ease: "power2.in",
            delay: 4,
            onComplete: onDone,
        });
    }, [onDone]);

    return (
        <div
            ref={cardRef}
            className="pointer-events-none px-5 py-3 rounded-2xl max-w-xs text-sm text-white/90 font-medium leading-relaxed"
            style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px) saturate(1.5)",
                WebkitBackdropFilter: "blur(20px) saturate(1.5)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
        >
            <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Data Point</span>
            </div>
            {text}
        </div>
    );
}
