/**
 * ═══════════════════════════════════════════════════════════════════
 * STRIPE CONNECT DASHBOARD: /dashboard/stripe-connect
 * ═══════════════════════════════════════════════════════════════════
 *
 * This page provides a complete Stripe Connect management interface:
 *
 *   1. CREATE ACCOUNT — Create a V2 Connected Account
 *   2. ONBOARDING     — Launch hosted onboarding via Account Links
 *   3. ACCOUNT STATUS  — Live status of capabilities & requirements
 *   4. PRODUCTS       — Create products on the connected account
 *   5. STOREFRONT LINK — Link to the public store for this account
 *   6. SUBSCRIPTION   — Subscribe the connected account to the platform
 *   7. BILLING PORTAL  — Manage subscription (upgrade/downgrade/cancel)
 *
 * All account status checks hit the Stripe API directly (no DB cache).
 */

"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "../connect/connect.css";

// ─── Types ─────────────────────────────────────────────────────────

interface AccountStatus {
    accountId: string;
    displayName: string;
    email: string;
    readyToProcessPayments: boolean;
    onboardingComplete: boolean;
    requirementsStatus: string;
    cardPaymentsStatus: string;
}

interface Product {
    productId: string;
    name: string;
    description: string;
    priceId: string | null;
    unitAmount: number;
    currency: string;
}

// ─── Main Component ────────────────────────────────────────────────

