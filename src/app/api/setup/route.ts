// ═══════════════════════════════════════════════════════════════════
// /api/setup/route.ts — Database Setup Endpoint
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { setupSupabaseTables, SQL_SCHEMA } from "@/lib/supabase-setup";

export async function GET() {
    const result = await setupSupabaseTables();

    return NextResponse.json({
        ...result,
        instructions: !result.success ? {
            step1: "Go to your Supabase Dashboard SQL Editor",
            step2: "Create a new query",
            step3: "Paste the SQL schema and run it",
            dashboardUrl: `${process.env.SUPABASE_URL?.replace('.supabase.co', '') || 'https://supabase.com/dashboard'}`,
            sql: SQL_SCHEMA,
        } : undefined,
    });
}
