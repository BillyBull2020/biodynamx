/**
 * ═══════════════════════════════════════════════════════════════════
 * API: /api/connect/subscribe
 * ═══════════════════════════════════════════════════════════════════
 *
 * POST — Create a subscription Checkout Session for a connected account.
 *
 * With V2 accounts, the connected account ID (acct_...) is used as
 * the `customer_account` — no separate Customer object is needed.
 *
 * This charges the CONNECTED ACCOUNT a platform subscription fee
 * (e.g., $497/mo for BioDynamX Growth Engine).
 */

import { NextRequest, NextResponse } from "next/server";
import { stripeClient, APP_URL, PLATFORM_PRICE_ID } from "@/lib/stripe-connect";

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

        // Validate that we have a platform subscription price
        if (!PLATFORM_PRICE_ID) {
            return NextResponse.json(
                {
                    error: "STRIPE_SUBSCRIPTION_PRICE_ID is not configured. " +
                        "Create a subscription product in the Stripe Dashboard → Products, " +
                        "then add the Price ID to .env.local as STRIPE_SUBSCRIPTION_PRICE_ID.",
                },
                { status: 500 }
            );
        }

        // Create a subscription Checkout Session
        // customer_account: the connected account ID (acct_...) acts as the customer
        // This is a V2 pattern — no need for a separate Customer object
        const session = await stripeClient.checkout.sessions.create({
            // V2 Connect: use customer_account instead of customer
            // The connected account IS the customer for platform subscriptions
            customer_account: accountId,

            mode: "subscription",

            line_items: [
                {
                    // The platform's subscription price (e.g., "price_1ABC...")
                    price: PLATFORM_PRICE_ID,
                    quantity: 1,
                },
            ],

            // {CHECKOUT_SESSION_ID} is auto-replaced by Stripe
            success_url: `${APP_URL}/dashboard/connect?accountId=${accountId}&subscribed=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${APP_URL}/dashboard/connect?accountId=${accountId}&subscribe_canceled=true`,
        });

        console.log(`[Connect] 🔄 Subscription checkout created for ${accountId}: ${session.id}`);

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("[Connect] Subscription checkout failed:", error.message);
        return NextResponse.json(
            { error: "Failed to create subscription checkout", details: error.message },
            { status: 500 }
        );
    }
}
