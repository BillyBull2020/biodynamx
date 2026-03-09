// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — EMAIL DELIVERY ENGINE
// Sends transcripts, lead reports, and audio to billy@biodynamx.com
// after every conversation. This is the lead generation lifeline.
// ═══════════════════════════════════════════════════════════════════

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const BILLY_EMAIL = "billy@biodynamx.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "ai@biodynamx.com";

// ── Types ──────────────────────────────────────────────────────────

export interface TranscriptEmailPayload {
    sessionId: string;
    prospectName?: string;
    prospectEmail?: string;
    prospectPhone?: string;
    businessUrl?: string;
    industry?: string;
    leadScore?: number;
    leadGrade?: string;
    leadPriority?: "hot" | "warm" | "nurture" | "cold";
    agentsUsed: string[];
    durationSeconds: number;
    turnCount?: number;
    commitmentLevel?: number;
    outcome?: string;
    painPoints?: string[];
    objections?: string[];
    toolsCalled?: string[];
    auditGrade?: string;
    auditScore?: number;
    monthlyLeak?: string;
    formattedTranscript: string;
    summary?: string;
    proposalText?: string;
    audioUrl?: string; // Supabase storage URL for audio recording
}

// ── Urgency Styling ────────────────────────────────────────────────

function getUrgencyEmoji(priority?: string): string {
    switch (priority) {
        case "hot": return "🔥🔥🔥";
        case "warm": return "🔥";
        case "nurture": return "📋";
        case "cold": return "❄️";
        default: return "📨";
    }
}

function getUrgencyColor(priority?: string): string {
    switch (priority) {
        case "hot": return "#ef4444";
        case "warm": return "#f59e0b";
        case "nurture": return "#3b82f6";
        case "cold": return "#6b7280";
        default: return "#00ff41";
    }
}

// ── Build HTML Email ───────────────────────────────────────────────

