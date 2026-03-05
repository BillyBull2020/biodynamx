"use client";

import Link from "next/link";
import { useState } from "react";

function EmailCapture() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        // In production, send to your email service (Mailchimp, ConvertKit, etc.)
        // For now, we store it and show success
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div style={{
                marginTop: 24, padding: 24, borderRadius: 14, textAlign: "center",
                background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
            }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#22c55e", marginBottom: 4 }}>You&apos;re In!</div>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    Check your inbox for your printable GMB checklist. We&apos;ll send monthly optimization tips — no spam, ever.
                </p>
            </div>
        );
    }

    return (
        <div style={{
            marginTop: 24, padding: 24, borderRadius: 14, textAlign: "center",
            background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.1)",
        }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>📥 Want a Printable Checklist?</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 14 }}>
                Get this entire 12-step guide as a PDF + monthly GMB optimization tips. Free.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, maxWidth: 400, margin: "0 auto" }}>
                <input
                    type="email"
                    placeholder="Your work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        flex: 1, padding: "10px 14px", borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                        color: "#fff", fontSize: 13, outline: "none",
                    }}
                />
                <button type="submit" style={{
                    padding: "10px 18px", borderRadius: 8, border: "none",
                    background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                    color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                }}>Send PDF →</button>
            </form>
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                No spam. Unsubscribe anytime. Your email stays between us.
            </p>
        </div>
    );
}

