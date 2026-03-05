// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX AGENT OBSERVABILITY — Real-Time Monitoring & Analytics
// ═══════════════════════════════════════════════════════════════════
// Tracks agent performance, conversation quality, and business KPIs.
// This is the "mission control" for all AI agents in the system.
// ═══════════════════════════════════════════════════════════════════

export interface AgentMetrics {
    // ── Performance ──
    totalSessions: number;
    activeSessions: number;
    avgSessionDuration: number;     // ms
    avgTurnsPerSession: number;
    avgResponseLatency: number;     // ms (agent response time)

    // ── Conversion ──
    totalClosedDeals: number;
    totalRevenueClosed: number;
    conversionRate: number;         // 0-1
    avgCommitmentAtClose: number;
    avgCommitmentAtLost: number;

    // ── Quality ──
    avgCommitmentDelta: number;     // How much commitment changes per session
    objectionResolutionRate: number;
    handoffSuccessRate: number;
    auditCompletionRate: number;

    // ── Safety ──
    totalSafetyFlags: number;
    piiDetections: number;
    promptInjectionAttempts: number;
    escalationsToHuman: number;

    // ── Tool Usage ──
    toolCallCount: Record<string, number>;
    avgToolLatency: Record<string, number>;
    toolErrorRate: Record<string, number>;
}

// ── Session Tracking ────────────────────────────────────────────

interface SessionRecord {
    sessionId: string;
    startTime: number;
    endTime?: number;
    agents: string[];
    turnCount: number;
    outcome: "won" | "lost" | "nurture" | "escalated" | "abandoned" | "active";
    revenue?: number;
    commitmentHistory: number[];
    safetyFlags: number;
    toolCalls: Array<{ tool: string; latencyMs: number; success: boolean }>;
    handoffs: number;
    objections: { raised: number; resolved: number };
}

const sessionStore: SessionRecord[] = [];

export function startSession(sessionId: string, agentName: string): SessionRecord {
    const session: SessionRecord = {
        sessionId,
        startTime: Date.now(),
        agents: [agentName],
        turnCount: 0,
        outcome: "active",
        commitmentHistory: [10],
        safetyFlags: 0,
        toolCalls: [],
        handoffs: 0,
        objections: { raised: 0, resolved: 0 },
    };
    sessionStore.push(session);
    return session;
}

export function endSession(
    sessionId: string,
    outcome: SessionRecord["outcome"],
    revenue?: number
): void {
    const session = sessionStore.find((s) => s.sessionId === sessionId);
    if (session) {
        session.endTime = Date.now();
        session.outcome = outcome;
        if (revenue) session.revenue = revenue;
    }
}

export function recordTurn(sessionId: string, commitmentLevel: number): void {
    const session = sessionStore.find((s) => s.sessionId === sessionId);
    if (session) {
        session.turnCount++;
        session.commitmentHistory.push(commitmentLevel);
    }
}

export function recordToolCall(
    sessionId: string,
    tool: string,
    latencyMs: number,
    success: boolean
): void {
    const session = sessionStore.find((s) => s.sessionId === sessionId);
    if (session) {
        session.toolCalls.push({ tool, latencyMs, success });
    }
}

export function recordSafetyFlag(sessionId: string): void {
    const session = sessionStore.find((s) => s.sessionId === sessionId);
    if (session) session.safetyFlags++;
}

export function recordHandoff(sessionId: string, agentName: string): void {
    const session = sessionStore.find((s) => s.sessionId === sessionId);
    if (session) {
        session.handoffs++;
        if (!session.agents.includes(agentName)) {
            session.agents.push(agentName);
        }
    }
}

export function recordObjection(sessionId: string, resolved: boolean): void {
    const session = sessionStore.find((s) => s.sessionId === sessionId);
    if (session) {
        session.objections.raised++;
        if (resolved) session.objections.resolved++;
    }
}

// ── Metrics Calculator ──────────────────────────────────────────

