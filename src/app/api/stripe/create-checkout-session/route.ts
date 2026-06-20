// ════════════════════════════════════════════════════════════════
// /api/stripe/create-checkout-session/route.ts — ProStorm Patrol Checkout
// ════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId, territoryZip, contractorEmail } = body;

    if (!priceId || !territoryZip) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create or retrieve customer
    let customerId: string;
    if (contractorEmail) {
      const existingCustomers = await stripe.customers.list({ email: contractorEmail, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: contractorEmail,
          metadata: { territory_zip: territoryZip },
        });
        customerId = customer.id;
      }
    } else {
      const customer = await stripe.customers.create({
        metadata: { territory_zip: territoryZip },
      });
      customerId = customer.id;
    }

    // Update customer metadata with territory
    await stripe.customers.update(customerId, {
      metadata: { territory_zip: territoryZip },
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        territory_zip: territoryZip,
        source: "storm_shield_signup",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/storm?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/storm?checkout=canceled`,
      subscription_data: {
        metadata: {
          territory_zip: territoryZip,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("[stripe-checkout] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}