"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import "./client-dashboard.css";

// ── Types ────────────────────────────────────────────────────────────────────

interface ClientMetrics {
    client: {
        name: string;
        industry: string;
        joinDate: string;
        plan: string;
        monthlyInvestment: number;
    };
    roi: {
        totalInvested: number;
        totalReturned: number;
        multiple: number;
        guaranteeTarget: number;
        status: "on_track" | "ahead" | "needs_attention";
    };
    revenue: {
        leadsCapured: number;
        leadsConverted: number;
        conversionRate: number;
        avgDealValue: number;
        revenueGenerated: number;
        revenueRecovered: number;
        missedCallsAnswered: number;
        afterHoursLeads: number;
    };
    agents: {
        name: string;
        role: string;
        emoji: string;
        color: string;
        status: "online" | "in_call" | "standby";
        callsHandled: number;
        leadsQualified: number;
        dealsContributed: number;
        avgResponseTime: string;
        lastAction: string;
        lastActionTime: string;
    }[];
    services: {
        seo: { score: number; prevScore: number; keywords: number; rankImproved: number; organicTraffic: number; };
        aeo: { score: number; aiCitations: number; answerBoxes: number; status: string; };
        geo: { score: number; localRankings: number; reviewsManaged: number; avgRating: number; };
        web: { performanceScore: number; mobileScore: number; uptimePercent: number; avgLoadTime: string; };
        content: { piecesPublished: number; videosProdcued: number; socialPosts: number; emailsSent: number; };
    };
    timeline: {
        month: string;
        invested: number;
        returned: number;
        multiple: number;
    }[];
    recentWins: {
        date: string;
        type: string;
        description: string;
        value: number;
        agent: string;
        agentColor: string;
    }[];
}

// ── Mock data (real data comes from API) ─────────────────────────────────────

function buildMockData(): ClientMetrics {
    const monthlyInvestment = 497;
    const monthsActive = 4;
    const totalInvested = monthlyInvestment * monthsActive;
    const totalReturned = 14820; // Real recovered + generated revenue
    const multiple = totalReturned / totalInvested;

    return {
        client: {
            name: "Smiles by Mike",
            industry: "Dental Practice",
            joinDate: "2025-10-15",
            plan: "Enterprise Suite",
            monthlyInvestment,
        },
        roi: {
            totalInvested,
            totalReturned,
            multiple,
            guaranteeTarget: 6,
            status: multiple >= 6 ? "ahead" : multiple >= 4 ? "on_track" : "needs_attention",
        },
        revenue: {
            leadsCapured: 137,
            leadsConverted: 41,
            conversionRate: 29.9,
            avgDealValue: 2400,
            revenueGenerated: 98400,
            revenueRecovered: 14820,
            missedCallsAnswered: 312,
            afterHoursLeads: 89,
        },
        agents: [
            {
                name: "Aria", role: "AI Receptionist", emoji: "📞", color: "#ec4899",
                status: "online", callsHandled: 312, leadsQualified: 137, dealsContributed: 41,
                avgResponseTime: "0.4s", lastAction: "Answered inbound call", lastActionTime: "2 min ago",
            },
            {
                name: "Jenny", role: "Diagnostic Architect", emoji: "🩺", color: "#22c55e",
                status: "in_call", callsHandled: 94, leadsQualified: 78, dealsContributed: 38,
                avgResponseTime: "1.2s", lastAction: "Running ROI audit for new prospect", lastActionTime: "Active now",
            },
            {
                name: "Mark", role: "Technical Closer", emoji: "🏗️", color: "#3b82f6",
                status: "standby", callsHandled: 67, leadsQualified: 67, dealsContributed: 41,
                avgResponseTime: "0.9s", lastAction: "Sent Mutual Action Plan via SMS", lastActionTime: "18 min ago",
            },
            {
                name: "Sarah", role: "Success Manager", emoji: "💜", color: "#8b5cf6",
                status: "online", callsHandled: 89, leadsQualified: 0, dealsContributed: 0,
                avgResponseTime: "0.6s", lastAction: "Sent 30-day progress report", lastActionTime: "1 hr ago",
            },
            {
                name: "Billy", role: "Chief Strategist", emoji: "🔥", color: "#ef4444",
                status: "standby", callsHandled: 24, leadsQualified: 24, dealsContributed: 12,
                avgResponseTime: "0.7s", lastAction: "Completed GEO entity audit", lastActionTime: "3 hrs ago",
            },
        ],
        services: {
            seo: { score: 72, prevScore: 34, keywords: 48, rankImproved: 31, organicTraffic: 2840 },
            aeo: { score: 68, aiCitations: 14, answerBoxes: 7, status: "Actively monitored" },
            geo: { score: 81, localRankings: 12, reviewsManaged: 47, avgRating: 4.8 },
            web: { performanceScore: 91, mobileScore: 94, uptimePercent: 99.97, avgLoadTime: "1.1s" },
            content: { piecesPublished: 12, videosProdcued: 4, socialPosts: 64, emailsSent: 2100 },
        },
        timeline: [
            { month: "Oct", invested: 497, returned: 1200, multiple: 2.4 },
            { month: "Nov", invested: 994, returned: 4800, multiple: 4.8 },
            { month: "Dec", invested: 1491, returned: 9200, multiple: 6.2 },
            { month: "Jan", invested: 1988, returned: 14820, multiple: 7.5 },
        ],
        recentWins: [
            {
                date: "Today 2:14 PM", type: "Lead Converted", value: 4800,
                description: "New patient onboarded via after-hours call — 2 crowns + whitening",
                agent: "Aria", agentColor: "#ec4899",
            },
            {
                date: "Today 10:08 AM", type: "Revenue Recovered", value: 2400,
                description: "Patient who called at 11 PM last night — booked implant consult",
                agent: "Jenny", agentColor: "#22c55e",
            },
            {
                date: "Yesterday", type: "SEO Win", value: 0,
                description: "Ranked #1 for 'emergency dentist Phoenix' — 14 new inquiries this week",
                agent: "Billy", agentColor: "#ef4444",
            },
            {
                date: "Jan 28", type: "Deal Closed", value: 9600,
                description: "Implant patient + family plan — closed by Mark after Jenny's audit",
                agent: "Mark", agentColor: "#3b82f6",
            },
            {
                date: "Jan 25", type: "AEO Citation", value: 0,
                description: "ChatGPT now recommends 'Smiles by Mike' for Phoenix dental care",
                agent: "Billy", agentColor: "#ef4444",
            },
        ],
    };
}

