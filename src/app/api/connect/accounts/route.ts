/**
 * ═══════════════════════════════════════════════════════════════════
 * API: /api/connect/accounts
 * ═══════════════════════════════════════════════════════════════════
 *
 * POST — Create a new Stripe Connect V2 account
 * GET  — Retrieve account status (include requirements + capabilities)
 *
 * This uses the V2 Core Accounts API. Key points:
 *   - Do NOT use top-level `type: 'express'` or `type: 'standard'`
 *   - Use `dashboard: 'full'` for full Stripe Dashboard access
 *   - fees_collector + losses_collector = 'stripe' (Stripe handles)
 *   - Request card_payments capability under merchant configuration
 */

import { NextRequest, NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe-connect";

// ─── POST: Create a Connected Account ──────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { displayName, email } = body;

        // Validate required fields from the user
        if (!displayName || !email) {
            return NextResponse.json(
                { error: "displayName and email are required" },
                { status: 400 }
            );
        }

        // Create a V2 Connected Account
        // NOTE: Do NOT pass `type` at the top level.
        // The V2 API uses `dashboard`, `defaults`, and `configuration` instead.
        const account = await stripeClient.v2.core.accounts.create({
            // Display name shown on the connected account's Stripe Dashboard
            display_name: displayName,

            // Contact email for the connected account
            contact_email: email,

            // Identity: the country where this account operates
            identity: {
                country: "us",
            },

            // Give the connected account access to the full Stripe Dashboard
            dashboard: "full",

            // Platform defaults:
            // - fees_collector: 'stripe'  → Stripe collects fees from the connected account
            // - losses_collector: 'stripe' → Stripe handles dispute losses
            defaults: {
                responsibilities: {
                    fees_collector: "stripe",
                    losses_collector: "stripe",
                },
            },

            // Configuration: request capabilities for the connected account
            configuration: {
                // Customer configuration (for subscriptions, billing portal, etc.)
                customer: {},

                // Merchant configuration with card_payments capability
                merchant: {
                    capabilities: {
                        card_payments: {
                            requested: true,
                        },
                    },
                },
            },
        });

        console.log(`[Connect] ✅ Created V2 account: ${account.id} for ${email}`);

        // TODO: If you have a database, store a mapping from your user object
        // to account.id here. Example:
        // await db.users.update({ email }, { stripeAccountId: account.id });

        return NextResponse.json({
            accountId: account.id,
            displayName: account.display_name,
            email: account.contact_email,
        });
    } catch (err: unknown) {
        const error = err as { message?: string; type?: string };
        console.error("[Connect] Account creation failed:", error.message);
        return NextResponse.json(
            { error: "Failed to create connected account", details: error.message },
            { status: 500 }
        );
    }
}

// ─── GET: Retrieve Account Status ──────────────────────────────────
// Always fetches fresh from Stripe (not from a database cache).
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
        return NextResponse.json(
            { error: "accountId query parameter is required" },
            { status: 400 }
        );
    }

    try {
        // Retrieve the V2 account with merchant config + requirements included
        // so we can determine onboarding status and capability readiness
        const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
            include: ["configuration.merchant", "requirements"],
        });

        // Check if card_payments capability is active → ready to process
        const readyToProcessPayments =
            account?.configuration?.merchant?.capabilities?.card_payments?.status === "active";

        // Check requirements status to determine if onboarding is complete
        const requirementsStatus =
            account.requirements?.summary?.minimum_deadline?.status;

        // Onboarding is complete when there are no "currently_due" or "past_due" requirements
        const onboardingComplete =
            requirementsStatus !== "currently_due" &&
            requirementsStatus !== "past_due";

        return NextResponse.json({
            accountId: account.id,
            displayName: account.display_name,
            email: account.contact_email,
            readyToProcessPayments,
            onboardingComplete,
            requirementsStatus: requirementsStatus || "none",
            cardPaymentsStatus:
                account?.configuration?.merchant?.capabilities?.card_payments?.status || "inactive",
        });
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("[Connect] Account retrieval failed:", error.message);
        return NextResponse.json(
            { error: "Failed to retrieve account", details: error.message },
            { status: 500 }
        );
    }
}
