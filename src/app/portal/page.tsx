"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import "./portal.css";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface ClientProfile {
    id: string;
    email: string;
    name: string | null;
    plan: string;
    status: string;
    onboarding_step: number;
    onboarding_complete: boolean;
    settings: {
        business_name: string;
        business_url: string;
        business_phone: string;
        business_hours: { open: string; close: string };
        timezone: string;
        ai_greeting: string;
        notifications_email: boolean;
        notifications_sms: boolean;
    };
}

const ONBOARDING_STEPS = [
    {
        title: "Set Up Your Business Profile",
        description: "Tell us about your business so our AI agents can represent you accurately.",
        time: "~2 minutes",
        fields: ["business_name", "business_url", "business_phone"],
    },
    {
        title: "Configure Business Hours",
        description: "Set your hours so our AI knows when to use after-hours messaging vs. live transfer.",
        time: "~1 minute",
        fields: ["business_hours", "timezone"],
    },
    {
        title: "Customize Your AI Greeting",
        description: "Write the perfect greeting your AI agent will use when answering calls and chats.",
        time: "~2 minutes",
        fields: ["ai_greeting"],
    },
    {
        title: "Set Up Notifications",
        description: "Choose how you want to be notified about new leads, missed calls, and sales opportunities.",
        time: "~1 minute",
        fields: ["notifications"],
    },
    {
        title: "Go Live!",
        description: "Review your setup and activate your BioDynamX AI engine. Leads will start flowing immediately.",
        time: "~30 seconds",
        fields: [],
    },
];

// ─── Jules Workspace Component ────────────────────────────────────────

interface JulesSession {
    name: string;
    title: string;
    state: string;
    url: string;
}

function JulesWorkspace({ profile }: { profile: ClientProfile | null }) {
    const [sessions, setSessions] = useState<JulesSession[]>([]);
    const [julesHealthy, setJulesHealthy] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [prompt, setPrompt] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/jules?action=sessions&pageSize=5");
                const data = await res.json();
                if (data.sessions) setSessions(data.sessions);
                setJulesHealthy(!data.error);
            } catch {
                setJulesHealthy(false);
            }
            setLoading(false);
        };
        load();
    }, []);

    const createSession = async () => {
        if (!prompt.trim()) return;
        setCreating(true);
        try {
            const res = await fetch("/api/stitch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    taskType: "custom",
                    clientName: profile?.settings?.business_name || "Client",
                    clientDomain: profile?.settings?.business_url || undefined,
                }),
            });
            const data = await res.json();
            if (data.success && data.sessionId) {
                setSessions(prev => [{
                    name: data.sessionId,
                    title: data.title || prompt.slice(0, 60),
                    state: data.state || "ACTIVE",
                    url: data.previewUrl,
                }, ...prev]);
                setPrompt("");
            }
        } catch {
            // Error handled gracefully
        }
        setCreating(false);
    };

    const stateColor = (state: string) => {
        switch (state) {
            case "ACTIVE": return "#00ff41";
            case "COMPLETED": return "#8b5cf6";
            case "FAILED": return "#ef4444";
            default: return "#888";
        }
    };

    return (
        <div className="agent-workspace animate-fade-in">
            <div className="workspace-header">
                <div className="agent-badge">
                    <span className={julesHealthy ? "pulse-dot-purple" : "pulse-dot-red"} />
                    🤖 JULES {julesHealthy === null ? "CONNECTING" : julesHealthy ? "ONLINE" : "OFFLINE"}
                </div>
                <h2>Jules: Your Proactive AI Architect</h2>
            </div>

            {/* New session form */}
            <div className="terminal-view">
                <div className="terminal-header">
                    <div className="terminal-dots">
                        <span className="terminal-dot red" />
                        <span className="terminal-dot yellow" />
                        <span className="terminal-dot green" />
                    </div>
                    <span>jules-engine-v2.0.0</span>
                </div>
                <div className="terminal-content">
                    <p className="terminal-line">
                        <span className="term-green">$</span> Describe a task for Jules to work on:
                    </p>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <input
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="e.g. Fix SEO issues on my landing page..."
                            style={{
                                flex: 1,
                                background: "rgba(0,255,65,0.05)",
                                border: "1px solid rgba(0,255,65,0.2)",
                                borderRadius: 8,
                                padding: "10px 14px",
                                color: "#00ff41",
                                fontFamily: "monospace",
                                fontSize: 14,
                            }}
                            onKeyDown={e => e.key === "Enter" && createSession()}
                        />
                        <button
                            className="portal-btn-primary"
                            onClick={createSession}
                            disabled={creating || !prompt.trim()}
                            style={{ minWidth: 120 }}
                        >
                            {creating ? "Creating..." : "Launch →"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sessions list */}
            {loading ? (
                <div style={{ textAlign: "center", padding: 24, color: "#666" }}>Loading sessions...</div>
            ) : sessions.length > 0 ? (
                <div style={{ marginTop: 16 }}>
                    <h3 style={{ color: "#aaa", fontSize: 14, marginBottom: 12, fontWeight: 500 }}>Recent Sessions</h3>
                    {sessions.map(s => (
                        <a
                            key={s.name}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "12px 16px",
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 10,
                                marginBottom: 8,
                                textDecoration: "none",
                                color: "#ccc",
                                transition: "all 0.2s",
                            }}
                        >
                            <span style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: stateColor(s.state),
                                boxShadow: `0 0 6px ${stateColor(s.state)}`,
                                flexShrink: 0,
                            }} />
                            <span style={{ flex: 1, fontSize: 14 }}>{s.title || s.name}</span>
                            <span style={{
                                fontSize: 11,
                                color: stateColor(s.state),
                                fontWeight: 600,
                                textTransform: "uppercase",
                            }}>{s.state}</span>
                        </a>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: 24, color: "#666" }}>
                    No sessions yet. Create your first task above!
                </div>
            )}

            <button
                className="portal-btn-primary"
                onClick={() => window.open("https://jules.google.com", "_blank")}
                style={{ marginTop: 16 }}
            >
                Open Jules Dashboard ↗
            </button>
        </div>
    );
}

