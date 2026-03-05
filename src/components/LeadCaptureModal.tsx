"use client";
// ============================================================================
// LeadCaptureModal — Premium Lead Capture Overlay
// ============================================================================
// A glassmorphism modal that captures email + phone + name.
// Simplified language and improved mobile placeholder readability.
// ============================================================================

import { useState, useCallback } from "react";
import "./LeadCaptureModal.css";

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    source: "audit" | "voice_diagnostic" | "homepage" | "direct";
    prefillData?: {
        auditGrade?: string;
        auditScore?: number;
        monthlyLeak?: string;
        annualLeak?: string;
        businessUrl?: string;
    };
}

export default function LeadCaptureModal({
    isOpen,
    onClose,
    source,
    prefillData = {},
}: LeadCaptureModalProps) {
    const [form, setForm] = useState({ name: "", email: "", phone: "", businessType: "" });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = useCallback(async () => {
        if (!form.email.trim()) {
            setError("Email is required");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(form.email)) {
            setError("Please enter a valid email");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim() || undefined,
                    businessType: form.businessType.trim() || undefined,
                    source,
                    businessUrl: prefillData.businessUrl,
                    auditGrade: prefillData.auditGrade,
                    auditScore: prefillData.auditScore,
                    monthlyLeak: prefillData.monthlyLeak,
                    annualLeak: prefillData.annualLeak,
                }),
            });

            if (!res.ok) throw new Error("Failed to submit");

            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }, [form, source, prefillData]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content">
                {!submitted ? (
                    <>
                        <div className="modal-header">
                            <div className="modal-icon">🚀</div>
                            <h3 className="modal-title">
                                {source === "audit" ? "Get Your Full Report" : "Get Started"}
                            </h3>
                            <p className="modal-desc">
                                {source === "audit"
                                    ? "Enter your details and we'll send your complete report + a personalized growth plan."
                                    : "Our team will reach out within minutes. Free diagnostic, zero obligation."}
                            </p>
                        </div>

                        <div className="modal-form">
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Your Name"
                                value={form.name}
                                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <input
                                type="email"
                                className="modal-input"
                                placeholder="Email Address *"
                                value={form.email}
                                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                required
                            />
                            <input
                                type="tel"
                                className="modal-input"
                                placeholder="Phone Number (for SMS updates)"
                                value={form.phone}
                                onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                            />
                            <select
                                className={`modal-input modal-select ${form.businessType ? 'has-value' : ''}`}
                                value={form.businessType}
                                onChange={(e) => setForm(prev => ({ ...prev, businessType: e.target.value }))}
                                aria-label="Business type"
                            >
                                <option value="">Select your business type</option>
                                <option value="call_center">Call Center</option>
                                <option value="small_business">Small Business</option>
                                <option value="startup">Startup</option>
                                <option value="med_spa">Med Spa</option>
                                <option value="real_estate">Real Estate</option>
                                <option value="dental">Dental / Healthcare</option>
                                <option value="home_services">Home Services</option>
                                <option value="ecommerce">E-Commerce</option>
                                <option value="agency">Marketing Agency</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {error && (
                            <div className="modal-error">{error}</div>
                        )}

                        <button
                            className="modal-submit"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "⏳ Saving..." : source === "audit" ? "Send My Report →" : "Get Started Free →"}
                        </button>

                        <div className="modal-trust">
                            🔒 No spam. We value your privacy. Unsubscribe anytime.
                        </div>

                        <button className="modal-close" onClick={onClose}>✕</button>
                    </>
                ) : (
                    <div className="success-container">
                        <div className="success-icon">✅</div>
                        <h3 className="success-title">Success!</h3>
                        <p className="modal-desc success-desc">
                            {form.phone
                                ? "We'll reach out within minutes via text. Check your phone! 📱"
                                : "Check your email — your results are on the way. 📧"}
                        </p>
                        <p className="modal-desc success-note">
                            In the meantime, feel free to try our live AI conversation on the homepage.
                        </p>
                        <button className="modal-submit success-close" onClick={onClose}>
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
