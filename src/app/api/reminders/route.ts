// ============================================================================
// /api/reminders — Appointment Reminder SMS System
// ============================================================================
// Sends automated appointment confirmation + reminders via Twilio SMS.
//
// POST /api/reminders/send — Send a reminder immediately
// POST /api/reminders/schedule — Schedule a future reminder
//
// Use cases:
//   - Confirmation SMS when appointment is booked
//   - 24-hour reminder
//   - 1-hour reminder
//   - Post-appointment follow-up (with review request link)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";

const REMINDER_TEMPLATES = {
    confirmation: (name: string, date: string, time: string, businessName: string) =>
        `✅ Confirmed! ${name}, your appointment with ${businessName} is set for ${date} at ${time}. We'll send you a reminder before. Reply CANCEL to reschedule. — ${businessName}`,

    reminder_24h: (name: string, date: string, time: string, businessName: string) =>
        `Hey ${name}! 📋 Friendly reminder — your appointment with ${businessName} is tomorrow (${date}) at ${time}. Reply YES to confirm or RESCHEDULE if you need a new time. — ${businessName}`,

    reminder_1h: (name: string, time: string, businessName: string) =>
        `${name}, your appointment with ${businessName} is in 1 hour (${time}). We're looking forward to seeing you! 🙌 — ${businessName}`,

    post_appointment: (name: string, businessName: string, reviewLink?: string) =>
        reviewLink
            ? `Thanks for visiting ${businessName}, ${name}! 😊 We hope everything went great. If you have 30 seconds, a quick review would mean the world: ${reviewLink} — Thank you!`
            : `Thanks for visiting ${businessName}, ${name}! 😊 We hope everything went great. If there's anything else we can help with, just reply here. — ${businessName}`,

    no_show: (name: string, businessName: string) =>
        `Hey ${name}, we missed you today at ${businessName}! 😔 No worries — would you like to reschedule? Just reply with a day/time that works and we'll lock it in. — ${businessName}`,
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            phone,
            name = "there",
            date,              // "Monday, Feb 24"
            time,              // "2:00 PM"
            businessName = "BioDynamX",
            template = "confirmation",
            reviewLink,
        } = body;

        if (!phone) {
            return NextResponse.json(
                { error: "Phone number required" },
                { status: 400 }
            );
        }

        let smsBody: string;
        const tmpl = template as keyof typeof REMINDER_TEMPLATES;

        switch (tmpl) {
            case "confirmation":
                smsBody = REMINDER_TEMPLATES.confirmation(name, date || "your scheduled date", time || "your scheduled time", businessName);
                break;
            case "reminder_24h":
                smsBody = REMINDER_TEMPLATES.reminder_24h(name, date || "tomorrow", time || "your scheduled time", businessName);
                break;
            case "reminder_1h":
                smsBody = REMINDER_TEMPLATES.reminder_1h(name, time || "soon", businessName);
                break;
            case "post_appointment":
                smsBody = REMINDER_TEMPLATES.post_appointment(name, businessName, reviewLink);
                break;
            case "no_show":
                smsBody = REMINDER_TEMPLATES.no_show(name, businessName);
                break;
            default:
                smsBody = REMINDER_TEMPLATES.confirmation(name, date || "your scheduled date", time || "your scheduled time", businessName);
        }

        const result = await sendSMS(phone, smsBody);

        return NextResponse.json({
            success: result.success,
            message: result.success ? `${template} SMS sent to ${phone}` : `Failed to send to ${phone}`,
            sid: result.sid,
            template: tmpl,
        });
    } catch (error) {
        console.error("[Reminders] Error:", error);
        return NextResponse.json(
            { error: "Failed to send reminder" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        service: "BioDynamX Appointment Reminders",
        status: "active",
        templates: Object.keys(REMINDER_TEMPLATES),
        usage: "POST /api/reminders { phone: '+1...', name: 'John', date: 'Mon Feb 24', time: '2:00 PM', template: 'confirmation' }",
    });
}
