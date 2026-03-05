/**
 * ═══════════════════════════════════════════════════════════════════
 * API: /api/connect/webhooks/accounts
 * ═══════════════════════════════════════════════════════════════════
 *
 * Handles V2 "thin" events for connected account requirement changes.
 *
 * THIN EVENTS (V2):
 *   Thin events contain only the event ID and type — no payload.
 *   You must fetch the full event data using client.v2.core.events.retrieve().
 *
 * EVENTS HANDLED:
 *   - v2.core.account[requirements].updated
 *       → Requirements have changed (e.g., regulatory changes)
 *   - v2.core.account[configuration.merchant].capability_status_updated
 *       → A merchant capability status changed (active, inactive, pending)
 *   - v2.core.account[configuration.customer].capability_status_updated
 *       → A customer capability status changed
 *
 * SETUP:
 *   1. In Stripe Dashboard → Developers → Webhooks → + Add destination
 *   2. Select "Connected accounts" in the "Events from" section
 *   3. Click "Show advanced options" → Payload style: select "Thin"
 *   4. Search for "v2" and select:
 *      - v2.account[requirements].updated
 *      - v2.account[configuration.merchant].capability_status_updated
 *      - v2.account[configuration.customer].capability_status_updated
 *   5. Set endpoint URL: https://biodynamx.com/api/connect/webhooks/accounts
 *   6. Copy the Signing Secret → set as STRIPE_CONNECT_WEBHOOK_SECRET in .env.local
 *
 * LOCAL TESTING (Stripe CLI):
 *   stripe listen --thin-events \
 *     'v2.core.account[requirements].updated,\
 *      v2.core.account[configuration.recipient].capability_status_updated,\
 *      v2.core.account[configuration.merchant].capability_status_updated,\
 *      v2.core.account[configuration.customer].capability_status_updated' \
 *     --forward-thin-to http://localhost:3001/api/connect/webhooks/accounts
 */

import { NextRequest, NextResponse } from "next/server";
import { stripeClient, CONNECT_WEBHOOK_SECRET } from "@/lib/stripe-connect";

export async function POST(req: NextRequest) {
    // Step 1: Read the raw request body and Stripe signature
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        console.error("[Connect Webhook] Missing stripe-signature header");
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!CONNECT_WEBHOOK_SECRET) {
        console.error(
            "[Connect Webhook] ⚠️ STRIPE_CONNECT_WEBHOOK_SECRET is not set. " +
            "Add it to .env.local from Stripe Dashboard → Developers → Webhooks → Signing secret"
        );
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    try {
        // Step 2: Parse the thin event using the Stripe Client
        // parseEventNotification verifies the signature and returns an event notification
        // containing only { id, type } — no payload data.
        // NOTE: In SDK v20.4.0+, this was renamed from parseThinEvent to parseEventNotification.
        const eventNotification = stripeClient.parseEventNotification(
            body,
            sig,
            CONNECT_WEBHOOK_SECRET
        );

        console.log(`[Connect Webhook] 📨 Event notification received: ${eventNotification.type} (${eventNotification.id})`);

        // Step 3: Fetch the FULL event data from Stripe
        // Event notifications don't include the payload — we must retrieve it
        const event = await stripeClient.v2.core.events.retrieve(eventNotification.id);

        console.log(`[Connect Webhook] 📋 Full event type: ${event.type}`);

        // Step 4: Handle each event type
        // NOTE: Event types use bracket notation (e.g., [requirements], [configuration.merchant])
        switch (event.type) {
            // ── Requirements Updated ────────────────────────────────
            // This fires when account requirements change due to
            // regulatory updates, card network changes, etc.
            case "v2.core.account[requirements].updated": {
                const relatedObject = event.related_object;
                const accountId = relatedObject?.id;

                console.log(`[Connect Webhook] 📝 Requirements updated for account: ${accountId}`);

                if (accountId) {
                    // Fetch the latest account state to see what's needed
                    const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
                        include: ["requirements"],
                    });

                    const reqStatus = account.requirements?.summary?.minimum_deadline?.status;

                    console.log(`[Connect Webhook]   Requirements status: ${reqStatus}`);

                    // TODO: If you have a database, update the account's onboarding status:
                    // await db.accounts.update({ stripeAccountId: accountId }, {
                    //     requirementsStatus: reqStatus,
                    //     requirementsUpdatedAt: new Date(),
                    // });

                    // TODO: If requirements are "currently_due" or "past_due",
                    // notify the connected account owner via email/SMS that they
                    // need to complete additional verification.
                    if (reqStatus === "currently_due" || reqStatus === "past_due") {
                        console.warn(
                            `[Connect Webhook] ⚠️ Account ${accountId} has ${reqStatus} requirements!`
                        );
                    }
                }
                break;
            }

            // ── Merchant Capability Status Updated ──────────────────
            // Fires when a merchant capability (e.g., card_payments) changes status
            case "v2.core.account[configuration.merchant].capability_status_updated": {
                const relatedObject = event.related_object;
                const accountId = relatedObject?.id;

                console.log(`[Connect Webhook] 🏪 Merchant capability updated for: ${accountId}`);

                if (accountId) {
                    const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
                        include: ["configuration.merchant"],
                    });

                    const cardStatus =
                        account?.configuration?.merchant?.capabilities?.card_payments?.status;

                    console.log(`[Connect Webhook]   card_payments status: ${cardStatus}`);

                    // TODO: Update database with new capability status
                    // await db.accounts.update({ stripeAccountId: accountId }, {
                    //     cardPaymentsStatus: cardStatus,
                    // });
                }
                break;
            }

            // ── Customer Capability Status Updated ──────────────────
            // Fires when a customer capability changes status
            case "v2.core.account[configuration.customer].capability_status_updated": {
                const relatedObject = event.related_object;
                const accountId = relatedObject?.id;

                console.log(`[Connect Webhook] 👤 Customer capability updated for: ${accountId}`);

                // TODO: Handle customer capability updates if needed
                // This is relevant for subscriptions/billing portal access
                break;
            }

            default:
                console.log(`[Connect Webhook] Unhandled event type: ${event.type}`);
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("[Connect Webhook] Processing failed:", error.message);
        return NextResponse.json(
            { error: "Webhook processing failed", details: error.message },
            { status: 400 }
        );
    }
}
