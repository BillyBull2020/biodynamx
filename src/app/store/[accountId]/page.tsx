/**
 * ═══════════════════════════════════════════════════════════════════
 * STOREFRONT: /store/[accountId]
 * ═══════════════════════════════════════════════════════════════════
 *
 * Public-facing storefront for a connected account's products.
 * Customers can browse products and click "Buy" to checkout.
 *
 * NOTE: The URL uses the connected account's Stripe ID (acct_...)
 * for this demo. In production, you should use a more user-friendly
 * identifier (like a slug or username) and map it to the account ID
 * in your database.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import "./store.css";

interface Product {
    productId: string;
    name: string;
    description: string;
    images: string[];
    priceId: string | null;
    unitAmount: number;
    currency: string;
}

export default function StorefrontPage() {
    // NOTE: In production, use a friendly slug instead of the raw Stripe account ID.
    // Map the slug to the account ID in your database.
    const params = useParams();
    const accountId = params.accountId as string;
    const searchParams = useSearchParams();
    const canceled = searchParams.get("canceled");

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [buyingId, setBuyingId] = useState<string | null>(null);

    // ── Load products from the connected account ──────────────────
    useEffect(() => {
        if (!accountId) return;

        const fetchProducts = async () => {
            try {
                const res = await fetch(`/api/connect/products?accountId=${accountId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to load products");
                setProducts(data.products || []);
            } catch (err: unknown) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [accountId]);

    // ── Handle Buy (Direct Charge Checkout) ───────────────────────
    const handleBuy = async (product: Product) => {
        setBuyingId(product.productId);

        try {
            const res = await fetch("/api/connect/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accountId,
                    productName: product.name,
                    unitAmount: product.unitAmount,
                    currency: product.currency,
                    quantity: 1,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Checkout failed");

            // Redirect to Stripe hosted Checkout
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setBuyingId(null);
        }
    };

    // ── Format price for display ──────────────────────────────────
    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    return (
        <div className="store-page">
            <div className="store-header">
                <h1>Store</h1>
                <p className="store-subtitle">Browse and purchase products</p>
            </div>

            {canceled && (
                <div className="connect-msg error">
                    Checkout was canceled. Feel free to try again.
                </div>
            )}

            {error && <div className="connect-msg error">{error}</div>}

            {loading ? (
                <div className="store-loading">
                    <div className="connect-spinner" /> Loading products...
                </div>
            ) : products.length === 0 ? (
                <div className="store-empty">
                    <p>No products available yet.</p>
                </div>
            ) : (
                <div className="store-grid">
                    {products.map((product) => (
                        <div key={product.productId} className="store-product">
                            <div className="store-product-info">
                                <h3 className="product-name">{product.name}</h3>
                                {product.description && (
                                    <p className="product-desc">{product.description}</p>
                                )}
                                <div className="product-price">
                                    {formatPrice(product.unitAmount, product.currency)}
                                </div>
                            </div>
                            <button
                                className="connect-btn green"
                                onClick={() => handleBuy(product)}
                                disabled={buyingId === product.productId || !product.priceId}
                            >
                                {buyingId === product.productId ? (
                                    <><span className="connect-spinner" /> Processing...</>
                                ) : (
                                    "Buy Now"
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
