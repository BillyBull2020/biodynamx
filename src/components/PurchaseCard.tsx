"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface PurchaseCardProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PurchaseCard({ isOpen, onClose }: PurchaseCardProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const shimmerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCheckoutError(null);
            gsap.set(overlayRef.current, { display: "flex" });
            gsap.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.4, ease: "power2.out" }
            );
            gsap.fromTo(cardRef.current,
                { y: 80, opacity: 0, scale: 0.9, filter: "blur(10px)" },
                { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "back.out(1.2)", delay: 0.1 }
            );

            // Background shimmer animation
            if (shimmerRef.current) {
                gsap.to(shimmerRef.current, {
                    backgroundPosition: "200% 0%",
                    duration: 3,
                    repeat: -1,
                    ease: "none"
                });
            }
        } else {
            gsap.to(cardRef.current, {
                y: 80, opacity: 0, scale: 0.9,
                duration: 0.3, ease: "power2.in"
            });
            gsap.to(overlayRef.current, {
                opacity: 0, duration: 0.3, delay: 0.1,
                onComplete: () => { gsap.set(overlayRef.current, { display: "none" }); }
            });
        }
    }, [isOpen]);

    const handleCheckout = async () => {
        setIsLoading(true);
        setCheckoutError(null);

        try {
            // Try server-side checkout first (requires STRIPE_SECRET_KEY)
            const res = await fetch("/api/create-checkout", { method: "POST" });
            const data = await res.json();

            if (data.url) {
                window.open(data.url, "_blank");
            } else if (data.error?.includes("not configured")) {
                // Fallback: Use Stripe Payment Link or direct dashboard
                // Since we have the publishable key, redirect to Stripe's hosted page
                const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
                if (pk) {
                    setCheckoutError("Redirecting to Stripe dashboard...");
                    // Open Stripe dashboard to create payment link
                    window.open("https://dashboard.stripe.com/payment-links/create", "_blank");
                } else {
                    setCheckoutError("Stripe checkout is being configured. Contact us to get started.");
                }
            } else {
                setCheckoutError(data.error || "Checkout failed. Please try again.");
            }
        } catch (err) {
            console.error("Checkout error:", err);
            setCheckoutError("Connection error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 items-center justify-center hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            {/* Shimmer background */}
            <div
                ref={shimmerRef}
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.1) 25%, rgba(52,211,153,0.2) 50%, rgba(16,185,129,0.1) 75%, transparent 100%)",
                    backgroundSize: "200% 100%"
                }}
            />

            <div
                ref={cardRef}
                className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, rgba(6,78,59,0.95), rgba(4,47,35,0.98))",
                    border: "1px solid rgba(52, 211, 153, 0.4)",
                    boxShadow: "0 0 80px rgba(16, 185, 129, 0.2), 0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                }}
            >
                {/* Glow bar at top */}
                <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500" />

                <div className="p-8 flex flex-col items-center gap-6">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
                        <span className="text-3xl">⚡</span>
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-emerald-300 tracking-tight">
                            BioDynamX Engineering Suite
                        </h2>
                        <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                            Full access to the AI-powered engineering platform.<br />
                            Voice agents, automated pipelines, and real-time analytics.
                        </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-extrabold text-white">$497</span>
                        <span className="text-gray-400 text-lg">/mo</span>
                    </div>

                    {/* 5x ROI Guarantee */}
                    <div className="w-full px-4 py-2.5 rounded-xl text-center"
                        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase">
                            🛡️ 5x ROI Guarantee — Or We Continue At No Cost
                        </span>
                    </div>

                    {/* Features */}
                    <ul className="w-full space-y-3 text-sm">
                        {[
                            "Unlimited AI Voice Agent Conversations",
                            "Multi-Agent Orchestration (Alpha + Beta)",
                            "Live Business Audit & ROI Engine",
                            "Calendly + Stripe Integration",
                            "Priority Engineering Support",
                            "Real-time Analytics & War Room Dashboard"
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-300">
                                <span className="text-emerald-400 text-base">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    {/* Error */}
                    {checkoutError && (
                        <p className="text-amber-400 text-xs text-center px-3 py-2 rounded-xl w-full"
                            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.15)" }}>
                            {checkoutError}
                        </p>
                    )}

                    {/* CTA Button */}
                    <button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-200 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
                        style={{
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                        }}
                    >
                        {isLoading ? "Connecting to Stripe..." : "Start Now — $497/mo →"}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                        Secure checkout powered by Stripe. Cancel anytime.
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all text-sm cursor-pointer"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
