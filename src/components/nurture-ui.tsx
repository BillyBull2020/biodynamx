"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function NurtureUI() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeStage, setActiveStage] = useState(0);

    const stages = [
        { title: "+5 Mins: Journey SMS", description: "\"Critical AEO Leak Detected. See the fix.\" (Fear of Loss engaged)", icon: "📱", color: "text-rose-400" },
        { title: "+60 Mins: Veo 3 Email", description: "\"Your Business in 2027: Adapted vs. Obsolete\" (Video Simulation Sent)", icon: "✉️", color: "text-amber-400" },
        { title: "+24 Hrs: Mark's AI Call", description: "\"Do you want the 2.1x ROI slot, or should I release it?\" (Scarcity Lock)", icon: "📞", color: "text-emerald-400" }
    ];

    useEffect(() => {
        if (!containerRef.current) return;

        gsap.fromTo(containerRef.current.children,
            { x: -20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, stagger: 0.2, ease: "power2.out" }
        );

        const interval = setInterval(() => {
            setActiveStage((prev) => (prev + 1) % stages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [stages.length]);

    return (
        <div className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-white/50">Omni-Channel Nurture Active</h3>
            </div>

            <div ref={containerRef} className="space-y-3">
                {stages.map((stage, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-all duration-500 ${activeStage === idx
                            ? "border-white/20 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)] scale-[1.02]"
                            : "border-transparent opacity-50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{stage.icon}</span>
                            <div>
                                <h4 className={`text-sm font-bold ${activeStage === idx ? stage.color : "text-white/70"}`}>
                                    {stage.title}
                                </h4>
                                <p className="text-xs text-white/40 mt-1 italic">
                                    {stage.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
                <p className="text-[10px] text-emerald-400/50 font-mono tracking-wider">SYSTEM: Hunting Mode Engaged</p>
            </div>
        </div>
    );
}
