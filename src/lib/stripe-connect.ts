/**
 * ═══════════════════════════════════════════════════════════════════
 * STRIPE CONNECT — Shared Client & Helpers
 * ═══════════════════════════════════════════════════════════════════
 *
 * This module provides a single Stripe Client instance used by all
 * Connect-related API routes. Using a "Stripe Client" pattern ensures
 * consistent authentication and versioning across the application.
 *
 * SETUP:
 *   1. Set STRIPE_SECRET_KEY in your .env.local file
 *      Get from: https://dashboard.stripe.com/apikeys
 *   2. Set STRIPE_CONNECT_WEBHOOK_SECRET for thin-event webhook verification
 *      Get from: Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret
 *   3. Set STRIPE_SUBSCRIPTION_PRICE_ID for the platform subscription product
 *      Create a product+price in Stripe Dashboard → Products
 */

import Stripe from "stripe";

// ─── Stripe Client (singleton) ─────────────────────────────────────
// All requests go through this client. The API version is set
// automatically by the SDK (v20.4.0 → API version 2026-02-25.clover).

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
    console.error(
        "⚠️ STRIPE_SECRET_KEY is not set. " +
        "Get your key from https://dashboard.stripe.com/apikeys and add it to .env.local"
    );
}

/**
 * The shared Stripe Client used for all requests.
 * This ensures consistent auth and avoids creating multiple instances.
 */
export const stripeClient = new Stripe(STRIPE_SECRET_KEY || "");

// ─── Webhook Secrets ───────────────────────────────────────────────

/**
 * Secret for verifying Connect thin-event webhooks (V2 account events).
 * Set this in .env.local after creating your webhook endpoint in the
 * Stripe Dashboard under Developers → Webhooks.
 */
export const CONNECT_WEBHOOK_SECRET = process.env.STRIPE_CONNECT_WEBHOOK_SECRET || "";

/**
 * Secret for verifying standard (fat) subscription webhooks.
 * This is the same secret used by your existing stripe-webhook endpoint.
 */
export const SUBSCRIPTION_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// ─── Platform Subscription Price ───────────────────────────────────

/**
 * The Price ID for the platform subscription that connected accounts
 * subscribe to. Create this in Stripe Dashboard → Products.
 *
 * PLACEHOLDER: Replace with your actual Price ID.
 * Example: "price_1ABC123def456..."
 */
export const PLATFORM_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID || "";

if (!PLATFORM_PRICE_ID) {
    console.warn(
        "⚠️ STRIPE_SUBSCRIPTION_PRICE_ID is not set. " +
        "Create a subscription product in Stripe Dashboard → Products, " +
        "then add the Price ID to .env.local"
    );
}

// ─── App URL Helper ────────────────────────────────────────────────

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";

// ─── Application Fee ───────────────────────────────────────────────

/**
 * The platform's application fee percentage (as a decimal).
 * 10% = 0.10. Applied as a flat amount on each direct charge.
 */
export const APPLICATION_FEE_PERCENT = 0.10; // 10% platform fee