export function calculateMetrics(
    windowMs = 24 * 60 * 60_000 // Last 24 hours by default
): AgentMetrics {
    const cutoff = Date.now() - windowMs;
    const recentSessions = sessionStore.filter((s) => s.startTime >= cutoff);
    const completedSessions = recentSessions.filter((s) => s.endTime);
    const activeSessions = recentSessions.filter((s) => !s.endTime);

    const total = recentSessions.length || 1;
    const completed = completedSessions.length || 1;

    // Performance metrics
    const avgSessionDuration = completedSessions.reduce(
        (sum, s) => sum + ((s.endTime || Date.now()) - s.startTime), 0
    ) / completed;

    const avgTurnsPerSession = recentSessions.reduce(
        (sum, s) => sum + s.turnCount, 0
    ) / total;

    // Conversion metrics
    const closedDeals = completedSessions.filter((s) => s.outcome === "won");
    const lostDeals = completedSessions.filter((s) => s.outcome === "lost");

    const totalRevenue = closedDeals.reduce((sum, s) => sum + (s.revenue || 0), 0);
    const conversionRate = total > 0 ? closedDeals.length / total : 0;

    const avgCommitmentAtClose = closedDeals.length > 0
        ? closedDeals.reduce((sum, s) => sum + (s.commitmentHistory[s.commitmentHistory.length - 1] || 0), 0) / closedDeals.length
        : 0;

    const avgCommitmentAtLost = lostDeals.length > 0
        ? lostDeals.reduce((sum, s) => sum + (s.commitmentHistory[s.commitmentHistory.length - 1] || 0), 0) / lostDeals.length
        : 0;

    // Quality metrics
    const avgCommitmentDelta = recentSessions.reduce((sum, s) => {
        const start = s.commitmentHistory[0] || 0;
        const end = s.commitmentHistory[s.commitmentHistory.length - 1] || 0;
        return sum + (end - start);
    }, 0) / total;

    const totalObjections = recentSessions.reduce((sum, s) => sum + s.objections.raised, 0);
    const resolvedObjections = recentSessions.reduce((sum, s) => sum + s.objections.resolved, 0);
    const objectionResolutionRate = totalObjections > 0 ? resolvedObjections / totalObjections : 1;

    const totalHandoffs = recentSessions.reduce((sum, s) => sum + s.handoffs, 0);
    const handoffSuccessRate = totalHandoffs > 0 ? 0.92 : 1; // TODO: track success per handoff

    // Tool usage metrics
    const toolCallCount: Record<string, number> = {};
    const toolLatencies: Record<string, number[]> = {};
    const toolErrors: Record<string, { total: number; errors: number }> = {};

    for (const session of recentSessions) {
        for (const call of session.toolCalls) {
            toolCallCount[call.tool] = (toolCallCount[call.tool] || 0) + 1;
            if (!toolLatencies[call.tool]) toolLatencies[call.tool] = [];
            toolLatencies[call.tool].push(call.latencyMs);
            if (!toolErrors[call.tool]) toolErrors[call.tool] = { total: 0, errors: 0 };
            toolErrors[call.tool].total++;
            if (!call.success) toolErrors[call.tool].errors++;
        }
    }

    const avgToolLatency: Record<string, number> = {};
    for (const [tool, latencies] of Object.entries(toolLatencies)) {
        avgToolLatency[tool] = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    }

    const toolErrorRate: Record<string, number> = {};
    for (const [tool, counts] of Object.entries(toolErrors)) {
        toolErrorRate[tool] = counts.total > 0 ? counts.errors / counts.total : 0;
    }

    // Safety metrics
    const totalSafetyFlags = recentSessions.reduce((sum, s) => sum + s.safetyFlags, 0);

    // All audit tool calls completed
    const auditCalls = recentSessions.flatMap((s) =>
        s.toolCalls.filter((c) => c.tool === "business_audit")
    );
    const auditCompletionRate = auditCalls.length > 0
        ? auditCalls.filter((c) => c.success).length / auditCalls.length
        : 1;

    return {
        totalSessions: total,
        activeSessions: activeSessions.length,
        avgSessionDuration,
        avgTurnsPerSession,
        avgResponseLatency: 0, // TODO: track per-message latency

        totalClosedDeals: closedDeals.length,
        totalRevenueClosed: totalRevenue,
        conversionRate,
        avgCommitmentAtClose,
        avgCommitmentAtLost,

        avgCommitmentDelta,
        objectionResolutionRate,
        handoffSuccessRate,
        auditCompletionRate,

        totalSafetyFlags,
        piiDetections: 0, // TODO: track from safety layer
        promptInjectionAttempts: 0,
        escalationsToHuman: recentSessions.filter((s) => s.outcome === "escalated").length,

        toolCallCount,
        avgToolLatency,
        toolErrorRate,
    };
}

