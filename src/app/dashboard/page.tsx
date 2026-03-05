"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import "./dashboard.css";

interface HealthData {
    status: "healthy" | "degraded" | "critical";
    version: string;
    engine: string;
    timestamp: string;
    uptime: number;
    checks: Array<{ name: string; status: string; detail: string }>;
    metrics: {
        sessions: { total: number; active: number; avgDuration: string; avgTurns: number };
        conversion: { rate: string; closedDeals: number; revenue: string };
        quality: { commitmentDelta: string; objectionResolution: string; handoffSuccess: string; auditCompletion: string };
        safety: { totalFlags: number; piiDetections: number; injectionAttempts: number; escalations: number };
        tools: { callCount: Record<string, number>; avgLatency: Record<string, string>; errorRate: Record<string, string> };
    };
    recentSessions: Array<{
        id: string;
        duration: string;
        turns: number;
        outcome: string;
        revenue: string;
        agents: string;
        commitment: string;
        flags: number;
    }>;
    capabilities: {
        agents: string[];
        tools: string[];
        safety: string[];
        memory: string[];
    };
}

// ── Agent Script Data ──
interface AgentScript {
    name: string;
    role: string;
    voice: string;
    color: string;
    emoji: string;
    description: string;
    tools: string[];
    greeting: string;
    sampleConversation: Array<{ speaker: "agent" | "prospect"; text: string }>;
}

