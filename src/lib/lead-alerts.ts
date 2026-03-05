// ============================================================================
// Lead Alert — Instantly notify the business owner of new leads
// ============================================================================
// Sends an SMS to the business owner whenever a new lead is captured.
// Call this function from any lead capture point (missed call, web form, AI chat).
// ============================================================================

import { sendSMS } from "@/lib/twilio";

// Billy's phone — receives all lead alerts
const OWNER_PHONE = process.env.OWNER_ALERT_PHONE || "+17205732344";

export interface LeadAlertData {
    name?: string;
    phone?: string;
    email?: string;
    source: string;        // "missed_call" | "web_form" | "ai_chat" | "sms_reply"
    businessType?: string;
    auditGrade?: string;
    monthlyLeak?: string;
    urgency?: "hot" | "warm" | "cold";
}

export async function sendLeadAlert(lead: LeadAlertData) {
    const urgencyEmoji = lead.urgency === "hot" ? "🔥🔥🔥" :
        lead.urgency === "warm" ? "🔥" : "📋";

    const parts = [
        `${urgencyEmoji} NEW LEAD — BioDynamX`,
        `Name: ${lead.name || "Unknown"}`,
        lead.phone ? `Phone: ${lead.phone}` : null,
        lead.email ? `Email: ${lead.email}` : null,
        `Source: ${lead.source}`,
        lead.businessType ? `Business: ${lead.businessType}` : null,
        lead.auditGrade ? `Audit Grade: ${lead.auditGrade}` : null,
        lead.monthlyLeak ? `Monthly Leak: ${lead.monthlyLeak}` : null,
        `Time: ${new Date().toLocaleString("en-US", { timeZone: "America/Denver" })}`,
    ].filter(Boolean);

    const message = parts.join("\n");

    try {
        const result = await sendSMS(OWNER_PHONE, message);
        console.log(`[Lead Alert] ${result.success ? "✅" : "❌"} Notified owner about new lead: ${lead.name || lead.phone}`);
        return result;
    } catch (err) {
        console.error("[Lead Alert] Failed to send alert:", err);
        return { success: false, error: String(err) };
    }
}
