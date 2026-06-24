// ════════════════════════════════════════════════════════════════
// /api/stripe/webhook/route.ts — ProStorm Patrol Stripe Webhook
// ════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = 'force-static';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("[stripe-webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[stripe-webhook] Checkout completed:", session.id);
        
        // Territory is locked in session metadata
        const territoryZip = session.metadata?.territory_zip;
        const customerId = session.customer as string;
        
        if (territoryZip) {
          // Here you would update your database to mark territory as assigned
          // For now, log it
          console.log(`[stripe-webhook] Territory ${territoryZip} assigned to customer ${customerId}`);
          
          // You could also:
          // - Send welcome email
          // - Create contractor account
          // - Send territory confirmation
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const territoryZip = subscription.metadata?.territory_zip;
        const status = subscription.status;
        
        console.log(`[stripe-webhook] Subscription ${subscription.id} ${event.type}: ${status} for ZIP ${territoryZip}`);
        
        // Update territory status in your database
        // If status is 'past_due', 'canceled', 'unpaid' -> mark territory as available again
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const territoryZip = subscription.metadata?.territory_zip;
        
        console.log(`[stripe-webhook] Subscription canceled for ZIP ${territoryZip} - territory now available`);
        
        // Mark territory as available in your database
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe-webhook] Payment failed for invoice ${invoice.id}`);
        // Send dunning email
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe-webhook] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}