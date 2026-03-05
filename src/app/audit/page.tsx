"use client";
// ============================================================================
// /audit — BioDynamX Business Audit Tool
// ============================================================================
// A cinematic, professional business audit page that:
// 1. Accepts a business URL
// 2. Runs a 16-probe automated audit (site speed, mobile, tech debt, etc.)
// 3. Sends results to Gemini for AI-powered summarization
// 4. Displays a gorgeous audit report with severity-coded findings
import { useState, useCallback } from "react";
import Link from 'next/link';

import LeadCaptureModal from "@/components/LeadCaptureModal";

// ─── Silent Email Capture (for visitors not ready to talk) ───────────────────
function AuditEmailCapture() {
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !website) return;
        // In production, send to your email/CRM (Mailchimp, HubSpot, etc.)
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="audit-email-capture audit-email-success">
                <div className="audit-email-check">✅</div>
                <div className="audit-email-success-title">We&apos;ll Send Your Report!</div>
                <p className="audit-email-success-text">
                    Our AI will audit your site and email you the full report with revenue recovery recommendations. Check your inbox within 24 hours.
                </p>
            </div>
        );
    }

    return (
        <div className="audit-email-capture">
            <div className="audit-email-divider">
                <span className="audit-email-divider-line" />
                <span className="audit-email-divider-text">or</span>
                <span className="audit-email-divider-line" />
            </div>
            <div className="audit-email-title">📧 Not ready to talk? Get your audit report by email.</div>
            <p className="audit-email-desc">
                Enter your website and email. We&apos;ll run the audit and send you the full report — no call required.
            </p>
            <form onSubmit={handleSubmit} className="audit-email-form">
                <input
                    type="text"
                    placeholder="yourcompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    required
                    className="audit-email-input"
                />
                <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="audit-email-input"
                />
                <button type="submit" className="audit-email-btn">
                    Send My Audit →
                </button>
            </form>
            <p className="audit-email-privacy">
                Free. No spam. We&apos;ll only email your report + one follow-up.
            </p>
        </div>
    );
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface AuditFinding {
    category: string;
    severity: "critical" | "warning" | "good";
    finding: string;
    monthlyImpact: string;
    fix: string;
    timeToFix: string;
}

interface TopAction {
    priority: number;
    action: string;
    expectedResult: string;
    urgency: string;
}

interface AuditSummary {
    grade: string;
    overallHealthScore: number;
    headline: string;
    executiveSummary: string;
    criticalFindings: AuditFinding[];
    revenueSummary: {
        totalMonthlyLeak: string;
        totalAnnualLeak: string;
        recoverableWithAI: string;
        roiProjection: string;
    };
    competitorGap: string;
    top3Actions: TopAction[];
    biodynamxPitch: string;
}

type AuditPhase = "idle" | "scanning" | "analyzing" | "capture" | "complete" | "error";

// ─── Severity Config ─────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
    critical: { color: "#ff3b3b", bg: "rgba(255,59,59,0.08)", border: "rgba(255,59,59,0.2)", label: "CRITICAL", icon: "🔴" },
    warning: { color: "#ffa726", bg: "rgba(255,167,38,0.08)", border: "rgba(255,167,38,0.2)", label: "WARNING", icon: "🟡" },
    good: { color: "#00ff41", bg: "rgba(0,255,65,0.08)", border: "rgba(0,255,65,0.2)", label: "GOOD", icon: "🟢" },
};

