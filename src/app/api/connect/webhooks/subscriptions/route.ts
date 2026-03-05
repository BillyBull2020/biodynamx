/**
 * ═══════════════════════════════════════════════════════════════════
 * API: /api/connect/webhooks/subscriptions
 * ═══════════════════════════════════════════════════════════════════
 *
 * Handles STANDARD (fat) webhook events for subscription lifecycle.
 * These are NOT thin events — they include the full event payload.
 *
 * EVENTS HANDLED:
 *   - customer.subscription.updated → upgrades, downgrades, pauses, cancellations
 *   - customer.subscription.deleted → subscription fully canceled
 *   - invoice.payment_succeeded     → successful payment
 *   - invoice.payment_failed        → failed payment
 *   - payment_method.attached       → customer added a payment method
 *   - payment_method.detached       → customer removed a payment method
 *   - customer.updated              → customer billing info changed
 *
 * IMPORTANT (V2 Accounts):
 *   For V2 accounts, use `.customer_account` (not `.customer`) to get the
 *   connected account ID from subscription/invoice objects.
 *   Shape: acct_...
 *
 * SETUP:
 *   1. In Stripe Dashboard → Developers → Webhooks → + Add endpoint
 *   2. URL: https://biodynamx.com/api/connect/webhooks/subscriptions
 *   3. Select events: customer.subscription.*, invoice.*, payment_method.*, customer.updated
 *   4. Copy Signing Secret → set as STRIPE_WEBHOOK_SECRET in .env.local
 */

