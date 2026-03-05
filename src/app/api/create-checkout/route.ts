import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey || secretKey.includes("placeholder")) {
        console.log("[Checkout] ⚠️ Using mock mode — no live Stripe key");
        return NextResponse.json({
            url: "/success?plan=BioDynamX+Growth+Engine&amount=$497/mo",
            mock: true,
        });
    }

    const stripe = new Stripe(secretKey);

    // Parse optional body for plan selection
    let planName = "BioDynamX Growth Engine";
    let amount = 49700; // $497.00
    let description = "Full AI automation platform: AI Voice Agents, CRM, Funnels, Email/SMS Marketing, Scheduling, Reputation Management, Workflow Automation, Analytics Dashboard, and 5x ROI Guarantee.";

    try {
        const body = await req.json().catch(() => ({}));
        if (body.plan === "enterprise") {
            planName = "BioDynamX Enterprise";
            amount = 149700; // $1,497.00
            description = "Everything in Growth Engine plus Custom Software Development, Commercial & Video Production, Full SEO/AEO/GEO Management, Membership Platform, White-Label Branding, and Dedicated Account Manager.";
        }
    } catch {
        // Use defaults
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: planName,
                            description,
                        },
                        unit_amount: amount,
                        recurring: { interval: "month" },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/success?plan=${encodeURIComponent(planName)}&amount=$${(amount / 100).toFixed(0)}/mo&checkout=success`,
            cancel_url: `${baseUrl}/?checkout=cancel`,
            allow_promotion_codes: true,
            billing_address_collection: "required",
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        const stripeErr = err as { message?: string; type?: string; code?: string };
        console.error("Stripe checkout error:", stripeErr.message, stripeErr.type, stripeErr.code);
        return NextResponse.json(
            { error: "Failed to create checkout session", details: stripeErr.message || String(err) },
            { status: 500 }
        );
    }
}