function StripeConnectContent() {
    const searchParams = useSearchParams();

    // ── State ──────────────────────────────────────────────────────
    const [accountId, setAccountId] = useState<string>("");
    const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form state
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [productName, setProductName] = useState("");
    const [productDesc, setProductDesc] = useState("");
    const [productPrice, setProductPrice] = useState("");

    // ── Check URL params on mount (return from onboarding) ─────────
    useEffect(() => {
        const urlAccountId = searchParams.get("accountId");
        if (urlAccountId) {
            setAccountId(urlAccountId);
        }
        const subscribed = searchParams.get("subscribed");
        if (subscribed === "true") {
            setMsg({ type: "success", text: "🎉 Subscription activated! Welcome to BioDynamX." });
        }
        const refresh = searchParams.get("refresh");
        if (refresh === "true") {
            setMsg({ type: "error", text: "Onboarding link expired. Click 'Onboard' to get a new one." });
        }
    }, [searchParams]);

    // ── Fetch Account Status ───────────────────────────────────────
    const fetchStatus = useCallback(async (id: string) => {
        if (!id) return;
        try {
            const res = await fetch(`/api/connect/accounts?accountId=${id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch status");
            setAccountStatus(data);
        } catch (err: unknown) {
            setMsg({ type: "error", text: (err as Error).message });
        }
    }, []);

    // ── Fetch Products ─────────────────────────────────────────────
    const fetchProducts = useCallback(async (id: string) => {
        if (!id) return;
        try {
            const res = await fetch(`/api/connect/products?accountId=${id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch products");
            setProducts(data.products || []);
        } catch {
            // Non-critical — products may not exist yet
        }
    }, []);

    // Auto-fetch when accountId changes
    useEffect(() => {
        if (accountId) {
            fetchStatus(accountId);
            fetchProducts(accountId);
        }
    }, [accountId, fetchStatus, fetchProducts]);

    // ── Create Connected Account ───────────────────────────────────
    const handleCreateAccount = async () => {
        if (!displayName || !email) {
            setMsg({ type: "error", text: "Display name and email are required." });
            return;
        }
        setLoading(true);
        setMsg(null);
        try {
            const res = await fetch("/api/connect/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayName, email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create account");
            setAccountId(data.accountId);
            setMsg({ type: "success", text: `✅ Account created: ${data.accountId}` });
            // Fetch fresh status
            fetchStatus(data.accountId);
        } catch (err: unknown) {
            setMsg({ type: "error", text: (err as Error).message });
        } finally {
            setLoading(false);
        }
    };

    // ── Start Onboarding ───────────────────────────────────────────
    const handleOnboard = async () => {
        if (!accountId) return;
        setLoading(true);
        try {
            const res = await fetch("/api/connect/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create onboarding link");
            // Redirect to Stripe hosted onboarding
            window.location.href = data.url;
        } catch (err: unknown) {
            setMsg({ type: "error", text: (err as Error).message });
            setLoading(false);
        }
    };

    // ── Create Product ─────────────────────────────────────────────
    const handleCreateProduct = async () => {
        if (!productName || !productPrice) {
            setMsg({ type: "error", text: "Product name and price are required." });
            return;
        }
        setLoading(true);
        setMsg(null);
        try {
            const priceInCents = Math.round(parseFloat(productPrice) * 100);
            const res = await fetch("/api/connect/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accountId,
                    name: productName,
                    description: productDesc,
                    priceInCents,
                    currency: "usd",
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create product");
            setMsg({ type: "success", text: `✅ Product "${data.name}" created!` });
            setProductName("");
            setProductDesc("");
            setProductPrice("");
            fetchProducts(accountId);
        } catch (err: unknown) {
            setMsg({ type: "error", text: (err as Error).message });
        } finally {
            setLoading(false);
        }
    };

    // ── Subscribe to Platform ──────────────────────────────────────
    const handleSubscribe = async () => {
        if (!accountId) return;
        setLoading(true);
        try {
            const res = await fetch("/api/connect/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create subscription checkout");
            window.location.href = data.url;
        } catch (err: unknown) {
            setMsg({ type: "error", text: (err as Error).message });
            setLoading(false);
        }
    };

    // ── Open Billing Portal ────────────────────────────────────────
    const handleBillingPortal = async () => {
        if (!accountId) return;
        setLoading(true);
        try {
            const res = await fetch("/api/connect/billing-portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to open billing portal");
            window.location.href = data.url;
        } catch (err: unknown) {
            setMsg({ type: "error", text: (err as Error).message });
            setLoading(false);
        }
    };

    // ── Format Price ───────────────────────────────────────────────
    const formatPrice = (amount: number, currency: string) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount / 100);

    // ── Render ─────────────────────────────────────────────────────
    return (
        <div className="connect-page">
            <div className="back-link">
                <a href="/dashboard">← Back to Dashboard</a>
            </div>

            <div className="connect-header">
                <h1>💳 Stripe Connect</h1>
                <p className="subtitle">
                    Create connected accounts, onboard sellers, manage products & subscriptions
                </p>
            </div>

            {msg && <div className={`connect-msg ${msg.type}`}>{msg.text}</div>}

            {/* ══════════════════════════════════════════════════════
                SECTION 1: Create Connected Account
                ══════════════════════════════════════════════════════ */}
            <div className="connect-card">
                <div className="card-header">
                    <div className="card-icon stripe">🏦</div>
                    <div className="card-title-wrap">
                        <div className="card-title">Create Connected Account</div>
                        <div className="card-subtitle">
                            V2 API — creates a connected account with card_payments capability
                        </div>
                    </div>
                </div>

                {!accountId ? (
                    <div className="connect-form">
                        <div className="form-row">
                            <input
                                className="connect-input"
                                placeholder="Business Display Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                            <input
                                className="connect-input"
                                placeholder="Contact Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            className="connect-btn green"
                            onClick={handleCreateAccount}
                            disabled={loading}
                        >
                            {loading ? <><span className="connect-spinner" /> Creating...</> : "Create Account"}
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="status-row">
                            <span className="status-badge active">
                                Account: {accountId}
                            </span>
                        </div>
                        <p className="card-subtitle">
                            To manage a different account, enter the ID:
                        </p>
                        <div className="form-row">
                            <input
                                className="connect-input"
                                placeholder="acct_..."
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                            />
                            <button
                                className="connect-btn outline"
                                onClick={() => fetchStatus(accountId)}
                            >
                                Refresh Status
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════
                SECTION 2: Onboarding & Account Status
                ══════════════════════════════════════════════════════ */}
            {accountId && (
                <div className="connect-card">
                    <div className="card-header">
                        <div className="card-icon google">📋</div>
                        <div className="card-title-wrap">
                            <div className="card-title">Onboarding & Status</div>
                            <div className="card-subtitle">
                                Status is fetched directly from the Stripe API (not cached)
                            </div>
                        </div>
                    </div>

                    {accountStatus ? (
                        <>
                            <div className="status-row">
                                <span className={`status-badge ${accountStatus.onboardingComplete ? "active" : "pending"}`}>
                                    Onboarding: {accountStatus.onboardingComplete ? "Complete ✓" : "Incomplete"}
                                </span>
                                <span className={`status-badge ${accountStatus.readyToProcessPayments ? "active" : "inactive"}`}>
                                    Payments: {accountStatus.readyToProcessPayments ? "Active ✓" : "Not Ready"}
                                </span>
                                <span className={`status-badge ${accountStatus.cardPaymentsStatus === "active" ? "active" : "pending"}`}>
                                    Card Payments: {accountStatus.cardPaymentsStatus}
                                </span>
                                <span className={`status-badge info`}>
                                    Requirements: {accountStatus.requirementsStatus}
                                </span>
                            </div>

                            {!accountStatus.onboardingComplete && (
                                <button
                                    className="connect-btn green"
                                    onClick={handleOnboard}
                                    disabled={loading}
                                >
                                    {loading ? <><span className="connect-spinner" /> Loading...</> : "🚀 Onboard to Collect Payments"}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="card-body">
                            <p>Loading account status... <span className="connect-spinner" /></p>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                SECTION 3: Subscription & Billing
                ══════════════════════════════════════════════════════ */}
            {accountId && (
                <div className="connect-card">
                    <div className="card-header">
                        <div className="card-icon stripe">🔄</div>
                        <div className="card-title-wrap">
                            <div className="card-title">Platform Subscription</div>
                            <div className="card-subtitle">
                                Subscribe this connected account to BioDynamX (uses customer_account)
                            </div>
                        </div>
                    </div>

                    <div className="card-actions">
                        <button className="connect-btn blue" onClick={handleSubscribe} disabled={loading}>
                            Subscribe to BioDynamX
                        </button>
                        <button className="connect-btn outline" onClick={handleBillingPortal} disabled={loading}>
                            Manage Subscription →
                        </button>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                SECTION 4: Create Products
                ══════════════════════════════════════════════════════ */}
            {accountId && accountStatus?.readyToProcessPayments && (
                <div className="connect-card">
                    <div className="card-header">
                        <div className="card-icon gemini">📦</div>
                        <div className="card-title-wrap">
                            <div className="card-title">Create Product</div>
                            <div className="card-subtitle">
                                Products are created on the connected account via Stripe-Account header
                            </div>
                        </div>
                    </div>

                    <div className="connect-form">
                        <div className="form-row">
                            <input
                                className="connect-input"
                                placeholder="Product Name"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                            <input
                                className="connect-input"
                                placeholder="Price (USD, e.g. 29.99)"
                                type="number"
                                step="0.01"
                                min="0.50"
                                value={productPrice}
                                onChange={(e) => setProductPrice(e.target.value)}
                            />
                        </div>
                        <input
                            className="connect-input"
                            placeholder="Description (optional)"
                            value={productDesc}
                            onChange={(e) => setProductDesc(e.target.value)}
                        />
                        <button
                            className="connect-btn green"
                            onClick={handleCreateProduct}
                            disabled={loading || !productName || !productPrice}
                        >
                            {loading ? <><span className="connect-spinner" /> Creating...</> : "Create Product"}
                        </button>
                    </div>

                    {products.length > 0 && (
                        <>
                            <hr className="connect-hr" />
                            <h3 className="card-title">Products on this account</h3>
                            <div className="product-grid">
                                {products.map((p) => (
                                    <div key={p.productId} className="product-card">
                                        <div className="product-name">{p.name}</div>
                                        {p.description && <div className="product-desc">{p.description}</div>}
                                        <div className="product-price">
                                            {formatPrice(p.unitAmount, p.currency)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                SECTION 5: Storefront Link
                ══════════════════════════════════════════════════════ */}
            {accountId && products.length > 0 && (
                <div className="connect-card">
                    <div className="card-header">
                        <div className="card-icon supabase">🛒</div>
                        <div className="card-title-wrap">
                            <div className="card-title">Storefront</div>
                            <div className="card-subtitle">
                                Public page where customers can browse and buy products
                            </div>
                        </div>
                    </div>
                    <div className="card-actions">
                        <a
                            href={`/store/${accountId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-connect primary"
                        >
                            Open Storefront →
                        </a>
                    </div>
                    <p className="card-subtitle" style={{ marginTop: "0.75rem" }}>
                        {/* NOTE: In production, use a friendly slug (e.g., /store/my-shop)
                            instead of the raw Stripe account ID in the URL.
                            Map the slug to the account ID in your database. */}
                        URL: <code className="step-content">/store/{accountId}</code>
                    </p>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                SECTION 6: Webhook Setup Instructions
                ══════════════════════════════════════════════════════ */}
            <div className="setup-instructions setup-meta">
                <h2>🔔 Webhook Setup</h2>

                <div className="setup-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                        <h3>V2 Account Events (Thin Events)</h3>
                        <p>
                            In <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer">
                                Stripe Dashboard → Webhooks</a> → + Add destination
                            <br />
                            Events from: <strong>Connected accounts</strong>
                            <br />
                            Show advanced options → Payload style: <strong>Thin</strong>
                            <br />
                            Select: <code>v2.account[requirements].updated</code>,{" "}
                            <code>v2.account[configuration.merchant].capability_status_updated</code>,{" "}
                            <code>v2.account[configuration.customer].capability_status_updated</code>
                            <br />
                            Endpoint: <code>https://biodynamx.com/api/connect/webhooks/accounts</code>
                        </p>
                    </div>
                </div>

                <div className="setup-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                        <h3>Subscription Events (Standard)</h3>
                        <p>
                            Create another webhook endpoint for subscription lifecycle events.
                            <br />
                            Select: <code>customer.subscription.updated</code>,{" "}
                            <code>customer.subscription.deleted</code>,{" "}
                            <code>invoice.payment_succeeded</code>,{" "}
                            <code>invoice.payment_failed</code>
                            <br />
                            Endpoint: <code>https://biodynamx.com/api/connect/webhooks/subscriptions</code>
                        </p>
                    </div>
                </div>

                <div className="setup-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                        <h3>Local Testing (Stripe CLI)</h3>
                        <p>
                            For thin events:
                            <br />
                            <code>
                                stripe listen --thin-events
                                &apos;v2.core.account[requirements].updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated&apos;
                                --forward-thin-to http://localhost:3001/api/connect/webhooks/accounts
                            </code>
                            <br /><br />
                            For subscription events:
                            <br />
                            <code>
                                stripe listen --forward-to http://localhost:3001/api/connect/webhooks/subscriptions
                            </code>
                        </p>
                    </div>
                </div>

                <div className="setup-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                        <h3>Environment Variables</h3>
                        <p>
                            Add these to <code>.env.local</code>:
                            <br />
                            <code>STRIPE_SECRET_KEY=sk_test_...</code>
                            <br />
                            <code>STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...</code> (thin events)
                            <br />
                            <code>STRIPE_WEBHOOK_SECRET=whsec_...</code> (subscription events)
                            <br />
                            <code>STRIPE_SUBSCRIPTION_PRICE_ID=price_...</code> (platform subscription)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page Export with Suspense ──────────────────────────────────────

export default function StripeConnectPage() {
    return (
        <Suspense
            fallback={
                <div className="connect-page">
                    <p className="card-subtitle" style={{ textAlign: "center", padding: "4rem" }}>
                        Loading Stripe Connect...
                    </p>
                </div>
            }
        >
            <StripeConnectContent />
        </Suspense>
    );
}