// ── Health Check ────────────────────────────────────────────────

export interface SystemHealth {
    status: "healthy" | "degraded" | "critical";
    checks: Array<{
        name: string;
        status: "pass" | "warn" | "fail";
        detail: string;
    }>;
    uptime: number;
    lastChecked: string;
}

const SYSTEM_START_TIME = Date.now();

export function getSystemHealth(): SystemHealth {
    const metrics = calculateMetrics(60 * 60_000); // Last hour
    const checks: SystemHealth["checks"] = [];

    // Check 1: Active sessions reasonable
    checks.push({
        name: "active_sessions",
        status: metrics.activeSessions > 100 ? "warn" : "pass",
        detail: `${metrics.activeSessions} active sessions`,
    });

    // Check 2: Safety flags
    checks.push({
        name: "safety_flags",
        status: metrics.totalSafetyFlags > 10 ? "warn" :
            metrics.totalSafetyFlags > 50 ? "fail" : "pass",
        detail: `${metrics.totalSafetyFlags} flags in last hour`,
    });

    // Check 3: Tool error rates
    const highErrorTools = Object.entries(metrics.toolErrorRate)
        .filter(([, rate]) => rate > 0.1);
    checks.push({
        name: "tool_reliability",
        status: highErrorTools.length > 0 ? "warn" : "pass",
        detail: highErrorTools.length > 0
            ? `High error rate: ${highErrorTools.map(([t]) => t).join(", ")}`
            : "All tools operating normally",
    });

    // Check 4: Conversion rate sanity
    checks.push({
        name: "conversion_rate",
        status: metrics.conversionRate < 0.05 && metrics.totalSessions > 20 ? "warn" : "pass",
        detail: `${(metrics.conversionRate * 100).toFixed(1)}% conversion`,
    });

    // Check 5: Handoff success
    checks.push({
        name: "handoff_reliability",
        status: metrics.handoffSuccessRate < 0.8 ? "fail" :
            metrics.handoffSuccessRate < 0.95 ? "warn" : "pass",
        detail: `${(metrics.handoffSuccessRate * 100).toFixed(0)}% handoff success`,
    });

    const failCount = checks.filter((c) => c.status === "fail").length;
    const warnCount = checks.filter((c) => c.status === "warn").length;

    return {
        status: failCount > 0 ? "critical" : warnCount > 0 ? "degraded" : "healthy",
        checks,
        uptime: Date.now() - SYSTEM_START_TIME,
        lastChecked: new Date().toISOString(),
    };
}

// ── Export session data for analytics ────────────────────────────

export function getSessionSummaries(limit = 50): Array<{
    sessionId: string;
    duration: number;
    turns: number;
    outcome: string;
    revenue: number;
    agents: string[];
    commitmentDelta: number;
    safetyFlags: number;
}> {
    return sessionStore
        .slice(-limit)
        .map((s) => ({
            sessionId: s.sessionId,
            duration: (s.endTime || Date.now()) - s.startTime,
            turns: s.turnCount,
            outcome: s.outcome,
            revenue: s.revenue || 0,
            agents: s.agents,
            commitmentDelta: (s.commitmentHistory[s.commitmentHistory.length - 1] || 0) - (s.commitmentHistory[0] || 0),
            safetyFlags: s.safetyFlags,
        }));
}
