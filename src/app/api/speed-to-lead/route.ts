// ============================================================================
// /api/speed-to-lead — Instant Web Lead Response
// ============================================================================
// When a web form is submitted, this immediately:
//   1. Texts the prospect back (under 60 seconds)
//   2. Alerts the business owner
//   3. Logs everything in Supabase
//
// This is the "Speed to Lead" engine — studies show responding
// within 5 minutes makes you 100x more likely to connect.
// We respond in under 60 SECONDS.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";
import { sendLeadAlert } from "@/lib/lead-alerts";

const SPEED_RESPONSES = {
    withAudit: (name: string) =>
        `Hey ${name}! 🚀 Thanks for running your free BioDynamX audit. Our AI team found some interesting opportunities for your business. Want me to call you in the next 60 seconds to walk through the results? Reply YES or pick a time: https://calendly.com/biodynamx/new-meeting-1 — Jenny, BioDynamX AI`,

    general: (name: string) =>
        `Hey ${name}! 👋 Thanks for reaching out to BioDynamX. I'm Jenny, your AI diagnostic consultant. I'd love to give you a free 60-second business audit — it reveals exactly where your revenue is leaking. Want me to call you now? Reply YES or book a time: https://calendly.com/biodynamx/new-meeting-1`,

    afterHours: (name: string) =>
        `Hey ${name}! 🌙 Thanks for reaching out to BioDynamX. Our team is offline right now, but I'm Jenny — the AI that never sleeps! I can still run a free business audit for you right now at https://biodynamx.com, or book a call for tomorrow: https://calendly.com/biodynamx/new-meeting-1`,

    pricing: (name: string) =>
        `Hey ${name}! Thanks for your interest in BioDynamX. Our Growth Engine starts at $497/mo — that covers AI Voice Agents, CRM, funnels, email/SMS marketing, scheduling, and more. Want to see a custom ROI estimate? Reply YES and I'll call you in 60 seconds. — Jenny`,
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            phone,
            name = "there",
            email,
            source = "web_form",
            interest, // "audit" | "pricing" | "general"
        } = body;

        if (!phone) {
            return NextResponse.json(
                { error: "Phone number required for speed-to-lead" },
                { status: 400 }
            );
        }

        // Determine template
        const hour = new Date().getHours();
        const isAfterHours = hour < 8 || hour >= 18;

        let smsBody: string;
        const firstName = name?.split(" ")[0] || "there";

        if (isAfterHours) {
            smsBody = SPEED_RESPONSES.afterHours(firstName);
        } else if (interest === "pricing") {
            smsBody = SPEED_RESPONSES.pricing(firstName);
        } else if (interest === "audit") {
            smsBody = SPEED_RESPONSES.withAudit(firstName);
        } else {
            smsBody = SPEED_RESPONSES.general(firstName);
        }

        // Fire both in parallel — speed is everything
        const [smsResult] = await Promise.all([
            sendSMS(phone, smsBody),
            sendLeadAlert({
                name,
                phone,
                email,
                source,
                urgency: "hot",
            }),
        ]);

        return NextResponse.json({
            success: smsResult.success,
            responseTime: "< 60 seconds",
            message: smsResult.success
                ? `Speed-to-lead SMS sent to ${phone}`
                : `Failed to send to ${phone}`,
            sid: smsResult.sid,
        });
    } catch (error) {
        console.error("[Speed-to-Lead] Error:", error);
        return NextResponse.json(
            { error: "Speed-to-lead failed" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        service: "BioDynamX Speed-to-Lead Engine",
        status: "active",
        responseTime: "< 60 seconds",
        description: "Instantly texts back web leads and alerts the business owner. Studies show responding within 5 minutes makes you 100x more likely to connect.",
    });
}
