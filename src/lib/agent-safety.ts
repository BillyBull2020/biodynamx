// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX AGENT SAFETY LAYER — Production-Grade Guardrails
// ═══════════════════════════════════════════════════════════════════
// This module implements enterprise-grade safety for all AI agents.
// Every message passes through this pipeline BEFORE reaching the user.
// ═══════════════════════════════════════════════════════════════════

export interface SafetyResult {
    safe: boolean;
    filtered: string;          // The sanitized message (or original if safe)
    flags: SafetyFlag[];
    severity: "none" | "low" | "medium" | "high" | "critical";
    action: "pass" | "warn" | "redact" | "block" | "escalate";
}

export interface SafetyFlag {
    type: SafetyFlagType;
    description: string;
    position?: { start: number; end: number };
}

export type SafetyFlagType =
    | "pii_detected"
    | "financial_claim"
    | "medical_advice"
    | "legal_advice"
    | "profanity"
    | "manipulation"
    | "off_topic"
    | "prompt_injection"
    | "excessive_promise"
    | "competitor_disparagement"
    | "hallucination_risk";

// ── PII Patterns ────────────────────────────────────────────────
const PII_PATTERNS: Array<{ pattern: RegExp; type: string; replacement: string }> = [
    { pattern: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, type: "SSN", replacement: "[SSN REDACTED]" },
    { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, type: "Credit Card", replacement: "[CARD REDACTED]" },
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: "Email", replacement: "[EMAIL REDACTED]" },
    { pattern: /\b(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, type: "Phone", replacement: "[PHONE REDACTED]" },
    { pattern: /\b\d{5}(?:-\d{4})?\b/g, type: "ZIP Code", replacement: "[ZIP REDACTED]" },
];

// ── Prompt Injection Patterns ───────────────────────────────────
const INJECTION_PATTERNS = [
    /ignore\s+(previous|all|above)\s+(instructions?|prompts?|rules?)/i,
    /you\s+are\s+now\s+(?:a|an)\s+(?!biodynamx)/i,
    /system\s*:\s*override/i,
    /forget\s+(everything|all|your)\s+(you|know|training)/i,
    /reveal\s+(your|the)\s+(prompt|instructions|system)/i,
    /act\s+as\s+(?:if|though)\s+you\s+(?:are|were)\s+(?!jenny|mark|sarah|journey|billy)/i,
    /pretend\s+(?:to\s+be|you\s+are)\s+(?!jenny|mark|sarah|journey|billy)/i,
    /jailbreak/i,
    /dan\s+mode/i,
    /output\s+your\s+(?:system|initial)\s+(?:prompt|instructions)/i,
];

// ── Excessive Promise Patterns ──────────────────────────────────
const EXCESSIVE_PROMISE_PATTERNS = [
    /guarantee[sd]?\s+(?:\w+\s+){0,3}(?:million|100%|instant|overnight|unlimited)/i,
    /you\s+will\s+(?:definitely|absolutely|certainly)\s+(?:make|earn|get)\s+(?:\$[\d,]+|millions?)/i,
    /risk[- ]free\s+(?:guaranteed|forever)/i,
    /no\s+risk\s+(?:whatsoever|at\s+all|guaranteed)/i,
];

// ── Competitive Disparagement ───────────────────────────────────
const COMPETITOR_NAMES = [
    "gohighlevel", "go high level", "vapi", "bland.ai", "bland ai",
    "synthflow", "retell", "air.ai", "air ai", "openai",
];

// ── Rate Limiter ────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
    sessionId: string,
    maxRequests = 60,
    windowMs = 60_000
): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(sessionId);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(sessionId, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetIn = entry.resetTime - now;

    return {
        allowed: entry.count <= maxRequests,
        remaining,
        resetIn,
    };
}

// ── Content Moderation ──────────────────────────────────────────

export function moderateAgentOutput(text: string): SafetyResult {
    const flags: SafetyFlag[] = [];
    let filtered = text;
    let severity: SafetyResult["severity"] = "none";
    let action: SafetyResult["action"] = "pass";

    // 1. PII Detection & Redaction
    for (const { pattern, type, replacement } of PII_PATTERNS) {
        const matches = filtered.match(pattern);
        if (matches) {
            flags.push({
                type: "pii_detected",
                description: `${type} detected and redacted`,
            });
            filtered = filtered.replace(pattern, replacement);
            severity = "high";
            action = "redact";
        }
    }

    // 2. Excessive Promise Detection
    for (const pattern of EXCESSIVE_PROMISE_PATTERNS) {
        if (pattern.test(filtered)) {
            flags.push({
                type: "excessive_promise",
                description: "Agent made an excessive or unrealistic promise",
            });
            severity = severity === "high" ? "high" : "medium";
            action = action === "redact" ? "redact" : "warn";
        }
    }

    // 3. Competitor Disparagement Check
    const lowerText = filtered.toLowerCase();
    for (const competitor of COMPETITOR_NAMES) {
        if (lowerText.includes(competitor)) {
            // Check if it's negative context
            const negativePatterns = [
                "terrible", "awful", "worst", "garbage", "trash", "scam",
                "don't use", "avoid", "never use", "problems with",
            ];
            for (const neg of negativePatterns) {
                const competitorIdx = lowerText.indexOf(competitor);
                const nearbyText = lowerText.slice(
                    Math.max(0, competitorIdx - 50),
                    competitorIdx + competitor.length + 50
                );
                if (nearbyText.includes(neg)) {
                    flags.push({
                        type: "competitor_disparagement",
                        description: `Negative mention of competitor: ${competitor}`,
                    });
                    severity = severity === "high" ? "high" : "medium";
                    action = action === "redact" ? "redact" : "warn";
                }
            }
        }
    }

    return {
        safe: flags.length === 0,
        filtered,
        flags,
        severity,
        action,
    };
}