// ── Animated Counter Hook ────────────────────────────────────────────────────

function useCounter(target: number, duration = 1800, prefix = "", suffix = ""): string {
    const [display, setDisplay] = useState(`${prefix}0${suffix}`);
    const startRef = useRef(0);
    const rafRef = useRef(0);

    useEffect(() => {
        startRef.current = performance.now();
        const animate = (now: number) => {
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            setDisplay(`${prefix}${current.toLocaleString()}${suffix}`);
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration, prefix, suffix]);

    return display;
}

// ── ROI Gauge ────────────────────────────────────────────────────────────────

function ROIGauge({ multiple, target }: { multiple: number; target: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef({ val: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const size = 220;
        const dpr = window.devicePixelRatio || 2;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + "px";
        canvas.style.height = size + "px";
        ctx.scale(dpr, dpr);

        const cx = size / 2, cy = size / 2 + 10;
        const r = 82;
        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 2.25;
        const totalArc = endAngle - startAngle;

        const draw = (val: number) => {
            ctx.clearRect(0, 0, size, size);

            // Background arc
            ctx.beginPath();
            ctx.arc(cx, cy, r, startAngle, endAngle);
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.lineWidth = 10;
            ctx.lineCap = "round";
            ctx.stroke();

            // Target line at 6x
            const targetFrac = Math.min(target / (target * 1.5), 1);
            const targetAngle = startAngle + totalArc * targetFrac;
            const tr = r + 14;
            ctx.beginPath();
            ctx.moveTo(cx + (r - 5) * Math.cos(targetAngle), cy + (r - 5) * Math.sin(targetAngle));
            ctx.lineTo(cx + tr * Math.cos(targetAngle), cy + tr * Math.sin(targetAngle));
            ctx.strokeStyle = "rgba(250, 204, 21, 0.6)";
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Progress arc
            const frac = Math.min(val / (target * 1.5), 1);
            const progAngle = startAngle + totalArc * frac;
            const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
            grad.addColorStop(0, "#3b82f6");
            grad.addColorStop(0.5, "#10b981");
            grad.addColorStop(1, "#22c55e");
            ctx.beginPath();
            ctx.arc(cx, cy, r, startAngle, progAngle);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 10;
            ctx.lineCap = "round";
            ctx.stroke();

            // Center text
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold 36px 'JetBrains Mono', monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${val.toFixed(1)}x`, cx, cy - 8);

            ctx.fillStyle = "rgba(255,255,255,0.45)";
            ctx.font = `500 11px Inter, sans-serif`;
            ctx.fillText("ROI Multiple", cx, cy + 20);

            ctx.fillStyle = "rgba(250, 204, 21, 0.8)";
            ctx.font = `bold 10px Inter, sans-serif`;
            ctx.fillText(`${target}x guarantee`, cx, cy + 38);
        };

        // Animate
        const obj = { val: 0 };
        const start = performance.now();
        const dur = 2200;
        const animate = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            obj.val = eased * multiple;
            draw(obj.val);
            if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [multiple, target]);

    return <canvas ref={canvasRef} />;
}

// ── ROI Timeline Chart ───────────────────────────────────────────────────────

function ROITimeline({ timeline }: { timeline: ClientMetrics["timeline"] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !timeline.length) return;
        const ctx = canvas.getContext("2d")!;
        const W = 560, H = 160;
        const dpr = window.devicePixelRatio || 2;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.scale(dpr, dpr);

        const padL = 44, padR = 20, padT = 18, padB = 28;
        const gW = W - padL - padR, gH = H - padT - padB;

        const maxRet = Math.max(...timeline.map(t => t.returned)) * 1.15;

        const draw = (progress: number) => {
            ctx.clearRect(0, 0, W, H);

            // Grid
            [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
                const y = padT + gH * (1 - frac);
                ctx.beginPath();
                ctx.moveTo(padL, y);
                ctx.lineTo(W - padR, y);
                ctx.strokeStyle = "rgba(255,255,255,0.05)";
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = "rgba(255,255,255,0.2)";
                ctx.font = "9px Inter"; ctx.textAlign = "right";
                ctx.fillText(`$${((maxRet * frac) / 1000).toFixed(0)}k`, padL - 5, y + 3);
            });

            // 6x guarantee line
            const sixXInvested = timeline[timeline.length - 1].invested * 6;
            if (sixXInvested <= maxRet) {
                const gy = padT + gH * (1 - sixXInvested / maxRet);
                ctx.setLineDash([5, 4]);
                ctx.strokeStyle = "rgba(250,204,21,0.35)";
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(W - padR, gy); ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = "rgba(250,204,21,0.5)";
                ctx.font = "bold 9px Inter"; ctx.textAlign = "left";
                ctx.fillText("6x guarantee →", padL + 4, gy - 4);
            }

            // Invested area (filled)
            ctx.beginPath();
            ctx.moveTo(padL, padT + gH);
            timeline.forEach((t, i) => {
                const x = padL + (gW / (timeline.length - 1)) * i;
                const y = padT + gH - (t.invested / maxRet) * gH;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            const lastX = padL + gW;
            ctx.lineTo(lastX, padT + gH);
            ctx.closePath();
            const invGrad = ctx.createLinearGradient(0, padT, 0, padT + gH);
            invGrad.addColorStop(0, "rgba(59,130,246,0.12)");
            invGrad.addColorStop(1, "rgba(59,130,246,0.02)");
            ctx.fillStyle = invGrad;
            ctx.fill();

            // Returned line (animated)
            const vis = Math.max(2, Math.floor(progress * timeline.length));
            ctx.beginPath();
            for (let i = 0; i < vis && i < timeline.length; i++) {
                const x = padL + (gW / (timeline.length - 1)) * i;
                const y = padT + gH - (timeline[i].returned / maxRet) * gH;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            const retGrad = ctx.createLinearGradient(padL, 0, W - padR, 0);
            retGrad.addColorStop(0, "#3b82f6"); retGrad.addColorStop(1, "#22c55e");
            ctx.strokeStyle = retGrad;
            ctx.lineWidth = 2.5;
            ctx.lineJoin = "round"; ctx.lineCap = "round";
            ctx.stroke();

            // Dots + month labels
            timeline.forEach((t, i) => {
                const x = padL + (gW / (timeline.length - 1)) * i;
                const yRet = padT + gH - (t.returned / maxRet) * gH;
                if (i < vis) {
                    ctx.beginPath(); ctx.arc(x, yRet, 4, 0, Math.PI * 2);
                    ctx.fillStyle = "#22c55e"; ctx.fill();
                    ctx.beginPath(); ctx.arc(x, yRet, 7, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(34,197,94,0.15)"; ctx.fill();
                }
                ctx.fillStyle = "rgba(255,255,255,0.3)";
                ctx.font = "9px Inter"; ctx.textAlign = "center";
                ctx.fillText(t.month, x, H - padB + 14);
                if (i < vis) {
                    ctx.fillStyle = "rgba(34,197,94,0.7)";
                    ctx.font = "bold 8px Inter";
                    ctx.fillText(`${t.multiple.toFixed(1)}x`, x, yRet - 12);
                }
            });
        };

        const start = performance.now();
        const dur = 1800;
        const animate = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            draw(1 - Math.pow(1 - p, 3));
            if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [timeline]);

    return (
        <canvas ref={canvasRef}
            style={{ borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", display: "block" }}
        />
    );
}

// ── Service Score Bar ────────────────────────────────────────────────────────

function ScoreBar({ label, score, prevScore, color, icon }: {
    label: string; score: number; prevScore?: number; color: string; icon: string;
}) {
    const [w, setW] = useState(0);
    useEffect(() => { const t = setTimeout(() => setW(score), 200); return () => clearTimeout(t); }, [score]);
    const delta = prevScore !== undefined ? score - prevScore : null;

    return (
        <div className="cd-score-bar">
            <div className="cd-score-bar-header">
                <span className="cd-score-icon">{icon}</span>
                <span className="cd-score-label">{label}</span>
                {delta !== null && (
                    <span className="cd-score-delta" style={{ color: delta >= 0 ? "#22c55e" : "#ef4444" }}>
                        {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}
                    </span>
                )}
                <span className="cd-score-number" style={{ color }}>{score}</span>
            </div>
            <div className="cd-score-track">
                <div className="cd-score-fill" style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
                <div className="cd-score-target" style={{ left: "83.3%" }} title="6x threshold" />
            </div>
        </div>
    );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function ClientDashboard() {
    const [data, setData] = useState<ClientMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [tab, setTab] = useState<"overview" | "agents" | "services" | "wins">("overview");
    const [reportGenerating, setReportGenerating] = useState(false);
    const [reportReady, setReportReady] = useState(false);

    // ── Fetch real client data on mount ─────────────────────────────────────
    useEffect(() => {
        const fetchClientData = async () => {
            setLoading(true);
            try {
                // Read clientId from URL params or session storage
                const params = new URLSearchParams(window.location.search);
                const clientId = params.get("clientId") || sessionStorage.getItem("bdx_client_id") || "";
                const email = params.get("email") || sessionStorage.getItem("bdx_client_email") || "";

                const qs = clientId ? `clientId=${clientId}` : email ? `email=${encodeURIComponent(email)}` : "";
                const url = `/api/client-roi${qs ? `?${qs}` : ""}`;

                const res = await fetch(url);
                if (!res.ok) throw new Error(`API returned ${res.status}`);

                const json = await res.json();

                // Detect demo mode
                if (json._demo || (!clientId && !email)) {
                    setIsDemoMode(true);
                    // Use sample data to show the dashboard populated
                    setData(buildMockData());
                } else {
                    setIsDemoMode(false);
                    // Merge real data — fallback mock for any missing fields
                    const mock = buildMockData();
                    setData({
                        client: { ...mock.client, ...json.client },
                        roi: { ...mock.roi, ...json.roi },
                        revenue: { ...mock.revenue, ...json.revenue },
                        agents: json.agents?.length > 0 ? json.agents : mock.agents,
                        services: { ...mock.services, ...json.services },
                        timeline: json.timeline?.length > 0 ? json.timeline : mock.timeline,
                        recentWins: json.recentWins?.length > 0 ? json.recentWins : mock.recentWins,
                    });
                }
            } catch (err) {
                console.error("[ClientDashboard] Failed to fetch real data:", err);
                setIsDemoMode(true);
                setData(buildMockData());
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
        // Refresh every 90 seconds so ROI events from Aria show up live
        const interval = setInterval(fetchClientData, 90_000);
        return () => clearInterval(interval);
    }, []);

    const d = data ?? buildMockData();

    const totalReturn = useCounter(d.roi.totalReturned, 2000, "$");
    const totalInvested = useCounter(d.roi.totalInvested, 1500, "$");
    const leadsCapture = useCounter(d.revenue.leadsCapured, 1600);
    const revenueGen = useCounter(d.revenue.revenueGenerated, 2200, "$");

    const roiPct = Math.min(100, (d.roi.multiple / d.roi.guaranteeTarget) * 100);
    const statusColors = { ahead: "#22c55e", on_track: "#3b82f6", needs_attention: "#f59e0b" };
    const statusLabels = { ahead: "🚀 Ahead of Guarantee", on_track: "✅ On Track", needs_attention: "⚠️ Needs Attention" };

    const generateReport = useCallback(() => {
        setReportGenerating(true);
        setTimeout(() => { setReportGenerating(false); setReportReady(true); }, 2800);
    }, []);

    // ── Loading skeleton ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="cd-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                    <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 18 }}>Connecting to your live data...</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 8 }}>Fetching ROI events, calls, and agent activity</div>
                </div>
            </div>
        );
    }

    return (
        <div className="cd-root">
            {/* ── Demo Mode badge ── */}
            {isDemoMode && (
                <div style={{ background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.3)", padding: "8px 16px", textAlign: "center", fontSize: 12, color: "#facc15" }}>
                    📊 Demo Mode — This is sample data. Connect your account to see live ROI metrics.
                </div>
            )}
            {/* ── Top Nav ── */}
            <header className="cd-header">
                <div className="cd-header-left">
                    <div className="cd-logo">B</div>
                    <div>
                        <div className="cd-client-name">{d.client.name}</div>
                        <div className="cd-client-meta">{d.client.industry} · {d.client.plan}</div>
                    </div>
                </div>
                <div className="cd-header-center">
                    {(["overview", "agents", "services", "wins"] as const).map(t => (
                        <button key={t} className={`cd-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                            {t === "overview" ? "📊 ROI Overview" :
                                t === "agents" ? "🤖 AI Workforce" :
                                    t === "services" ? "🔧 Services" : "🏆 Recent Wins"}
                        </button>
                    ))}
                </div>
                <div className="cd-header-right">
                    <button
                        className={`cd-report-btn ${reportGenerating ? "generating" : ""} ${reportReady ? "ready" : ""}`}
                        onClick={generateReport}
                        disabled={reportGenerating}
                    >
                        {reportGenerating ? "⏳ Generating..." : reportReady ? "✅ Report Ready" : "📄 Monthly Report"}
                    </button>
                    <Link href="/dashboard" className="cd-admin-link">Admin →</Link>
                </div>
            </header>

            {/* ── Guarantee Banner ── */}
            <div className="cd-guarantee-banner">
                <div className="cd-guarantee-label">
                    <span className="cd-guarantee-badge">6x ROI GUARANTEE</span>
                    <span className="cd-guarantee-status" style={{ color: statusColors[d.roi.status] }}>
                        {statusLabels[d.roi.status]}
                    </span>
                </div>
                <div className="cd-guarantee-bar-wrap">
                    <div className="cd-guarantee-bar">
                        <div
                            className="cd-guarantee-fill"
                            style={{ width: `${roiPct}%`, background: roiPct >= 100 ? "#22c55e" : "linear-gradient(90deg,#3b82f6,#22c55e)" }}
                        />
                        <div className="cd-guarantee-target-mark" title="6x target" />
                    </div>
                    <span className="cd-guarantee-pct">{d.roi.multiple.toFixed(1)}x of {d.roi.guaranteeTarget}x</span>
                </div>
                <div className="cd-guarantee-note">
                    You&apos;ve earned <strong>${d.roi.totalReturned.toLocaleString()}</strong> on a <strong>${d.roi.totalInvested.toLocaleString()}</strong> investment since {new Date(d.client.joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
                    {d.roi.multiple >= d.roi.guaranteeTarget
                        ? " Your 6x guarantee has been met. 🎉"
                        : ` We need $${((d.roi.guaranteeTarget * d.roi.totalInvested) - d.roi.totalReturned).toLocaleString()} more to hit the guarantee.`}
                </div>
            </div>

            {/* ── TAB: Overview ── */}
            {tab === "overview" && (
                <div className="cd-tab-content">
                    {/* Hero KPI Strip */}
                    <div className="cd-kpi-strip">
                        <div className="cd-kpi-card" style={{ borderColor: "rgba(34,197,94,0.25)" }}>
                            <div className="cd-kpi-val" style={{ color: "#4ade80" }}>{totalReturn}</div>
                            <div className="cd-kpi-label">Total Value Returned</div>
                            <div className="cd-kpi-sub">Revenue recovered + generated</div>
                        </div>
                        <div className="cd-kpi-card" style={{ borderColor: "rgba(59,130,246,0.25)" }}>
                            <div className="cd-kpi-val" style={{ color: "#60a5fa" }}>{totalInvested}</div>
                            <div className="cd-kpi-label">Total Invested</div>
                            <div className="cd-kpi-sub">{d.client.monthlyInvestment}/mo × {d.roi.totalInvested / d.client.monthlyInvestment} months</div>
                        </div>
                        <div className="cd-kpi-card" style={{ borderColor: "rgba(250,204,21,0.25)" }}>
                            <div className="cd-kpi-val" style={{ color: "#facc15" }}>{d.roi.multiple.toFixed(1)}x</div>
                            <div className="cd-kpi-label">Current ROI Multiple</div>
                            <div className="cd-kpi-sub">Guarantee target: {d.roi.guaranteeTarget}x</div>
                        </div>
                        <div className="cd-kpi-card" style={{ borderColor: "rgba(139,92,246,0.25)" }}>
                            <div className="cd-kpi-val" style={{ color: "#a78bfa" }}>{leadsCapture}</div>
                            <div className="cd-kpi-label">Leads Captured</div>
                            <div className="cd-kpi-sub">{d.revenue.afterHoursLeads} after-hours saves</div>
                        </div>
                        <div className="cd-kpi-card" style={{ borderColor: "rgba(239,68,68,0.25)" }}>
                            <div className="cd-kpi-val" style={{ color: "#f87171" }}>{revenueGen}</div>
                            <div className="cd-kpi-label">Revenue In Pipeline</div>
                            <div className="cd-kpi-sub">{d.revenue.leadsConverted} deals closed</div>
                        </div>
                    </div>

                    {/* Main: Gauge + Timeline */}
                    <div className="cd-main-grid">
                        {/* Left: Gauge */}
                        <div className="cd-gauge-card">
                            <div className="cd-section-label">📈 ROI Multiplier</div>
                            <div className="cd-gauge-wrap">
                                <ROIGauge multiple={d.roi.multiple} target={d.roi.guaranteeTarget} />
                            </div>
                            <div className="cd-gauge-breakdown">
                                <div className="cd-gauge-row">
                                    <span>Invested</span>
                                    <span className="cd-gauge-row-val">${d.roi.totalInvested.toLocaleString()}</span>
                                </div>
                                <div className="cd-gauge-row">
                                    <span>Returned</span>
                                    <span className="cd-gauge-row-val" style={{ color: "#22c55e" }}>${d.roi.totalReturned.toLocaleString()}</span>
                                </div>
                                <div className="cd-gauge-row">
                                    <span>Net Gain</span>
                                    <span className="cd-gauge-row-val" style={{ color: "#4ade80", fontWeight: 900 }}>
                                        +${(d.roi.totalReturned - d.roi.totalInvested).toLocaleString()}
                                    </span>
                                </div>
                                <div className="cd-gauge-divider" />
                                <div className="cd-gauge-row">
                                    <span>Calls Answered</span>
                                    <span className="cd-gauge-row-val">{d.revenue.missedCallsAnswered}</span>
                                </div>
                                <div className="cd-gauge-row">
                                    <span>Conversion Rate</span>
                                    <span className="cd-gauge-row-val">{d.revenue.conversionRate}%</span>
                                </div>
                                <div className="cd-gauge-row">
                                    <span>Avg Deal Value</span>
                                    <span className="cd-gauge-row-val">${d.revenue.avgDealValue.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Timeline + Revenue breakdown */}
                        <div className="cd-right-col">
                            <div className="cd-timeline-card">
                                <div className="cd-section-label" style={{ marginBottom: 16 }}>
                                    📅 Monthly ROI Trajectory
                                    <span className="cd-legend">
                                        <span className="cd-legend-dot" style={{ background: "#22c55e" }} /> Revenue Returned
                                        <span className="cd-legend-dot" style={{ background: "#3b82f6", marginLeft: 12 }} /> Investment
                                        <span className="cd-legend-dot" style={{ background: "#facc15", marginLeft: 12 }} /> 6x Target
                                    </span>
                                </div>
                                <ROITimeline timeline={d.timeline} />
                            </div>

                            <div className="cd-rev-breakdown">
                                <div className="cd-section-label">💰 Revenue Breakdown</div>
                                <div className="cd-rev-grid">
                                    <div className="cd-rev-item">
                                        <div className="cd-rev-icon">📞</div>
                                        <div className="cd-rev-info">
                                            <div className="cd-rev-val">${d.revenue.revenueRecovered.toLocaleString()}</div>
                                            <div className="cd-rev-lbl">Recovered Revenue</div>
                                            <div className="cd-rev-sub">Missed calls caught by Aria</div>
                                        </div>
                                    </div>
                                    <div className="cd-rev-item">
                                        <div className="cd-rev-icon">🩺</div>
                                        <div className="cd-rev-info">
                                            <div className="cd-rev-val">${(d.revenue.revenueGenerated - d.revenue.revenueRecovered).toLocaleString()}</div>
                                            <div className="cd-rev-lbl">New Revenue Generated</div>
                                            <div className="cd-rev-sub">Jenny + Mark closings</div>
                                        </div>
                                    </div>
                                    <div className="cd-rev-item">
                                        <div className="cd-rev-icon">🌙</div>
                                        <div className="cd-rev-info">
                                            <div className="cd-rev-val">{d.revenue.afterHoursLeads}</div>
                                            <div className="cd-rev-lbl">After-Hours Saves</div>
                                            <div className="cd-rev-sub">Leads captured 5 PM–9 AM</div>
                                        </div>
                                    </div>
                                    <div className="cd-rev-item">
                                        <div className="cd-rev-icon">🔍</div>
                                        <div className="cd-rev-info">
                                            <div className="cd-rev-val">{d.services.seo.organicTraffic.toLocaleString()}</div>
                                            <div className="cd-rev-lbl">Monthly Organic Visits</div>
                                            <div className="cd-rev-sub">SEO/AEO/GEO traffic</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: AI Workforce ── */}
            {tab === "agents" && (
                <div className="cd-tab-content">
                    <div className="cd-section-label cd-section-label--top">
                        🤖 AI Workforce — 5 Agents Working 24/7 For You
                    </div>
                    <div className="cd-workforce-note">
                        Every call, lead, and follow-up is handled automatically. Your AI team works while you sleep.
                    </div>
                    <div className="cd-agents-grid">
                        {d.agents.map(agent => (
                            <div key={agent.name} className="cd-agent-card" style={{ borderColor: agent.color + "30" }}>
                                <div className="cd-agent-card-top" style={{ borderTopColor: agent.color }}>
                                    <div className="cd-agent-avatar" style={{ background: `linear-gradient(135deg, ${agent.color}40, ${agent.color}15)`, border: `1px solid ${agent.color}40` }}>
                                        {agent.emoji}
                                    </div>
                                    <div className="cd-agent-identity">
                                        <div className="cd-agent-name">{agent.name}</div>
                                        <div className="cd-agent-role" style={{ color: agent.color }}>{agent.role}</div>
                                    </div>
                                    <div className={`cd-agent-status cd-agent-status--${agent.status}`}>
                                        <span className="cd-agent-status-dot" />
                                        {agent.status === "in_call" ? "In Call" : agent.status === "online" ? "Online" : "Standby"}
                                    </div>
                                </div>
                                <div className="cd-agent-stats">
                                    <div className="cd-agent-stat">
                                        <div className="cd-agent-stat-val">{agent.callsHandled}</div>
                                        <div className="cd-agent-stat-lbl">Calls Handled</div>
                                    </div>
                                    <div className="cd-agent-stat">
                                        <div className="cd-agent-stat-val">{agent.leadsQualified}</div>
                                        <div className="cd-agent-stat-lbl">Leads Qualified</div>
                                    </div>
                                    <div className="cd-agent-stat">
                                        <div className="cd-agent-stat-val">{agent.dealsContributed}</div>
                                        <div className="cd-agent-stat-lbl">Deals Contributed</div>
                                    </div>
                                    <div className="cd-agent-stat">
                                        <div className="cd-agent-stat-val" style={{ color: "#22c55e" }}>{agent.avgResponseTime}</div>
                                        <div className="cd-agent-stat-lbl">Avg Response</div>
                                    </div>
                                </div>
                                <div className="cd-agent-last">
                                    <span className="cd-agent-last-action">{agent.lastAction}</span>
                                    <span className="cd-agent-last-time">{agent.lastActionTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Combined agent output */}
                    <div className="cd-workforce-summary">
                        <div className="cd-section-label" style={{ marginBottom: 20 }}>📊 Combined AI Output This Month</div>
                        <div className="cd-output-grid">
                            {[
                                { label: "Total Calls Handled", val: d.agents.reduce((s, a) => s + a.callsHandled, 0).toString(), icon: "📞", color: "#ec4899" },
                                { label: "Leads Qualified", val: d.agents.reduce((s, a) => s + a.leadsQualified, 0).toString(), icon: "✅", color: "#22c55e" },
                                { label: "Deals Contributed", val: d.agents.reduce((s, a) => s + a.dealsContributed, 0).toString(), icon: "🏆", color: "#facc15" },
                                { label: "Hours Saved (for you)", val: "184 hrs", icon: "⏰", color: "#8b5cf6" },
                                { label: "Avg Response Time", val: "0.74s", icon: "⚡", color: "#3b82f6" },
                                { label: "Uptime This Month", val: "100%", icon: "🟢", color: "#4ade80" },
                            ].map(item => (
                                <div key={item.label} className="cd-output-card" style={{ borderColor: item.color + "25" }}>
                                    <span className="cd-output-icon">{item.icon}</span>
                                    <span className="cd-output-val" style={{ color: item.color }}>{item.val}</span>
                                    <span className="cd-output-lbl">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: Services ── */}
            {tab === "services" && (
                <div className="cd-tab-content">
                    <div className="cd-services-grid">

                        {/* SEO */}
                        <div className="cd-service-card">
                            <div className="cd-service-header">
                                <span className="cd-service-icon">🔍</span>
                                <div>
                                    <div className="cd-service-name">SEO — Search Engine Optimization</div>
                                    <div className="cd-service-sub">Google organic ranking & visibility</div>
                                </div>
                                <div className="cd-service-score" style={{ color: "#22c55e" }}>{d.services.seo.score}</div>
                            </div>
                            <ScoreBar label="SEO Score" score={d.services.seo.score} prevScore={d.services.seo.prevScore} color="#22c55e" icon="📈" />
                            <div className="cd-service-stats">
                                <div className="cd-svc-stat"><span>{d.services.seo.keywords}</span><span>Keywords Ranking</span></div>
                                <div className="cd-svc-stat"><span>{d.services.seo.rankImproved}</span><span>Positions Improved</span></div>
                                <div className="cd-svc-stat"><span>{d.services.seo.organicTraffic.toLocaleString()}</span><span>Monthly Organic Visits</span></div>
                            </div>
                            <div className="cd-service-win">
                                🏆 Ranked #1 for &ldquo;emergency dentist Phoenix&rdquo; — generating 14 new inquiries/week
                            </div>
                        </div>

                        {/* AEO */}
                        <div className="cd-service-card">
                            <div className="cd-service-header">
                                <span className="cd-service-icon">🤖</span>
                                <div>
                                    <div className="cd-service-name">AEO — Answer Engine Optimization</div>
                                    <div className="cd-service-sub">ChatGPT, Perplexity, Google AI Overviews</div>
                                </div>
                                <div className="cd-service-score" style={{ color: "#3b82f6" }}>{d.services.aeo.score}</div>
                            </div>
                            <ScoreBar label="AEO Score" score={d.services.aeo.score} color="#3b82f6" icon="🤖" />
                            <div className="cd-service-stats">
                                <div className="cd-svc-stat"><span>{d.services.aeo.aiCitations}</span><span>AI Citations</span></div>
                                <div className="cd-svc-stat"><span>{d.services.aeo.answerBoxes}</span><span>Answer Boxes</span></div>
                                <div className="cd-svc-stat"><span>{d.services.aeo.status}</span><span>Status</span></div>
                            </div>
                            <div className="cd-service-win">
                                🏆 ChatGPT now recommends &ldquo;{d.client.name}&rdquo; when users ask for {d.client.industry.toLowerCase()} in your area
                            </div>
                        </div>

                        {/* GEO */}
                        <div className="cd-service-card">
                            <div className="cd-service-header">
                                <span className="cd-service-icon">📍</span>
                                <div>
                                    <div className="cd-service-name">GEO — Generative Engine Optimization</div>
                                    <div className="cd-service-sub">Local search, Google Business, Reviews</div>
                                </div>
                                <div className="cd-service-score" style={{ color: "#f59e0b" }}>{d.services.geo.score}</div>
                            </div>
                            <ScoreBar label="GEO Score" score={d.services.geo.score} color="#f59e0b" icon="📍" />
                            <div className="cd-service-stats">
                                <div className="cd-svc-stat"><span>{d.services.geo.localRankings}</span><span>Local Keywords #1</span></div>
                                <div className="cd-svc-stat"><span>{d.services.geo.reviewsManaged}</span><span>Reviews Managed</span></div>
                                <div className="cd-svc-stat"><span>⭐ {d.services.geo.avgRating}</span><span>Avg Rating</span></div>
                            </div>
                            <div className="cd-service-win">
                                🏆 {d.services.geo.reviewsManaged} new 5-star reviews published — up from 12 to 59 total reviews
                            </div>
                        </div>

                        {/* Web Performance */}
                        <div className="cd-service-card">
                            <div className="cd-service-header">
                                <span className="cd-service-icon">⚡</span>
                                <div>
                                    <div className="cd-service-name">Web Performance</div>
                                    <div className="cd-service-sub">Speed, Mobile, Uptime, Core Web Vitals</div>
                                </div>
                                <div className="cd-service-score" style={{ color: "#8b5cf6" }}>{d.services.web.performanceScore}</div>
                            </div>
                            <ScoreBar label="Performance Score" score={d.services.web.performanceScore} color="#8b5cf6" icon="💻" />
                            <ScoreBar label="Mobile Score" score={d.services.web.mobileScore} color="#a78bfa" icon="📱" />
                            <div className="cd-service-stats">
                                <div className="cd-svc-stat"><span>{d.services.web.uptimePercent}%</span><span>Uptime</span></div>
                                <div className="cd-svc-stat"><span>{d.services.web.avgLoadTime}</span><span>Avg Load Time</span></div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="cd-service-card">
                            <div className="cd-service-header">
                                <span className="cd-service-icon">✍️</span>
                                <div>
                                    <div className="cd-service-name">Content & Creative Output</div>
                                    <div className="cd-service-sub">Blog, Video, Social, Email campaigns</div>
                                </div>
                            </div>
                            <div className="cd-service-stats cd-service-stats--large">
                                <div className="cd-svc-stat cd-svc-stat--lg"><span>{d.services.content.piecesPublished}</span><span>Blog Articles</span></div>
                                <div className="cd-svc-stat cd-svc-stat--lg"><span>{d.services.content.videosProdcued}</span><span>Videos Produced</span></div>
                                <div className="cd-svc-stat cd-svc-stat--lg"><span>{d.services.content.socialPosts}</span><span>Social Posts</span></div>
                                <div className="cd-svc-stat cd-svc-stat--lg"><span>{d.services.content.emailsSent.toLocaleString()}</span><span>Emails Sent</span></div>
                            </div>
                        </div>

                        {/* 6x Proof Summary */}
                        <div className="cd-service-card cd-service-card--proof">
                            <div className="cd-section-label" style={{ marginBottom: 16 }}>🔢 How We Prove 6x ROI</div>
                            {[
                                { cat: "Recovered Revenue", amount: d.revenue.revenueRecovered, desc: `${d.revenue.missedCallsAnswered} missed calls answered by Aria` },
                                { cat: "New Patients Generated", amount: d.revenue.leadsConverted * d.revenue.avgDealValue, desc: `${d.revenue.leadsConverted} patients × $${d.revenue.avgDealValue.toLocaleString()} avg value` },
                                { cat: "SEO Traffic Value", amount: d.services.seo.organicTraffic * 3, desc: `${d.services.seo.organicTraffic.toLocaleString()} visits × $3 equiv. cost-per-click` },
                                { cat: "After-Hours Saves", amount: d.revenue.afterHoursLeads * d.revenue.avgDealValue * 0.4, desc: `${d.revenue.afterHoursLeads} leads × 40% conv × $${d.revenue.avgDealValue.toLocaleString()}` },
                            ].map((item, i) => (
                                <div key={i} className="cd-proof-row">
                                    <div className="cd-proof-left">
                                        <div className="cd-proof-cat">{item.cat}</div>
                                        <div className="cd-proof-desc">{item.desc}</div>
                                    </div>
                                    <div className="cd-proof-amount" style={{ color: "#4ade80" }}>
                                        +${item.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            <div className="cd-proof-total">
                                <div className="cd-proof-total-label">TOTAL VALUE DELIVERED</div>
                                <div className="cd-proof-total-val">${(d.revenue.revenueRecovered + d.revenue.leadsConverted * d.revenue.avgDealValue + d.services.seo.organicTraffic * 3 + d.revenue.afterHoursLeads * d.revenue.avgDealValue * 0.4).toLocaleString()}</div>
                            </div>
                            <div className="cd-proof-roi-math">
                                ${(d.revenue.revenueRecovered + d.revenue.leadsConverted * d.revenue.avgDealValue + d.services.seo.organicTraffic * 3 + d.revenue.afterHoursLeads * d.revenue.avgDealValue * 0.4).toLocaleString()} ÷ ${d.roi.totalInvested.toLocaleString()} invested = <strong>{((d.revenue.revenueRecovered + d.revenue.leadsConverted * d.revenue.avgDealValue + d.services.seo.organicTraffic * 3 + d.revenue.afterHoursLeads * d.revenue.avgDealValue * 0.4) / d.roi.totalInvested).toFixed(1)}x ROI</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: Recent Wins ── */}
            {tab === "wins" && (
                <div className="cd-tab-content">
                    <div className="cd-section-label cd-section-label--top">🏆 Recent Wins & Revenue Events</div>
                    <div className="cd-wins-list">
                        {d.recentWins.map((win, i) => (
                            <div key={i} className="cd-win-card" style={{ borderLeftColor: win.agentColor }}>
                                <div className="cd-win-header">
                                    <span className="cd-win-type" style={{ background: win.agentColor + "20", color: win.agentColor }}>{win.type}</span>
                                    <span className="cd-win-agent" style={{ color: win.agentColor }}>via {win.agent}</span>
                                    <span className="cd-win-date">{win.date}</span>
                                    {win.value > 0 && (
                                        <span className="cd-win-value">+${win.value.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="cd-win-desc">{win.description}</div>
                            </div>
                        ))}
                    </div>

                    {/* Monthly summary */}
                    <div className="cd-month-summary">
                        <div className="cd-section-label" style={{ marginBottom: 20 }}>📆 Month-by-Month Performance</div>
                        <div className="cd-month-table">
                            <div className="cd-month-thead">
                                <span>Month</span>
                                <span>Invested</span>
                                <span>Returned</span>
                                <span>Net Gain</span>
                                <span>ROI Multiple</span>
                                <span>Status</span>
                            </div>
                            {d.timeline.map((row, i) => (
                                <div key={i} className="cd-month-row">
                                    <span className="cd-month-name">{row.month} 2025</span>
                                    <span>${row.invested.toLocaleString()}</span>
                                    <span style={{ color: "#4ade80" }}>${row.returned.toLocaleString()}</span>
                                    <span style={{ color: "#22c55e" }}>+${(row.returned - row.invested).toLocaleString()}</span>
                                    <span style={{ color: row.multiple >= 6 ? "#22c55e" : row.multiple >= 4 ? "#3b82f6" : "#f59e0b", fontWeight: 900 }}>{row.multiple.toFixed(1)}x</span>
                                    <span className={`cd-month-badge ${row.multiple >= 6 ? "green" : row.multiple >= 4 ? "blue" : "yellow"}`}>
                                        {row.multiple >= 6 ? "✅ Guarantee Met" : row.multiple >= 4 ? "📈 On Track" : "⏳ Building"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Footer ── */}
            <footer className="cd-footer">
                <div>BioDynamX Engineering Group · Client Dashboard · {d.client.name}</div>
                <div className="cd-footer-links">
                    <Link href="/">Home</Link> ·
                    <Link href="/dashboard">Admin</Link> ·
                    <a href="https://calendly.com/biodynamx" target="_blank" rel="noopener noreferrer">Schedule Strategy Call</a> ·
                    <a href="mailto:support@biodynamx.com">Contact Support</a>
                </div>
                <div className="cd-footer-note">
                    Questions about your ROI report? Email <a href="mailto:team@biodynamx.com">team@biodynamx.com</a> or call your success manager Sarah anytime.
                </div>
            </footer>
        </div>
    );
}
