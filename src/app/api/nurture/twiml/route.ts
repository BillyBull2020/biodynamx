// ============================================================================
// /api/nurture/twiml — Jenny's Voice Call Script (TwiML)
// ============================================================================
// Returns TwiML XML that Twilio uses for Jenny's automated follow-up calls.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { generateJennyCallTwiml } from "@/lib/twilio";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const name = url.searchParams.get("name") || "there";
    const grade = url.searchParams.get("grade") || undefined;

    const twiml = generateJennyCallTwiml(name, grade);

    return new NextResponse(twiml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}

export async function POST(req: NextRequest) {
    // Twilio sends POST requests to TwiML endpoints
    return GET(req);
}
