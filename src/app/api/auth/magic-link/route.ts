import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${baseUrl}/portal`,
            },
        });

        if (error) {
            console.error("[Magic Link] Error:", error);
            return NextResponse.json(
                { error: "Failed to send magic link. Please verify your email and try again." },
                { status: 400 }
            );
        }

        console.log(`[Magic Link] ✅ Sent to ${email}`);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[Magic Link] Server error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
