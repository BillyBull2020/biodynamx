// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — CONVERSATION TRANSCRIPT ENGINE
// Full transcript capture for legal protection, QA, and training.
// Every word said by the agent AND the prospect is recorded with
// timestamps, speaker identification, and metadata.
// ═══════════════════════════════════════════════════════════════════

export interface TranscriptEntry {
    timestamp: string;          // ISO 8601
    elapsedMs: number;          // ms since session start
    speaker: "agent" | "prospect" | "system";
    agentName?: string;         // "Jenny", "Mark", "Aria"
    content: string;            // The actual text spoken
    type: "speech" | "tool_call" | "tool_result" | "handoff" | "system_event";
    metadata?: Record<string, unknown>;
}

export interface ConversationTranscript {
    sessionId: string;
    startedAt: string;          // ISO 8601
    endedAt?: string;           // ISO 8601
    durationMs: number;
    entries: TranscriptEntry[];
    prospect: {
        name?: string;
        email?: string;
        phone?: string;
        businessUrl?: string;
    };
    agents: string[];           // Which agents participated
    summary?: string;           // Auto-generated summary at end
    toolsCalled: string[];      // List of tools invoked
    outcome?: "converted" | "nurture" | "lost" | "escalated" | "unknown";
}

// ── In-Memory Transcript Store ──────────────────────────────────
const transcriptStore = new Map<string, ConversationTranscript>();

/**
 * Create a new transcript for a session
 */
export function createTranscript(sessionId: string, agentName: string): ConversationTranscript {
    const transcript: ConversationTranscript = {
        sessionId,
        startedAt: new Date().toISOString(),
        durationMs: 0,
        entries: [],
        prospect: {},
        agents: [agentName],
        toolsCalled: [],
        outcome: "unknown",
    };

    transcriptStore.set(sessionId, transcript);

    // Add session start entry
    addEntry(sessionId, {
        speaker: "system",
        content: `Session started with ${agentName}`,
        type: "system_event",
    });

    return transcript;
}

/**
 * Add an entry to the transcript
 */
export function addEntry(
    sessionId: string,
    entry: {
        speaker: TranscriptEntry["speaker"];
        content: string;
        type: TranscriptEntry["type"];
        agentName?: string;
        metadata?: Record<string, unknown>;
    }
): void {
    const transcript = transcriptStore.get(sessionId);
    if (!transcript) return;

    const now = new Date();
    const startTime = new Date(transcript.startedAt).getTime();

    transcript.entries.push({
        timestamp: now.toISOString(),
        elapsedMs: now.getTime() - startTime,
        speaker: entry.speaker,
        agentName: entry.agentName,
        content: entry.content,
        type: entry.type,
        metadata: entry.metadata,
    });

    // Track duration
    transcript.durationMs = now.getTime() - startTime;

    // Track agents
    if (entry.agentName && !transcript.agents.includes(entry.agentName)) {
        transcript.agents.push(entry.agentName);
    }

    // Track tool calls
    if (entry.type === "tool_call" && entry.metadata?.toolName) {
        const toolName = entry.metadata.toolName as string;
        if (!transcript.toolsCalled.includes(toolName)) {
            transcript.toolsCalled.push(toolName);
        }
    }
}

/**
 * Record what the agent said
 */
export function recordAgentSpeech(sessionId: string, agentName: string, text: string): void {
    addEntry(sessionId, {
        speaker: "agent",
        agentName,
        content: text,
        type: "speech",
    });
}

/**
 * Record what the prospect said (from Gemini's speech-to-text)
 */
export function recordProspectSpeech(sessionId: string, text: string): void {
    addEntry(sessionId, {
        speaker: "prospect",
        content: text,
        type: "speech",
    });
}

/**
 * Record a tool call
 */
export function recordToolCallInTranscript(
    sessionId: string,
    agentName: string,
    toolName: string,
    args: Record<string, unknown>
): void {
    addEntry(sessionId, {
        speaker: "system",
        agentName,
        content: `Tool called: ${toolName}`,
        type: "tool_call",
        metadata: { toolName, args },
    });
}

/**
 * Record a tool result
 */
export function recordToolResultInTranscript(
    sessionId: string,
    toolName: string,
    success: boolean,
    summary?: string
): void {
    addEntry(sessionId, {
        speaker: "system",
        content: `Tool result: ${toolName} — ${success ? "success" : "failed"}${summary ? `: ${summary}` : ""}`,
        type: "tool_result",
        metadata: { toolName, success },
    });
}

/**
 * Record an agent handoff
 */
export function recordHandoffInTranscript(sessionId: string, fromAgent: string, toAgent: string): void {
    addEntry(sessionId, {
        speaker: "system",
        content: `Handoff: ${fromAgent} → ${toAgent}`,
        type: "handoff",
        metadata: { from: fromAgent, to: toAgent },
    });
}

/**
 * Update prospect info
 */
export function updateProspectInfo(
    sessionId: string,
    info: Partial<ConversationTranscript["prospect"]>
): void {
    const transcript = transcriptStore.get(sessionId);
    if (!transcript) return;
    Object.assign(transcript.prospect, info);
}

