/**
 * ═══════════════════════════════════════════════════════════════════
 * API: /api/connect/products
 * ═══════════════════════════════════════════════════════════════════
 *
 * POST — Create a product on a connected account
 * GET  — List products on a connected account
 *
 * Products are created ON the connected account using the
 * `stripeAccount` header. This means the product lives in the
 * connected account's Stripe Dashboard, not the platform's.
 */

import { NextRequest, NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe-connect";

// ─── POST: Create a Product on Connected Account ───────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { accountId, name, description, priceInCents, currency } = body;

        // Validate required fields
        if (!accountId || !name || !priceInCents) {
            return NextResponse.json(
                { error: "accountId, name, and priceInCents are required" },
                { status: 400 }
            );
        }

        // Create the product with a default price on the CONNECTED account
        // The { stripeAccount: accountId } option sets the Stripe-Account header,
        // which means this product is created in the connected account's Stripe,
        // not the platform's Stripe.
        const product = await stripeClient.products.create(
            {
                name,
                description: description || "",
                // default_price_data creates a Price object alongside the Product
                default_price_data: {
                    unit_amount: priceInCents,
                    currency: currency || "usd",
                },
            },
            {
                // This sets the Stripe-Account header → product lives on the connected account
                stripeAccount: accountId,
            }
        );

        console.log(`[Connect] 📦 Product "${name}" created on ${accountId}: ${product.id}`);

        return NextResponse.json({
            productId: product.id,
            name: product.name,
            description: product.description,
            priceId: typeof product.default_price === "string"
                ? product.default_price
                : product.default_price?.id,
            priceInCents,
            currency: currency || "usd",
        });
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("[Connect] Product creation failed:", error.message);
        return NextResponse.json(
            { error: "Failed to create product", details: error.message },
            { status: 500 }
        );
    }
}

// ─── GET: List Products on Connected Account ───────────────────────
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
        return NextResponse.json(
            { error: "accountId query parameter is required" },
            { status: 400 }
        );
    }

    try {
        // List active products with their default price expanded
        // Using stripeAccount to query the connected account's products
        const products = await stripeClient.products.list(
            {
                limit: 20,
                active: true,
                // Expand default_price so we get the price amount in the response
                expand: ["data.default_price"],
            },
            {
                // Stripe-Account header → reads from the connected account
                stripeAccount: accountId,
            }
        );

        // Map to a clean response shape
        const items = products.data.map((p) => {
            const price = typeof p.default_price === "object" && p.default_price
                ? p.default_price
                : null;

            return {
                productId: p.id,
                name: p.name,
                description: p.description,
                images: p.images,
                priceId: price?.id || null,
                unitAmount: price?.unit_amount || 0,
                currency: price?.currency || "usd",
            };
        });

        return NextResponse.json({ products: items });
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("[Connect] Product listing failed:", error.message);
        return NextResponse.json(
            { error: "Failed to list products", details: error.message },
            { status: 500 }
        );
    }
}