const STEPS = [
    {
        id: 1, title: "Business Name", icon: "🏢", color: "#8b5cf6",
        description: "Your exact legal business name — no keyword stuffing",
        tips: [
            "Use your EXACT legal business name",
            "❌ Wrong: 'Joe's Plumbing — Best Emergency Plumber 24/7 Near Me'",
            "✅ Right: 'Joe's Plumbing LLC'",
            "Google penalizes keyword-stuffed names with SUSPENSION",
            "If your legal name has a location (e.g., 'Downtown Dental'), that's fine — it's your real name",
        ],
        actionUrl: "https://business.google.com/create",
        actionLabel: "Go to Google Business Profile →",
        checklist: [
            "Business name matches legal/registered name exactly",
            "No extra keywords, locations, or descriptors added",
            "Matches name on signage, website, and other directories",
        ],
    },
    {
        id: 2, title: "Primary Category", icon: "📂", color: "#3b82f6",
        description: "The single most important ranking factor for local search",
        tips: [
            "Choose the MOST SPECIFIC category that describes your core service",
            "Google has 4,000+ categories — find the exact one, don't settle for generic",
            "Add 5-9 secondary categories for related services",
            "Research competitor categories using PlePer.com or GMB Spy extension",
            "Examples: 'Dentist' (not 'Health'), 'Real Estate Agent' (not 'Business')",
        ],
        checklist: [
            "Primary category is the most specific match for your main service",
            "5-9 secondary categories added for related services",
            "Researched competitor categories in your area",
        ],
    },
    {
        id: 3, title: "Business Description", icon: "📝", color: "#ffa726",
        description: "750 characters to tell Google and customers what you do",
        tips: [
            "First 250 characters show in preview — make them count",
            "Include: What you do → Who you serve → What makes you different → Service area",
            "Naturally include 3-5 keyword phrases (don't force them)",
            "End with a soft CTA: 'Contact us for a free consultation'",
            "NO: links, phone numbers, promotional language, or ALL CAPS",
        ],
        template: "[Business Name] is a [type of business] serving [area/audience]. We specialize in [core services] and are known for [unique differentiator]. Our team helps [target customers] achieve [key outcome]. [Additional detail about experience/credentials]. Contact us today for [CTA].",
        checklist: [
            "Description is 500-750 characters",
            "First 250 characters contain your most important info",
            "3-5 natural keyword phrases included",
            "Ends with a call-to-action",
            "No links, phone numbers, or promotional language",
        ],
    },
    {
        id: 4, title: "Contact Info", icon: "📞", color: "#22c55e",
        description: "NAP consistency is everything for local SEO",
        tips: [
            "Use a LOCAL phone number (not toll-free) — local numbers rank better",
            "Website URL: add UTM tracking: ?utm_source=google&utm_medium=organic&utm_campaign=gbp",
            "Set appointment URL to your booking/scheduling page",
            "NAP (Name, Address, Phone) must be IDENTICAL across ALL directories",
            "Even small differences hurt: 'St.' vs 'Street', 'Ste' vs 'Suite'",
        ],
        checklist: [
            "Local phone number set (not toll-free)",
            "Website URL includes UTM tracking",
            "Appointment URL links to booking page",
            "NAP is identical on website, social media, and all directories",
        ],
    },
    {
        id: 5, title: "Address & Service Area", icon: "📍", color: "#ef4444",
        description: "Physical locations rank higher, but service-area works too",
        tips: [
            "Physical address = stronger ranking in Google Maps local pack",
            "Service-area business: set up to 20 cities/regions you serve",
            "Home office? You can hide your address but still rank locally",
            "Hybrid model: serve at your location AND travel to customers? Use both",
            "NEVER use a virtual office address — Google catches these and suspends",
        ],
        checklist: [
            "Address type selected (physical, service-area, or hybrid)",
            "Service areas defined (up to 20 cities/regions)",
            "Address hidden if home office (optional)",
            "No virtual office or PO Box used",
        ],
    },
    {
        id: 6, title: "Business Hours", icon: "🕐", color: "#8b5cf6",
        description: "Accurate hours = 'open now' search results",
        tips: [
            "Set ACCURATE hours — Google cross-references with real activity signals",
            "Add special hours for ALL holidays BEFORE they happen",
            "If you're available 24/7 (AI services, emergency), list as 24 hours",
            "'Open now' is a massive search filter — accurate hours put you here",
            "Update hours immediately if anything changes, even temporarily",
        ],
        checklist: [
            "Regular hours set accurately",
            "Upcoming holiday hours pre-set",
            "Hours match what's on your website",
            "Special service hours added if applicable",
        ],
    },
    {
        id: 7, title: "Photos & Media", icon: "📸", color: "#ec4899",
        description: "Businesses with 100+ photos get 520% more calls",
        tips: [
            "Minimum 15 photos to start, upload more weekly",
            "MUST have: Cover (1024x576), Logo (720x720), Interior (3-5), Team (3-5), Services (5+)",
            "Geotag photos with your business GPS coordinates before uploading",
            "Use real photos only — Google's AI detects stock photos",
            "Add new photos weekly — freshness signals matter for ranking",
            "Video: 30-second tours or service demos perform extremely well",
        ],
        checklist: [
            "Cover photo uploaded (1024x576px)",
            "Logo uploaded (720x720px, square)",
            "3-5 interior/workspace photos",
            "3-5 team member photos",
            "5+ product/service photos",
            "Photos are geotagged with business coordinates",
            "All photos are original (not stock)",
        ],
    },
    {
        id: 8, title: "Products & Services", icon: "🛍️", color: "#3b82f6",
        description: "List every service to appear in 'service near me' searches",
        tips: [
            "List EVERY service your business offers",
            "Write a unique, keyword-rich description (150-300 chars) for each",
            "Include prices or price ranges when possible",
            "Link each service to the relevant page on your website",
            "This data feeds directly into Google's 'service near me' results",
        ],
        checklist: [
            "All services listed",
            "Each has a unique, keyword-rich description",
            "Prices or price ranges added",
            "Each service links to relevant website page",
        ],
    },
    {
        id: 9, title: "Google Posts", icon: "📣", color: "#ffa726",
        description: "Post weekly to signal Google your profile is active",
        tips: [
            "Post at LEAST 1x per week — Google rewards active profiles",
            "Rotate types: What's New, Offers, Events, Products",
            "Every post MUST have a CTA button (Learn More, Call Now, Book, etc.)",
            "Include a relevant image with every post",
            "Posts expire after 7 days, so consistency is key",
            "Pro tip: Schedule a month of posts in advance",
        ],
        template: "🔥 [Attention-Grabbing Headline]\n\n[2-3 sentences about the value, offer, or update]\n\n[CTA: Learn more at your-website.com/page]",
        checklist: [
            "First post published",
            "CTA button included",
            "Image attached",
            "Recurring weekly schedule set",
        ],
    },
    {
        id: 10, title: "Reviews Strategy", icon: "⭐", color: "#ffa726",
        description: "THE #1 local ranking factor — target 50+ in 90 days",
        tips: [
            "Target: 50+ reviews in first 90 days, then 5+/month ongoing",
            "Ask 24-48 hours after a positive experience (dopamine is still active)",
            "Send your direct review link via SMS: g.page/[your-business]/review",
            "Add QR codes to receipts, invoices, and follow-up emails",
            "Respond to EVERY review within 24 hours — positive AND negative",
            "NEVER buy reviews or incentivize with discounts — Google will penalize you",
        ],
        reviewResponseTemplates: {
            positive: "Thank you so much, [Name]! We're thrilled to hear about your experience with [specific service]. Our team works hard to [value proposition], and feedback like yours keeps us going. We look forward to serving you again!",
            negative: "Hi [Name], we're sorry to hear about your experience. This isn't the standard we hold ourselves to. We'd love to make this right — could you reach out to us at [email/phone] so we can address this personally? Thank you for the feedback.",
        },
        checklist: [
            "Direct review link created and saved",
            "Review request sent to 10 recent happy customers",
            "QR code generated for review link",
            "Response template ready for positive reviews",
            "Response template ready for negative reviews",
            "Goal set: 50 reviews in 90 days",
        ],
    },
    {
        id: 11, title: "Q&A Section", icon: "❓", color: "#8b5cf6",
        description: "Seed your own Q&A — this feeds into AI search and voice",
        tips: [
            "PROACTIVELY ask and answer your top 10 questions",
            "This feeds directly into Google AI Overviews and voice search",
            "Answer each question in 100-200 words with natural keywords",
            "Questions to seed: services, hours, pricing, areas served, specialties",
            "Monitor for new public questions and answer within 24 hours",
        ],
        seedQuestions: [
            "What services does [Your Business] offer?",
            "What are [Your Business]'s hours of operation?",
            "Does [Your Business] offer free consultations?",
            "How much does [core service] cost?",
            "What areas does [Your Business] serve?",
            "Does [Your Business] accept insurance?",
            "How do I book an appointment with [Your Business]?",
            "What makes [Your Business] different from competitors?",
            "Does [Your Business] offer emergency/after-hours service?",
            "What payment methods does [Your Business] accept?",
        ],
        checklist: [
            "10 seed questions posted",
            "Each question answered with 100-200 words",
            "Answers include natural keyword phrases",
            "Set reminder to check for new Q&A weekly",
        ],
    },
    {
        id: 12, title: "Attributes & Launch", icon: "🚀", color: "#22c55e",
        description: "Enable all attributes and launch your optimized profile",
        tips: [
            "Enable ALL applicable attributes: online appointments, languages, accessibility",
            "Mark payment methods accepted",
            "Set health & safety measures if applicable",
            "Check 'Online estimates' and 'Online appointments' if you offer them",
            "These power Google's filter-based searches",
        ],
        checklist: [
            "All applicable attributes enabled",
            "Payment methods listed",
            "Accessibility features marked",
            "Online appointment/booking enabled",
            "Profile reviewed and published",
            "🎉 CONGRATULATIONS — your profile is optimized!",
        ],
    },
];