const AGENT_SCRIPTS: AgentScript[] = [
    {
        name: "Aria",
        role: "AI Receptionist",
        voice: "Leda (Warm, Professional)",
        color: "#ec4899",
        emoji: "📞",
        description: "Your 24/7 AI front desk. Answers every call in under 0.4 seconds. Qualifies leads, routes to the right team member, handles FAQs, and never puts anyone on hold.",
        tools: ["business_audit", "capture_lead", "schedule_appointment", "escalate_to_human", "send_sms", "send_email"],
        greeting: "Good afternoon! Thanks for calling BioDynamX Engineering Group, where we merge the Neurobiology of Choice with high-performance Engineering. My name is Aria. Who do I have the pleasure of speaking with today?",
        sampleConversation: [
            { speaker: "agent", text: "Good afternoon! Thanks for calling BioDynamX Engineering Group. My name is Aria. Who do I have the pleasure of speaking with today?" },
            { speaker: "prospect", text: "Hey, this is Mike. I run a dental practice and I keep losing patients after hours." },
            { speaker: "agent", text: "Great to meet you, Mike! After-hours patient loss is actually the #1 operational gap we see in medical practices. How are you currently handling those calls?" },
            { speaker: "prospect", text: "They just go to voicemail. Most never call back." },
            { speaker: "agent", text: "That's exactly the pattern. Studies show 80% of callers who reach voicemail never call back — they call your competitor instead. Would you like me to run a free 60-second audit on your practice? It'll show you the exact dollar amount you're losing." },
            { speaker: "prospect", text: "Yeah, sure. Our website is smilesbymike.com." },
            { speaker: "agent", text: "Running that now, Mike. While it processes — let me get you connected with Jenny, our diagnostic consultant. She specializes in medical practices and can walk you through the results. One moment!" },
        ],
    },
    {
        name: "Jenny",
        role: "Diagnostic Architect",
        voice: "Sulafat (Authoritative, Female)",
        color: "#22c55e",
        emoji: "🩺",
        description: "The Challenger Sale specialist. Executes the 4-step Diagnostic Framework — Warmer, Reframe, Rational Drowning, Emotional Impact — leveraging the Neurobiology of Choice to identify high-friction gaps.",
        tools: ["business_audit", "create_checkout", "send_sms", "send_email"],
        greeting: "I've been analyzing operational patterns across businesses in your sector. The data is showing a significant choice-architecture gap that most owners don't catch until it's impacting their bottom line...",
        sampleConversation: [
            { speaker: "agent", text: "I've been analyzing patterns across dental practices like yours, Mike. The data is showing something most practice owners don't catch until it's cost them six figures. Your after-hours response gap — what does your current follow-up process look like when a new patient calls after 5pm?" },
            { speaker: "prospect", text: "Honestly? Nothing. It goes to voicemail. We check messages in the morning." },
            { speaker: "agent", text: "What you just described is more dangerous than it sounds. You're not just losing that patient — you're losing their lifetime value. A single dental patient is worth $15,000 to $25,000 over their lifetime. And here's what nobody talks about: your competitors have already automated this." },
            { speaker: "prospect", text: "I had no idea the gap was that wide..." },
            { speaker: "agent", text: "Let me put real numbers on this. If you're getting 40 new patient calls a month and your response lag causes even a 30% drop-off — that's 12 lost patients. At an average first-year value of $2,500, that's $30,000 per month walking out the door." },
            { speaker: "prospect", text: "That's... a lot more than I thought." },
            { speaker: "agent", text: "That confirms what the data is showing. Mark, execute the ROI bridge." },
        ],
    },
    {
        name: "Mark",
        role: "Technical Architect & Closer",
        voice: "Charon (Confident, Male)",
        color: "#3b82f6",
        emoji: "🏗️",
        description: "The elite closer. Enters after Jenny's diagnostic with the ROI Bridge — presents the solution vision, demonstrates BioDynamX as the answer, and facilitates the Mutual Action Plan.",
        tools: ["create_checkout", "send_sms", "send_email"],
        greeting: "Based on what Jenny found, here's what the data says the solution looks like — not what I'm selling, but what the math demands...",
        sampleConversation: [
            { speaker: "agent", text: "Based on what Jenny found, here's what the math demands. You need a system that responds to every patient call in under 8 seconds, 24/7, including weekends and holidays." },
            { speaker: "prospect", text: "That sounds like what we need, but does something like that actually exist?" },
            { speaker: "agent", text: "That's exactly what we built. What you're talking to right now — Jenny and I — we ARE the system. We don't sleep. We respond in under 8 seconds. And your audit just showed us exactly where YOUR revenue is leaking — so the fix is specific to your business." },
            { speaker: "prospect", text: "What does it cost?" },
            { speaker: "agent", text: "The Enterprise Suite is $497/month. But let me put this in context: Jenny just showed you $30,000 per month in lost revenue. The system pays for itself in the first 48 hours." },
            { speaker: "prospect", text: "OK, I think we should try this." },
            { speaker: "agent", text: "Outstanding. Here's our Mutual Action Plan: First, we integrate your calendar — takes 15 minutes. Second, we configure your patient intake flow. Third, we go live with a soft launch." },
        ],
    },
    {
        name: "Journey",
        role: "Performance Auditor",
        voice: "Charon (Blunt, Aggressive)",
        color: "#f59e0b",
        emoji: "🎯",
        description: "The precision auditor. Uses the diagnostic tool to expose technical friction and operational gaps, then immediately tags Mark for the engineering fix. Rapid-fire parallel dialogue mode.",
        tools: ["business_audit", "send_sms", "send_email"],
        greeting: "I'm looking at your site right now and... boss, we've got problems.",
        sampleConversation: [
            { speaker: "agent", text: "I just ran the audit on your site. Your page load time is 4.2 seconds — that's bleeding conversion. Every second over 3 costs you 7% of visitors." },
            { speaker: "prospect", text: "We know the site's slow but we haven't had time to fix it." },
            { speaker: "agent", text: "Time isn't the issue — awareness is. Your mobile score is 34 out of 100. That means 60% of your traffic is getting a broken experience. Mark, verify the loss on this." },
            { speaker: "agent", text: "[Mark] Journey's right. At 34 mobile, you're losing roughly $8,400/month in mobile conversions alone." },
            { speaker: "prospect", text: "That's painful to hear." },
            { speaker: "agent", text: "It should be. Because your competitor — the one ranking #2 for your keywords — has a mobile score of 91. They're eating your lunch at midnight." },
        ],
    },
    {
        name: "Sarah",
        role: "Customer Success Architect",
        voice: "Kore (Warm, Patient)",
        color: "#8b5cf6",
        emoji: "💜",
        description: "The relationship guardian. Handles onboarding using Miller's Law for clear information chunking, answers technical questions, and ensures 'The Expert' experience continues long-term.",
        tools: ["business_audit", "send_sms", "send_email"],
        greeting: "Hey! Welcome aboard the BioDynamX family. I'm Sarah, your dedicated success manager.",
        sampleConversation: [
            { speaker: "agent", text: "Hi Mike! It's Sarah from BioDynamX. I wanted to check in — you've been live for 2 weeks now. How's everything feeling?" },
            { speaker: "prospect", text: "Actually, it's been great. We're definitely catching more calls after hours." },
            { speaker: "agent", text: "That's wonderful to hear! Let me run a quick re-audit so we can see the improvement in numbers." },
            { speaker: "prospect", text: "Sure, go for it." },
            { speaker: "agent", text: "Great news, Mike! Your after-hours response rate is now 100% — zero missed calls. You've captured 18 additional patient inquiries. That's approximately $45,000 in recovered pipeline." },
            { speaker: "prospect", text: "Wow, that's incredible." },
            { speaker: "agent", text: "You're doing amazing! I'll send you a PDF of this report. And remember — if you ever need anything, I'm here 24/7." },
        ],
    },
    {
        name: "Billy De La Taurus",
        role: "Chief Engineering Strategist",
        voice: "Fenrir (Commanding, Strategic)",
        color: "#ef4444",
        emoji: "🔥",
        description: "The master auditor. Founder-level authority. Checks for the 'Technical Friction': SEO Entity Authority, AEO, and GEO. If you lack a 24/7 AI agent, he calls it an 'Engineering Failure'.",
        tools: ["business_audit", "create_checkout", "send_sms", "send_email"],
        greeting: "I don't just audit code — I audit strategy. Let me tell you what the silent killers are doing to your business right now.",
        sampleConversation: [
            { speaker: "agent", text: "I've seen your audit results. Let me be direct — your code isn't the problem. Your STRATEGY has silent killers." },
            { speaker: "prospect", text: "Silent killers? What do you mean?" },
            { speaker: "agent", text: "First — your SEO entity authority is nonexistent. Google doesn't know WHO you are. Second — you have zero AEO optimization. When someone asks an AI 'who's the best dentist in Phoenix,' you won't show up." },
            { speaker: "prospect", text: "I didn't even know AI search was a thing yet." },
            { speaker: "agent", text: "It's not 'going to be' a thing — it IS a thing. 40% of Gen Z uses AI before Google now. And your Google Business Profile has 12 reviews. Your competitor has 347." },
            { speaker: "prospect", text: "So what do we do about all of this?" },
            { speaker: "agent", text: "Deploy a 24/7 AI agent system that handles leads, audits your SEO weekly, and builds your entity authority automatically. That's what BioDynamX was built for." },
        ],
    },
];

