// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — Agent System Health API
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSystemHealth, calculateMetrics, getSessionSummaries } from "@/lib/agent-observability";

export async function GET() {
    try {
        const health = getSystemHealth();
        const metrics = calculateMetrics(24 * 60 * 60_000); // 24h window
        const recentSessions = getSessionSummaries(10);

        return NextResponse.json({
            status: health.status,
            version: "3.1.0",
            engine: "BioDynamX Agentic Engine",
            timestamp: new Date().toISOString(),
            uptime: health.uptime,
            checks: health.checks,
            metrics: {
                sessions: {
                    total: metrics.totalSessions,
                    active: metrics.activeSessions,
                    avgDuration: `${Math.round(metrics.avgSessionDuration / 1000)}s`,
                    avgTurns: Math.round(metrics.avgTurnsPerSession),
                },
                conversion: {
                    rate: `${(metrics.conversionRate * 100).toFixed(1)}%`,
                    closedDeals: metrics.totalClosedDeals,
                    revenue: `$${metrics.totalRevenueClosed.toLocaleString()}`,
                },
                quality: {
                    commitmentDelta: metrics.avgCommitmentDelta.toFixed(1),
                    objectionResolution: `${(metrics.objectionResolutionRate * 100).toFixed(0)}%`,
                    handoffSuccess: `${(metrics.handoffSuccessRate * 100).toFixed(0)}%`,
                    auditCompletion: `${(metrics.auditCompletionRate * 100).toFixed(0)}%`,
                },
                safety: {
                    totalFlags: metrics.totalSafetyFlags,
                    piiDetections: metrics.piiDetections,
                    injectionAttempts: metrics.promptInjectionAttempts,
                    escalations: metrics.escalationsToHuman,
                },
                tools: {
                    callCount: metrics.toolCallCount,
                    avgLatency: Object.fromEntries(
                        Object.entries(metrics.avgToolLatency).map(([k, v]) => [k, `${Math.round(v)}ms`])
                    ),
                    errorRate: Object.fromEntries(
                        Object.entries(metrics.toolErrorRate).map(([k, v]) => [k, `${(v * 100).toFixed(1)}%`])
                    ),
                },
            },
            recentSessions: recentSessions.map((s) => ({
                id: s.sessionId.substring(0, 8),
                duration: `${Math.round(s.duration / 1000)}s`,
                turns: s.turns,
                outcome: s.outcome,
                revenue: s.revenue > 0 ? `$${s.revenue}` : "-",
                agents: s.agents.join(" → "),
                commitment: `${s.commitmentDelta > 0 ? "+" : ""}${s.commitmentDelta}`,
                flags: s.safetyFlags,
            })),
            capabilities: {
                agents: ["Aria (AI Receptionist)", "Jenny (Diagnostic Consultant)", "Mark (Technical Architect)", "Journey (Fear-of-Loss Hunter)", "Sarah (Customer Success)", "Billy (Head Architect)"],
                tools: ["business_audit", "create_checkout", "capture_lead", "schedule_appointment", "escalate_to_human", "send_sms", "send_email"],
                safety: ["PII redaction", "Prompt injection defense", "Rate limiting", "Conversation boundaries", "Commitment gating", "Audit trail"],
                memory: ["Entity extraction", "Commitment scoring", "Pain point tracking", "Objection tracking", "Phase management"],
            },
        });
    } catch (err) {
        return NextResponse.json(
            { status: "error", error: String(err) },
            { status: 500 }
        );
    }
}
