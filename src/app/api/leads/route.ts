// ============================================================================
// /api/leads — Lead Capture API
// ============================================================================
// Captures leads from the homepage, audit page, or voice diagnostic.
// Stores in Supabase and triggers the nurture sequence.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createLead, logNurtureEvent } from "@/lib/supabase";
import { sendSMS, NURTURE_SMS } from "@/lib/twilio";
import { quickScore } from "@/lib/lead-scoring";
import { sendLeadAlert } from "@/lib/lead-alerts";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            email,
            phone,
            name,
            businessUrl,
            businessType,
            source = "homepage",
            auditGrade,
            auditScore,
            monthlyLeak,
            annualLeak,
        } = body;

        // Validate required fields
        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // ── Step 0: Score the lead ──────────────────────────────
        const leadScore = quickScore(source, !!phone, !!auditGrade, auditGrade);

        // ── Step 1: Create lead in Supabase ─────────────────────
        const { data: lead, error } = await createLead({
            email,
            phone: phone || null,
            name: name || null,
            business_url: businessUrl || null,
            business_type: businessType || null,
            source,
            audit_grade: auditGrade || null,
            audit_score: auditScore || null,
            monthly_leak: monthlyLeak || null,
            annual_leak: annualLeak || null,
            nurture_stage: "captured",
            nurture_sequence_step: 0,
            metadata: {
                captured_at: new Date().toISOString(),
                user_agent: req.headers.get("user-agent"),
                ip: req.headers.get("x-forwarded-for") || "unknown",
                lead_score: leadScore.score,
                lead_priority: leadScore.priority,
            },
        });

        if (error) {
            console.error("Lead creation error:", error);
            // Don't fail the request — still try to send SMS
        }

        const leadId = lead?.id || `temp_${Date.now()}`;

        // ── Step 1b: Alert business owner instantly ──────────────
        sendLeadAlert({
            name: name || undefined,
            phone: phone || undefined,
            email,
            source,
            businessType: businessType || undefined,
            auditGrade: auditGrade || undefined,
            monthlyLeak: monthlyLeak || undefined,
            urgency: leadScore.priority === "hot" ? "hot" : leadScore.priority === "warm" ? "warm" : "cold",
        }).catch(err => console.error("[Leads] Alert failed:", err));

        // ── Step 2: Trigger immediate nurture (SMS) ─────────────
        if (phone) {
            const firstName = name?.split(" ")[0] || "there";
            const smsBody = monthlyLeak
                ? NURTURE_SMS.auditResults(firstName, monthlyLeak)
                : NURTURE_SMS.auditResults(firstName, "$2,400+");

            // Send SMS (async, don't block response)
            sendSMS(phone, smsBody).then(async (result) => {
                await logNurtureEvent({
                    lead_id: leadId,
                    event_type: "sms",
                    status: result.success ? "sent" : "failed",
                    content: smsBody,
                    scheduled_at: new Date().toISOString(),
                    sent_at: new Date().toISOString(),
                    metadata: { sid: result.sid, step: 1 },
                });
            });
        }

        // ── Step 3: Schedule follow-up sequence ──────────────────
        // In production, this would use a job queue (Firebase Functions, Supabase Edge Functions, or cron)
        // For now, we log the sequence plan
        const sequencePlan = [
            { step: 1, delay: "2 minutes", type: "sms", template: "auditResults", status: phone ? "triggered" : "skipped_no_phone" },
            { step: 2, delay: "24 hours", type: "sms", template: "followUp", status: "scheduled" },
            { step: 3, delay: "24 hours", type: "call", template: "jennyFollowUp", status: "scheduled" },
            { step: 4, delay: "3 days", type: "sms", template: "caseStudy", status: "scheduled" },
            { step: 5, delay: "3 days", type: "email", template: "auditPDF", status: "scheduled" },
            { step: 6, delay: "7 days", type: "sms", template: "urgency", status: "scheduled" },
            { step: 7, delay: "7 days", type: "call", template: "finalCall", status: "scheduled" },
        ];

        console.log(`🚀 Nurture sequence initiated for ${email}:`, sequencePlan);

        return NextResponse.json({
            success: true,
            leadId,
            leadScore: leadScore.score,
            leadPriority: leadScore.priority,
            message: "Lead captured and nurture sequence initiated",
            sequence: sequencePlan,
        });
    } catch (err) {
        console.error("Lead capture error:", err);
        return NextResponse.json(
            { error: "Failed to capture lead" },
            { status: 500 }
        );
    }
}