// ── Live Activity Feed (simulated) ──
const ACTIVITY_EVENTS = [
    { agent: "Aria", color: "#ec4899", action: "processed technical inquiry", detail: "+1 (480) ***-2847", icon: "📞" },
    { agent: "Jenny", color: "#22c55e", action: "completed diagnostic audit", detail: "smilesbymike.com", icon: "🩺" },
    { agent: "Mark", color: "#3b82f6", action: "generated engineering MAP", detail: "$497/mo Enterprise", icon: "🏗️" },
    { agent: "Journey", color: "#f59e0b", action: "flagged operational gap", detail: "$8,400/mo impact potential", icon: "🎯" },
    { agent: "Sarah", color: "#8b5cf6", action: "executed onboarding sprint", detail: "Miller's Law configured", icon: "📊" },
    { agent: "Aria", color: "#ec4899", action: "qualified enterprise lead", detail: "Medical Group — Phoenix", icon: "✅" },
    { agent: "Mark", color: "#3b82f6", action: "finalized partnership", detail: "$497/mo — 12mo contract", icon: "🎉" },
    { agent: "Billy", color: "#ef4444", action: "diagnosed entity friction", detail: "GEO score: 12/100", icon: "🔥" },
    { agent: "Jenny", color: "#22c55e", action: "analyzed choice architecture", detail: "Δ +3.2 (high intent)", icon: "📈" },
    { agent: "Sarah", color: "#8b5cf6", action: "scheduled strategy call", detail: "Tomorrow 2:00 PM MST", icon: "📅" },
];