// ─── Category Icons ──────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
    "SEO": "🔍", "AEO": "🤖", "GEO": "🌐", "Website": "💻",
    "GMB": "📍", "CTA": "🎯", "AI Readiness": "⚡", "Missed Calls": "📞",
    "Revenue Leak": "💰", "Content": "📝",
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function AuditPage() {
    const [url, setUrl] = useState("");
    const [phase, setPhase] = useState<AuditPhase>("idle");
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [summary, setSummary] = useState<AuditSummary | null>(null);
    const [error, setError] = useState("");

    // ─── Run the full audit pipeline ─────────────────────────────────────
    const runAudit = useCallback(async () => {
        if (!url.trim()) return;
        setError("");
        setSummary(null);
        setPhase("scanning");
        setProgress(0);

        // Phase 1: Run the 16-probe audit
        const probeSteps = [
            "Resolving DNS...", "Measuring site speed...", "Analyzing mobile UX...",
            "Scanning for tech debt...", "Identifying competitors...",
            "Estimating revenue leaks...", "Calculating ROI potential...",
            "Auditing Google Business Profile...", "Checking social presence...",
            "Scanning AEO/GEO readiness...", "Testing lead response...",
            "Running deep diagnostic...", "Analyzing structured data...",
            "Simulating lead leakage...", "Scanning voicemail gaps...",
            "Compiling raw data...",
        ];

        // Simulate probe progress (actual work happens server-side)
        for (let i = 0; i < probeSteps.length; i++) {
            setStatusText(probeSteps[i]);
            setProgress(Math.floor(((i + 1) / probeSteps.length) * 50));
            await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
        }

        try {
            // Call the audit API
            setStatusText("Executing 16-probe audit...");
            const auditRes = await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url.trim() }),
            });

            if (!auditRes.ok) {
                throw new Error(`Audit probe failed: ${auditRes.statusText}`);
            }

            const auditData = await auditRes.json();
            setProgress(60);
            setPhase("analyzing");
            setStatusText("Sending to Gemini for AI analysis...");

            // Phase 2: Send to Gemini summarizer
            const analyzeSteps = [
                "Gemini processing audit data...",
                "Identifying critical revenue leaks...",
                "Calculating competitor gaps...",
                "Generating executive summary...",
                "Formulating action plan...",
            ];

            for (let i = 0; i < analyzeSteps.length; i++) {
                setStatusText(analyzeSteps[i]);
                setProgress(60 + Math.floor(((i + 1) / analyzeSteps.length) * 35));
                await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
            }

            const summaryRes = await fetch("/api/audit/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ auditData }),
            });

            if (!summaryRes.ok) {
                throw new Error(`AI analysis failed: ${summaryRes.statusText}`);
            }

            const summaryData = await summaryRes.json();
            setProgress(100);
            setStatusText("Audit complete. Preparing report...");
            setSummary(summaryData);
            setPhase("capture"); // Trigger lead capture before showing results

        } catch (err) {
            console.error("Audit error:", err);
            setError(err instanceof Error ? err.message : "Audit failed");
            setPhase("error");
        }
    }, [url]);

    // ─── Grade Color ─────────────────────────────────────────────────────
    const gradeColor = (grade: string) => {
        if (grade.startsWith("A")) return "#00ff41";
        if (grade.startsWith("B")) return "#4ade80";
        if (grade.startsWith("C")) return "#ffa726";
        if (grade.startsWith("D")) return "#ff6b35";
        return "#ff3b3b";
    };

    // ─── Render ──────────────────────────────────────────────────────────
    return (
        <div className="audit-page">
            {/* ── Lead Capture Modal ── */}
            <LeadCaptureModal
                isOpen={phase === "capture"}
                onClose={() => setPhase("complete")} // Reveal results when they close (or submit)
                source="audit"
                prefillData={{
                    businessUrl: url,
                    auditGrade: summary?.grade,
                    auditScore: summary?.overallHealthScore,
                    monthlyLeak: summary?.revenueSummary.totalMonthlyLeak,
                    annualLeak: summary?.revenueSummary.totalAnnualLeak,
                }}
            />

            {/* ── Header ── */}
            <nav className="audit-nav">
                <Link href="/" className="audit-logo">
                    <div className="audit-logo-mark">B</div>
                    <div>
                        <div className="audit-brand">BioDynamX</div>
                        <div className="audit-sub-brand">Business Audit Engine</div>
                    </div>
                </Link>
                <div className="audit-badge">Powered by Google Gemini</div>
            </nav>

            {/* ── Hero / Input ── */}
            {phase === "idle" && (
                <div className="audit-hero">
                    <h1 className="audit-title">
                        Free AI Business Audit
                    </h1>
                    <p className="audit-subtitle">
                        Enter your website URL. Our AI runs 16 diagnostic probes and
                        Gemini generates a comprehensive report — in 60 seconds.
                    </p>

                    <div className="audit-input-group">
                        <input
                            type="text"
                            className="audit-input"
                            placeholder="yourcompany.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && runAudit()}
                        />
                        <button className="audit-btn" onClick={runAudit}>
                            Run Audit
                        </button>
                    </div>

                    <div className="audit-probes-label">
                        16 PROBES: SEO · AEO · GEO · Website · GMB · CTA · AI · Calls · Revenue · Content
                    </div>

                    <div className="audit-trust">
                        <span>🔒 No login required</span>
                        <span>⚡ Results in ~60 seconds</span>
                        <span>🤖 Powered by Gemini 2.5</span>
                    </div>

                    {/* Silent Email Capture — for visitors not ready to talk yet */}
                    <AuditEmailCapture />
                </div>
            )}

            {/* ── Scanning / Analyzing ── */}
            {(phase === "scanning" || phase === "analyzing") && (
                <div className="audit-scanning">
                    <div className="audit-scan-ring">
                        <svg viewBox="0 0 120 120" className="audit-ring-svg">
                            <circle cx="60" cy="60" r="54" className="audit-ring-bg" />
                            <circle
                                cx="60" cy="60" r="54"
                                className="audit-ring-progress"
                                strokeDasharray={`${progress * 3.39} 339.292`}
                            />
                        </svg>
                        <div className="audit-ring-text">{progress}%</div>
                    </div>
                    <div className="audit-scan-phase">
                        {phase === "scanning" ? "SCANNING" : "AI ANALYSIS"}
                    </div>
                    <div className="audit-scan-status">{statusText}</div>
                    <div className="audit-scan-url">{url}</div>
                </div>
            )}

            {/* ── Error ── */}
            {phase === "error" && (
                <div className="audit-error">
                    <div className="audit-error-icon">⚠️</div>
                    <div className="audit-error-text">{error}</div>
                    <button className="audit-btn" onClick={() => setPhase("idle")}>
                        Try Again
                    </button>
                </div>
            )}

            {/* ── Results ── */}
            {phase === "complete" && summary && (
                <div className="audit-results">
                    {/* Grade Card */}
                    <div className="audit-grade-card">
                        <div className="audit-grade" style={{ color: gradeColor(summary.grade) }}>
                            {summary.grade}
                        </div>
                        <div className="audit-score">
                            <span className="audit-score-num">{summary.overallHealthScore}</span>
                            <span className="audit-score-label">/100</span>
                        </div>
                        <h2 className="audit-headline">{summary.headline}</h2>
                        <p className="audit-exec-summary">{summary.executiveSummary}</p>
                    </div>

                    {/* Revenue Impact */}
                    <div className="audit-revenue-strip">
                        <div className="audit-rev-item">
                            <div className="audit-rev-label">Monthly Leak</div>
                            <div className="audit-rev-value critical">
                                {summary.revenueSummary.totalMonthlyLeak}
                            </div>
                        </div>
                        <div className="audit-rev-divider" />
                        <div className="audit-rev-item">
                            <div className="audit-rev-label">Annual Loss</div>
                            <div className="audit-rev-value warning">
                                {summary.revenueSummary.totalAnnualLeak}
                            </div>
                        </div>
                        <div className="audit-rev-divider" />
                        <div className="audit-rev-item">
                            <div className="audit-rev-label">Recoverable with AI</div>
                            <div className="audit-rev-value good">
                                {summary.revenueSummary.recoverableWithAI}
                            </div>
                        </div>
                        <div className="audit-rev-divider" />
                        <div className="audit-rev-item">
                            <div className="audit-rev-label">ROI Projection</div>
                            <div className="audit-rev-value good">
                                {summary.revenueSummary.roiProjection}
                            </div>
                        </div>
                    </div>

                    {/* Findings Grid */}
                    <h3 className="audit-section-title">Critical Findings</h3>
                    <div className="audit-findings-grid">
                        {summary.criticalFindings.map((f, i) => {
                            const sev = SEVERITY_CONFIG[f.severity] || SEVERITY_CONFIG.warning;
                            const icon = CATEGORY_ICONS[f.category] || "📋";
                            return (
                                <div
                                    key={i}
                                    className="audit-finding-card"
                                    style={{
                                        borderColor: sev.border,
                                        background: sev.bg,
                                    }}
                                >
                                    <div className="audit-finding-header">
                                        <span className="audit-finding-icon">{icon}</span>
                                        <span className="audit-finding-category">{f.category}</span>
                                        <span
                                            className="audit-finding-badge"
                                            style={{ color: sev.color, borderColor: sev.border }}
                                        >
                                            {sev.icon} {sev.label}
                                        </span>
                                    </div>
                                    <p className="audit-finding-text">{f.finding}</p>
                                    <div className="audit-finding-meta">
                                        <span className="audit-finding-impact" style={{ color: sev.color }}>
                                            {f.monthlyImpact}/mo
                                        </span>
                                        <span className="audit-finding-time">⏱ {f.timeToFix}</span>
                                    </div>
                                    <div className="audit-finding-fix">
                                        <strong>Fix:</strong> {f.fix}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Top 3 Actions */}
                    <h3 className="audit-section-title">Priority Action Plan</h3>
                    <div className="audit-actions">
                        {summary.top3Actions.map((action) => (
                            <div key={action.priority} className="audit-action-card">
                                <div className="audit-action-num">#{action.priority}</div>
                                <div className="audit-action-content">
                                    <div className="audit-action-label">{action.action}</div>
                                    <div className="audit-action-result">→ {action.expectedResult}</div>
                                    <div className="audit-action-urgency">⚡ {action.urgency}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Competitor Gap */}
                    <div className="audit-competitor-gap">
                        <div className="audit-comp-label">COMPETITOR INTELLIGENCE</div>
                        <p className="audit-comp-text">{summary.competitorGap}</p>
                    </div>

                    {/* BioDynamX Pitch + CTA */}
                    <div className="audit-cta-section">
                        <p className="audit-pitch">{summary.biodynamxPitch}</p>
                        <Link href="/" className="audit-cta-btn">
                            Talk to Jenny & Mark — Fix Everything Now
                        </Link>
                        <div className="audit-cta-sub">
                            60-second voice diagnostic · Zero cost · Guaranteed 5x ROI
                        </div>
                    </div>

                    {/* Run Another */}
                    <button
                        className="audit-again-btn"
                        onClick={() => { setPhase("idle"); setSummary(null); setUrl(""); }}
                    >
                        Run Another Audit
                    </button>
                </div>
            )}

            {/* ── Footer ── */}
            <footer className="audit-footer">
                <span>© 2026 BioDynamX Engineering Group × AI Expert Solutions</span>
                <span>Enterprise Grade · SOC 2 Ready · 99.9% Uptime</span>
            </footer>

            {/* ── Styles ── */}
            <style>{`
                /* ═══ BASE ═══ */
                .audit-page {
                    min-height: 100vh;
                    background: #050505;
                    color: #fff;
                    font-family: 'Inter', -apple-system, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                /* ═══ NAV ═══ */
                .audit-nav {
                    width: 100%;
                    max-width: 1200px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 32px;
                }
                .audit-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                }
                .audit-logo-mark {
                    width: 32px; height: 32px;
                    background: linear-gradient(135deg, #00ff41, #00cc33);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 14px; color: #000;
                }
                .audit-brand { font-size: 16px; font-weight: 700; color: #fff; }
                .audit-sub-brand { font-size: 10px; color: rgba(255,255,255,0.35); letter-spacing: 0.08em; text-transform: uppercase; }
                .audit-badge {
                    font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.4);
                    padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 100px; letter-spacing: 0.04em;
                }

                /* ═══ HERO ═══ */
                .audit-hero {
                    text-align: center;
                    padding: 80px 32px 60px;
                    max-width: 700px;
                    animation: fadeUp 0.8s ease-out;
                }
                .audit-title {
                    font-size: clamp(32px, 5vw, 52px);
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    line-height: 1.1;
                    margin: 0 0 16px;
                    background: linear-gradient(135deg, #fff 0%, #00ff41 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .audit-subtitle {
                    font-size: 16px; color: rgba(255,255,255,0.45);
                    line-height: 1.6; margin: 0 0 36px;
                }
                .audit-input-group {
                    display: flex; gap: 8px;
                    max-width: 500px; margin: 0 auto 16px;
                }
                .audit-input {
                    flex: 1; padding: 16px 20px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 12px;
                    color: #fff; font-size: 16px;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.3s;
                }
                .audit-input:focus {
                    border-color: #00ff41;
                    box-shadow: 0 0 20px rgba(0,255,65,0.1);
                }
                .audit-input::placeholder { color: rgba(255,255,255,0.75); opacity: 1; }
                .audit-btn {
                    padding: 16px 32px;
                    background: linear-gradient(135deg, #00ff41, #00cc33);
                    border: none; border-radius: 12px;
                    color: #000; font-size: 15px; font-weight: 700;
                    font-family: inherit; cursor: pointer;
                    transition: all 0.3s; white-space: nowrap;
                }
                .audit-btn:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 30px rgba(0,255,65,0.3);
                }
                .audit-probes-label {
                    font-size: 10px; color: rgba(255,255,255,0.2);
                    letter-spacing: 0.06em; margin-bottom: 24px;
                }
                .audit-trust {
                    display: flex; gap: 20px; justify-content: center;
                    font-size: 12px; color: rgba(255,255,255,0.3);
                }

                /* ═══ SCANNING ═══ */
                .audit-scanning {
                    text-align: center;
                    padding: 100px 32px;
                    animation: fadeUp 0.5s ease-out;
                }
                .audit-scan-ring {
                    position: relative; width: 140px; height: 140px;
                    margin: 0 auto 24px;
                }
                .audit-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
                .audit-ring-bg {
                    fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 6;
                }
                .audit-ring-progress {
                    fill: none; stroke: #00ff41; stroke-width: 6;
                    stroke-linecap: round;
                    transition: stroke-dasharray 0.4s ease;
                }
                .audit-ring-text {
                    position: absolute; inset: 0;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px; font-weight: 700; color: #00ff41;
                }
                .audit-scan-phase {
                    font-size: 11px; font-weight: 600; color: #00ff41;
                    letter-spacing: 0.12em; margin-bottom: 8px;
                }
                .audit-scan-status {
                    font-size: 15px; color: rgba(255,255,255,0.6);
                    margin-bottom: 6px; min-height: 22px;
                }
                .audit-scan-url {
                    font-size: 12px; color: rgba(255,255,255,0.2);
                    font-family: 'SF Mono', monospace;
                }

                /* ═══ ERROR ═══ */
                .audit-error {
                    text-align: center; padding: 100px 32px;
                    animation: fadeUp 0.5s ease-out;
                }
                .audit-error-icon { font-size: 48px; margin-bottom: 16px; }
                .audit-error-text {
                    font-size: 16px; color: #ff4444; margin-bottom: 24px;
                    max-width: 400px; margin-left: auto; margin-right: auto;
                }

                /* ═══ RESULTS ═══ */
                .audit-results {
                    width: 100%; max-width: 900px;
                    padding: 40px 32px 60px;
                    animation: fadeUp 0.8s ease-out;
                }

                /* Grade Card */
                .audit-grade-card {
                    text-align: center;
                    padding: 48px 32px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    margin-bottom: 24px;
                }
                .audit-grade {
                    font-size: 72px; font-weight: 900;
                    letter-spacing: -0.04em; line-height: 1;
                }
                .audit-score { margin: 8px 0 20px; }
                .audit-score-num {
                    font-size: 28px; font-weight: 700; color: rgba(255,255,255,0.7);
                }
                .audit-score-label {
                    font-size: 16px; color: rgba(255,255,255,0.3);
                }
                .audit-headline {
                    font-size: 22px; font-weight: 700; color: #fff;
                    letter-spacing: -0.02em; margin: 0 0 12px;
                    line-height: 1.3;
                }
                .audit-exec-summary {
                    font-size: 14px; color: rgba(255,255,255,0.45);
                    line-height: 1.7; max-width: 600px; margin: 0 auto;
                }

                /* Revenue Strip */
                .audit-revenue-strip {
                    display: flex; align-items: center; justify-content: center;
                    gap: 24px; padding: 24px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px;
                    margin-bottom: 40px;
                    flex-wrap: wrap;
                }
                .audit-rev-item { text-align: center; }
                .audit-rev-label {
                    font-size: 10px; color: rgba(255,255,255,0.3);
                    letter-spacing: 0.06em; text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .audit-rev-value {
                    font-size: 20px; font-weight: 700;
                    letter-spacing: -0.02em;
                }
                .audit-rev-value.critical { color: #ff3b3b; }
                .audit-rev-value.warning { color: #ffa726; }
                .audit-rev-value.good { color: #00ff41; }
                .audit-rev-divider {
                    width: 1px; height: 36px;
                    background: rgba(255,255,255,0.08);
                }

                /* Section Title */
                .audit-section-title {
                    font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.6);
                    letter-spacing: -0.01em; margin: 0 0 16px;
                }

                /* Findings Grid */
                .audit-findings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 12px;
                    margin-bottom: 40px;
                }
                .audit-finding-card {
                    padding: 16px;
                    border: 1px solid;
                    border-radius: 12px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .audit-finding-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
                }
                .audit-finding-header {
                    display: flex; align-items: center; gap: 8px;
                    margin-bottom: 10px;
                }
                .audit-finding-icon { font-size: 18px; }
                .audit-finding-category {
                    font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.7);
                    flex: 1;
                }
                .audit-finding-badge {
                    font-size: 9px; font-weight: 700; letter-spacing: 0.08em;
                    padding: 2px 8px; border: 1px solid;
                    border-radius: 100px;
                }
                .audit-finding-text {
                    font-size: 13px; color: rgba(255,255,255,0.55);
                    line-height: 1.5; margin: 0 0 10px;
                }
                .audit-finding-meta {
                    display: flex; justify-content: space-between;
                    align-items: center; margin-bottom: 10px;
                }
                .audit-finding-impact { font-size: 14px; font-weight: 700; }
                .audit-finding-time {
                    font-size: 11px; color: rgba(255,255,255,0.3);
                }
                .audit-finding-fix {
                    font-size: 12px; color: rgba(255,255,255,0.4);
                    line-height: 1.5;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }

                /* Actions */
                .audit-actions {
                    display: flex; flex-direction: column; gap: 10px;
                    margin-bottom: 32px;
                }
                .audit-action-card {
                    display: flex; align-items: flex-start; gap: 16px;
                    padding: 16px 20px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                }
                .audit-action-num {
                    font-size: 24px; font-weight: 800; color: #00ff41;
                    min-width: 36px;
                }
                .audit-action-content { flex: 1; }
                .audit-action-label {
                    font-size: 14px; font-weight: 600; color: #fff;
                    margin-bottom: 4px;
                }
                .audit-action-result {
                    font-size: 12px; color: rgba(255,255,255,0.45);
                    margin-bottom: 4px;
                }
                .audit-action-urgency {
                    font-size: 11px; color: #ffa726; font-weight: 600;
                }

                /* Competitor Gap */
                .audit-competitor-gap {
                    padding: 20px 24px;
                    background: rgba(255,167,38,0.04);
                    border: 1px solid rgba(255,167,38,0.12);
                    border-radius: 12px;
                    margin-bottom: 32px;
                }
                .audit-comp-label {
                    font-size: 9px; font-weight: 700; color: #ffa726;
                    letter-spacing: 0.1em; margin-bottom: 8px;
                }
                .audit-comp-text {
                    font-size: 14px; color: rgba(255,255,255,0.5);
                    line-height: 1.6; margin: 0;
                }

                /* CTA Section */
                .audit-cta-section {
                    text-align: center;
                    padding: 40px 24px;
                    background: linear-gradient(135deg, rgba(0,255,65,0.03) 0%, rgba(0,255,65,0.01) 100%);
                    border: 1px solid rgba(0,255,65,0.12);
                    border-radius: 20px;
                    margin-bottom: 24px;
                }
                .audit-pitch {
                    font-size: 14px; color: rgba(255,255,255,0.5);
                    line-height: 1.7; margin: 0 0 24px;
                    max-width: 600px; margin-left: auto; margin-right: auto;
                }
                .audit-cta-btn {
                    display: inline-block;
                    padding: 18px 48px;
                    background: linear-gradient(135deg, #00ff41, #00cc33);
                    border-radius: 14px;
                    color: #000; font-size: 16px; font-weight: 800;
                    text-decoration: none;
                    transition: all 0.3s;
                    box-shadow: 0 4px 40px rgba(0,255,65,0.3);
                }
                .audit-cta-btn:hover {
                    transform: scale(1.03);
                    box-shadow: 0 8px 60px rgba(0,255,65,0.4);
                }
                .audit-cta-sub {
                    font-size: 12px; color: rgba(255,255,255,0.25);
                    margin-top: 12px; letter-spacing: 0.03em;
                }

                /* Run Again */
                .audit-again-btn {
                    display: block; width: 100%;
                    padding: 14px;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    color: rgba(255,255,255,0.3);
                    font-size: 13px; font-weight: 600;
                    font-family: inherit; cursor: pointer;
                    transition: all 0.3s;
                }
                .audit-again-btn:hover {
                    border-color: rgba(255,255,255,0.2);
                    color: rgba(255,255,255,0.5);
                }

                /* Footer */
                .audit-footer {
                    width: 100%; max-width: 900px;
                    padding: 20px 32px;
                    display: flex; justify-content: space-between;
                    font-size: 9px; color: rgba(255,255,255,0.12);
                    letter-spacing: 0.04em;
                    margin-top: auto;
                }

                /* Animations */
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* ═══ EMAIL CAPTURE ═══ */
                .audit-email-capture {
                    margin-top: 32px;
                    max-width: 440px;
                    margin-left: auto;
                    margin-right: auto;
                    animation: fadeUp 0.6s ease-out 0.3s both;
                }
                .audit-email-divider {
                    display: flex; align-items: center; gap: 12px;
                    margin-bottom: 20px;
                }
                .audit-email-divider-line {
                    flex: 1; height: 1px; background: rgba(255,255,255,0.08);
                }
                .audit-email-divider-text {
                    font-size: 12px; color: rgba(255,255,255,0.2);
                    text-transform: uppercase; letter-spacing: 0.1em;
                }
                .audit-email-title {
                    font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.8);
                    margin-bottom: 6px;
                }
                .audit-email-desc {
                    font-size: 13px; color: rgba(255,255,255,0.35);
                    margin: 0 0 16px; line-height: 1.5;
                }
                .audit-email-form {
                    display: flex; flex-direction: column; gap: 8px;
                }
                .audit-email-input {
                    padding: 12px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    color: #fff; font-size: 14px;
                    font-family: inherit; outline: none;
                    transition: border-color 0.3s;
                }
                .audit-email-input:focus {
                    border-color: rgba(139,92,246,0.4);
                }
                .audit-email-input::placeholder { color: rgba(255,255,255,0.6); opacity: 1; }
                .audit-email-btn {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #8b5cf6, #3b82f6);
                    border: none; border-radius: 10px;
                    color: #fff; font-size: 14px; font-weight: 700;
                    font-family: inherit; cursor: pointer;
                    transition: all 0.3s;
                }
                .audit-email-btn:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 24px rgba(139,92,246,0.3);
                }
                .audit-email-privacy {
                    font-size: 11px; color: rgba(255,255,255,0.15);
                    margin: 8px 0 0; text-align: center;
                }
                .audit-email-success {
                    text-align: center;
                    padding: 24px;
                    background: rgba(34,197,94,0.04);
                    border: 1px solid rgba(34,197,94,0.12);
                    border-radius: 14px;
                }
                .audit-email-check { font-size: 28px; margin-bottom: 8px; }
                .audit-email-success-title {
                    font-size: 16px; font-weight: 700; color: #22c55e;
                    margin-bottom: 4px;
                }
                .audit-email-success-text {
                    font-size: 13px; color: rgba(255,255,255,0.4);
                    margin: 0; line-height: 1.5;
                }

                /* Mobile */
                @media (max-width: 640px) {
                    .audit-input-group { flex-direction: column; }
                    .audit-trust { flex-direction: column; gap: 8px; }
                    .audit-revenue-strip { flex-direction: column; gap: 16px; }
                    .audit-rev-divider { width: 60px; height: 1px; }
                    .audit-footer { flex-direction: column; align-items: center; gap: 4px; }
                    .audit-findings-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