import { NextRequest, NextResponse } from "next/server";
import { stripeClient, SUBSCRIPTION_WEBHOOK_SECRET } from "@/lib/stripe-connect";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    if (!SUBSCRIPTION_WEBHOOK_SECRET) {
        console.error(
            "[Subscription Webhook] ⚠️ STRIPE_WEBHOOK_SECRET is not set. " +
            "Add it to .env.local from Stripe Dashboard → Webhooks → Signing secret"
        );
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        // Verify the webhook signature (standard/fat events)
        event = stripeClient.webhooks.constructEvent(body, sig, SUBSCRIPTION_WEBHOOK_SECRET);
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("[Subscription Webhook] Signature verification failed:", error.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`[Subscription Webhook] 📨 ${event.type}`);

    switch (event.type) {
        // ── SUBSCRIPTION UPDATED ────────────────────────────────────
        // Covers: upgrades, downgrades, quantity changes, pauses,
        //         cancel_at_period_end changes, and reactivations
        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;

            // V2 Accounts: get the connected account ID from customer_account
            // NOT from .customer — with V2 accounts, customer_account has the acct_ ID
            const accountId = (subscription as Stripe.Subscription & { customer_account?: string }).customer_account;
            const status = subscription.status;
            const cancelAtPeriodEnd = subscription.cancel_at_period_end;

            console.log(`[Subscription Webhook] 🔄 Subscription updated:`);
            console.log(`  Account: ${accountId}`);
            console.log(`  Status: ${status}`);
            console.log(`  Cancel at period end: ${cancelAtPeriodEnd}`);

            // Check for upgrade/downgrade by looking at the current price
            const currentPrice = subscription.items?.data?.[0]?.price;
            if (currentPrice) {
                console.log(`  Current Price: ${currentPrice.id} ($${(currentPrice.unit_amount || 0) / 100}/${currentPrice.recurring?.interval})`);
            }

            // Check for quantity changes
            const currentQuantity = subscription.items?.data?.[0]?.quantity;
            console.log(`  Quantity: ${currentQuantity}`);

            // Check if subscription was paused
            const pauseCollection = subscription.pause_collection;
            if (pauseCollection) {
                console.log(`  ⏸️ Collection paused. Behavior: ${pauseCollection.behavior}`);
                if (pauseCollection.resumes_at) {
                    console.log(`  Resumes at: ${new Date(pauseCollection.resumes_at * 1000).toISOString()}`);
                }
            } else {
                console.log(`  Collection active (not paused)`);
            }

            // Handle cancellation-at-period-end vs reactivation
            if (cancelAtPeriodEnd) {
                console.log(`  ⚠️ Subscription will cancel at end of billing period`);
                // TODO: Update database — mark subscription as "canceling"
                // await db.subscriptions.update({ accountId }, {
                //     status: 'canceling',
                //     cancelAt: subscription.cancel_at,
                // });
            } else {
                // If cancel_at_period_end is false, it might be a reactivation
                console.log(`  ✅ Subscription active (or reactivated)`);
                // TODO: Update database — mark subscription as active
                // await db.subscriptions.update({ accountId }, {
                //     status: status,
                //     priceId: currentPrice?.id,
                //     quantity: currentQuantity,
                // });
            }

            break;
        }

        // ── SUBSCRIPTION DELETED ────────────────────────────────────
        // Subscription fully canceled — revoke access
        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const accountId = (subscription as Stripe.Subscription & { customer_account?: string }).customer_account;

            console.log(`[Subscription Webhook] 🚫 Subscription DELETED for account: ${accountId}`);

            // TODO: Revoke the customer's access to the product/service
            // await db.subscriptions.update({ accountId }, {
            //     status: 'canceled',
            //     canceledAt: new Date(),
            //     accessRevoked: true,
            // });

            break;
        }

        // ── INVOICE PAYMENT SUCCEEDED ───────────────────────────────
        // A recurring payment was successful
        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            const accountId = (invoice as Stripe.Invoice & { customer_account?: string }).customer_account;
            const amount = (invoice.amount_paid || 0) / 100;

            console.log(`[Subscription Webhook] 💰 Payment succeeded: $${amount} from ${accountId}`);

            // TODO: Update database — confirm payment received
            // await db.payments.create({
            //     accountId,
            //     invoiceId: invoice.id,
            //     amount,
            //     paidAt: new Date(),
            // });

            break;
        }

        // ── INVOICE PAYMENT FAILED ──────────────────────────────────
        // A payment attempt failed — take action
        case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const accountId = (invoice as Stripe.Invoice & { customer_account?: string }).customer_account;

            console.error(`[Subscription Webhook] ❌ Payment FAILED for ${accountId}`);
            console.error(`  Invoice: ${invoice.id}`);
            console.error(`  Attempt count: ${invoice.attempt_count}`);

            // TODO: Notify the account owner about the failed payment
            // TODO: Consider sending an email/SMS with a link to update payment method

            break;
        }

        // ── PAYMENT METHOD ATTACHED ─────────────────────────────────
        case "payment_method.attached": {
            const pm = event.data.object as Stripe.PaymentMethod;
            console.log(`[Subscription Webhook] 💳 Payment method attached: ${pm.type} (${pm.id})`);
            break;
        }

        // ── PAYMENT METHOD DETACHED ─────────────────────────────────
        case "payment_method.detached": {
            const pm = event.data.object as Stripe.PaymentMethod;
            console.log(`[Subscription Webhook] 💳 Payment method detached: ${pm.type} (${pm.id})`);
            break;
        }

        // ── CUSTOMER UPDATED ────────────────────────────────────────
        // Billing info or default payment method changed
        case "customer.updated": {
            const customer = event.data.object as Stripe.Customer;
            console.log(`[Subscription Webhook] 👤 Customer updated: ${customer.id}`);

            // Check the new default payment method
            const defaultPM = customer.invoice_settings?.default_payment_method;
            console.log(`  Default payment method: ${defaultPM || "none"}`);

            // IMPORTANT: Only treat this as a billing info change.
            // Do NOT use the billing email as a login credential.

            // TODO: Update relevant billing info in database
            // await db.customers.update({ stripeCustomerId: customer.id }, {
            //     defaultPaymentMethod: defaultPM,
            //     billingEmail: customer.email,
            // });

            break;
        }

        default:
            console.log(`[Subscription Webhook] Unhandled event: ${event.type}`);
    }

    // Always acknowledge receipt
    return NextResponse.json({ received: true });
}
