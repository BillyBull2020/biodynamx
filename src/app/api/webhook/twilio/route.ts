// ============================================================================
// /api/webhook/twilio — Twilio SMS/Voice Webhook
// ============================================================================
// Receives incoming text messages or call events from Twilio.
// If a lead replies to an auto-nurture SMS, this routes their reply
// to an AI Agent (Jenny) to keep the conversation going autonomously
// or triggers a direct phone call.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { sendSMS, initiateCallWithGreeting } from "@/lib/twilio";
import { getLeadByPhone, logNurtureEvent } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_AUDIT_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: NextRequest) {
    try {
        // Twilio sends data as x-www-form-urlencoded
        const bodyText = await req.text();
        const formData = new URLSearchParams(bodyText);

        const fromPhone = formData.get("From");
        const toPhone = formData.get("To");
        const messageBody = formData.get("Body");
        const smsSid = formData.get("SmsSid");

        console.log(`[Twilio Webhook] Received SMS from ${fromPhone}: "${messageBody}"`);

        if (!fromPhone || !messageBody) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // 1. Identify the Lead from Supabase (by phone number)
        const lead = await getLeadByPhone(fromPhone);
        const leadName = lead?.name?.split(" ")[0] || "there";
        const leadId = lead?.id || "unknown_lead";

        // 2. Log incoming message
        await logNurtureEvent({
            lead_id: leadId,
            event_type: "sms",
            status: "delivered",
            content: messageBody,
            scheduled_at: new Date().toISOString(),
            sent_at: new Date().toISOString(),
            metadata: { sid: smsSid, from: fromPhone, direction: "inbound" },
        });

        // 3. AI determines the intent of the reply (Are they asking a question? Ready to talk? Unsubscribing?)
        const leadContextStr = lead ? "Business: " + (lead.business_type || "unknown") + ", Audit Score: " + (lead.audit_score || "N/A") : "Unknown new lead";
        const analysisPrompt = `
You are the intent analyzer for BioDynamX's AI Sales Engine.
A prospect named ${leadName} just replied to an automated SMS from Jenny (a diagnostic consultant).

Prospect's reply: "${messageBody}"
Lead Context: ${leadContextStr}

Analyze their intent and return ONE of the following precise JSON responses:
{"intent": "call_me"}       // If they explicitly ask for a phone call or say "call me", "yes call", "let's talk now", etc.
{"intent": "question"}      // If they are asking a specific question about the service, pricing, or their audit
{"intent": "not_interested"}// If they say stop, unsubscribe, no, take me off your list
{"intent": "general"}       // If they say something generic like "thanks", "ok", or you are unsure

Only return the JSON. No markdown.
`;

        const aiAnalyze = await model.generateContent(analysisPrompt);
        const analysisText = aiAnalyze.response.text().trim().replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "");
        let intent = "general";
        try {
            const parsed = JSON.parse(analysisText);
            intent = parsed.intent;
        } catch (e) {
            console.error("[Twilio Webhook] Failed to parse intent JSON, defaulting to general:", analysisText);
        }

        console.log(`[Twilio Webhook] Intent determined: ${intent}`);

        // 4. Handle the intent and respond
        let AI_RESPONSE = "";

        if (intent === "not_interested") {
            // Opt out
            AI_RESPONSE = "Got it, I've opted you out of further messages. Have a great day!";
            if (leadId !== "unknown_lead") {
                // In production, update lead status in Supabase to 'unsubscribed'
            }
        }
        else if (intent === "call_me") {
            // Hot Lead! Trigger a live AI Phone Call via Twilio
            AI_RESPONSE = `You got it ${leadName}. My AI system is calling you right now from a Denver number (303).`;

            // Initiate actual phone call asynchronously
            setTimeout(() => {
                initiateCallWithGreeting(fromPhone, leadName, "follow_up").catch(err => {
                    console.error("[Twilio Webhook] Failed to initiate live call:", err);
                });
            }, 5000); // 5 second delay to let the SMS arrive first
        }
        else if (intent === "question" || intent === "general") {
            // Use Gemini to draft a contextual, conversational response as "Jenny"
            const responsePrompt = `
You are Jenny, a highly intelligent, premium Diagnostic Consultant for BioDynamX Engineering group. 
You previously texted a prospect named ${leadName}. 
They just replied: "${messageBody}"

Write a short, professional, friendly text message reply (max 2 sentences). 
Your goal is to answer their question if they had one, or gracefully push them to schedule a free 60-second voice diagnostic or let you call them.
Do NOT sound like a rigid robot. Use appropriate emojis. 
Sign off as "— Jenny".
            `;
            const aiDraft = await model.generateContent(responsePrompt);
            AI_RESPONSE = aiDraft.response.text().trim();
        }

        // 5. Send the response back to the user via Twilio SMS
        if (AI_RESPONSE) {
            const smsResult = await sendSMS(fromPhone, AI_RESPONSE);

            // Log outbound AI response
            await logNurtureEvent({
                lead_id: leadId,
                event_type: "sms",
                status: smsResult.success ? "sent" : "failed",
                content: AI_RESPONSE,
                scheduled_at: new Date().toISOString(),
                sent_at: new Date().toISOString(),
                metadata: { sid: smsResult.sid, generated_by_ai: true, direction: "outbound" },
            });
        }

        // 6. Return standard TwiML response (empty)
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
            {
                status: 200,
                headers: { "Content-Type": "text/xml" },
            }
        );

    } catch (error: any) {
        console.error("[Twilio Webhook] Error processing SMS:", error.message);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
