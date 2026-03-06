import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, upsertIronclawSession, addIronclawLearning } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, data } = body;

        console.log(`[Ironclaw Sync] Firing ${type} sync...`);

        if (type === "session") {
            await upsertIronclawSession(data);
            return NextResponse.json({ success: true, type: "session" });
        }

        if (type === "learning") {
            const { learning, sessionId } = data;
            await addIronclawLearning(learning, sessionId);
            return NextResponse.json({ success: true, type: "learning" });
        }

        return NextResponse.json({ success: false, error: "Invalid sync type" }, { status: 400 });
    } catch (err) {
        console.error("[Ironclaw Sync API Error]", err);
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