/**
 * End the transcript and generate summary
 */
export function endTranscript(
    sessionId: string,
    outcome?: ConversationTranscript["outcome"]
): ConversationTranscript | undefined {
    const transcript = transcriptStore.get(sessionId);
    if (!transcript) return undefined;

    transcript.endedAt = new Date().toISOString();
    transcript.durationMs = new Date(transcript.endedAt).getTime() - new Date(transcript.startedAt).getTime();
    transcript.outcome = outcome || transcript.outcome;

    // Add session end entry
    addEntry(sessionId, {
        speaker: "system",
        content: `Session ended. Duration: ${Math.round(transcript.durationMs / 1000)}s. Outcome: ${transcript.outcome}. Entries: ${transcript.entries.length}`,
        type: "system_event",
    });

    // Auto-generate summary
    transcript.summary = generateTranscriptSummary(transcript);

    return transcript;
}

/**
 * Get the full transcript
 */
export function getTranscript(sessionId: string): ConversationTranscript | undefined {
    return transcriptStore.get(sessionId);
}

/**
 * Get a formatted text version of the transcript (for saving/emailing)
 */
export function getFormattedTranscript(sessionId: string): string {
    const transcript = transcriptStore.get(sessionId);
    if (!transcript) return "";

    const header = [
        `═══ BIODYNAMX CONVERSATION TRANSCRIPT ═══`,
        `Session ID: ${transcript.sessionId}`,
        `Date: ${new Date(transcript.startedAt).toLocaleString()}`,
        `Duration: ${Math.round(transcript.durationMs / 1000)}s`,
        `Agents: ${transcript.agents.join(", ")}`,
        `Prospect: ${transcript.prospect.name || "Unknown"}${transcript.prospect.businessUrl ? ` (${transcript.prospect.businessUrl})` : ""}`,
        `Outcome: ${transcript.outcome}`,
        `Tools Used: ${transcript.toolsCalled.join(", ") || "None"}`,
        `═══════════════════════════════════════════`,
        ``,
    ].join("\n");

    const body = transcript.entries.map(e => {
        const time = formatElapsed(e.elapsedMs);
        const speaker = e.speaker === "agent"
            ? `[${e.agentName || "Agent"}]`
            : e.speaker === "prospect"
                ? "[Prospect]"
                : "[System]";

        return `${time} ${speaker} ${e.content}`;
    }).join("\n");

    const footer = [
        ``,
        `═══════════════════════════════════════════`,
        `SUMMARY: ${transcript.summary || "No summary generated"}`,
        `═══════════════════════════════════════════`,
        `This transcript was automatically generated by BioDynamX AI.`,
        `Transcript ID: ${transcript.sessionId}`,
        `Generated: ${new Date().toISOString()}`,
    ].join("\n");

    return `${header}${body}\n${footer}`;
}

/**
 * Get transcript as JSON for API storage
 */
export function getTranscriptJSON(sessionId: string): Record<string, unknown> | null {
    const transcript = transcriptStore.get(sessionId);
    if (!transcript) return null;

    return {
        session_id: transcript.sessionId,
        started_at: transcript.startedAt,
        ended_at: transcript.endedAt,
        duration_ms: transcript.durationMs,
        prospect_name: transcript.prospect.name,
        prospect_email: transcript.prospect.email,
        prospect_phone: transcript.prospect.phone,
        business_url: transcript.prospect.businessUrl,
        agents: transcript.agents,
        tools_called: transcript.toolsCalled,
        outcome: transcript.outcome,
        summary: transcript.summary,
        entry_count: transcript.entries.length,
        entries: transcript.entries,
        formatted_text: getFormattedTranscript(sessionId),
    };
}

/**
 * Clean up old transcripts (keep last 50)
 */
export function cleanupTranscripts(): void {
    if (transcriptStore.size > 50) {
        const sortedKeys = Array.from(transcriptStore.keys());
        const toDelete = sortedKeys.slice(0, sortedKeys.length - 50);
        for (const key of toDelete) {
            transcriptStore.delete(key);
        }
    }
}

// ── Helpers ─────────────────────────────────────────────────────

function formatElapsed(ms: number): string {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `[${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}]`;
}

function generateTranscriptSummary(transcript: ConversationTranscript): string {
    const duration = Math.round(transcript.durationMs / 1000);
    const agentEntries = transcript.entries.filter(e => e.speaker === "agent");
    const prospectEntries = transcript.entries.filter(e => e.speaker === "prospect");

    const parts: string[] = [
        `${duration}s conversation with ${transcript.agents.join(" and ")}.`,
    ];

    if (transcript.prospect.name) {
        parts.push(`Prospect: ${transcript.prospect.name}.`);
    }

    if (transcript.prospect.businessUrl) {
        parts.push(`Business: ${transcript.prospect.businessUrl}.`);
    }

    parts.push(`${agentEntries.length} agent messages, ${prospectEntries.length} prospect messages.`);

    if (transcript.toolsCalled.length > 0) {
        parts.push(`Tools used: ${transcript.toolsCalled.join(", ")}.`);
    }

    parts.push(`Outcome: ${transcript.outcome}.`);

    return parts.join(" ");
}