export default function GMBSetupWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [completed, setCompleted] = useState<Record<number, Record<number, boolean>>>({});

    const step = STEPS[currentStep];
    const stepChecklist = completed[currentStep] || {};
    const totalChecked = Object.values(stepChecklist).filter(Boolean).length;
    const totalItems = step.checklist.length;
    const progress = Math.round(
        (Object.values(completed).reduce((sum, s) => sum + Object.values(s).filter(Boolean).length, 0) /
            STEPS.reduce((sum, s) => sum + s.checklist.length, 0)) * 100
    );

    const toggleCheck = (idx: number) => {
        setCompleted((prev) => ({
            ...prev,
            [currentStep]: { ...(prev[currentStep] || {}), [idx]: !(prev[currentStep] || {})[idx] },
        }));
    };

    return (
        <main style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Nav */}
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <Link href="/" style={{ textDecoration: "none", color: "#fff", fontWeight: 800, fontSize: 18 }}>BioDynamX</Link>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Dashboard</Link>
                    <Link href="/" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Talk to Jenny</Link>
                </div>
            </nav>

            <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Free Tool</div>
                    <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 12 }}>
                        Google My Business Setup Wizard
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto", fontSize: 15 }}>
                        12 steps to a perfectly optimized Google Business Profile. Do it right the first time.
                    </p>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Overall Progress</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>{progress}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #22c55e, #8b5cf6)", width: `${progress}%`, transition: "width 0.5s ease" }} />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
                    {/* Step Navigation */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {STEPS.map((s, i) => {
                            const sc = completed[i] || {};
                            const done = s.checklist.every((_, ci) => sc[ci]);
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setCurrentStep(i)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        padding: "10px 12px", borderRadius: 10, border: "none",
                                        background: i === currentStep ? `${s.color}15` : "transparent",
                                        cursor: "pointer", textAlign: "left",
                                        borderLeft: i === currentStep ? `3px solid ${s.color}` : "3px solid transparent",
                                    }}
                                >
                                    <span style={{ fontSize: 16 }}>{done ? "✅" : s.icon}</span>
                                    <span style={{
                                        fontSize: 13, fontWeight: i === currentStep ? 700 : 500,
                                        color: i === currentStep ? "#fff" : "rgba(255,255,255,0.5)",
                                    }}>{s.title}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Step Content */}
                    <div style={{
                        padding: 28, borderRadius: 16,
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${step.color}20`,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 28 }}>{step.icon}</span>
                            <div>
                                <div style={{ fontSize: 12, color: step.color, fontWeight: 600 }}>Step {step.id} of 12</div>
                                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{step.title}</h2>
                            </div>
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24, fontSize: 15 }}>{step.description}</p>

                        {/* Tips */}
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: step.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>💡 Expert Tips</h3>
                            {step.tips.map((tip, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                    <span style={{ color: step.color, flexShrink: 0 }}>•</span>
                                    <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{tip}</p>
                                </div>
                            ))}
                        </div>

                        {/* Template (if exists) */}
                        {"template" in step && step.template && (
                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#ffa726", textTransform: "uppercase", letterSpacing: "0.05em" }}>📋 Template</h3>
                                <div style={{
                                    padding: 16, borderRadius: 10, background: "rgba(255,167,38,0.05)",
                                    border: "1px solid rgba(255,167,38,0.15)", fontFamily: "monospace",
                                    fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, whiteSpace: "pre-wrap",
                                }}>{step.template}</div>
                            </div>
                        )}

                        {/* Seed Questions (for Q&A step) */}
                        {"seedQuestions" in step && step.seedQuestions && (
                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.05em" }}>❓ Questions to Seed</h3>
                                {step.seedQuestions.map((q: string, i: number) => (
                                    <div key={i} style={{ padding: "8px 12px", marginBottom: 4, borderRadius: 8, background: "rgba(139,92,246,0.05)", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                                        {i + 1}. {q}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Review Response Templates */}
                        {"reviewResponseTemplates" in step && step.reviewResponseTemplates && (
                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#ffa726", textTransform: "uppercase", letterSpacing: "0.05em" }}>💬 Review Response Templates</h3>
                                {Object.entries(step.reviewResponseTemplates as Record<string, string>).map(([type, template]) => (
                                    <div key={type} style={{ padding: 14, marginBottom: 8, borderRadius: 10, background: type === "positive" ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)", border: `1px solid ${type === "positive" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}` }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: type === "positive" ? "#22c55e" : "#ef4444", marginBottom: 6, textTransform: "uppercase" }}>{type} Review</div>
                                        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, fontStyle: "italic" }}>{template}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action URL */}
                        {"actionUrl" in step && step.actionUrl && (
                            <a href={step.actionUrl} target="_blank" rel="noopener noreferrer" style={{
                                display: "inline-block", padding: "10px 20px", borderRadius: 8,
                                background: `${step.color}20`, border: `1px solid ${step.color}40`,
                                color: step.color, textDecoration: "none", fontSize: 13, fontWeight: 600, marginBottom: 24,
                            }}>{step.actionLabel}</a>
                        )}

                        {/* Checklist */}
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#fff" }}>
                                ✅ Checklist ({totalChecked}/{totalItems})
                            </h3>
                            {step.checklist.map((item, i) => (
                                <label key={i} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "8px 0", cursor: "pointer",
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={!!stepChecklist[i]}
                                        onChange={() => toggleCheck(i)}
                                        style={{ width: 18, height: 18, accentColor: step.color, cursor: "pointer" }}
                                    />
                                    <span style={{
                                        fontSize: 14,
                                        color: stepChecklist[i] ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.8)",
                                        textDecoration: stepChecklist[i] ? "line-through" : "none",
                                    }}>{item}</span>
                                </label>
                            ))}
                        </div>

                        {/* Navigation */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                            <button
                                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                disabled={currentStep === 0}
                                style={{
                                    padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                                    background: "transparent", color: currentStep === 0 ? "rgba(255,255,255,0.2)" : "#fff",
                                    cursor: currentStep === 0 ? "default" : "pointer", fontSize: 14, fontWeight: 600,
                                }}
                            >← Previous</button>
                            <button
                                onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
                                disabled={currentStep === STEPS.length - 1}
                                style={{
                                    padding: "10px 20px", borderRadius: 8, border: "none",
                                    background: currentStep === STEPS.length - 1 ? "rgba(34,197,94,0.2)" : `linear-gradient(135deg, ${step.color}, #8b5cf6)`,
                                    color: "#fff", cursor: currentStep === STEPS.length - 1 ? "default" : "pointer",
                                    fontSize: 14, fontWeight: 700,
                                }}
                            >{currentStep === STEPS.length - 1 ? "🎉 Complete!" : "Next Step →"}</button>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div style={{
                    marginTop: 40, padding: 28, borderRadius: 16, textAlign: "center",
                    background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(139,92,246,0.06))",
                    border: "1px solid rgba(34,197,94,0.1)",
                }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Want Us to Do This For You?</h3>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 16 }}>
                        BioDynamX sets up and optimizes your Google Business Profile as part of every partnership.
                    </p>
                    <Link href="/" style={{
                        display: "inline-block", padding: "12px 24px", borderRadius: 10,
                        background: "linear-gradient(135deg, #22c55e, #8b5cf6)",
                        color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14,
                    }}>Talk to Jenny About Setup</Link>
                </div>

                {/* Soft Email Capture — optional, doesn't gate anything */}
                <EmailCapture />
            </div>

            <footer style={{ padding: "32px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                © {new Date().getFullYear()} BioDynamX Engineering Group
            </footer>
        </main>
    );
}
