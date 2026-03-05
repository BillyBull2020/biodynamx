"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import "./login.css";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

type AuthMode = "email" | "phone";
type PhoneStep = "enter" | "verify";

export default function PortalLoginPage() {
    const [mode, setMode] = useState<AuthMode>("email");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneStep, setPhoneStep] = useState<PhoneStep>("enter");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // ── Google Sign-In ──────────────────────────────────────────
    const handleGoogleLogin = async () => {
        setLoading(true);
        setMessage(null);
        const baseUrl = window.location.origin;
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${baseUrl}/portal`,
            },
        });
        if (error) {
            setMessage({ type: "error", text: error.message });
            setLoading(false);
        }
    };

    // ── Apple Sign-In ───────────────────────────────────────────
    const handleAppleLogin = async () => {
        setLoading(true);
        setMessage(null);
        const baseUrl = window.location.origin;
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "apple",
            options: {
                redirectTo: `${baseUrl}/portal`,
            },
        });
        if (error) {
            setMessage({ type: "error", text: error.message });
            setLoading(false);
        }
    };

    // ── Email Magic Link ────────────────────────────────────────
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setMessage(null);

        const baseUrl = window.location.origin;
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${baseUrl}/portal`,
            },
        });

        if (error) {
            setMessage({ type: "error", text: error.message });
        } else {
            setMessage({
                type: "success",
                text: "✅ Magic link sent! Check your inbox and click the link to sign in.",
            });
        }
        setLoading(false);
    };

    // ── Phone OTP — Send Code ───────────────────────────────────
    const handlePhoneSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;
        setLoading(true);
        setMessage(null);

        // Format phone number
        let formatted = phone.replace(/\D/g, "");
        if (!formatted.startsWith("1") && formatted.length === 10) {
            formatted = "1" + formatted;
        }
        if (!formatted.startsWith("+")) {
            formatted = "+" + formatted;
        }

        const { error } = await supabase.auth.signInWithOtp({
            phone: formatted,
        });

        if (error) {
            setMessage({ type: "error", text: error.message });
        } else {
            setPhoneStep("verify");
            setMessage({
                type: "info",
                text: `📱 We just texted a 6-digit code to ${formatted}`,
            });
        }
        setLoading(false);
    };

    // ── Phone OTP — Verify Code ─────────────────────────────────
    const handlePhoneVerify = async () => {
        const code = otp.join("");
        if (code.length !== 6) return;
        setLoading(true);
        setMessage(null);

        let formatted = phone.replace(/\D/g, "");
        if (!formatted.startsWith("1") && formatted.length === 10) {
            formatted = "1" + formatted;
        }
        if (!formatted.startsWith("+")) {
            formatted = "+" + formatted;
        }

        const { error } = await supabase.auth.verifyOtp({
            phone: formatted,
            token: code,
            type: "sms",
        });

        if (error) {
            setMessage({ type: "error", text: "Invalid code. Please try again." });
        } else {
            router.push("/portal");
        }
        setLoading(false);
    };

    // ── OTP Input Handler ───────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (newOtp.every(d => d !== "") && newOtp.join("").length === 6) {
            setTimeout(() => handlePhoneVerify(), 300);
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length > 0) {
            const newOtp = [...otp];
            for (let i = 0; i < 6; i++) {
                newOtp[i] = pasted[i] || "";
            }
            setOtp(newOtp);
            if (pasted.length === 6) {
                setTimeout(() => handlePhoneVerify(), 300);
            }
        }
    };

    return (
        <div className="portal-login">
            <div className="login-card">
                <div className="login-logo">🧬</div>
                <h1>Client Portal</h1>
                <p className="subtitle">Sign in to your BioDynamX dashboard</p>

                {/* ── Social Login ──────────────────── */}
                <div className="social-buttons">
                    <button className="social-btn google" onClick={handleGoogleLogin} disabled={loading}>
                        <svg viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <button className="social-btn apple" onClick={handleAppleLogin} disabled={loading}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C4.24 16.5 5 10.12 9.03 9.87c1.23.07 2.08.72 2.8.75.93-.19 1.82-.88 2.83-.79 1.21.11 2.12.65 2.72 1.63-2.5 1.49-1.91 4.77.42 5.69-.49 1.29-.75 1.85-1.75 3.13zM12.03 9.82C11.88 7.75 13.51 5.96 15.49 6c.33 2.27-2.04 3.97-3.46 3.82z" />
                        </svg>
                        Continue with Apple
                    </button>
                </div>

                {/* ── Divider ──────────────────────── */}
                <div className="login-divider">or use</div>

                {/* ── Tab Switcher ──────────────────── */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${mode === "email" ? "active" : ""}`}
                        onClick={() => { setMode("email"); setMessage(null); }}
                    >
                        ✉️ Email
                    </button>
                    <button
                        className={`auth-tab ${mode === "phone" ? "active" : ""}`}
                        onClick={() => { setMode("phone"); setPhoneStep("enter"); setMessage(null); }}
                    >
                        📱 Phone
                    </button>
                </div>

                {/* ── Email Magic Link ──────────────── */}
                {mode === "email" && (
                    <form className="login-form" onSubmit={handleEmailLogin}>
                        <input
                            type="email"
                            className="login-input"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                        <button type="submit" className="login-btn" disabled={loading || !email}>
                            {loading ? "Sending magic link..." : "Send Magic Link ✨"}
                        </button>
                    </form>
                )}

                {/* ── Phone OTP ─────────────────────── */}
                {mode === "phone" && phoneStep === "enter" && (
                    <form className="login-form" onSubmit={handlePhoneSend}>
                        <div className="input-group">
                            <span className="input-prefix">🇺🇸</span>
                            <input
                                type="tel"
                                className="login-input with-prefix"
                                placeholder="(303) 555-1234"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={loading || !phone}>
                            {loading ? "Sending code..." : "Text Me a Code 📲"}
                        </button>
                    </form>
                )}

                {mode === "phone" && phoneStep === "verify" && (
                    <div className="login-form">
                        <button className="back-to-send" onClick={() => { setPhoneStep("enter"); setOtp(["", "", "", "", "", ""]); setMessage(null); }}>
                            ← Change number
                        </button>
                        <div className="otp-row" onPaste={handleOtpPaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { otpRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    aria-label={`Verification code digit ${i + 1}`}
                                    className={`otp-digit ${digit ? "filled" : ""}`}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    autoFocus={i === 0}
                                />
                            ))}
                        </div>
                        <button
                            className="login-btn"
                            onClick={handlePhoneVerify}
                            disabled={loading || otp.join("").length !== 6}
                        >
                            {loading ? "Verifying..." : "Verify & Sign In →"}
                        </button>
                    </div>
                )}

                {/* ── Message ──────────────────────── */}
                {message && (
                    <div className={`login-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* ── Security Badge ───────────────── */}
                <div className="security-badge">
                    <span className="lock">🔒</span>
                    <span>256-bit encrypted · Powered by Supabase Auth</span>
                </div>

                {/* ── Footer ───────────────────────── */}
                <div className="login-footer">
                    Not a client yet? <Link href="/">Learn about BioDynamX</Link>
                    <br />
                    Need help? <a href="mailto:support@biodynamx.com">support@biodynamx.com</a>
                </div>
            </div>
        </div>
    );
}