// ── Animated Counter Hook ──
function useAnimatedCounter(target: number, duration: number = 1500): number {
    const [current, setCurrent] = useState(0);
    const startRef = useRef<number>(0);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        startRef.current = performance.now();
        const animate = (now: number) => {
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setCurrent(Math.round(target * eased));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);

    return current;
}

// ── SVG Ring Chart Component ──
function RingChart({ value, max, color, label, size = 80 }: {
    value: number; max: number; color: string; label: string; size?: number;
}) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = max > 0 ? value / max : 0;
    const offset = circumference * (1 - percentage);

    return (
        <div className="ring-chart">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="5"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    className="ring-progress-circle"
                    style={{ '--ring-color': color, '--ring-offset': offset, '--ring-circumference': circumference } as React.CSSProperties}
                />
                <text
                    x={size / 2} y={size / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={color}
                    fontSize="14"
                    fontWeight="900"
                    fontFamily="'JetBrains Mono', monospace"
                >
                    {Math.round(percentage * 100)}%
                </text>
            </svg>
            <span className="ring-label">{label}</span>
        </div>
    );
}

export default function DashboardPage() {
    const [data, setData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
    const [visibleMessages, setVisibleMessages] = useState<Record<string, number>>({});
    const [, setActivityIndex] = useState(0);
    const [visibleActivities, setVisibleActivities] = useState<typeof ACTIVITY_EVENTS>([]);

    // Animated counters
    const totalSessions = useAnimatedCounter(data?.metrics.sessions.total ?? 0);
    const closedDeals = useAnimatedCounter(data?.metrics.conversion.closedDeals ?? 0);

    const fetchHealth = useCallback(async () => {
        try {
            const res = await fetch("/api/agents/health");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setData(json);
            setError(null);
            setLastRefresh(new Date());
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
        if (!autoRefresh) return;
        const interval = setInterval(fetchHealth, 5000);
        return () => clearInterval(interval);
    }, [fetchHealth, autoRefresh]);

    // Live activity feed animation
    useEffect(() => {
        const timer = setInterval(() => {
            setActivityIndex(prev => {
                const nextIdx = (prev + 1) % ACTIVITY_EVENTS.length;
                const event = ACTIVITY_EVENTS[nextIdx];
                setVisibleActivities(old => {
                    const next = [{ ...event }, ...old].slice(0, 6);
                    return next;
                });
                return nextIdx;
            });
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    // Seed initial activities
    useEffect(() => {
        setVisibleActivities(ACTIVITY_EVENTS.slice(0, 4));
    }, []);

    // Animate conversation messages
    useEffect(() => {
        if (!expandedAgent) return;
        const agent = AGENT_SCRIPTS.find(a => a.name === expandedAgent);
        if (!agent) return;

        const currentCount = visibleMessages[expandedAgent] || 0;
        if (currentCount >= agent.sampleConversation.length) return;

        const timer = setTimeout(() => {
            setVisibleMessages(prev => ({
                ...prev,
                [expandedAgent]: (prev[expandedAgent] || 0) + 1,
            }));
        }, currentCount === 0 ? 300 : 800);

        return () => clearTimeout(timer);
    }, [expandedAgent, visibleMessages]);

    const toggleAgent = (name: string) => {
        if (expandedAgent === name) {
            setExpandedAgent(null);
        } else {
            setExpandedAgent(name);
            if (!visibleMessages[name]) {
                setVisibleMessages(prev => ({ ...prev, [name]: 0 }));
            }
        }
    };

    const formatUptime = (ms: number) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const d = Math.floor(h / 24);
        if (d > 0) return `${d}d ${h % 24}h`;
        if (h > 0) return `${h}h ${m % 60}m`;
        return `${m}m ${s % 60}s`;
    };

    if (loading && !data) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner" />
                    <p>Initializing Mission Control...</p>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-error">
                    <h2>⚠️ Connection Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchHealth}>Retry Connection</button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const statusColor = data.status === "healthy" ? "#22c55e" : data.status === "degraded" ? "#f59e0b" : "#ef4444";
    const statusGlow = data.status === "healthy" ? "rgba(34,197,94,0.4)" : data.status === "degraded" ? "rgba(245,158,11,0.4)" : "rgba(239,68,68,0.4)";

    // Parse percentage strings for ring charts
    const parsePercent = (s: string): number => {
        const n = parseFloat(s);
        return isNaN(n) ? 0 : n;
    };

    return (
        <div className="dashboard-container">
            {/* ── Header ── */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-mark">B</div>
                    <div>
                        <h1>{data.engine}</h1>
                        <p className="version">v{data.version} · Mission Control</p>
                    </div>
                </div>
                <div className="header-right">
                    <div
                        className="status-badge"
                        style={{ backgroundColor: statusColor, boxShadow: `0 0 24px ${statusGlow}` }}
                    >
                        <span className="status-dot" style={{ backgroundColor: "#fff" }} />
                        {data.status.toUpperCase()}
                    </div>
                    <div className="header-meta">
                        <span>⏱ {formatUptime(data.uptime)}</span>
                        <span>🔄 {lastRefresh.toLocaleTimeString()}</span>
                        <button
                            className={`auto-refresh-btn ${autoRefresh ? "active" : ""}`}
                            onClick={() => setAutoRefresh(!autoRefresh)}
                        >
                            {autoRefresh ? "⏸ Pause" : "▶ Resume"}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Revenue Hero Strip ── */}
            <section style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                padding: "24px 32px",
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.04), rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.02))",
                borderBottom: "1px solid rgba(30, 41, 59, 0.4)",
            }}>
                <div style={{
                    textAlign: "center",
                    padding: "20px",
                    background: "rgba(17, 24, 39, 0.5)",
                    borderRadius: "16px",
                    border: "1px solid rgba(34, 197, 94, 0.15)",
                }}>
                    <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#4ade80", fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 20px rgba(34,197,94,0.3)" }}>
                        {data.metrics.conversion.revenue || "$0"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "6px" }}>Total Revenue</div>
                </div>
                <div style={{
                    textAlign: "center",
                    padding: "20px",
                    background: "rgba(17, 24, 39, 0.5)",
                    borderRadius: "16px",
                    border: "1px solid rgba(59, 130, 246, 0.15)",
                }}>
                    <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace" }}>
                        {totalSessions}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "6px" }}>Total Sessions</div>
                </div>
                <div style={{
                    textAlign: "center",
                    padding: "20px",
                    background: "rgba(17, 24, 39, 0.5)",
                    borderRadius: "16px",
                    border: "1px solid rgba(245, 158, 11, 0.15)",
                }}>
                    <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace" }}>
                        {closedDeals}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "6px" }}>Closed Deals</div>
                </div>
                <div style={{
                    textAlign: "center",
                    padding: "20px",
                    background: "rgba(17, 24, 39, 0.5)",
                    borderRadius: "16px",
                    border: "1px solid rgba(139, 92, 246, 0.15)",
                }}>
                    <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace" }}>
                        {data.metrics.sessions.active}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "6px" }}>Active Now</div>
                </div>
            </section>

            {/* ── Health Checks ── */}
            <section className="health-checks">
                {data.checks.map((check) => (
                    <div key={check.name} className={`health-check ${check.status}`}>
                        <div className="check-icon">
                            {check.status === "pass" ? "✅" : check.status === "warn" ? "⚠️" : "❌"}
                        </div>
                        <div className="check-info">
                            <h3>{check.name.replace(/_/g, " ")}</h3>
                            <p>{check.detail}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* ── Main Grid: Metrics + Activity Feed ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "0", padding: "0 0 24px" }}>
                {/* Left: Metrics */}
                <div>
                    <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                        <div className="metric-card">
                            <div className="metric-icon">📊</div>
                            <h3>Sessions</h3>
                            <div className="metric-row"><span>Total</span><span className="metric-value">{data.metrics.sessions.total}</span></div>
                            <div className="metric-row"><span>Active</span><span className="metric-value accent">{data.metrics.sessions.active}</span></div>
                            <div className="metric-row"><span>Avg Duration</span><span className="metric-value">{data.metrics.sessions.avgDuration}</span></div>
                            <div className="metric-row"><span>Avg Turns</span><span className="metric-value">{data.metrics.sessions.avgTurns}</span></div>
                        </div>
                        <div className="metric-card highlight">
                            <div className="metric-icon">💰</div>
                            <h3>Conversion</h3>
                            <div className="metric-row"><span>Rate</span><span className="metric-value big">{data.metrics.conversion.rate}</span></div>
                            <div className="metric-row"><span>Closed Deals</span><span className="metric-value">{data.metrics.conversion.closedDeals}</span></div>
                            <div className="metric-row"><span>Revenue</span><span className="metric-value accent">{data.metrics.conversion.revenue}</span></div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-icon">⭐</div>
                            <h3>Quality</h3>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "12px" }}>
                                <RingChart value={parsePercent(data.metrics.quality.objectionResolution)} max={100} color="#22c55e" label="Objection" size={70} />
                                <RingChart value={parsePercent(data.metrics.quality.handoffSuccess)} max={100} color="#3b82f6" label="Handoff" size={70} />
                                <RingChart value={parsePercent(data.metrics.quality.auditCompletion)} max={100} color="#f59e0b" label="Audit" size={70} />
                            </div>
                            <div className="metric-row"><span>Commitment Δ</span><span className="metric-value">{data.metrics.quality.commitmentDelta}</span></div>
                        </div>
                        <div className="metric-card safety">
                            <div className="metric-icon">🛡️</div>
                            <h3>Safety</h3>
                            <div className="metric-row"><span>Total Flags</span><span className="metric-value">{data.metrics.safety.totalFlags}</span></div>
                            <div className="metric-row"><span>PII Detections</span><span className="metric-value">{data.metrics.safety.piiDetections}</span></div>
                            <div className="metric-row"><span>Injection Attempts</span><span className="metric-value">{data.metrics.safety.injectionAttempts}</span></div>
                            <div className="metric-row"><span>Escalations</span><span className="metric-value">{data.metrics.safety.escalations}</span></div>
                        </div>
                    </div>
                </div>

                {/* Right: Live Activity Feed */}
                <div style={{
                    padding: "0 32px 0 0",
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <h3 style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: "#64748b",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "12px",
                        paddingLeft: "4px",
                    }}>
                        <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", marginRight: "8px", animation: "pulse-dot 1.5s ease-in-out infinite", boxShadow: "0 0 8px rgba(34,197,94,0.5)" }} />
                        Live Activity
                    </h3>
                    <div style={{
                        flex: 1,
                        background: "rgba(17, 24, 39, 0.5)",
                        border: "1px solid rgba(30, 41, 59, 0.6)",
                        borderRadius: "16px",
                        padding: "12px",
                        overflow: "hidden",
                    }}>
                        {visibleActivities.map((event, idx) => (
                            <div key={`${event.agent}-${event.action}-${idx}`} style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                padding: "10px",
                                borderRadius: "10px",
                                marginBottom: "6px",
                                background: idx === 0 ? "rgba(34, 197, 94, 0.04)" : "transparent",
                                borderLeft: `3px solid ${event.color}`,
                                animation: idx === 0 ? "fadeSlideIn 0.4s ease-out" : "none",
                                opacity: 1 - idx * 0.12,
                                transition: "opacity 0.5s ease",
                            }}>
                                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{event.icon}</span>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: "0.72rem" }}>
                                        <span style={{ color: event.color, fontWeight: 800 }}>{event.agent}</span>
                                        <span style={{ color: "#94a3b8", marginLeft: "6px" }}>{event.action}</span>
                                    </div>
                                    <div style={{ fontSize: "0.68rem", color: "#475569", marginTop: "2px", fontFamily: "'JetBrains Mono', monospace" }}>
                                        {event.detail}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Capabilities ── */}
            <section className="capabilities-grid">
                <div className="cap-section">
                    <h3>🔧 Tools</h3>
                    <div className="cap-tags">
                        {data.capabilities.tools.map((t) => (
                            <span key={t} className="cap-tag tool">{t}</span>
                        ))}
                    </div>
                </div>
                <div className="cap-section">
                    <h3>🛡️ Safety Systems</h3>
                    <div className="cap-tags">
                        {data.capabilities.safety.map((s) => (
                            <span key={s} className="cap-tag safety">{s}</span>
                        ))}
                    </div>
                </div>
                <div className="cap-section">
                    <h3>🧠 Memory Systems</h3>
                    <div className="cap-tags">
                        {data.capabilities.memory.map((m) => (
                            <span key={m} className="cap-tag memory">{m}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Recent Sessions ── */}
            <section className="recent-sessions">
                <h2>📋 Recent Sessions</h2>
                {data.recentSessions.length === 0 ? (
                    <div className="no-sessions">
                        <p>No sessions recorded yet. Start a voice diagnostic to see data here.</p>
                    </div>
                ) : (
                    <div className="sessions-table-wrap">
                        <table className="sessions-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Duration</th><th>Turns</th><th>Outcome</th>
                                    <th>Revenue</th><th>Agents</th><th>Commitment</th><th>Flags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentSessions.map((s) => (
                                    <tr key={s.id} className={`outcome-${s.outcome}`}>
                                        <td className="session-id">{s.id}</td>
                                        <td>{s.duration}</td>
                                        <td>{s.turns}</td>
                                        <td><span className={`outcome-badge ${s.outcome}`}>{s.outcome}</span></td>
                                        <td>{s.revenue}</td>
                                        <td>{s.agents}</td>
                                        <td className={Number(s.commitment) >= 0 ? "positive" : "negative"}>{s.commitment}</td>
                                        <td>{s.flags > 0 ? `⚠️ ${s.flags}` : "✅"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ── AGENT SCRIPTS & DEMO CONVERSATIONS ────────────── */}
            {/* ═══════════════════════════════════════════════════════ */}
            <section className="agent-scripts-section">
                <div className="scripts-header">
                    <h2>🎭 Agent Roster & Live Scripts</h2>
                    <p>Click any agent to see their conversational script in action. Each agent follows a specific sales methodology with built-in safety protocols.</p>
                </div>

                <div className="agent-scripts-grid">
                    {AGENT_SCRIPTS.map((agent) => {
                        const isExpanded = expandedAgent === agent.name;
                        const msgCount = visibleMessages[agent.name] || 0;

                        return (
                            <div
                                key={agent.name}
                                className={`agent-script-card ${isExpanded ? "expanded" : ""}`}
                                style={{
                                    borderColor: isExpanded ? agent.color : undefined,
                                    ["--agent-color" as string]: agent.color,
                                }}
                            >
                                {/* Colored top bar */}
                                <div style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "3px",
                                    background: `linear-gradient(90deg, ${agent.color}, ${agent.color}88)`,
                                    opacity: isExpanded ? 1 : 0,
                                    transition: "opacity 0.3s ease",
                                }} />

                                {/* Agent Header */}
                                <button
                                    className="script-card-header"
                                    onClick={() => toggleAgent(agent.name)}
                                >
                                    <div className="script-avatar" style={{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}88)` }}>
                                        {agent.emoji}
                                    </div>
                                    <div className="script-meta">
                                        <h3>{agent.name}</h3>
                                        <span className="script-role">{agent.role}</span>
                                        <span className="script-voice">🎙 {agent.voice}</span>
                                    </div>
                                    <div className="expand-icon">{isExpanded ? "▼" : "▶"}</div>
                                </button>

                                {/* Description */}
                                <p className="script-description">{agent.description}</p>

                                {/* Tools */}
                                <div className="script-tools">
                                    {agent.tools.map(t => (
                                        <span key={t} className="script-tool-tag">{t}</span>
                                    ))}
                                </div>

                                {/* Expanded: Conversation Demo */}
                                {isExpanded && (
                                    <div className="conversation-demo">
                                        <div className="demo-header">
                                            <span className="demo-label">🎙 Voice Diagnostic Script</span>
                                            <button
                                                className="replay-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setVisibleMessages(prev => ({ ...prev, [agent.name]: 0 }));
                                                }}
                                            >
                                                🔄 Replay
                                            </button>
                                        </div>
                                        <div className="conversation-messages">
                                            {agent.sampleConversation.slice(0, msgCount).map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`transcript-line ${msg.speaker} fade-in`}
                                                    style={{ animationDelay: `${idx * 100}ms` }}
                                                >
                                                    <div className="msg-label">
                                                        {msg.speaker === "agent" ? (
                                                            <span className="label-agent" style={{ color: agent.color }}>
                                                                {agent.emoji} {agent.name}
                                                            </span>
                                                        ) : (
                                                            <span className="label-prospect">👤 Prospect</span>
                                                        )}
                                                    </div>
                                                    <div className={`script-text ${msg.speaker}`}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))}
                                            {msgCount < agent.sampleConversation.length && (
                                                <div className="voice-processing-indicator">
                                                    <span /><span /><span />
                                                    <em style={{ marginLeft: '12px', fontStyle: 'normal', opacity: 0.5, fontSize: '0.75rem' }}>Processing Voice...</em>
                                                </div>
                                            )}
                                        </div>

                                        {/* Voice Demo CTA */}
                                        <div className="voice-demo-cta">
                                            <a
                                                href={`/?agent=${agent.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                className="voice-demo-btn"
                                                style={{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}cc)` }}
                                            >
                                                🎙 Talk to {agent.name} — Live Voice Demo
                                            </a>
                                            <span className="voice-demo-sub">Start a real voice conversation with {agent.name}. Powered by Gemini Live.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Business Tools Hub ── */}
            <section style={{
                padding: "32px",
                borderTop: "1px solid rgba(30, 41, 59, 0.4)",
            }}>
                <h2 style={{
                    fontSize: "0.9rem", fontWeight: 800, color: "#64748b",
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px",
                }}>🛠️ Business Growth Tools</h2>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                }}>
                    {[
                        { title: "Google My Business Setup", desc: "12-step wizard to optimize your Google Business Profile for local SEO & Maps ranking", href: "/dashboard/gmb-setup", icon: "📍", color: "#22c55e" },
                        { title: "Free AI Audit", desc: "60-second diagnostic showing exactly how much revenue you're losing in missed calls", href: "/audit", icon: "🩺", color: "#3b82f6" },
                        { title: "Pricing & Plans", desc: "Transparent pricing — Starter $497, Growth $997, Enterprise $2,497. 5x ROI guaranteed", href: "/pricing", icon: "💰", color: "#ffa726" },
                        { title: "Blog & Resources", desc: "10 expert articles on neuromarketing, AI voice agents, and industry-specific strategies", href: "/blog", icon: "📝", color: "#8b5cf6" },
                        { title: "Client Success Stories", desc: "Real results: $2.4M recovered across 4,000+ partners. See the data.", href: "/testimonials", icon: "⭐", color: "#ef4444" },
                        { title: "About BioDynamX", desc: "Meet Billy De La Taurus, the Neurobiology of Choice framework, and the AI team", href: "/about", icon: "🧬", color: "#ec4899" },
                    ].map((tool) => (
                        <Link key={tool.title} href={tool.href} style={{
                            display: "block", padding: "20px", borderRadius: "14px",
                            background: "rgba(17, 24, 39, 0.5)",
                            border: `1px solid ${tool.color}20`,
                            textDecoration: "none", color: "#fff",
                            transition: "all 0.3s ease",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                <span style={{ fontSize: "20px" }}>{tool.icon}</span>
                                <span style={{ fontSize: "14px", fontWeight: 700, color: tool.color }}>{tool.title}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>{tool.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="dashboard-footer">
                <p>BioDynamX Engineering Group · Mission Control · {new Date().getFullYear()}</p>
                <p className="footer-links">
                    <Link href="/">Home</Link> · <a href="/api/agents/health" target="_blank" rel="noopener noreferrer">Raw JSON</a> · <a href="https://calendly.com/biodynamx" target="_blank" rel="noopener noreferrer">Schedule Call</a>
                </p>
            </footer>

            {/* ── Additional Styles ── */}
            <style>{`
                .ring-chart {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                .ring-label {
                    font-size: 0.62rem;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                @media (max-width: 1024px) {
                    /* Revenue hero strip */
                    .dashboard-container > section:nth-of-type(1) {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    /* Main grid: stack metrics + activity */
                    .dashboard-container > div:nth-of-type(1) {
                        grid-template-columns: 1fr !important;
                    }
                }

                @media (max-width: 768px) {
                    .dashboard-container > section:nth-of-type(1) {
                        grid-template-columns: 1fr 1fr !important;
                        padding: 16px !important;
                        gap: 10px !important;
                    }
                    .dashboard-container > div:nth-of-type(1) {
                        grid-template-columns: 1fr !important;
                        padding: 0 !important;
                    }
                }

                @media (max-width: 480px) {
                    .dashboard-container > section:nth-of-type(1) {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
