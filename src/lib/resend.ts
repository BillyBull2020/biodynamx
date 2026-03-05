// ═══════════════════════════════════════════════════════════════════════════
// Email Delivery — Resend API
// ═══════════════════════════════════════════════════════════════════════════
// Resend is the modern developer-first email API built for reliability.
// Used throughout BioDynamX for: welcome emails, ROI reports, audit results,
// monthly performance reports, and transactional notifications.
//
// Docs: https://resend.com/docs/api-reference/emails/send-email
// Pricing: Free tier sends 3,000 emails/month (100/day). $20/mo → 50k/mo
// ═══════════════════════════════════════════════════════════════════════════

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@biodynamx.com";
const FROM_NAME = "BioDynamX AI Team";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;          // Plain-text fallback
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

// ── Core send function ────────────────────────────────────────────────────────

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (!RESEND_API_KEY) {
    console.warn("[Resend] No RESEND_API_KEY — email simulated:", payload.subject);
    return { success: true, simulated: true, messageId: `sim_${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo || "support@biodynamx.com",
        tags: payload.tags,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[Resend] Send failed:", data);
      return { success: false, error: data.message || "Email send failed" };
    }

    console.log(`[Resend] ✅ Sent "${payload.subject}" → ${JSON.stringify(payload.to)} (id: ${data.id})`);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("[Resend] Error:", err);
    return { success: false, error: String(err) };
  }
}

// ── Pre-built email templates ─────────────────────────────────────────────────

/** Welcome email sent immediately after Stripe checkout */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  plan: string;
  portalUrl?: string;
  dashboardUrl?: string;
}): Promise<EmailResult> {
  const firstName = params.name?.split(" ")[0] || "there";
  const portal = params.portalUrl || "https://biodynamx.com/portal";
  const dashboard = params.dashboardUrl || "https://biodynamx.com/dashboard/client";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BioDynamX</title>
</head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#0a0a0f;color:#e0e0e0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;">
      <div style="font-size:48px;margin-bottom:12px;">🧬</div>
      <h1 style="color:#00ff41;font-size:28px;margin:0;font-weight:700;letter-spacing:-0.5px;">BioDynamX</h1>
      <p style="color:#888;font-size:14px;margin:6px 0 0;">AI Growth Engine</p>
    </div>

    <!-- Hero -->
    <div style="background:linear-gradient(135deg,rgba(0,255,65,0.08),rgba(59,130,246,0.08));border:1px solid rgba(0,255,65,0.2);border-radius:16px;padding:32px;margin-bottom:32px;text-align:center;">
      <h2 style="font-size:24px;margin:0 0 16px;color:#fff;">Welcome, ${firstName}! 🎉</h2>
      <p style="color:#ccc;font-size:16px;line-height:1.6;margin:0 0 8px;">Your <strong style="color:#00ff41;">${params.plan}</strong> is now active.</p>
      <p style="color:#888;font-size:14px;margin:0;">Your AI team is already working for you 24/7.</p>
    </div>

    <!-- Your AI Team -->
    <div style="margin-bottom:32px;">
      <h3 style="color:#fff;font-size:18px;margin:0 0 20px;">🤖 Your AI Team is Live</h3>
      <div style="display:grid;gap:12px;">
        ${[
      ["📞", "Aria", "AI Receptionist", "Answers every call in under 1 second", "#ec4899"],
      ["🩺", "Jenny", "Diagnostic Architect", "Identifies your revenue leaks", "#22c55e"],
      ["🏗️", "Mark", "Technical Closer", "Converts prospects into clients", "#3b82f6"],
      ["💜", "Sarah", "Success Manager", "Ensures your 6x ROI guarantee", "#8b5cf6"],
      ["🔥", "Billy", "Chief Strategist", "Oversees your entire growth engine", "#ef4444"],
    ].map(([emoji, name, role, desc, color]) => `
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;display:flex;align-items:center;gap:16px;">
          <div style="font-size:28px;">${emoji}</div>
          <div>
            <div style="color:${color};font-weight:600;font-size:15px;">${name} — ${role}</div>
            <div style="color:#888;font-size:13px;margin-top:2px;">${desc}</div>
          </div>
        </div>`).join("")}
      </div>
    </div>

    <!-- CTA Buttons -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${dashboard}" style="display:inline-block;background:linear-gradient(135deg,#00ff41,#22c55e);color:#000;font-weight:700;font-size:16px;padding:16px 32px;border-radius:12px;text-decoration:none;margin:0 8px 12px;">
        📊 View ROI Dashboard
      </a>
      <a href="${portal}" style="display:inline-block;background:rgba(255,255,255,0.08);color:#fff;font-weight:600;font-size:16px;padding:16px 32px;border-radius:12px;text-decoration:none;border:1px solid rgba(255,255,255,0.15);margin:0 8px 12px;">
        ⚙️ Client Portal
      </a>
    </div>

    <!-- Guarantee -->
    <div style="background:linear-gradient(135deg,rgba(239,68,68,0.08),rgba(251,146,60,0.08));border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:24px;margin-bottom:32px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">🛡️</div>
      <h3 style="color:#ef4444;margin:0 0 8px;font-size:18px;">6x ROI Guarantee</h3>
      <p style="color:#ccc;font-size:14px;margin:0;line-height:1.6;">If we don't deliver 6x your investment in measurable ROI within 90 days, we refund every cent. No questions asked.</p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#666;font-size:13px;line-height:1.8;">
      <p>Questions? Reply to this email or text us at <strong style="color:#aaa;">(303) 392-3700</strong></p>
      <p style="margin:0;">© 2026 BioDynamX · <a href="https://biodynamx.com" style="color:#00ff41;text-decoration:none;">biodynamx.com</a></p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: params.to,
    subject: `🎉 Welcome to BioDynamX, ${firstName}! Your AI team is live.`,
    html,
    text: `Welcome, ${firstName}! Your ${params.plan} is now active. Your AI team is working for you 24/7. Log in at ${portal}`,
    tags: [{ name: "type", value: "welcome" }],
  });
}

/** Monthly ROI report email */
export async function sendROIReportEmail(params: {
  to: string;
  name: string;
  period: string;
  totalInvested: number;
  totalReturned: number;
  multiple: number;
  leadsCapured: number;
  revenueGenerated: number;
  topWins: string[];
  dashboardUrl?: string;
}): Promise<EmailResult> {
  const firstName = params.name?.split(" ")[0] || "there";
  const dashboard = params.dashboardUrl || "https://biodynamx.com/dashboard/client";
  const statusColor = params.multiple >= 6 ? "#00ff41" : params.multiple >= 3 ? "#22c55e" : "#f59e0b";
  const statusText = params.multiple >= 6 ? "🏆 6x Guarantee MET" : params.multiple >= 3 ? "📈 On Track for 6x" : "🔄 Momentum Building";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#0a0a0f;color:#e0e0e0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:36px;">📊</div>
      <h1 style="color:#fff;font-size:24px;margin:8px 0 4px;">${params.period} Performance Report</h1>
      <p style="color:${statusColor};font-weight:600;font-size:16px;margin:0;">${statusText}</p>
    </div>

    <!-- ROI Summary -->
    <div style="background:rgba(0,255,65,0.05);border:1px solid rgba(0,255,65,0.2);border-radius:16px;padding:28px;margin-bottom:24px;">
      <h2 style="color:#00ff41;font-size:18px;margin:0 0 20px;text-align:center;">ROI Snapshot</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;text-align:center;">
        <div>
          <div style="font-size:28px;font-weight:700;color:#fff;">${params.multiple}x</div>
          <div style="color:#888;font-size:12px;margin-top:4px;">ROI Multiple</div>
        </div>
        <div>
          <div style="font-size:28px;font-weight:700;color:#fff;">$${params.totalReturned.toLocaleString()}</div>
          <div style="color:#888;font-size:12px;margin-top:4px;">Value Generated</div>
        </div>
        <div>
          <div style="font-size:28px;font-weight:700;color:#fff;">${params.leadsCapured}</div>
          <div style="color:#888;font-size:12px;margin-top:4px;">Leads Captured</div>
        </div>
      </div>
    </div>

    <!-- Top Wins -->
    ${params.topWins.length > 0 ? `
    <div style="margin-bottom:24px;">
      <h3 style="color:#fff;font-size:16px;margin:0 0 16px;">🏆 Top Wins This Month</h3>
      ${params.topWins.map(win => `
      <div style="background:rgba(255,255,255,0.03);border-left:3px solid #00ff41;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:8px;">
        <p style="margin:0;color:#ccc;font-size:14px;">${win}</p>
      </div>`).join("")}
    </div>` : ""}

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${dashboard}" style="display:inline-block;background:linear-gradient(135deg,#00ff41,#22c55e);color:#000;font-weight:700;font-size:16px;padding:16px 40px;border-radius:12px;text-decoration:none;">
        View Full Dashboard →
      </a>
    </div>

    <div style="text-align:center;color:#666;font-size:13px;">
      <p>© 2026 BioDynamX · <a href="https://biodynamx.com" style="color:#00ff41;text-decoration:none;">biodynamx.com</a></p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: params.to,
    subject: `📊 Your ${params.period} ROI Report — ${params.multiple}x Return`,
    html,
    text: `Hi ${firstName}, your ${params.period} report: ${params.multiple}x ROI, $${params.totalReturned.toLocaleString()} generated, ${params.leadsCapured} leads. View: ${dashboard}`,
    tags: [{ name: "type", value: "roi_report" }],
  });
}

/** Audit results email with full diagnostic */
export async function sendAuditEmail(params: {
  to: string;
  name: string;
  domain: string;
  overallScore: number;
  seoScore: number;
  aeoScore: number;
  speedScore: number;
  mobileScore: number;
  monthlyLeak: string;
  missedCalls: number;
  checkoutUrl?: string;
}): Promise<EmailResult> {
  const firstName = params.name?.split(" ")[0] || "there";
  const checkout = params.checkoutUrl || "https://biodynamx.com/#pricing";
  const grade = params.overallScore >= 80 ? "B" : params.overallScore >= 60 ? "C" : params.overallScore >= 40 ? "D" : "F";
  const gradeColor = grade === "F" || grade === "D" ? "#ef4444" : grade === "C" ? "#f59e0b" : "#22c55e";

  const metrics = [
    ["🔍 SEO Score", params.seoScore, 100],
    ["🤖 AI Visibility", params.aeoScore, 100],
    ["⚡ Site Speed", params.speedScore, 100],
    ["📱 Mobile Score", params.mobileScore, 100],
  ];

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#0a0a0f;color:#e0e0e0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#fff;font-size:24px;margin:0 0 8px;">Your Digital Health Audit</h1>
      <p style="color:#888;font-size:14px;margin:0;">${params.domain}</p>
    </div>

    <!-- Grade -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:${gradeColor}22;border:3px solid ${gradeColor};border-radius:50%;width:100px;height:100px;line-height:100px;font-size:48px;font-weight:900;color:${gradeColor};">${grade}</div>
      <h2 style="color:#fff;margin:16px 0 4px;">${params.overallScore}/100</h2>
      <p style="color:#888;font-size:14px;margin:0;">Overall Score</p>
    </div>

    <!-- Revenue Leak -->
    <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">🚨</div>
      <h3 style="color:#ef4444;margin:0 0 8px;font-size:20px;">Revenue Leak: ${params.monthlyLeak}/month</h3>
      <p style="color:#ccc;font-size:14px;margin:0 0 4px;">Your website is losing <strong>${params.monthlyLeak}</strong> every month due to digital gaps.</p>
      <p style="color:#888;font-size:13px;margin:0;">${params.missedCalls} missed calls/month going unanswered.</p>
    </div>

    <!-- Score Grid -->
    <div style="margin-bottom:24px;">
      ${metrics.map(([label, score]) => `
      <div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <div style="width:140px;color:#aaa;font-size:14px;">${label}</div>
        <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:4px;height:8px;overflow:hidden;">
          <div style="height:8px;border-radius:4px;width:${score}%;background:${Number(score) >= 70 ? "#22c55e" : Number(score) >= 50 ? "#f59e0b" : "#ef4444"};"></div>
        </div>
        <div style="width:40px;text-align:right;font-weight:600;color:${Number(score) >= 70 ? "#22c55e" : Number(score) >= 50 ? "#f59e0b" : "#ef4444"};font-size:14px;">${score}</div>
      </div>`).join("")}
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <h3 style="color:#fff;margin:0 0 16px;">Ready to stop the leak?</h3>
      <a href="${checkout}" style="display:inline-block;background:linear-gradient(135deg,#00ff41,#22c55e);color:#000;font-weight:700;font-size:16px;padding:16px 40px;border-radius:12px;text-decoration:none;">
        Start Recovering Revenue →
      </a>
      <p style="color:#888;font-size:13px;margin:16px 0 0;">6x ROI Guarantee. If we don't deliver, you get every cent back.</p>
    </div>

    <div style="text-align:center;color:#666;font-size:13px;">
      <p>© 2026 BioDynamX · <a href="https://biodynamx.com" style="color:#00ff41;text-decoration:none;">biodynamx.com</a></p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: params.to,
    subject: `⚠️ Your Digital Audit: Grade ${grade} — ${params.monthlyLeak}/month revenue leak found`,
    html,
    text: `Hi ${firstName}, your audit for ${params.domain}: Overall ${params.overallScore}/100 (Grade ${grade}). Revenue leak: ${params.monthlyLeak}/month. Fix it at ${checkout}`,
    tags: [{ name: "type", value: "audit" }],
  });
}

// ── Owner notification email — sent to Billy after EVERY AI conversation ──────
// Destination: expertaissolutions@gmail.com
// Triggered from: /api/transcripts POST (after Supabase save)

const OWNER_NOTIFICATION_EMAIL = "expertaissolutions@gmail.com";

export async function sendTranscriptNotification(data: {
  session_id: string;
  started_at?: string;
  ended_at?: string;
  duration_ms?: number;
  prospect_name?: string;
  prospect_email?: string;
  prospect_phone?: string;
  business_url?: string;
  agents?: string[];
  tools_called?: string[];
  outcome?: string;
  summary?: string;
  entry_count?: number;
  formatted_text?: string;
  entries?: Array<{
    timestamp?: string;
    elapsed_ms?: number;
    speaker?: string;
    agent_name?: string;
    content?: string;
    type?: string;
  }>;
}): Promise<EmailResult> {
  const prospectName = data.prospect_name || "Unknown Visitor";
  const duration = data.duration_ms ? `${Math.round(data.duration_ms / 1000)}s` : "N/A";
  const agents = data.agents?.join(", ") || "Jenny";
  const tools = data.tools_called?.join(", ") || "None";
  const outcome = data.outcome || "unknown";
  const startTime = data.started_at
    ? new Date(data.started_at).toLocaleString("en-US", { timeZone: "America/Denver" })
    : new Date().toLocaleString("en-US", { timeZone: "America/Denver" });

  // Format the transcript entries as readable HTML
  const transcriptHTML = (data.entries || []).map(e => {
    const speakerLabel = e.speaker === "agent"
      ? `<span style="color:#00ff41;font-weight:600;">[${e.agent_name || "Agent"}]</span>`
      : e.speaker === "prospect"
        ? `<span style="color:#3b82f6;font-weight:600;">[Prospect]</span>`
        : `<span style="color:#888;font-weight:600;">[System]</span>`;

    const elapsedStr = e.elapsed_ms ? `${Math.round(e.elapsed_ms / 1000)}s` : "";

    return `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;">
            <span style="color:#666;font-size:11px;margin-right:8px;">${elapsedStr}</span>
            ${speakerLabel} <span style="color:#ccc;">${e.content || ""}</span>
        </div>`;
  }).join("");

  // Outcome badge color
  const outcomeColor = outcome === "converted" ? "#00ff41"
    : outcome === "nurture" ? "#f59e0b"
      : outcome === "escalated" ? "#ef4444"
        : "#888";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#0a0a0f;color:#e0e0e0;">
  <div style="max-width:700px;margin:0 auto;padding:30px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#fff;font-size:20px;margin:0 0 4px;">🧬 BioDynamX — AI Conversation Complete</h1>
      <p style="color:#888;font-size:13px;margin:0;">${startTime} MT</p>
    </div>

    <!-- Quick Stats -->
    <div style="background:rgba(0,255,65,0.05);border:1px solid rgba(0,255,65,0.15);border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="display:flex;flex-wrap:wrap;gap:16px;">
        <div style="flex:1;min-width:120px;">
          <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Prospect</div>
          <div style="color:#fff;font-size:15px;font-weight:600;margin-top:4px;">${prospectName}</div>
        </div>
        <div style="flex:1;min-width:120px;">
          <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Duration</div>
          <div style="color:#fff;font-size:15px;font-weight:600;margin-top:4px;">${duration}</div>
        </div>
        <div style="flex:1;min-width:120px;">
          <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Outcome</div>
          <div style="color:${outcomeColor};font-size:15px;font-weight:700;margin-top:4px;text-transform:uppercase;">${outcome}</div>
        </div>
        <div style="flex:1;min-width:120px;">
          <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Entries</div>
          <div style="color:#fff;font-size:15px;font-weight:600;margin-top:4px;">${data.entry_count || 0}</div>
        </div>
      </div>
    </div>

    <!-- Prospect Details -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-bottom:20px;">
      <h3 style="color:#fff;font-size:14px;margin:0 0 12px;">📋 Prospect Details</h3>
      <table style="width:100%;font-size:13px;">
        ${data.prospect_email ? `<tr><td style="color:#888;padding:4px 0;width:100px;">Email:</td><td style="color:#ccc;">${data.prospect_email}</td></tr>` : ""}
        ${data.prospect_phone ? `<tr><td style="color:#888;padding:4px 0;width:100px;">Phone:</td><td style="color:#ccc;">${data.prospect_phone}</td></tr>` : ""}
        ${data.business_url ? `<tr><td style="color:#888;padding:4px 0;width:100px;">Website:</td><td style="color:#ccc;">${data.business_url}</td></tr>` : ""}
        <tr><td style="color:#888;padding:4px 0;width:100px;">Agents:</td><td style="color:#ccc;">${agents}</td></tr>
        <tr><td style="color:#888;padding:4px 0;width:100px;">Tools Used:</td><td style="color:#ccc;">${tools}</td></tr>
        <tr><td style="color:#888;padding:4px 0;width:100px;">Session ID:</td><td style="color:#666;font-family:monospace;font-size:11px;">${data.session_id}</td></tr>
      </table>
    </div>

    <!-- Summary -->
    ${data.summary ? `
    <div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.15);border-radius:12px;padding:16px;margin-bottom:20px;">
      <h3 style="color:#3b82f6;font-size:14px;margin:0 0 8px;">📝 AI Summary</h3>
      <p style="color:#ccc;font-size:13px;line-height:1.6;margin:0;">${data.summary}</p>
    </div>
    ` : ""}

    <!-- Full Transcript -->
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;margin-bottom:20px;">
      <h3 style="color:#fff;font-size:14px;margin:0 0 12px;">💬 Full Transcript</h3>
      ${transcriptHTML || '<p style="color:#666;font-size:13px;">No transcript entries recorded.</p>'}
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#666;font-size:12px;margin-top:24px;">
      <p>This is an automated notification from BioDynamX AI.</p>
      <p style="margin:0;">© 2026 BioDynamX · <a href="https://biodynamx.com" style="color:#00ff41;text-decoration:none;">biodynamx.com</a></p>
    </div>
  </div>
</body>
</html>`;

  // Plain-text fallback
  const plainText = [
    `BioDynamX AI Conversation Complete`,
    `Prospect: ${prospectName}`,
    data.prospect_email ? `Email: ${data.prospect_email}` : null,
    data.prospect_phone ? `Phone: ${data.prospect_phone}` : null,
    data.business_url ? `Website: ${data.business_url}` : null,
    `Duration: ${duration}`,
    `Agents: ${agents}`,
    `Outcome: ${outcome}`,
    `Tools: ${tools}`,
    ``,
    data.summary ? `Summary: ${data.summary}` : null,
    ``,
    `--- Full Transcript ---`,
    data.formatted_text || "(no transcript)",
  ].filter(Boolean).join("\n");

  const subjectOutcome = outcome === "converted" ? "🔥 CONVERTED"
    : outcome === "nurture" ? "📋 Nurture"
      : outcome === "escalated" ? "🚨 Escalated"
        : "📞 Complete";

  return sendEmail({
    to: OWNER_NOTIFICATION_EMAIL,
    subject: `${subjectOutcome} — ${prospectName}${data.business_url ? ` (${data.business_url})` : ""} — ${duration}`,
    html,
    text: plainText,
    replyTo: data.prospect_email || "support@biodynamx.com",
    tags: [
      { name: "type", value: "transcript_notification" },
      { name: "outcome", value: outcome },
    ],
  });
}
