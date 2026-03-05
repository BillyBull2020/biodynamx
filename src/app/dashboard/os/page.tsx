"use client";

// ═══════════════════════════════════════════════════════════════════════════
// BioDynamX OS — The Dashboard That Knows Your Business
// An operating-system-style workspace where AI agents work autonomously
// and everything grows smarter with every interaction.
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import "./os-dashboard.css";

const LiquidOrb = dynamic(() => import("@/components/LiquidOrb"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────

type ModuleId = "command" | "analytics" | "agents" | "leads" | "conversations" | "settings";

interface BusinessProfile {
    name: string;
    industry: string;
    stage: "new" | "growing" | "established";
    website?: string;
    phone?: string;
    email?: string;
    services: string[];
    goals: string[];
    teamSize: number;
    monthlyRevenue?: number;
    createdAt: string;
}

interface AgentStatus {
    name: string;
    role: string;
    emoji: string;
    color: string;
    status: "active" | "idle" | "working";
    lastAction?: string;
    lastActionTime?: string;
    conversationsToday: number;
    leadsConverted: number;
}

interface ActivityItem {
    id: string;
    agent: string;
    agentColor: string;
    action: string;
    detail: string;
    timestamp: string;
    type: "lead" | "audit" | "followup" | "conversion" | "system";
}

interface DashMetric {
    label: string;
    value: string;
    change?: string;
    positive?: boolean;
    icon: string;
}

// ─── Mock Data (will be Supabase-backed) ──────────────────────────────────

function getBusinessProfile(): BusinessProfile {
    return {
        name: "Your Business",
        industry: "Not set",
        stage: "new",
        services: [],
        goals: [],
        teamSize: 1,
        createdAt: new Date().toISOString(),
    };
}

function getAgents(): AgentStatus[] {
    return [
        {
            name: "Jenny", role: "Sales Agent", emoji: "💼", color: "#00ff41",
            status: "active", lastAction: "Completed sales call", lastActionTime: "2 min ago",
            conversationsToday: 7, leadsConverted: 2,
        },
        {
            name: "Mark", role: "Solutions Architect", emoji: "🏗️", color: "#4488ff",
            status: "idle", lastAction: "Drafted proposal", lastActionTime: "14 min ago",
            conversationsToday: 3, leadsConverted: 1,
        },
        {
            name: "Aria", role: "AI Receptionist", emoji: "📞", color: "#ec4899",
            status: "active", lastAction: "Answered call, routed to Jenny", lastActionTime: "Just now",
            conversationsToday: 12, leadsConverted: 0,
        },
        {
            name: "Sarah", role: "Audit Specialist", emoji: "🔍", color: "#f59e0b",
            status: "working", lastAction: "Running SEO audit for lead #34", lastActionTime: "1 min ago",
            conversationsToday: 5, leadsConverted: 0,
        },
    ];
}

function getActivityFeed(): ActivityItem[] {
    const now = new Date();
    return [
        { id: "1", agent: "Jenny", agentColor: "#00ff41", action: "Closed a deal", detail: "New dental client signed up for Growth plan ($497/mo)", timestamp: new Date(now.getTime() - 120000).toISOString(), type: "conversion" },
        { id: "2", agent: "Aria", agentColor: "#ec4899", action: "Answered incoming call", detail: "Qualified lead from Google — med spa in Scottsdale", timestamp: new Date(now.getTime() - 300000).toISOString(), type: "lead" },
        { id: "3", agent: "Sarah", agentColor: "#f59e0b", action: "Completed audit", detail: "SEO score: 72 → 78 (+6 points since last week)", timestamp: new Date(now.getTime() - 600000).toISOString(), type: "audit" },
        { id: "4", agent: "Mark", agentColor: "#4488ff", action: "Sent follow-up", detail: "Auto follow-up to lead who visited pricing page 3x", timestamp: new Date(now.getTime() - 900000).toISOString(), type: "followup" },
        { id: "5", agent: "System", agentColor: "#666", action: "Daily briefing generated", detail: "7 leads captured, 2 converted, SEO improved", timestamp: new Date(now.getTime() - 3600000).toISOString(), type: "system" },
    ];
}

function getDashMetrics(): DashMetric[] {
    return [
        { label: "Leads Today", value: "7", change: "+3 vs yesterday", positive: true, icon: "🎯" },
        { label: "Revenue This Month", value: "$4,970", change: "+$1,494 vs last month", positive: true, icon: "💰" },
        { label: "Agent Conversations", value: "27", change: "12 today", positive: true, icon: "💬" },
        { label: "SEO Score", value: "78", change: "+6 this week", positive: true, icon: "📈" },
    ];
}

// ─── Sidebar Module ───────────────────────────────────────────────────────

const MODULES: { id: ModuleId; icon: string; label: string }[] = [
    { id: "command", icon: "🏠", label: "Command Center" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "agents", icon: "🤖", label: "AI Team" },
    { id: "leads", icon: "📋", label: "Leads" },
    { id: "conversations", icon: "💬", label: "Conversations" },
    { id: "settings", icon: "⚙️", label: "Settings" },
];

// ─── Time Formatter ───────────────────────────────────────────────────────

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Command Center Module ────────────────────────────────────────────────

function CommandCenter({
    profile,
    metrics,
    agents,
    activity,
}: {
    profile: BusinessProfile;
    metrics: DashMetric[];
    agents: AgentStatus[];
    activity: ActivityItem[];
}) {
    return (
        <div className="os-module-content">
            {/* Greeting */}
            <div className="os-greeting">
                <div className="os-greeting-text">
                    <h2>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"} 👋</h2>
                    <p>Here&apos;s what your AI team has been up to.</p>
                </div>
                <div className="os-greeting-orb">
                    <LiquidOrb label="Live" />
                </div>
            </div>

            {/* Metrics Strip */}
            <div className="os-metrics-strip">
                {metrics.map((m) => (
                    <div key={m.label} className="os-metric-card">
                        <div className="os-metric-icon">{m.icon}</div>
                        <div className="os-metric-value">{m.value}</div>
                        <div className="os-metric-label">{m.label}</div>
                        {m.change && (
                            <div className={`os-metric-change ${m.positive ? "positive" : "negative"}`}>
                                {m.change}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Two Column: Agents + Activity */}
            <div className="os-two-col">
                {/* Agent Status */}
                <div className="os-panel">
                    <div className="os-panel-header">
                        <h3>🤖 AI Team Status</h3>
                        <span className="os-panel-badge">{agents.filter(a => a.status === "active").length} active</span>
                    </div>
                    <div className="os-agent-list">
                        {agents.map((agent) => (
                            <div key={agent.name} className="os-agent-row">
                                <div className="os-agent-avatar" style={{ borderColor: agent.color }}>
                                    {agent.emoji}
                                </div>
                                <div className="os-agent-info">
                                    <div className="os-agent-name">
                                        {agent.name}
                                        <span className={`os-agent-status-dot ${agent.status}`} />
                                    </div>
                                    <div className="os-agent-role">{agent.role}</div>
                                    <div className="os-agent-last">{agent.lastAction} · {agent.lastActionTime}</div>
                                </div>
                                <div className="os-agent-stats">
                                    <div className="os-agent-stat">{agent.conversationsToday} <span>chats</span></div>
                                    <div className="os-agent-stat">{agent.leadsConverted} <span>closed</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="os-panel">
                    <div className="os-panel-header">
                        <h3>📡 Live Activity</h3>
                        <span className="os-panel-badge os-live-pulse">Live</span>
                    </div>
                    <div className="os-activity-feed">
                        {activity.map((item) => (
                            <div key={item.id} className={`os-activity-item ${item.type}`}>
                                <div className="os-activity-dot" style={{ backgroundColor: item.agentColor }} />
                                <div className="os-activity-content">
                                    <div className="os-activity-action">
                                        <strong>{item.agent}</strong> {item.action}
                                    </div>
                                    <div className="os-activity-detail">{item.detail}</div>
                                    <div className="os-activity-time">{timeAgo(item.timestamp)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Business Context Card */}
            {profile.industry === "Not set" && (
                <div className="os-setup-banner">
                    <div className="os-setup-icon">🧬</div>
                    <div className="os-setup-text">
                        <h4>Tell us about your business</h4>
                        <p>The more we know, the smarter your AI team gets. Set up your business profile to unlock personalized insights.</p>
                    </div>
                    <button className="os-setup-btn">Set Up Profile →</button>
                </div>
            )}
        </div>
    );
}

// ─── Agents Module ────────────────────────────────────────────────────────

function AgentsModule({ agents }: { agents: AgentStatus[] }) {
    return (
        <div className="os-module-content">
            <h2>AI Team Dashboard</h2>
            <p className="os-module-desc">Your autonomous AI workforce. They learn, adapt, and act independently.</p>
            <div className="os-agents-grid">
                {agents.map((agent) => (
                    <div key={agent.name} className="os-agent-card" style={{ borderColor: agent.color }}>
                        <div className="os-agent-card-header">
                            <div className="os-agent-card-avatar">{agent.emoji}</div>
                            <div>
                                <div className="os-agent-card-name">{agent.name}</div>
                                <div className="os-agent-card-role">{agent.role}</div>
                            </div>
                            <div className={`os-agent-status-badge ${agent.status}`}>{agent.status}</div>
                        </div>
                        <div className="os-agent-card-stats">
                            <div className="os-agent-card-stat">
                                <div className="os-stat-number">{agent.conversationsToday}</div>
                                <div className="os-stat-label">Conversations</div>
                            </div>
                            <div className="os-agent-card-stat">
                                <div className="os-stat-number">{agent.leadsConverted}</div>
                                <div className="os-stat-label">Converted</div>
                            </div>
                        </div>
                        <div className="os-agent-card-last">
                            <span>Last action:</span> {agent.lastAction}
                            <div className="os-agent-card-time">{agent.lastActionTime}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Placeholder Module ───────────────────────────────────────────────────

function PlaceholderModule({ title, description }: { title: string; description: string }) {
    return (
        <div className="os-module-content os-placeholder">
            <div className="os-placeholder-icon">🚧</div>
            <h2>{title}</h2>
            <p>{description}</p>
            <div className="os-placeholder-hint">Ask Jenny to help you set this up.</div>
        </div>
    );
}

// ─── Main OS Dashboard ───────────────────────────────────────────────────

export default function OSDashboard() {
    const [activeModule, setActiveModule] = useState<ModuleId>("command");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [profile] = useState<BusinessProfile>(getBusinessProfile());
    const [agents] = useState<AgentStatus[]>(getAgents());
    const [activity] = useState<ActivityItem[]>(getActivityFeed());
    const [metrics] = useState<DashMetric[]>(getDashMetrics());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [jennyListening, setJennyListening] = useState(false);

    // Live clock
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    // Render active workspace module
    function renderModule() {
        switch (activeModule) {
            case "command":
                return <CommandCenter profile={profile} metrics={metrics} agents={agents} activity={activity} />;
            case "agents":
                return <AgentsModule agents={agents} />;
            case "analytics":
                return <PlaceholderModule title="Analytics" description="Revenue tracking, lead funnel, conversion rates, and trend analysis. Coming soon — your data grows with every interaction." />;
            case "leads":
                return <PlaceholderModule title="Leads & Pipeline" description="Every prospect your AI team discovers, qualifies, and nurtures. Full CRM powered by AI memory." />;
            case "conversations":
                return <PlaceholderModule title="Conversations" description="Full transcripts of every AI conversation. Searchable, taggable, and always learning." />;
            case "settings":
                return <PlaceholderModule title="Business Settings" description="Your business profile, goals, processes, and preferences. The DNA that makes your AI team uniquely yours." />;
            default:
                return null;
        }
    }

    return (
        <div className={`os-container ${sidebarCollapsed ? "collapsed" : ""}`}>
            {/* ── Sidebar Dock ── */}
            <aside className="os-sidebar">
                <div className="os-sidebar-header">
                    <div className="os-logo-mark">B</div>
                    {!sidebarCollapsed && <span className="os-logo-text">BioDynamX OS</span>}
                </div>

                <nav className="os-nav">
                    {MODULES.map((mod) => (
                        <button
                            key={mod.id}
                            className={`os-nav-item ${activeModule === mod.id ? "active" : ""}`}
                            onClick={() => setActiveModule(mod.id)}
                            title={mod.label}
                        >
                            <span className="os-nav-icon">{mod.icon}</span>
                            {!sidebarCollapsed && <span className="os-nav-label">{mod.label}</span>}
                        </button>
                    ))}
                </nav>

                <button
                    className="os-collapse-btn"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    title={sidebarCollapsed ? "Expand" : "Collapse"}
                >
                    {sidebarCollapsed ? "→" : "←"}
                </button>
            </aside>

            {/* ── Main Workspace ── */}
            <main className="os-workspace">
                {/* Top Bar */}
                <header className="os-topbar">
                    <div className="os-topbar-left">
                        <h1 className="os-topbar-title">
                            {MODULES.find(m => m.id === activeModule)?.icon}{" "}
                            {MODULES.find(m => m.id === activeModule)?.label}
                        </h1>
                    </div>
                    <div className="os-topbar-right">
                        <div className="os-topbar-time">
                            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="os-topbar-status">
                            <span className="os-status-dot live" />
                            All Systems Operational
                        </div>
                    </div>
                </header>

                {/* Active Module */}
                <div className="os-workspace-content">
                    {renderModule()}
                </div>

                {/* ── Persistent Jenny Voice Bar ── */}
                <div className="os-voice-bar">
                    <button
                        className={`os-voice-btn ${jennyListening ? "active" : ""}`}
                        onClick={() => setJennyListening(!jennyListening)}
                    >
                        <span className="os-voice-mic">🎙️</span>
                        {jennyListening ? "Jenny is listening..." : "Talk to Jenny"}
                    </button>
                    <div className="os-voice-hint">
                        Try: &quot;Show me today&apos;s leads&quot; · &quot;Run an audit&quot; · &quot;Follow up with stale leads&quot;
                    </div>
                </div>
            </main>
        </div>
    );
}
