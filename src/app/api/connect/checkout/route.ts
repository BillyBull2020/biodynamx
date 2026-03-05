/**
 * ═══════════════════════════════════════════════════════════════════
 * API: /api/connect/checkout
 * ═══════════════════════════════════════════════════════════════════
 *
 * POST — Create a Checkout Session for a Direct Charge on a connected account.
 *
 * Direct Charges mean:
 *   - The charge appears on the CONNECTED account's Stripe Dashboard
 *   - The connected account is the merchant of record
 *   - We take an application_fee_amount as the platform's cut
 *
 * This uses hosted Checkout for simplicity — no custom payment form needed.
 */

import { NextRequest, NextResponse } from "next/server";
import { stripeClient, APP_URL, APPLICATION_FEE_PERCENT } from "@/lib/stripe-connect";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { accountId, productName, unitAmount, currency, quantity } = body;

        // Validate required fields
        if (!accountId || !productName || !unitAmount) {
            return NextResponse.json(
                { error: "accountId, productName, and unitAmount are required" },
                { status: 400 }
            );
        }

        const qty = quantity || 1;

        // Calculate the application fee (platform's cut of each transaction)
        // Example: 10% of (unitAmount * quantity)
        const applicationFee = Math.round(unitAmount * qty * APPLICATION_FEE_PERCENT);

        // Create a Checkout Session as a DIRECT CHARGE on the connected account
        // The { stripeAccount: accountId } option means:
        //   - The checkout session is created on the connected account
        //   - Payment goes directly to the connected account
        //   - We take application_fee_amount as our platform fee
        const session = await stripeClient.checkout.sessions.create(
            {
                line_items: [
                    {
                        price_data: {
                            currency: currency || "usd",
                            product_data: {
                                name: productName,
                            },
                            unit_amount: unitAmount,
                        },
                        quantity: qty,
                    },
                ],
                // payment_intent_data contains the application fee
                payment_intent_data: {
                    // This is the platform's cut — taken from the connected account's payment
                    application_fee_amount: applicationFee,
                },
                mode: "payment",
                // {CHECKOUT_SESSION_ID} is replaced by Stripe with the actual session ID
                success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${APP_URL}/store/${accountId}?canceled=true`,
            },
            {
                // CRITICAL: This creates the checkout on the CONNECTED account (Direct Charge)
                stripeAccount: accountId,
            }
        );

        console.log(`[Connect] 🛒 Checkout session created on ${accountId}: ${session.id}`);
        console.log(`  Application fee: $${(applicationFee / 100).toFixed(2)} (${APPLICATION_FEE_PERCENT * 100}%)`);

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("[Connect] Checkout creation failed:", error.message);
        return NextResponse.json(
            { error: "Failed to create checkout session", details: error.message },
            { status: 500 }
        );
    }
}
