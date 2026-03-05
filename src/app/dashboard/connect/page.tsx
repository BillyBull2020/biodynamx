"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./connect.css";

interface PlatformStatus {
    clientConfigured: boolean;
    connected: boolean;
    accountName: string | null;
}

interface StatusResponse {
    platforms: Record<string, PlatformStatus>;
    summary: {
        total: number;
        connected: number;
        needsSetup: string[];
    };
}

function ConnectAccountsContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<StatusResponse | null>(null);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        // Check for OAuth callback results
        const success = searchParams.get("success");
        const error = searchParams.get("error");
        const name = searchParams.get("name");

        if (success) {
            setTimeout(() => {
                setToast({
                    type: "success",
                    message: `✅ ${success.charAt(0).toUpperCase() + success.slice(1)} connected${name ? ` as ${name}` : ""}!`,
                });
            }, 0);
        }
        if (error) {
            setTimeout(() => {
                setToast({ type: "error", message: `❌ Connection failed: ${error}` });
            }, 0);
        }

        // Auto-dismiss toast
        if (success || error) {
            setTimeout(() => setToast(null), 5000);
        }

        // Fetch status
        fetch("/api/oauth/status")
            .then(r => r.json())
            .then(data => setStatus(data))
            .catch(() => { /* silent */ });
    }, [searchParams]);

    const connectedCount = status?.summary?.connected || 0;
    const totalCount = status?.summary?.total || 8;

    const platformCards = [
        {
            id: "gemini",
            name: "Google Gemini AI",
            subtitle: "AI Engine & Voice Agents",
            icon: "🧠",
            iconClass: "gemini",
            features: ["AI Voice Agents (Jenny, Mark, Aria)", "Real-time Sales Conversations", "Smart Content Generation", "Intent Analysis"],
            connectUrl: null, // API key based
            docsUrl: "https://aistudio.google.com/apikey",
        },
        {
            id: "stripe",
            name: "Stripe",
            subtitle: "Payments & Subscriptions",
            icon: "💳",
            iconClass: "stripe",
            features: ["$497/mo Growth Engine Checkout", "$1,497/mo Enterprise Checkout", "Subscription Management", "Payment Webhooks"],
            connectUrl: null,
            docsUrl: "https://dashboard.stripe.com/apikeys",
        },
        {
            id: "twilio",
            name: "Twilio",
            subtitle: "SMS, Voice & Phone System",
            icon: "📱",
            iconClass: "twilio",
            features: ["Missed Call Text-Back", "AI SMS Auto-Responder", "Outbound AI Calls", "Appointment Reminders"],
            connectUrl: null,
            docsUrl: "https://console.twilio.com",
        },
        {
            id: "supabase",
            name: "Supabase",
            subtitle: "Database & Lead Storage",
            icon: "🗄️",
            iconClass: "supabase",
            features: ["Lead Capture & Scoring", "Conversation Memory", "Nurture Sequence Tracking", "Analytics Data"],
            connectUrl: null,
            docsUrl: "https://supabase.com/dashboard",
        },
        {
            id: "google",
            name: "Google Business Profile",
            subtitle: "Reviews & Reputation",
            icon: "⭐",
            iconClass: "google",
            features: ["Review Monitoring", "AI Review Responses", "Reputation Scoring", "Competitor Benchmarking"],
            connectUrl: "/api/oauth/google",
            docsUrl: "https://console.cloud.google.com/apis/credentials",
        },
        {
            id: "google_ads",
            name: "Google Ads",
            subtitle: "Performance Max Campaigns",
            icon: "📣",
            iconClass: "google",
            features: ["AI-Optimized PMax Campaigns", "Search, YouTube & Display Ads", "Smart Bidding (Maximize Conversions)", "Real-Time ROI Reporting"],
            connectUrl: "/api/oauth/google-ads",
            docsUrl: "https://ads.google.com/home/tools/manager-accounts/",
        },
        {
            id: "stitch",
            name: "Stitch by Google",
            subtitle: "AI Website Builder",
            icon: "🎨",
            iconClass: "gemini",
            features: ["Generate Full Sites from Prompts", "Conversion-Optimized Designs", "Design Variants & A/B Testing", "Export-Ready UI Components"],
            connectUrl: null,
            docsUrl: "https://stitch.withgoogle.com",
        },
        {
            id: "resend",
            name: "Resend",
            subtitle: "Transactional Email",
            icon: "✉️",
            iconClass: "stripe",
            features: ["Welcome Emails on Signup", "Monthly ROI Report Delivery", "Audit Result Emails", "3,000 free emails/month"],
            connectUrl: null,
            docsUrl: "https://resend.com/api-keys",
        },
        {
            id: "meta",
            name: "Meta (Facebook + Instagram)",
            subtitle: "Social Media Posting",
            icon: "📸",
            iconClass: "meta",
            features: ["Auto-Post to Facebook Pages", "Instagram Content Publishing", "Comment Management", "Engagement Analytics"],
            connectUrl: "/api/oauth/meta",
            docsUrl: "https://developers.facebook.com/apps/",
        },
    ];

    return (
        <div className="connect-page">
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <div className="back-link">
                <a href="/dashboard">← Back to Dashboard</a>
            </div>

            <div className="connect-header">
                <h1>🔌 Connect Your Accounts</h1>
                <p className="subtitle">Link your platforms to unlock the full BioDynamX automation engine</p>
            </div>

            <div className="connect-status-bar">
                <div className="status-center">
                    <div className="status-count">{connectedCount}/{totalCount}</div>
                    <div className="status-label">Platforms Connected</div>
                </div>
                <div className="progress-bar-track">
                    <div
                        className="progress-bar-fill"
                        style={{ '--progress-width': `${(connectedCount / totalCount) * 100}%` } as React.CSSProperties}
                    />
                </div>
            </div>

            <div className="connect-grid">
                {platformCards.map(card => {
                    const platformStatus = status?.platforms?.[card.id];
                    const isConnected = platformStatus?.connected || false;
                    const accountName = platformStatus?.accountName;

                    return (
                        <div key={card.id} className={`connect-card ${isConnected ? "connected" : ""}`}>
                            <div className="card-header">
                                <div className={`card-icon ${card.iconClass}`}>
                                    {card.icon}
                                </div>
                                <div className="card-title-wrap">
                                    <div className="card-title">{card.name}</div>
                                    <div className="card-subtitle">{card.subtitle}</div>
                                </div>
                                <span className={`card-status ${isConnected ? "live" : "needs-setup"}`}>
                                    <span className="dot" />
                                    {isConnected ? "Live" : "Setup"}
                                </span>
                            </div>

                            <div className="card-body">
                                <ul className="card-features">
                                    {card.features.map((f, i) => (
                                        <li key={i}>{f}</li>
                                    ))}
                                </ul>
                                {isConnected && accountName && (
                                    <div className="connected-account">Connected: {accountName}</div>
                                )}
                            </div>

                            <div className="card-actions">
                                {isConnected ? (
                                    <span className="btn-connect connected-btn">✓ Connected</span>
                                ) : card.connectUrl ? (
                                    <a href={card.connectUrl} className="btn-connect primary">
                                        Connect {card.name.split(" ")[0]}
                                    </a>
                                ) : platformStatus?.clientConfigured ? (
                                    <span className="btn-connect connected-btn">✓ API Key Configured</span>
                                ) : (
                                    <a href={card.docsUrl} target="_blank" rel="noopener noreferrer" className="btn-connect primary">
                                        Get API Key
                                    </a>
                                )}
                                <a href={card.docsUrl} target="_blank" rel="noopener noreferrer" className="btn-connect secondary">
                                    Dashboard →
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="setup-instructions">
                <h2>🔧 Quick Setup — Google Business Profile (Reviews)</h2>
                <div className="setup-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                        <h3>Open Google Cloud Console</h3>
                        <p>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">console.cloud.google.com/apis/credentials</a></p>
                    </div>
                </div>
                <div className="setup-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                        <h3>Create OAuth 2.0 Client</h3>
                        <p>Click &quot;Create Credentials&quot; → &quot;OAuth client ID&quot; → Application type: &quot;Web application&quot;</p>
                    </div>
                </div>
                <div className="setup-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                        <h3>Set Redirect URI</h3>
                        <p>Add this as an Authorized redirect URI: <code>https://biodynamx.com/api/oauth/google</code></p>
                    </div>
                </div>
                <div className="setup-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                        <h3>Enable the API</h3>
                        <p>Go to <a href="https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com" target="_blank" rel="noopener noreferrer">API Library</a> and enable &quot;My Business Business Information API&quot;</p>
                    </div>
                </div>
                <div className="setup-step">
                    <div className="step-number">5</div>
                    <div className="step-content">
                        <h3>Add Keys to Environment</h3>
                        <p>Copy the Client ID and Secret, then add to <code>.env.local</code>:<br />
                            <code>GOOGLE_OAUTH_CLIENT_ID=your-client-id</code><br />
                            <code>GOOGLE_OAUTH_CLIENT_SECRET=your-secret</code></p>
                    </div>
                </div>
                <div className="setup-step">
                    <div className="step-number">6</div>
                    <div className="step-content">
                        <h3>Click &quot;Connect Google&quot; Above!</h3>
                        <p>That&apos;s it — click the button and authorize. Reviews will be managed automatically.</p>
                    </div>
                </div>
            </div>

            <div className="setup-instructions setup-meta">
                <h2>📸 Quick Setup — Meta (Facebook + Instagram)</h2>
                <div className="setup-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                        <h3>Go to Meta Developer Portal</h3>
                        <p>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">developers.facebook.com/apps</a> and create a new app (type: &quot;Business&quot;)</p>
                    </div>
                </div>
                <div className="setup-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                        <h3>Add Facebook Login Product</h3>
                        <p>In your app dashboard, click &quot;Add Product&quot; → &quot;Facebook Login&quot; → &quot;Set Up&quot;</p>
                    </div>
                </div>
                <div className="setup-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                        <h3>Set Redirect URI</h3>
                        <p>Under Facebook Login → Settings, add: <code>https://biodynamx.com/api/oauth/meta</code></p>
                    </div>
                </div>
                <div className="setup-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                        <h3>Add Keys to Environment</h3>
                        <p>From App Settings → Basic, copy App ID and App Secret:<br />
                            <code>META_APP_ID=your-app-id</code><br />
                            <code>META_APP_SECRET=your-app-secret</code></p>
                    </div>
                </div>
                <div className="setup-step">
                    <div className="step-number">5</div>
                    <div className="step-content">
                        <h3>Click &quot;Connect Meta&quot; Above!</h3>
                        <p>Authorize your Facebook account and we&apos;ll automatically get access to your Pages and Instagram.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ConnectAccountsPage() {
    return (
        <Suspense fallback={<div className="connect-page"><p style={{ color: "#888", textAlign: "center", padding: "4rem" }}>Loading...</p></div>}>
            <ConnectAccountsContent />
        </Suspense>
    );
}
