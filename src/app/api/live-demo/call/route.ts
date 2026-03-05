// ============================================================================
// LIVE DEMO — OUTBOUND CALL API ROUTE
// ============================================================================
// Enables AI agents to initiate real outbound phone calls via Twilio.
// Uses INLINE TwiML so no public URL is needed — Jenny speaks immediately.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { initiateCallWithGreeting } from "@/lib/twilio";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to, prospectName, purpose, agentName } = body;

        if (!to) {
            return NextResponse.json({ error: "Phone number required" }, { status: 400 });
        }

        // Clean phone number
        let phone = to.replace(/[^\d+]/g, "");
        if (!phone.startsWith("+")) {
            phone = phone.startsWith("1") ? `+${phone}` : `+1${phone}`;
        }

        // Use inline TwiML with Jenny's personalized greeting
        const result = await initiateCallWithGreeting(
            phone,
            prospectName || "there",
            purpose || "demo_callback"
        );

        console.log(`📞 Outbound call (${purpose}) by ${agentName} → ${phone}`);

        return NextResponse.json({
            success: result.success,
            sid: result.sid,
            to: phone,
            purpose,
            initiatedBy: agentName,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("❌ Live demo call error:", error);
        return NextResponse.json(
            { error: "Failed to initiate call", details: String(error) },
            { status: 500 }
        );
    }
}
