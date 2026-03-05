// ============================================================================
// LIVE DEMO — SMS API ROUTE
// ============================================================================
// Enables AI agents to send real SMS messages during live conversations.
// This is the WOW factor — the agent says "Watch your phone" and the
// prospect receives a personalized text IN REAL-TIME while on the call.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to, template, prospectName, customMessage, auditUrl, checkoutUrl, agentName } = body;

        if (!to) {
            return NextResponse.json({ error: "Phone number required" }, { status: 400 });
        }

        // Clean phone number (ensure +1 prefix for US)
        let phone = to.replace(/[^\d+]/g, "");
        if (!phone.startsWith("+")) {
            phone = phone.startsWith("1") ? `+${phone}` : `+1${phone}`;
        }

        // Build message based on template
        let message = "";
        const name = prospectName || "there";

        switch (template) {
            case "demo_hello":
                message = `Hey ${name}! 👋 This is ${agentName || "Aria"} from BioDynamX. See? Our AI just sent you this text in real-time while we're talking. This is what happens to every missed call — automatically. No human needed. Pretty cool, right? 🚀\n\nLearn more: https://biodynamx.com`;
                break;

            case "audit_results":
                message = `📊 ${name}, your BioDynamX AI audit is ready!\n\nWe found recoverable revenue in your business. Here are your results:\n${auditUrl || "https://biodynamx.com/audit"}\n\nReply CALL to have Jenny walk you through the findings.\n\n— BioDynamX Engineering Group`;
                break;

            case "checkout_link":
                message = `🔒 ${name}, here's your secure checkout link:\n${checkoutUrl || "https://biodynamx.com"}\n\n✅ BioDynamX Engineering Suite — $497/mo\n✅ Dual AI Voice Agents (Jenny & Mark)\n✅ 5x ROI Guarantee\n\nQuestions? Reply here or call (303) 392-3700.\n\n— BioDynamX Engineering Group`;
                break;

            case "thank_you":
                message = `🎉 Welcome to BioDynamX, ${name}!\n\nYou just made one of the smartest decisions for your business. Here's what happens next:\n\n1️⃣ Jenny will call you within 24h for your deep diagnostic\n2️⃣ Mark will build your custom AI automation plan\n3️⃣ You'll see your first recovered revenue within 14 days\n\nYour partner agreement: https://biodynamx.com/agreement\n\nWe're in this together. 💪\n— Billy De La Taurus, Founder`;
                break;

            case "follow_up":
                message = `${name}, just wanted to follow up on our conversation. Our AI runs a free 60-second audit that shows you exactly where your business is leaking revenue — and how to fix it.\n\nReady to see your numbers? Book a free audit:\nhttps://biodynamx.com/audit\n\n— ${agentName || "BioDynamX Team"}`;
                break;

            case "custom":
                message = customMessage || `Hey ${name}! Thanks for connecting with BioDynamX. 🚀\n\nhttps://biodynamx.com`;
                break;

            default:
                message = `Hey ${name}! 👋 Thanks for chatting with ${agentName || "our AI team"} at BioDynamX. We specialize in recovering lost revenue using AI voice agents.\n\nFree 60-second audit: https://biodynamx.com/audit\n\n— BioDynamX Engineering Group`;
        }

        const result = await sendSMS(phone, message);

        return NextResponse.json({
            success: result.success,
            sid: result.sid,
            template,
            to: phone,
            messageSent: message.substring(0, 100) + "...",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("❌ Live demo SMS error:", error);
        return NextResponse.json(
            { error: "Failed to send SMS", details: String(error) },
            { status: 500 }
        );
    }
}
