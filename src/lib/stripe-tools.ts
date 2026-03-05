import Stripe from "stripe";
import { NextResponse } from "next/server";

// Stripe tools for agent-triggered checkout
// The secret key is loaded from environment
const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    return new Stripe(key);
};

export const stripeTools = {
    createCheckout: async (amount: number = 49700, productName: string = "BioDynamX ROI Acceleration") => {
        const stripe = getStripe();
        if (!stripe) {
            return { error: "Stripe not configured", checkoutUrl: null };
        }

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [{
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: productName,
                            description: "Full access to AI voice agents, multi-agent orchestration, real-time analytics, and the 5x ROI guarantee.",
                        },
                        unit_amount: amount,
                        recurring: { interval: "month" },
                    },
                    quantity: 1,
                }],
                mode: "subscription",
                success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/?checkout=success`,
                cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/?checkout=cancel`,
            });

            return { checkoutUrl: session.url, error: null };
        } catch (err) {
            console.error("Stripe checkout error:", err);
            return { error: String(err), checkoutUrl: null };
        }
    },
};

// API route handler for the create_checkout function call
export async function POST() {
    const result = await stripeTools.createCheckout();

    if (result.error) {
        return NextResponse.json(
            { error: result.error },
            { status: result.checkoutUrl ? 200 : 500 }
        );
    }

    return NextResponse.json({ url: result.checkoutUrl });
}
