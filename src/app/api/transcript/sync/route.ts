import { NextRequest, NextResponse } from "next/server";
import { saveTranscriptEntry } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, index, entry } = body;

        console.log(`[Transcript Sync] Line ${index} for ${sessionId}`);

        await saveTranscriptEntry(sessionId, index, entry);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[Transcript Sync API Error]", err);
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
