import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClientAccount } from "@/lib/client-auth";
import { sendSMS } from "@/lib/twilio";
import { sendLeadAlert } from "@/lib/lead-alerts";
import { sendWelcomeEmail } from "@/lib/resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
        console.error("[Stripe Webhook] ⚠️ Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const email = session.customer_email;
            const customerName = session.customer_details?.name;
            const amount = (session.amount_total || 0) / 100;
            const plan = amount >= 1400 ? "BioDynamX Enterprise" : "BioDynamX Growth Engine";

            console.log(`[Stripe Webhook] ✅ Checkout completed!`);
            console.log(`  Customer: ${email} (${customerName})`);
            console.log(`  Plan: ${plan} ($${amount}/mo)`);
            console.log(`  Subscription: ${session.subscription}`);

            // ── Create client account + portal access ──────────
            let userId: string | null = null;
            if (email) {
                try {
                    const result = await createClientAccount({
                        email,
                        name: customerName || undefined,
                        plan,
                        stripeCustomerId: session.customer as string,
                        stripeSubscriptionId: session.subscription as string,
                    });
                    userId = result.userId;
                    console.log(`[Stripe Webhook] 🎉 Client account created: ${userId}`);
                } catch (err) {
                    console.error("[Stripe Webhook] Failed to create client account:", err);
                }

                // ── Record initial ROI event (onboarding) ───────
                if (userId) {
                    try {
                        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com"}/api/client-roi`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                clientId: userId,
                                type: "onboarding",
                                amount: 0,
                                description: `Welcome aboard! ${plan} activated. Your 6x ROI journey begins now.`,
                                agentName: "system",
                            }),
                        });
                    } catch { /* non-critical */ }
                }

                // ── Send welcome email (Resend) ─────────────────────────────
                sendWelcomeEmail({
                    to: email,
                    name: customerName || "Valued Client",
                    plan,
                    portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com"}/portal`,
                    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com"}/dashboard/client`,
                }).catch(err => console.error("[Stripe Webhook] Welcome email failed:", err));

                // ── Send welcome SMS ────────────────────────────────────────
                const phone = session.customer_details?.phone;
                if (phone) {
                    sendSMS(phone,
                        `🎉 Welcome to BioDynamX, ${customerName || "friend"}! Your ${plan} is now active. ` +
                        `Log in to your client portal: https://biodynamx.com/portal\n\n` +
                        `Your AI team (Aria, Jenny, Mark, Sarah & Billy) starts working for you immediately. ` +
                        `Check your ROI dashboard here: https://biodynamx.com/dashboard/client\n\n` +
                        `— Team BioDynamX`
                    ).catch(err => console.error("[Stripe Webhook] Welcome SMS failed:", err));
                }

                // ── Alert the team ──────────────────────────────
                sendLeadAlert({
                    name: customerName || undefined,
                    email,
                    phone: phone || undefined,
                    source: "stripe_purchase",
                    urgency: "hot",
                }).catch(err => console.error("[Stripe Webhook] Alert failed:", err));

                // ── Dispatch background service delivery ─────────
                // Fire-and-forget: kick off the actual work
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";
                const metaDict = session.metadata || {};

                // Kick off website design if businessUrl was passed in metadata
                if (metaDict.businessName || metaDict.businessUrl) {
                    fetch(`${appUrl}/api/stitch-website`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "create",
                            businessName: metaDict.businessName || customerName || "New Client",
                            industry: metaDict.industry || "Business",
                            description: metaDict.businessDescription || "Local business needing a premium web presence.",
                            primaryCTA: "Book a Free Consultation",
                        }),
                    }).catch(() => { /* non-critical */ });
                }

                // Kick off initial audit if URL was provided
                if (metaDict.businessUrl) {
                    fetch(`${appUrl}/api/audit`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: metaDict.businessUrl, clientId: userId }),
                    }).catch(() => { /* non-critical */ });
                }

                console.log(`[Stripe Webhook] 🚀 Full service delivery pipeline dispatched for ${email}`);
            }
            break;
        }

        case "customer.subscription.created": {
            const subscription = event.data.object as Stripe.Subscription;
            console.log(`[Stripe Webhook] 🎉 New subscription: ${subscription.id} (${subscription.status})`);
            break;
        }

        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            console.log(`[Stripe Webhook] 💰 Payment: $${(invoice.amount_paid || 0) / 100} from ${invoice.customer_email || invoice.customer}`);

            // Record monthly renewal as ROI event confirmation
            const custEmail = invoice.customer_email;
            if (custEmail && (invoice as Stripe.Invoice & { subscription?: string }).subscription) {
                // Fire-and-forget monthly renewal notification
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";
                fetch(`${appUrl}/api/send-report`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: custEmail,
                        period: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                        agentName: "system",
                        trigger: "monthly_renewal",
                    }),
                }).catch(() => { /* non-critical */ });
            }
            break;
        }

        case "invoice.payment_failed": {
            const failedInvoice = event.data.object as Stripe.Invoice;
            console.error(`[Stripe Webhook] ❌ Payment FAILED: ${failedInvoice.customer_email || failedInvoice.customer}`);

            // Alert team
            sendLeadAlert({
                email: failedInvoice.customer_email || undefined,
                source: "payment_failed",
                urgency: "hot",
            }).catch(() => { /* silent */ });
            break;
        }

        case "customer.subscription.deleted": {
            const cancelledSub = event.data.object as Stripe.Subscription;
            console.log(`[Stripe Webhook] 🚫 Subscription cancelled: ${cancelledSub.id}`);

            // Alert team
            sendLeadAlert({
                source: "subscription_cancelled",
                urgency: "hot",
            }).catch(() => { /* silent */ });
            break;
        }

        default:
            console.log(`[Stripe Webhook] Unhandled: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
