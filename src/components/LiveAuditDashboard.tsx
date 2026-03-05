"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export interface AuditData {
    url: string;
    siteSpeed: {
        score: number;
        loadTime: string;
        ttfb: string;
        issues: string[];
    };
    mobile: {
        score: number;
        isResponsive: boolean;
        issues: string[];
    };
    competitors: {
        name: string;
        strength: string;
    }[];
    revenueEstimate: {
        monthlyTraffic: number;
        conversionRate: number;
        industryAvg: number;
        leakingRevenue: string;
        potentialROI: string;
    };
}

interface LiveAuditDashboardProps {
    data: AuditData | null;
    isLoading: boolean;
}

export default function LiveAuditDashboard({ data, isLoading }: LiveAuditDashboardProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Progressive reveal: sections appear one by one with GSAP
    useEffect(() => {
        if (!data || !containerRef.current) return;

        const cards = containerRef.current.querySelectorAll(".audit-card");
        cards.forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, y: 30, scale: 0.95, filter: "blur(8px)" },
                {
                    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
                    duration: 0.6, ease: "power3.out",
                    delay: 0.4 + i * 0.8,
                }
            );
        });
    }, [data]);

    if (!data && !isLoading) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "#34d399";
        if (score >= 60) return "#fbbf24";
        if (score >= 40) return "#f97316";
        return "#ef4444";
    };

    return (
        <div
            ref={containerRef}
            className="fixed right-4 top-4 bottom-4 w-80 z-40 flex flex-col gap-3 overflow-y-auto pr-1"
            style={{ scrollbarWidth: "thin" }}
        >
            {/* Header */}
            <div className="audit-card px-4 py-3 rounded-2xl"
                style={{
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold">Live Audit</span>
                </div>
                <p className="text-white/80 text-sm font-semibold mt-1 truncate">{data?.url || "Scanning..."}</p>
                {isLoading && (
                    <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/5">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                )}
            </div>

            {data && (
                <>
                    {/* Site Speed Card */}
                    <div className="audit-card px-4 py-4 rounded-2xl opacity-0" style={{
                        background: "rgba(255,255,255,0.03)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                    }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-white/40">Performance</span>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black" style={{ color: getScoreColor(data.siteSpeed.score) }}>
                                    {data.siteSpeed.score}
                                </span>
                                <span className="text-[10px] text-white/30">/100</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                                <span className="text-white/30 block">Load Time</span>
                                <span className="text-white/80 font-semibold">{data.siteSpeed.loadTime}</span>
                            </div>
                            <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                                <span className="text-white/30 block">TTFB</span>
                                <span className="text-white/80 font-semibold">{data.siteSpeed.ttfb}</span>
                            </div>
                        </div>
                        {data.siteSpeed.issues.slice(0, 3).map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] text-red-300/70 mb-1.5">
                                <span className="mt-0.5 text-red-400">⚠</span>
                                {issue}
                            </div>
                        ))}
                    </div>

                    {/* Mobile Score Card */}
                    <div className="audit-card px-4 py-4 rounded-2xl opacity-0" style={{
                        background: "rgba(255,255,255,0.03)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                    }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-white/40">Mobile</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${data.mobile.isResponsive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                {data.mobile.isResponsive ? "Responsive" : "Not Responsive"}
                            </span>
                        </div>
                        {data.mobile.issues.slice(0, 2).map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] text-amber-300/70 mb-1.5">
                                <span className="mt-0.5 text-amber-400">📱</span>
                                {issue}
                            </div>
                        ))}
                    </div>

                    {/* Competitors Card */}
                    <div className="audit-card px-4 py-4 rounded-2xl opacity-0" style={{
                        background: "rgba(255,255,255,0.03)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                    }}>
                        <span className="text-xs font-bold uppercase tracking-wider text-white/40 block mb-3">Competitors</span>
                        {data.competitors.map((comp, i) => (
                            <div key={i} className="mb-2 last:mb-0">
                                <span className="text-sm text-white/80 font-semibold">{comp.name}</span>
                                <p className="text-[11px] text-white/40 mt-0.5">{comp.strength}</p>
                            </div>
                        ))}
                    </div>

                    {/* Revenue Card — The "Wow Factor" */}
                    <div className="audit-card px-4 py-4 rounded-2xl opacity-0" style={{
                        background: "linear-gradient(135deg, rgba(234,179,8,0.06), rgba(16,185,129,0.06))",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(234,179,8,0.15)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.2), 0 0 40px rgba(234,179,8,0.05)",
                    }}>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400/60 block mb-3">Revenue Analysis</span>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                                <span className="text-white/30 block">Monthly Traffic</span>
                                <span className="text-white/80 font-semibold">{data.revenueEstimate.monthlyTraffic.toLocaleString()}</span>
                            </div>
                            <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                                <span className="text-white/30 block">Conversion</span>
                                <span className="text-white/80 font-semibold">{data.revenueEstimate.conversionRate}%</span>
                                <span className="text-[10px] text-amber-400/60 block">avg: {data.revenueEstimate.industryAvg}%</span>
                            </div>
                        </div>
                        <div className="rounded-xl px-4 py-3 mb-2" style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.15)"
                        }}>
                            <span className="text-[10px] uppercase tracking-wider text-red-400/60 block">Leaking Revenue</span>
                            <span className="text-xl font-black text-red-400">{data.revenueEstimate.leakingRevenue}</span>
                        </div>
                        <div className="rounded-xl px-4 py-3" style={{
                            background: "rgba(16,185,129,0.08)",
                            border: "1px solid rgba(16,185,129,0.15)"
                        }}>
                            <span className="text-[10px] uppercase tracking-wider text-emerald-400/60 block">Potential 5x ROI</span>
                            <span className="text-xl font-black text-emerald-400">{data.revenueEstimate.potentialROI}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
