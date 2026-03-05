"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface AnimatedCounterProps {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    color?: string;
    decimals?: number;
    duration?: number;
}

function AnimatedCounter({ label, value, prefix = "", suffix = "", color = "#34d399", decimals = 0, duration = 2.0 }: AnimatedCounterProps) {
    const valueRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!valueRef.current || !containerRef.current) return;

        // Slot machine count-up
        const obj = { val: 0 };
        gsap.to(obj, {
            val: value,
            duration: duration,
            ease: "power2.out",
            onUpdate: () => {
                if (valueRef.current) {
                    const formatted = decimals > 0
                        ? obj.val.toFixed(decimals)
                        : Math.round(obj.val).toLocaleString();
                    valueRef.current.textContent = `${prefix}${formatted}${suffix}`;
                }
            }
        });

        // Entrance
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 15, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
        );
    }, [value, prefix, suffix, decimals, duration]);

    return (
        <div ref={containerRef} className="rounded-xl px-4 py-3" style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${color}22`,
        }}>
            <span className="text-[10px] uppercase tracking-wider font-bold block mb-1" style={{ color: color + "80" }}>
                {label}
            </span>
            <span ref={valueRef} className="text-xl font-black block" style={{ color }}>
                {prefix}0{suffix}
            </span>
        </div>
    );
}

// ──────────────────────────────────

export interface FirepowerData {
    techDebt: {
        markers: string[];
        severity: "critical" | "high" | "medium" | "low";
    };
    roi: {
        annualSavings: number;
        monthlySavings: number;
        roiMultiplier: number;
        hoursRecovered: number;
        optimizationLoopNeeded: boolean;
    };
    competitors: {
        name: string;
        strength: string;
        threat: "high" | "medium" | "low";
    }[];
}

interface FirepowerDashboardProps {
    data: FirepowerData | null;
    isVisible: boolean;
}

export default function FirepowerDashboard({ data, isVisible }: FirepowerDashboardProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        if (isVisible && data) {
            gsap.fromTo(containerRef.current,
                { x: -60, opacity: 0, filter: "blur(12px)" },
                { x: 0, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }
            );
        } else if (!isVisible) {
            gsap.to(containerRef.current, {
                x: -60, opacity: 0, filter: "blur(12px)",
                duration: 0.4, ease: "power2.in"
            });
        }
    }, [isVisible, data]);

    if (!data) return null;

    const severityColor = {
        critical: "#ef4444",
        high: "#f97316",
        medium: "#fbbf24",
        low: "#34d399",
    };

    const threatColor = {
        high: "#ef4444",
        medium: "#fbbf24",
        low: "#34d399",
    };

    return (
        <div
            ref={containerRef}
            className="fixed left-4 top-4 bottom-4 w-72 z-40 flex flex-col gap-3 overflow-y-auto pr-1 opacity-0"
            style={{ scrollbarWidth: "thin" }}
        >
            {/* Header */}
            <div className="px-4 py-3 rounded-2xl" style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}>
                <div className="flex items-center gap-2">
                    <span className="text-base">🔥</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold">Firepower Dashboard</span>
                </div>
                <p className="text-white/40 text-[11px] mt-1">Real-time business intelligence</p>
            </div>

            {/* ROI Counter Cards — Slot Machine Style */}
            <div className="px-4 py-4 rounded-2xl" style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(234,179,8,0.04))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(16,185,129,0.12)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            }}>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400/60 font-bold block mb-3">
                    ROI Analysis
                </span>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <AnimatedCounter
                        label="Annual Savings"
                        value={data.roi.annualSavings}
                        prefix="$"
                        color="#34d399"
                        duration={2.5}
                    />
                    <AnimatedCounter
                        label="Monthly"
                        value={data.roi.monthlySavings}
                        prefix="$"
                        color="#34d399"
                        duration={2.0}
                    />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <AnimatedCounter
                        label="ROI Multiple"
                        value={data.roi.roiMultiplier}
                        suffix="x"
                        color="#eab308"
                        decimals={1}
                        duration={3.0}
                    />
                    <AnimatedCounter
                        label="Hours Recovered"
                        value={data.roi.hoursRecovered}
                        suffix="/yr"
                        color="#818cf8"
                        duration={2.5}
                    />
                </div>

                {data.roi.optimizationLoopNeeded ? (
                    <div className="rounded-lg px-3 py-2 text-[11px] text-amber-300 font-medium"
                        style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.15)" }}>
                        ⚠ Optimization Loop Active — Fine-tuning for 2x guarantee
                    </div>
                ) : (
                    <div className="rounded-lg px-3 py-2 text-[11px] text-emerald-300 font-medium"
                        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                        ✓ 5x ROI Guarantee Met — {data.roi.roiMultiplier.toFixed(1)}x return confirmed
                    </div>
                )}
            </div>

            {/* Tech Debt Markers */}
            <div className="px-4 py-4 rounded-2xl" style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            }}>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Tech Debt</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{
                            background: severityColor[data.techDebt.severity] + "15",
                            color: severityColor[data.techDebt.severity],
                            border: `1px solid ${severityColor[data.techDebt.severity]}30`
                        }}>
                        {data.techDebt.severity}
                    </span>
                </div>
                {data.techDebt.markers.map((marker, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-white/60 mb-2 last:mb-0">
                        <span className="mt-0.5 text-[10px]" style={{ color: severityColor[data.techDebt.severity] }}>●</span>
                        {marker}
                    </div>
                ))}
            </div>

            {/* Competitor Threats */}
            <div className="px-4 py-4 rounded-2xl" style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            }}>
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-3">
                    Competitive Threats
                </span>
                {data.competitors.map((comp, i) => (
                    <div key={i} className="mb-2.5 last:mb-0">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/80 font-semibold">{comp.name}</span>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                                style={{
                                    background: threatColor[comp.threat] + "15",
                                    color: threatColor[comp.threat],
                                }}>
                                {comp.threat}
                            </span>
                        </div>
                        <p className="text-[11px] text-white/35 mt-0.5">{comp.strength}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
