// ============================================================================
// Client Authentication — Supabase Auth
// ============================================================================
// Handles client sign-in, session management, and account creation.
// Uses Supabase magic link (passwordless) for frictionless onboarding.
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Server-side client (admin operations — create users, etc.)
export function getAdminClient() {
    return createClient(supabaseUrl, supabaseServiceKey);
}

// Client-side client (browser — uses anon key + user session)
export function getBrowserClient() {
    return createClient(supabaseUrl, supabaseAnonKey);
}

// ── Create Client Account (called from Stripe webhook) ──────────────────
export async function createClientAccount(options: {
    email: string;
    name?: string;
    plan: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}) {
    const supabase = getAdminClient();

    // 1. Create auth user (or get existing)
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === options.email);

    let userId: string;

    if (existing) {
        userId = existing.id;
        console.log(`[Auth] User already exists: ${options.email} (${userId})`);
    } else {
        const { data: newUser, error } = await supabase.auth.admin.createUser({
            email: options.email,
            email_confirm: true,
            user_metadata: {
                name: options.name,
                plan: options.plan,
                onboarding_complete: false,
            },
        });

        if (error) {
            console.error("[Auth] Failed to create user:", error);
            throw error;
        }

        userId = newUser.user.id;
        console.log(`[Auth] ✅ Created new user: ${options.email} (${userId})`);
    }

    // 2. Upsert client profile in the clients table
    const { error: profileError } = await supabase
        .from("clients")
        .upsert({
            id: userId,
            email: options.email,
            name: options.name || null,
            plan: options.plan,
            stripe_customer_id: options.stripeCustomerId || null,
            stripe_subscription_id: options.stripeSubscriptionId || null,
            status: "active",
            onboarding_step: 0,
            onboarding_complete: false,
            created_at: new Date().toISOString(),
            settings: {
                business_name: "",
                business_url: "",
                business_phone: "",
                business_hours: { open: "09:00", close: "17:00" },
                timezone: "America/Denver",
                ai_greeting: "",
                notifications_email: true,
                notifications_sms: true,
            },
        }, { onConflict: "id" });

    if (profileError) {
        console.error("[Auth] Failed to create client profile:", profileError);
    }

    return { userId, email: options.email };
}

// ── Send Magic Link ─────────────────────────────────────────────────────
export async function sendMagicLink(email: string) {
    const supabase = getAdminClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    const { error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
            redirectTo: `${baseUrl}/portal`,
        },
    });

    if (error) {
        console.error("[Auth] Magic link error:", error);
        throw error;
    }

    console.log(`[Auth] ✅ Magic link sent to ${email}`);
    return { success: true };
}

// ── Get Client Profile ──────────────────────────────────────────────────
export async function getClientProfile(userId: string) {
    const supabase = getAdminClient();

    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("[Auth] Failed to get client profile:", error);
        return null;
    }

    return data;
}

// ── Update Onboarding Progress ──────────────────────────────────────────
export async function updateOnboardingStep(userId: string, step: number, settings?: Record<string, unknown>) {
    const supabase = getAdminClient();

    const updates: Record<string, unknown> = {
        onboarding_step: step,
    };

    if (step >= 5) {
        updates.onboarding_complete = true;
    }

    if (settings) {
        // Merge with existing settings
        const { data: current } = await supabase
            .from("clients")
            .select("settings")
            .eq("id", userId)
            .single();

        updates.settings = { ...(current?.settings || {}), ...settings };
    }

    const { error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", userId);

    if (error) {
        console.error("[Auth] Failed to update onboarding:", error);
    }

    return { step, complete: step >= 5 };
}