function buildEmailHTML(payload: TranscriptEmailPayload): string {
    const urgencyColor = getUrgencyColor(payload.leadPriority);
    const urgencyEmoji = getUrgencyEmoji(payload.leadPriority);
    const duration = formatDuration(payload.durationSeconds);
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Denver" });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 20px; }
    .container { max-width: 640px; margin: 0 auto; background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, ${urgencyColor}15 0%, #11111100 100%); border-bottom: 1px solid ${urgencyColor}40; padding: 28px 32px; }
    .header h1 { margin: 0 0 4px; font-size: 20px; color: #fff; font-weight: 800; }
    .header .subtitle { font-size: 13px; color: rgba(255,255,255,0.5); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; background: ${urgencyColor}20; color: ${urgencyColor}; border: 1px solid ${urgencyColor}40; }
    .section { padding: 24px 32px; border-bottom: 1px solid #1a1a1a; }
    .section-title { font-size: 11px; font-weight: 800; color: #00ff41; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .stat-box { background: #0a0a0a; border: 1px solid #222; border-radius: 10px; padding: 14px; }
    .stat-value { font-size: 20px; font-weight: 800; color: #00ff41; }
    .stat-label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.05em; text-transform: uppercase; margin-top: 4px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1a1a1a; font-size: 13px; }
    .info-label { color: rgba(255,255,255,0.4); font-weight: 600; }
    .info-value { color: #fff; font-weight: 600; }
    .transcript-block { background: #0a0a0a; border: 1px solid #222; border-radius: 10px; padding: 20px; font-size: 12px; line-height: 1.8; white-space: pre-wrap; font-family: 'SF Mono', 'Fira Code', monospace; color: rgba(255,255,255,0.7); max-height: 600px; overflow-y: auto; }
    .transcript-block .agent { color: #00ff41; font-weight: 700; }
    .transcript-block .prospect { color: #3b82f6; font-weight: 700; }
    .transcript-block .system { color: rgba(255,255,255,0.3); font-style: italic; }
    .pill { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; background: rgba(0,255,65,0.08); color: #00ff41; border: 1px solid rgba(0,255,65,0.2); margin: 2px 4px 2px 0; }
    .footer { padding: 20px 32px; font-size: 10px; color: rgba(255,255,255,0.2); text-align: center; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Header -->
    <div class="header">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1>${urgencyEmoji} ${payload.leadPriority?.toUpperCase() || "NEW"} LEAD — ${payload.prospectName || "Unknown"}</h1>
          <div class="subtitle">${timestamp} • ${duration} conversation • Session ${payload.sessionId.substring(0, 8)}</div>
        </div>
        <span class="badge">Score: ${payload.leadScore || "—"}/100 ${payload.leadGrade ? `(${payload.leadGrade})` : ""}</span>
      </div>
    </div>

    <!-- Key Stats -->
    <div class="section">
      <div class="section-title">Key Metrics</div>
      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-value">${payload.leadScore || "—"}<span style="font-size: 12px; color: rgba(255,255,255,0.3);">/100</span></div>
          <div class="stat-label">Lead Score</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${duration}</div>
          <div class="stat-label">Duration</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${payload.commitmentLevel || 0}%</div>
          <div class="stat-label">Commitment</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${payload.agentsUsed?.length || 1}</div>
          <div class="stat-label">Agents Used</div>
        </div>
      </div>
    </div>

    <!-- Prospect Info -->
    <div class="section">
      <div class="section-title">Prospect Intelligence</div>
      ${payload.prospectName ? `<div class="info-row"><span class="info-label">Name</span><span class="info-value">${payload.prospectName}</span></div>` : ""}
      ${payload.prospectPhone ? `<div class="info-row"><span class="info-label">Phone</span><span class="info-value"><a href="tel:${payload.prospectPhone}">${payload.prospectPhone}</a></span></div>` : ""}
      ${payload.prospectEmail ? `<div class="info-row"><span class="info-label">Email</span><span class="info-value"><a href="mailto:${payload.prospectEmail}">${payload.prospectEmail}</a></span></div>` : ""}
      ${payload.businessUrl ? `<div class="info-row"><span class="info-label">Website</span><span class="info-value"><a href="https://${payload.businessUrl}">${payload.businessUrl}</a></span></div>` : ""}
      ${payload.industry ? `<div class="info-row"><span class="info-label">Industry</span><span class="info-value">${payload.industry}</span></div>` : ""}
      ${payload.auditGrade ? `<div class="info-row"><span class="info-label">Audit Grade</span><span class="info-value" style="color: ${payload.auditGrade === "A" ? "#00ff41" : payload.auditGrade === "B" ? "#f59e0b" : "#ef4444"}">${payload.auditGrade} (${payload.auditScore || "—"}/100)</span></div>` : ""}
      ${payload.monthlyLeak ? `<div class="info-row"><span class="info-label">Monthly Leak</span><span class="info-value" style="color: #ef4444">${payload.monthlyLeak}</span></div>` : ""}
      <div class="info-row"><span class="info-label">Outcome</span><span class="info-value">${payload.outcome || "unknown"}</span></div>
    </div>

    <!-- Pain Points & Objections -->
    ${(payload.painPoints?.length || payload.objections?.length) ? `
    <div class="section">
      <div class="section-title">Conversation Intelligence</div>
      ${payload.painPoints?.length ? `<div style="margin-bottom: 12px;"><strong style="color: rgba(255,255,255,0.5); font-size: 11px;">PAIN POINTS:</strong><br/>${payload.painPoints.map(p => `<span class="pill">🎯 ${p}</span>`).join("")}</div>` : ""}
      ${payload.objections?.length ? `<div><strong style="color: rgba(255,255,255,0.5); font-size: 11px;">OBJECTIONS:</strong><br/>${payload.objections.map(o => `<span class="pill" style="background: rgba(239,68,68,0.08); color: #ef4444; border-color: rgba(239,68,68,0.2);">⚡ ${o}</span>`).join("")}</div>` : ""}
    </div>
    ` : ""}

    <!-- Agent Team -->
    <div class="section">
      <div class="section-title">Agent Team</div>
      <div style="font-size: 13px; color: rgba(255,255,255,0.7);">
        ${payload.agentsUsed?.map(a => `<span class="pill">${a}</span>`).join(" → ") || "Jenny"}
      </div>
      ${payload.toolsCalled?.length ? `<div style="margin-top: 12px; font-size: 11px; color: rgba(255,255,255,0.3);">Tools: ${payload.toolsCalled.join(", ")}</div>` : ""}
    </div>

    <!-- Full Transcript -->
    <div class="section">
      <div class="section-title">Full Transcript</div>
      <div class="transcript-block">${escapeHtml(payload.formattedTranscript)}</div>
    </div>

    <!-- AI Summary -->
    ${payload.summary ? `
    <div class="section">
      <div class="section-title">AI Summary</div>
      <p style="font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.7); margin: 0;">${payload.summary}</p>
    </div>
    ` : ""}

    <!-- Audio Link -->
    ${payload.audioUrl ? `
    <div class="section">
      <div class="section-title">Audio Recording</div>
      <a href="${payload.audioUrl}" style="display: inline-block; padding: 10px 20px; background: rgba(0,255,65,0.1); border: 1px solid rgba(0,255,65,0.3); border-radius: 8px; font-size: 13px; font-weight: 600;">🎙️ Listen to Recording</a>
    </div>
    ` : ""}

    <!-- Footer -->
    <div class="footer">
      BioDynamX AI OS • Agentic 4.0 • IronClaw Intelligence Report<br/>
      Automatically generated at ${timestamp}<br/>
      Session ID: ${payload.sessionId}
    </div>
  </div>
</body>
</html>`;
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\[Jenny\]/g, '<span class="agent">[Jenny]</span>')
        .replace(/\[Mark\]/g, '<span class="agent">[Mark]</span>')
        .replace(/\[Milton\]/g, '<span class="agent">[Milton]</span>')
        .replace(/\[Brock\]/g, '<span class="agent">[Brock]</span>')
        .replace(/\[Vicki\]/g, '<span class="agent">[Vicki]</span>')
        .replace(/\[Jules\]/g, '<span class="agent">[Jules]</span>')
        .replace(/\[Ben\]/g, '<span class="agent">[Ben]</span>')
        .replace(/\[Maya\]/g, '<span class="agent">[Maya]</span>')
        .replace(/\[Prospect\]/g, '<span class="prospect">[Prospect]</span>')
        .replace(/\[System\]/g, '<span class="system">[System]</span>');
}

// ── Main Send Function ─────────────────────────────────────────────

export async function sendTranscriptEmail(payload: TranscriptEmailPayload): Promise<{
    success: boolean;
    error?: string;
    emailId?: string;
}> {
    const urgencyEmoji = getUrgencyEmoji(payload.leadPriority);
    const subject = `${urgencyEmoji} ${payload.leadPriority?.toUpperCase() || "NEW"} LEAD — ${payload.prospectName || "Unknown Visitor"} ${payload.industry ? `(${payload.industry})` : ""} | Score: ${payload.leadScore || "—"}/100`;

    try {
        const { data, error } = await resend.emails.send({
            from: `BioDynamX AI <${FROM_EMAIL}>`,
            to: [BILLY_EMAIL],
            subject,
            html: buildEmailHTML(payload),
            text: payload.formattedTranscript, // Plain text fallback
            tags: [
                { name: "session_id", value: payload.sessionId },
                { name: "priority", value: payload.leadPriority || "unknown" },
                { name: "outcome", value: payload.outcome || "unknown" },
            ],
        });

        if (error) {
            console.error("[Email] ❌ Resend error:", error);
            return { success: false, error: error.message };
        }

        console.log(`[Email] ✅ Transcript delivered to ${BILLY_EMAIL} — ID: ${data?.id}`);
        return { success: true, emailId: data?.id };
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("[Email] ❌ Failed to send transcript:", errMsg);
        return { success: false, error: errMsg };
    }
}