// ─── Stitch Design Lab Component ──────────────────────────────────────

function StitchDesignLab({ profile }: { profile: ClientProfile | null }) {
    const [designPrompt, setDesignPrompt] = useState("");
    const [designing, setDesigning] = useState(false);
    const [result, setResult] = useState<{ success: boolean; previewUrl?: string; message?: string } | null>(null);

    const handleDesign = async () => {
        if (!designPrompt.trim()) return;
        setDesigning(true);
        setResult(null);
        try {
            const res = await fetch("/api/stitch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: designPrompt,
                    taskType: "design_implement",
                    clientName: profile?.settings?.business_name || "Client",
                    clientDomain: profile?.settings?.business_url || undefined,
                }),
            });
            const data = await res.json();
            setResult(data);
        } catch {
            setResult({ success: false, message: "Connection error. Please try again." });
        }
        setDesigning(false);
    };

    return (
        <div className="agent-workspace animate-fade-in">
            <div className="workspace-header">
                <div className="agent-badge">
                    <span className="pulse-dot-green" />
                    🎨 STITCH ACTIVE
                </div>
                <h2>Stitch: High-Fidelity Design Lab</h2>
            </div>
            <div className="stitch-canvas">
                <div className="canvas-placeholder">
                    <div className="placeholder-icon">📐</div>
                    <h3>What would you like to design?</h3>
                    <p>Describe your vision and Jules will architect a conversion-optimized implementation.</p>
                    <textarea
                        value={designPrompt}
                        onChange={e => setDesignPrompt(e.target.value)}
                        placeholder="e.g. Modern medical landing page with high trust signals, social proof, and AI chat integration..."
                        rows={4}
                        style={{
                            width: "100%",
                            background: "rgba(0,255,65,0.03)",
                            border: "1px solid rgba(0,255,65,0.15)",
                            borderRadius: 10,
                            padding: "12px 16px",
                            color: "#e0e0e0",
                            fontFamily: "inherit",
                            fontSize: 14,
                            resize: "vertical",
                            marginBottom: 16,
                        }}
                    />
                    <button
                        className="portal-btn-primary"
                        onClick={handleDesign}
                        disabled={designing || !designPrompt.trim()}
                    >
                        {designing ? "🎨 Designing..." : "Generate Design →"}
                    </button>

                    {result && (
                        <div style={{
                            marginTop: 16,
                            padding: "16px 20px",
                            background: result.success ? "rgba(0,255,65,0.05)" : "rgba(239,68,68,0.05)",
                            border: `1px solid ${result.success ? "rgba(0,255,65,0.2)" : "rgba(239,68,68,0.2)"}`,
                            borderRadius: 10,
                            textAlign: "left",
                        }}>
                            <p style={{ color: result.success ? "#00ff41" : "#ef4444", fontWeight: 600, marginBottom: 8 }}>
                                {result.success ? "✅ Design session created!" : "⚠️ " + (result.message || "Something went wrong")}
                            </p>
                            {result.previewUrl && (
                                <a
                                    href={result.previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#8b5cf6", textDecoration: "underline", fontSize: 14 }}
                                >
                                    View in Jules →
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ClientPortalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "builder" | "design" | "leads">("overview");
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [liveStats, setLiveStats] = useState<{
        leadsCapured: number;
        missedCallsAnswered: number;
        revenueGenerated: number;
    } | null>(null);

    const loadProfile = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from("clients")
            .select("*")
            .eq("id", userId)
            .single();

        if (data) {
            setProfile(data as ClientProfile);
            setFormData({
                business_name: data.settings?.business_name || "",
                business_url: data.settings?.business_url || "",
                business_phone: data.settings?.business_phone || "",
                open: data.settings?.business_hours?.open || "09:00",
                close: data.settings?.business_hours?.close || "17:00",
                timezone: data.settings?.timezone || "America/Denver",
                ai_greeting: data.settings?.ai_greeting || "",
            });
        }
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/portal/login");
                return;
            }

            setUser({
                email: session.user.email || "",
                name: session.user.user_metadata?.name,
            });

            await loadProfile(session.user.id);

            // Fetch live ROI stats
            try {
                const roiRes = await fetch(`/api/client-roi?clientId=${session.user.id}`);
                const roiData = await roiRes.json();
                if (roiData.revenue) {
                    setLiveStats({
                        leadsCapured: roiData.revenue.leadsCapured || 0,
                        missedCallsAnswered: roiData.revenue.missedCallsAnswered || 0,
                        revenueGenerated: roiData.revenue.revenueGenerated || 0,
                    });
                }
            } catch { /* non-critical */ }

            setLoading(false);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT" || !session) {
                router.push("/portal/login");
            }
        });

        return () => subscription.unsubscribe();
    }, [router, loadProfile]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/portal/login");
    };

    const handleSaveStep = async (stepIndex: number) => {
        if (!profile) return;
        setSaving(true);

        const settings: Record<string, unknown> = {};

        switch (stepIndex) {
            case 0:
                settings.business_name = formData.business_name;
                settings.business_url = formData.business_url;
                settings.business_phone = formData.business_phone;
                break;
            case 1:
                settings.business_hours = { open: formData.open, close: formData.close };
                settings.timezone = formData.timezone;
                break;
            case 2:
                settings.ai_greeting = formData.ai_greeting;
                break;
            case 3:
                settings.notifications_email = true;
                settings.notifications_sms = true;
                break;
        }

        const newStep = stepIndex + 1;

        await supabase
            .from("clients")
            .update({
                onboarding_step: newStep,
                onboarding_complete: newStep >= 5,
                settings: { ...(profile.settings || {}), ...settings },
            })
            .eq("id", profile.id);

        setProfile(prev => prev ? {
            ...prev,
            onboarding_step: newStep,
            onboarding_complete: newStep >= 5,
            settings: { ...prev.settings, ...settings } as ClientProfile["settings"],
        } : null);

        setActiveStep(newStep < 5 ? newStep : null);
        setSaving(false);
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="portal-loading">
                <div className="spinner" />
                <span>Loading your dashboard...</span>
            </div>
        );
    }

    const currentStep = profile?.onboarding_step || 0;
    const isOnboarded = profile?.onboarding_complete || false;

    return (
        <div className="client-portal">
            {/* Nav */}
            <nav className="portal-nav">
                <div className="portal-brand">
                    <span className="portal-brand-icon">🧬</span>
                    <span className="portal-brand-name">BioDynamX</span>
                    <span className="portal-brand-tag">Client Portal</span>
                </div>
                <div className="portal-user">
                    <span className="portal-user-name">{user?.name || user?.email}</span>
                    <button className="portal-logout" onClick={handleLogout}>Sign Out</button>
                </div>
            </nav>

            <div className="portal-content">
                {/* Welcome */}
                <div className="welcome-banner">
                    <h1>👋 Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!</h1>
                    <p>
                        {isOnboarded
                            ? "Your BioDynamX AI engine is live and working for you 24/7. Here's how things are looking."
                            : "Let's get your AI engine set up. It only takes about 5 minutes and you'll be capturing leads automatically."
                        }
                    </p>
                    {profile?.plan && (
                        <div className="welcome-plan">
                            ⚡ {profile.plan}
                        </div>
                    )}
                </div>

                {/* Onboarding */}
                {!isOnboarded && (
                    <div className="onboarding-section">
                        <h2>🚀 Quick Setup ({currentStep}/5 complete)</h2>

                        <div className="onboarding-progress">
                            {ONBOARDING_STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`progress-segment ${i < currentStep ? "completed" :
                                        i === currentStep ? "active" : ""
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="onboarding-steps">
                            {ONBOARDING_STEPS.map((step, i) => {
                                const isDone = i < currentStep;
                                const isCurrent = i === currentStep;
                                const isExpanded = activeStep === i;

                                return (
                                    <div
                                        key={i}
                                        className={`onboarding-step ${isDone ? "completed" : ""} ${isCurrent ? "active" : ""}`}
                                        onClick={() => isCurrent && setActiveStep(isExpanded ? null : i)}
                                    >
                                        <div className={`step-check ${isDone ? "done" : isCurrent ? "current" : "pending"}`}>
                                            {isDone ? "✓" : i + 1}
                                        </div>
                                        <div className="step-info">
                                            <h3>{step.title}</h3>
                                            <p>{step.description}</p>
                                            <div className="step-time">{step.time}</div>

                                            {isCurrent && !isExpanded && (
                                                <button className="step-action-btn" onClick={(e) => { e.stopPropagation(); setActiveStep(i); }}>
                                                    Start →
                                                </button>
                                            )}

                                            {isExpanded && (
                                                <div className="step-form" onClick={e => e.stopPropagation()}>
                                                    {i === 0 && (
                                                        <>
                                                            <div className="form-group">
                                                                <label htmlFor="business_name">Business Name</label>
                                                                <input id="business_name" value={formData.business_name || ""} onChange={e => updateField("business_name", e.target.value)} placeholder="e.g. Denver Dental Group" />
                                                            </div>
                                                            <div className="form-group">
                                                                <label htmlFor="business_url">Website URL</label>
                                                                <input id="business_url" value={formData.business_url || ""} onChange={e => updateField("business_url", e.target.value)} placeholder="e.g. https://denverdentalgroup.com" />
                                                            </div>
                                                            <div className="form-group">
                                                                <label htmlFor="business_phone">Business Phone</label>
                                                                <input id="business_phone" value={formData.business_phone || ""} onChange={e => updateField("business_phone", e.target.value)} placeholder="e.g. +1 (303) 555-1234" />
                                                            </div>
                                                        </>
                                                    )}
                                                    {i === 1 && (
                                                        <>
                                                            <div className="form-group">
                                                                <label htmlFor="open_time">Opening Time</label>
                                                                <input id="open_time" type="time" value={formData.open || "09:00"} onChange={e => updateField("open", e.target.value)} />
                                                            </div>
                                                            <div className="form-group">
                                                                <label htmlFor="close_time">Closing Time</label>
                                                                <input id="close_time" type="time" value={formData.close || "17:00"} onChange={e => updateField("close", e.target.value)} />
                                                            </div>
                                                            <div className="form-group">
                                                                <label htmlFor="timezone">Timezone</label>
                                                                <select id="timezone" aria-label="Timezone" value={formData.timezone || "America/Denver"} onChange={e => updateField("timezone", e.target.value)}>
                                                                    <option value="America/New_York">Eastern (ET)</option>
                                                                    <option value="America/Chicago">Central (CT)</option>
                                                                    <option value="America/Denver">Mountain (MT)</option>
                                                                    <option value="America/Los_Angeles">Pacific (PT)</option>
                                                                    <option value="America/Phoenix">Arizona (AZ)</option>
                                                                </select>
                                                            </div>
                                                        </>
                                                    )}
                                                    {i === 2 && (
                                                        <div className="form-group">
                                                            <label htmlFor="ai_greeting">AI Agent Greeting (what your AI says when it answers)</label>
                                                            <textarea
                                                                id="ai_greeting"
                                                                value={formData.ai_greeting || ""}
                                                                onChange={e => updateField("ai_greeting", e.target.value)}
                                                                placeholder={`e.g. "Hi! Thanks for calling ${formData.business_name || "our office"}. My name is Jenny, your AI assistant. How can I help you today?"`}
                                                                rows={4}
                                                            />
                                                        </div>
                                                    )}
                                                    {i === 3 && (
                                                        <>
                                                            <div className="form-group">
                                                                <label className="checkbox-label">
                                                                    <input type="checkbox" defaultChecked className="checkbox-input" />
                                                                    Email me when a new lead is captured
                                                                </label>
                                                            </div>
                                                            <div className="form-group">
                                                                <label className="checkbox-label">
                                                                    <input type="checkbox" defaultChecked className="checkbox-input" />
                                                                    Text me when a hot lead comes in
                                                                </label>
                                                            </div>
                                                            <div className="form-group">
                                                                <label className="checkbox-label">
                                                                    <input type="checkbox" defaultChecked className="checkbox-input" />
                                                                    Weekly performance report via email
                                                                </label>
                                                            </div>
                                                        </>
                                                    )}
                                                    {i === 4 && (
                                                        <div className="golive-card">
                                                            <p className="golive-icon">🎉</p>
                                                            <p className="golive-title">You&apos;re all set!</p>
                                                            <p className="golive-text">Click the button below to activate your AI engine.</p>
                                                        </div>
                                                    )}
                                                    <button
                                                        className="step-action-btn"
                                                        onClick={() => handleSaveStep(i)}
                                                        disabled={saving}
                                                    >
                                                        {saving ? "Saving..." : i === 4 ? "🚀 Activate AI Engine" : "Save & Continue →"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Content Tabs */}
                {activeTab === "overview" && (
                    <>
                        {/* Stats */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{liveStats?.leadsCapured ?? 0}</div>
                                <div className="stat-label">Leads This Month</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{liveStats?.missedCallsAnswered ?? 0}</div>
                                <div className="stat-label">Calls Answered</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">${(liveStats?.revenueGenerated ?? 0).toLocaleString()}</div>
                                <div className="stat-label">Revenue Generated</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">&lt;1s</div>
                                <div className="stat-label">Avg Response Time</div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <h2>⚡ Quick Actions</h2>
                            <div className="actions-grid">
                                <a href="/dashboard/client" className="action-card">
                                    <span className="action-icon">📊</span>
                                    <div>
                                        <div className="action-label">ROI Dashboard</div>
                                        <div className="action-sublabel">6x guarantee tracker</div>
                                    </div>
                                </a>
                                <button onClick={() => setActiveTab("design")} className="action-card">
                                    <span className="action-icon">🎨</span>
                                    <div>
                                        <div className="action-label">Website Builder</div>
                                        <div className="action-sublabel">Stitch AI design lab</div>
                                    </div>
                                </button>
                                <button onClick={() => setActiveTab("builder")} className="action-card">
                                    <span className="action-icon">🤖</span>
                                    <div>
                                        <div className="action-label">Jules Engineer</div>
                                        <div className="action-sublabel">Manage your AI builds</div>
                                    </div>
                                </button>
                                <a href="/portal/leads" className="action-card">
                                    <span className="action-icon">📋</span>
                                    <div>
                                        <div className="action-label">View Leads</div>
                                        <div className="action-sublabel">See all captured leads</div>
                                    </div>
                                </a>
                                <a href="/portal/settings" className="action-card">
                                    <span className="action-icon">⚙️</span>
                                    <div>
                                        <div className="action-label">Settings</div>
                                        <div className="action-sublabel">Account &amp; preferences</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "builder" && (
                    <JulesWorkspace profile={profile} />
                )}

                {activeTab === "design" && (
                    <StitchDesignLab profile={profile} />
                )}
            </div>
        </div>
    );
}
