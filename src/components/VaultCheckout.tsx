"use client";

/**
 * VaultCheckout — BioDynamX "Bottom Sheet" Stripe Checkout
 * ──────────────────────────────────────────────────────────
 * Mobile-native slide-up modal. Zero redirect. Obsidian dark.
 * 
 * Triggered via: window.dispatchEvent(new CustomEvent("bdx:vault-checkout"))
 *   -or- bdx:one-call-close (after OneCallClose agent sequence completes)
 * 
 * CSS lives in VaultUI.css (#biodynamx-vault-checkout)
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ── Stripe URL — update with actual checkout link ──
const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/biodynamx"; // placeholder

interface VaultCheckoutProps {
    stripeUrl?: string;
}

export default function VaultCheckout({ stripeUrl }: VaultCheckoutProps) {
    const [open, setOpen] = useState(false);
    const [packageTier, setPackageTier] = useState("BIODYNAMX_90_DAY_VAULT");
    const [lockedPrice, setLockedPrice] = useState(1497);
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    const deployVault = useCallback((detail?: Record<string, unknown>) => {
        if (detail?.packageTier) setPackageTier(String(detail.packageTier));
        if (detail?.lockedPrice) setLockedPrice(Number(detail.lockedPrice) || 1497);

        // Haptic tangibility
        if (navigator.vibrate) navigator.vibrate([15, 20, 15]);

        setOpen(true);
        console.log("[VaultCheckout] 🔒 Deployed. Commencing close.");
    }, []);

    const closeVault = useCallback(() => {
        setOpen(false);
    }, []);

    // Listen for vault checkout trigger events
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as Record<string, unknown> | undefined;
            deployVault(detail);
        };

        // Direct vault trigger
        window.addEventListener("bdx:vault-checkout", handler);

        // Also listen when OneCallClose's Stripe button is pressed
        // (OneCallClose fires this after 11-agent sequence completes)
        window.addEventListener("bdx:deploy-vault", handler);

        return () => {
            window.removeEventListener("bdx:vault-checkout", handler);
            window.removeEventListener("bdx:deploy-vault", handler);
        };
    }, [deployVault]);

    // Escape key closes
    useEffect(() => {
        if (!open) return;
        const esc = (e: KeyboardEvent) => { if (e.key === "Escape") closeVault(); };
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [open, closeVault]);

    const checkoutUrl = stripeUrl || STRIPE_CHECKOUT_URL;

    return (
        <>
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className={`vault-backdrop${open ? " vault-backdrop-active" : ""}`}
                onClick={closeVault}
                aria-hidden="true"
            />

            {/* Bottom Sheet Modal */}
            <div
                id="biodynamx-vault-checkout"
                ref={modalRef}
                className={open ? "vault-modal-active" : ""}
                role="dialog"
                aria-modal="true"
                aria-label="Secure Vault Checkout"
            >
                {/* Drag Handle */}
                <div className="vault-drag-handle" />

                {/* Header */}
                <div className="vault-header">
                    <h3>
                        <span className="lock-icon">🔒</span>
                        Secure Vault Access
                    </h3>
                    <button
                        id="close-vault-btn"
                        onClick={closeVault}
                        aria-label="Close checkout"
                    >
                        ✕
                    </button>
                </div>

                {/* Price Summary */}
                <div className="vault-price-summary">
                    <div className="vault-tier-label">
                        {packageTier === "BIODYNAMX_VIP_12MO" ? "VIP 12-MONTH VAULT" : "THE BIODYNAMX VAULT"}
                    </div>
                    <div>
                        <span className="vault-price">${lockedPrice.toLocaleString()}</span>
                        <span className="vault-price-suffix"> /mo</span>
                    </div>
                    <div className="vault-guarantee-badge">
                        🛡️ Triple-Lock 5X ROI Guarantee · Zero Financial Risk
                    </div>
                </div>

                {/* Stripe Embed */}
                <div id="stripe-checkout-embed">
                    {open && (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                            <a
                                href={checkoutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "inline-block",
                                    width: "100%",
                                    maxWidth: 380,
                                    padding: "18px 0",
                                    background: "linear-gradient(135deg, #00ff41 0%, #00c832 100%)",
                                    color: "#050508",
                                    fontWeight: 800,
                                    fontSize: 15,
                                    letterSpacing: "0.04em",
                                    borderRadius: 14,
                                    textDecoration: "none",
                                    border: "none",
                                }}
                            >
                                ACTIVATE MY VAULT →
                            </a>
                            <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                                Secured by Stripe · 256-bit encryption · Cancel anytime
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