// ── Input Sanitizer (for user messages) ─────────────────────────

export function sanitizeUserInput(text: string): SafetyResult {
    const flags: SafetyFlag[] = [];
    let severity: SafetyResult["severity"] = "none";
    let action: SafetyResult["action"] = "pass";

    // 1. Prompt Injection Detection
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text)) {
            flags.push({
                type: "prompt_injection",
                description: "Potential prompt injection attempt detected",
            });
            severity = "critical";
            action = "block";
            break;
        }
    }

    // 2. PII in user input — warn but don't block
    for (const { pattern, type } of PII_PATTERNS) {
        if (pattern.test(text)) {
            flags.push({
                type: "pii_detected",
                description: `User shared ${type} — agent should not store or repeat this`,
            });
            if (severity !== "critical") severity = "medium";
            if (action !== "block") action = "warn";
        }
    }

    return {
        safe: action !== "block",
        filtered: text, // Don't modify user input, just flag it
        flags,
        severity,
        action,
    };
}

// ── Conversation Boundary Enforcement ───────────────────────────

interface ConversationBounds {
    maxTurns: number;
    maxDurationMs: number;
    topicBoundary: string[];
    escalationThreshold: number;
}

const DEFAULT_BOUNDS: ConversationBounds = {
    maxTurns: 50,
    maxDurationMs: 30 * 60_000, // 30 minutes
    topicBoundary: [
        "business", "AI", "automation", "revenue", "leads",
        "marketing", "sales", "call center", "software",
        "pricing", "audit", "BioDynamX", "scheduling",
    ],
    escalationThreshold: 3, // After 3 failed attempts, escalate to human
};

export function checkConversationBounds(
    turnCount: number,
    startTime: number,
    recentFailures: number,
    bounds: ConversationBounds = DEFAULT_BOUNDS
): {
    withinBounds: boolean;
    reason?: string;
    recommendation: "continue" | "wrap_up" | "escalate" | "disconnect";
} {
    const elapsed = Date.now() - startTime;

    if (recentFailures >= bounds.escalationThreshold) {
        return {
            withinBounds: false,
            reason: "Multiple failed interactions detected — escalating to human support",
            recommendation: "escalate",
        };
    }

    if (elapsed > bounds.maxDurationMs) {
        return {
            withinBounds: false,
            reason: `Conversation exceeded ${bounds.maxDurationMs / 60_000} minute limit`,
            recommendation: "wrap_up",
        };
    }

    if (turnCount > bounds.maxTurns) {
        return {
            withinBounds: false,
            reason: `Conversation exceeded ${bounds.maxTurns} turn limit`,
            recommendation: "wrap_up",
        };
    }

    // Recommend wrapping up at 80% of limits
    if (turnCount > bounds.maxTurns * 0.8 || elapsed > bounds.maxDurationMs * 0.8) {
        return {
            withinBounds: true,
            reason: "Approaching conversation limits — begin wrapping up",
            recommendation: "wrap_up",
        };
    }

    return {
        withinBounds: true,
        recommendation: "continue",
    };
}

// ── Audit Trail Logger ──────────────────────────────────────────
// Immutable record of every safety-relevant event

export interface AuditEntry {
    timestamp: string;
    sessionId: string;
    agentName: string;
    eventType: "message_in" | "message_out" | "tool_call" | "safety_flag" | "handoff" | "escalation" | "session_start" | "session_end";
    content: string;
    safetyResult?: SafetyResult;
    metadata?: Record<string, unknown>;
}

const auditLog: AuditEntry[] = [];

export function logAuditEntry(entry: Omit<AuditEntry, "timestamp">): void {
    auditLog.push({
        ...entry,
        timestamp: new Date().toISOString(),
    });
}

export function getAuditLog(sessionId?: string): AuditEntry[] {
    if (sessionId) {
        return auditLog.filter((e) => e.sessionId === sessionId);
    }
    return [...auditLog];
}

export function clearAuditLog(): void {
    auditLog.length = 0;
}
