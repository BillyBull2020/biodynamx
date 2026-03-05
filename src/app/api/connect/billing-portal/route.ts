/**
 * ═══════════════════════════════════════════════════════════════════
 * API: /api/connect/billing-portal
 * ═══════════════════════════════════════════════════════════════════
 *
 * POST — Create a Billing Portal session for a connected account
 *        to manage their subscription (upgrade, downgrade, cancel,
 *        update payment method, etc.)
 *
 * With V2 accounts, use `customer_account` instead of `customer`.
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

        // Create a Billing Portal session for the connected account
        // customer_account: the connected account ID (V2 pattern)
        // return_url: where the user goes after leaving the portal
        const session = await stripeClient.billingPortal.sessions.create({
            // V2 Connect: connected account IS the customer
            customer_account: accountId,

            // Where the user returns after managing their subscription
            return_url: `${APP_URL}/dashboard/connect?accountId=${accountId}`,
        });

        console.log(`[Connect] 🔧 Billing portal session for ${accountId}: ${session.id}`);

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("[Connect] Billing portal failed:", error.message);
        return NextResponse.json(
            { error: "Failed to create billing portal session", details: error.message },
            { status: 500 }
        );
    }
}
