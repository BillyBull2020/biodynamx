// /api/storm/signup/route.ts — ProStorm Patrol contractor signup
// Saves contractor territory claim to Supabase

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      company,
      contactName,
      email,
      phone,
      license,
      territoryZip,
      territoryState,
      territoryScore,
      plan,
    } = body;

    // Validate required fields
    if (!company || !email || !phone || !territoryZip) {
      return NextResponse.json(
        { error: "Missing required fields: company, email, phone, territoryZip" },
        { status: 400 }
      );
    }

    // Check if territory is already claimed
    const { data: existing } = await supabase
      .from("prostorm_territories")
      .select("zip, contractor_company")
      .eq("zip", territoryZip)
      .eq("status", "active")
      .single();

    if (existing) {
      return NextResponse.json(
        {
          error: `Territory ${territoryZip} is already claimed by ${existing.contractor_company}`,
          territory_taken: true,
        },
        { status: 409 }
      );
    }

    // Insert contractor record
    const { data: contractor, error: contractorError } = await supabase
      .from("prostorm_contractors")
      .insert({
        company_name: company,
        contact_name: contactName,
        email: email,
        phone: phone,
        license_number: license || null,
        plan: plan,
        status: "trial",
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (contractorError) {
      console.error("Contractor insert error:", contractorError);
      return NextResponse.json(
        { error: "Failed to create contractor account" },
        { status: 500 }
      );
    }

    // Claim the territory
    const { error: territoryError } = await supabase
      .from("prostorm_territories")
      .insert({
        zip: territoryZip,
        state: territoryState,
        hail_risk_score: territoryScore,
        contractor_id: contractor.id,
        contractor_company: company,
        plan: plan,
        status: "active",
        claimed_at: new Date().toISOString(),
      });

    if (territoryError) {
      console.error("Territory claim error:", territoryError);
      // Try to rollback contractor creation
      await supabase.from("prostorm_contractors").delete().eq("id", contractor.id);
      return NextResponse.json(
        { error: "Failed to claim territory — it may have just been taken" },
        { status: 500 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      contractor_id: contractor.id,
      territory: territoryZip,
      plan: plan,
      trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      message: `Territory ${territoryZip} claimed successfully. 7-day trial started.`,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

// GET — check territory availability
export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get("zip");

  if (!zip) {
    // Return all claimed territories
    const { data } = await supabase
      .from("prostorm_territories")
      .select("zip, state, contractor_company, plan, claimed_at")
      .eq("status", "active");

    return NextResponse.json({ claimed: data || [] });
  }

  // Check specific ZIP
  const { data } = await supabase
    .from("prostorm_territories")
    .select("zip, contractor_company, plan")
    .eq("zip", zip)
    .eq("status", "active")
    .single();

  if (data) {
    return NextResponse.json({
      zip: zip,
      available: false,
      claimed_by: data.contractor_company,
      plan: data.plan,
    });
  }

  return NextResponse.json({ zip: zip, available: true });
}