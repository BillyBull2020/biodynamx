/**
 * ═══════════════════════════════════════════════════════════════════
 * API: /api/connect/onboard
 * ═══════════════════════════════════════════════════════════════════
 *
 * POST — Generate an Account Link for onboarding a connected account.
 *
 * This uses the V2 Account Links API to create a hosted onboarding
 * flow. The connected account owner clicks the link, fills out their
 * business details on Stripe, and is redirected back to our app.
 *
 * Two URLs are required:
 *   - return_url: Where the user lands after completing onboarding
 *   - refresh_url: Where the user lands if the link expires
 */

import { NextRequest, NextResponse } from "next/server";
import { stripeClient, APP_URL } from "@/lib/stripe-connect";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { accountId } = body;

        if (!accountId) {
            return NextResponse.json(
                { error: "accountId is required" },
                { status: 400 }
            );
        }

        // Create a V2 Account Link for onboarding
        // use_case.type: 'account_onboarding' → hosted onboarding flow
        // configurations: ['merchant', 'customer'] → onboard for both configs
        // return_url: user lands here after completing onboarding
        // refresh_url: user lands here if the link expires (re-generate a new one)
        const accountLink = await stripeClient.v2.core.accountLinks.create({
            account: accountId,
            use_case: {
                type: "account_onboarding",
                account_onboarding: {
                    // Onboard for both merchant (accepting payments) and customer (subscriptions)
                    configurations: ["merchant", "customer"],

                    // If the link expires, redirect here so we can generate a new one
                    refresh_url: `${APP_URL}/dashboard/connect?accountId=${accountId}&refresh=true`,

                    // After onboarding completes, redirect here with the accountId
                    return_url: `${APP_URL}/dashboard/connect?accountId=${accountId}`,
                },
            },
        });

        console.log(`[Connect] 🔗 Account Link created for ${accountId}`);

        return NextResponse.json({ url: accountLink.url });
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("[Connect] Account Link creation failed:", error.message);
        return NextResponse.json(
            { error: "Failed to create onboarding link", details: error.message },
            { status: 500 }
        );
    }
}
