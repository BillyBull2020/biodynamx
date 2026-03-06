// ═══════════════════════════════════════════════════════════════════
// API: /api/transcript/send
// Sends the full conversation transcript + lead intel to Billy
// Called by IronClaw's endSession() post-call automation
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { sendTranscriptEmail, type TranscriptEmailPayload } from "@/lib/email-transcript";

export async function POST(request: Request) {
    try {
        const body = await request.json() as TranscriptEmailPayload;

        // Validate required fields
        if (!body.sessionId || !body.formattedTranscript) {
            return NextResponse.json(
                { error: "Missing required fields: sessionId, formattedTranscript" },
                { status: 400 }
            );
        }

        // Send the email
        const result = await sendTranscriptEmail(body);

        if (result.success) {
            console.log(`[API/transcript] ✅ Transcript email sent for session ${body.sessionId}`);
            return NextResponse.json({
                success: true,
                emailId: result.emailId,
                message: `Transcript delivered to billy@biodynamx.com`,
            });
        } else {
            console.error(`[API/transcript] ❌ Failed: ${result.error}`);
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (err) {
        console.error("[API/transcript] ❌ Server error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
