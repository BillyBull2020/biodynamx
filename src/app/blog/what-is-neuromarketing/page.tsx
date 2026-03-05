"use client";

import Link from "next/link";

export default function WhatIsNeuromarketing() {
    return (
        <main style={{
            minHeight: "100vh", background: "#050508", color: "#fff",
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            <nav style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                <Link href="/" style={{ textDecoration: "none", color: "#fff", fontWeight: 800, fontSize: 18 }}>BioDynamX</Link>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Link href="/blog" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Blog</Link>
                    <Link href="/about" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>About</Link>
                    <Link href="/" style={{
                        background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                        color: "#fff", padding: "8px 16px", borderRadius: 8,
                        textDecoration: "none", fontSize: 13, fontWeight: 600,
                    }}>Try Jenny Free</Link>
                </div>
            </nav>

            <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
                <Link href="/blog" style={{ color: "#8b5cf6", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                    ← Back to Blog
                </Link>

                <div style={{ marginTop: 24, marginBottom: 32 }}>
                    <span style={{
                        fontSize: 11, fontWeight: 700, color: "#8b5cf6",
                        padding: "3px 10px", borderRadius: 100,
                        background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                    }}>Neuroscience</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 12 }}>
                        February 26, 2026 • 8 min read
                    </span>
                </div>

                <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
                    What Is Neuromarketing? The Brain Science Behind Converting Customers
                </h1>

                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 40 }}>
                    By <Link href="/about" style={{ color: "#8b5cf6", textDecoration: "none" }}>Billy De La Taurus</Link> — Founder, BioDynamX Engineering Group
                </p>

                {/* Article Body */}
                <div style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.8)", fontSize: 17 }}>
                    <p style={{ fontSize: 20, color: "rgba(255,255,255,0.9)", marginBottom: 28, lineHeight: 1.6 }}>
                        Every day, your brain makes around <strong style={{ color: "#fff" }}>35,000 decisions</strong>. How many of those are conscious? About <strong style={{ color: "#8b5cf6" }}>5%</strong>. The other 95% happen automatically — driven by biology, not logic. That&apos;s the foundation of neuromarketing.
                    </p>

                    <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 48, marginBottom: 16, color: "#fff" }}>
                        What Is Neuromarketing?
                    </h2>
                    <p style={{ marginBottom: 20 }}>
                        <strong style={{ color: "#fff" }}>Neuromarketing is the application of neuroscience, neurobiology, and behavioral psychology to marketing.</strong> It studies how the brain processes marketing stimuli — ads, sales conversations, website layouts, pricing — and uses that knowledge to increase conversion rates.
                    </p>
                    <p style={{ marginBottom: 20 }}>
                        Unlike traditional marketing that focuses on what people <em>say</em> they want (surveys, focus groups), neuromarketing reveals what their <em>brains actually respond to</em>. The difference is enormous: research from Harvard Business School shows that <strong style={{ color: "#ffa726" }}>85% of buying decisions are subconscious</strong>.
                    </p>
                    <p style={{ marginBottom: 20 }}>
                        At BioDynamX, we go further. We don&apos;t just study neuromarketing — we&apos;ve built it into AI agents that apply these principles in every conversation, every call, every interaction. We call this the <strong style={{ color: "#8b5cf6" }}>Neurobiology of Choice</strong>.
                    </p>

                    <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 48, marginBottom: 16, color: "#fff" }}>
                        The Triune Brain Model: Why It Matters for Sales
                    </h2>
                    <p style={{ marginBottom: 20 }}>
                        Neuroscientist Paul MacLean identified three distinct layers of the brain, each influencing decisions differently:
                    </p>

                    <div style={{
                        display: "grid", gap: 16, marginBottom: 28,
                    }}>
                        {[
                            { icon: "🦎", name: "Reptilian Brain", color: "#ef4444", desc: "The oldest part. Handles survival instincts — fight, flight, fear. In marketing: urgency, scarcity, loss aversion. When we say 'You're losing $14,000/month,' we're speaking to this brain." },
                            { icon: "❤️", name: "Limbic Brain", color: "#8b5cf6", desc: "The emotional center. Processes feelings, memories, and social bonds. In marketing: testimonials, storytelling, belonging. 'Join 4,000+ business owners who recovered their revenue' speaks here." },
                            { icon: "🧠", name: "Neocortex", color: "#3b82f6", desc: "The rational brain. Handles logic, data, and analysis. In marketing: ROI calculations, feature comparisons, guarantees. 'Average 36x ROI with guaranteed 2x results' satisfies this layer." },
                        ].map((brain) => (
                            <div key={brain.name} style={{
                                padding: 20, borderRadius: 12,
                                background: "rgba(255,255,255,0.03)",
                                borderLeft: `3px solid ${brain.color}`,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 20 }}>{brain.icon}</span>
                                    <strong style={{ color: brain.color, fontSize: 16 }}>{brain.name}</strong>
                                </div>
                                <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{brain.desc}</p>
                            </div>
                        ))}
                    </div>

                    <p style={{ marginBottom: 20 }}>
                        <strong style={{ color: "#fff" }}>The critical insight:</strong> You must address the Reptilian brain <em>first</em>, then the Limbic brain, then the Neocortex. Most businesses make the mistake of leading with logic (features, pricing) and wonder why prospects don&apos;t convert. That&apos;s because the logical brain is the <em>last</em> one to make a decision — it only rationalizes what the reptilian and limbic brains have already chosen.
                    </p>

                    <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 48, marginBottom: 16, color: "#fff" }}>
                        Key Neuromarketing Techniques
                    </h2>

                    <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#ffa726" }}>
                        1. Loss Aversion
                    </h3>
                    <p style={{ marginBottom: 20 }}>
                        Nobel laureate Daniel Kahneman proved that <strong style={{ color: "#fff" }}>losses are felt 2.5x more powerfully than equivalent gains</strong>. Telling someone &ldquo;You&apos;re losing $14,000/month in missed calls&rdquo; is neurobiologically more powerful than &ldquo;You could gain $14,000/month.&rdquo; BioDynamX AI agents always lead with what the prospect is <em>losing</em>, not what they could gain.
                    </p>

                    <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#ffa726" }}>
                        2. The Anchoring Effect
                    </h3>
                    <p style={{ marginBottom: 20 }}>
                        The first number a person hears becomes their reference point. When Jenny (our AI diagnostic consultant) tells a prospect &ldquo;Most dental practices lose $168,000 per year in missed calls,&rdquo; the $497/month solution suddenly feels insignificant by comparison. That&apos;s anchoring — and it&apos;s how our AI converts at 3x industry averages.
                    </p>

                    <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#ffa726" }}>
                        3. Hippocampal Headlines
                    </h3>
                    <p style={{ marginBottom: 20 }}>
                        The hippocampus — your brain&apos;s memory center — activates when it encounters something unexpected. Headlines and messages that break patterns get remembered. &ldquo;We don&apos;t sell to people. We sell to the mind.&rdquo; That sentence activates the hippocampus because it violates expectations.
                    </p>

                    <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#ffa726" }}>
                        4. Neurological Pricing
                    </h3>
                    <p style={{ marginBottom: 20 }}>
                        The brain processes prices differently depending on framing. &ldquo;$497/month&rdquo; triggers less pain response than &ldquo;$5,964/year&rdquo; — even though they&apos;re the same amount. Monthly framing reduces amygdala activation (the brain&apos;s pain center), making the purchase decision feel easier.
                    </p>

                    <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 48, marginBottom: 16, color: "#fff" }}>
                        How BioDynamX Applies Neuromarketing to AI
                    </h2>
                    <p style={{ marginBottom: 20 }}>
                        We built the world&apos;s first AI platform on these neuroscience principles. Every AI agent — Jenny, Mark, Aria, Sarah, and Billy AI — is trained on the Triune Brain model and applies neuro-sales frameworks in real-time:
                    </p>
                    <ul style={{ paddingLeft: 20, marginBottom: 28 }}>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>SPIN Selling</strong> — Situation, Problem, Implication, Need-Payoff questioning</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>SONCAS</strong> — Security, Ego, Novelty, Comfort, Money, Sympathy triggers</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Challenger Sale</strong> — Teach, Tailor, Take Control methodology</li>
                        <li style={{ marginBottom: 10 }}><strong style={{ color: "#fff" }}>Loss Aversion & Anchoring</strong> — in every diagnostic conversation</li>
                    </ul>
                    <p style={{ marginBottom: 20 }}>
                        The result? <strong style={{ color: "#ffa726" }}>$2.4 million recovered for partners in Q1 2026 alone.</strong> Not because we&apos;re better salespeople — because we engineer the neurobiology of buying decisions.
                    </p>

                    <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 48, marginBottom: 16, color: "#fff" }}>
                        Frequently Asked Questions About Neuromarketing
                    </h2>

                    {[
                        { q: "What is neuromarketing?", a: "Neuromarketing is the application of neuroscience to marketing. It studies how the brain makes buying decisions and uses that knowledge to create more effective marketing, sales, and customer experiences. Research shows 85% of decisions are subconscious." },
                        { q: "How does the Triune Brain model work in marketing?", a: "The Triune Brain has three layers: Reptilian (survival/urgency), Limbic (emotion/stories), and Neocortex (logic/data). Effective marketing addresses all three in sequence — urgency first, emotion second, logic last." },
                        { q: "What is the difference between neuromarketing and traditional marketing?", a: "Traditional marketing appeals to logic (features, pricing). Neuromarketing targets the subconscious brain with techniques like loss aversion, anchoring, and emotional triggers. Neuromarketing produces 2-3x higher conversion rates." },
                        { q: "Can AI use neuromarketing?", a: "Yes. BioDynamX built AI agents trained on the Triune Brain model, SPIN selling, and neuro-sales frameworks. Because AI applies these principles consistently on every interaction, it often outperforms human salespeople." },
                    ].map((faq) => (
                        <div key={faq.q} style={{
                            padding: 20, marginBottom: 12, borderRadius: 12,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{faq.q}</h3>
                            <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{faq.a}</p>
                        </div>
                    ))}

                    {/* CTA */}
                    <div style={{
                        marginTop: 48, padding: 32, borderRadius: 16,
                        background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))",
                        border: "1px solid rgba(139,92,246,0.2)", textAlign: "center",
                    }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                            See Neuromarketing AI in Action
                        </h3>
                        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 20, fontSize: 15 }}>
                            Talk to Jenny — our neuroscience-trained AI — and experience the Triune Brain model live. Takes 60 seconds. Completely free.
                        </p>
                        <Link href="/" style={{
                            display: "inline-block", padding: "12px 28px", borderRadius: 10,
                            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                            color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15,
                        }}>
                            Talk to Jenny — Free
                        </Link>
                    </div>
                </div>
            </article>

            <footer style={{
                padding: "32px 24px", textAlign: "center",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.3)", fontSize: 13,
            }}>
                © {new Date().getFullYear()} BioDynamX Engineering Group
            </footer>
        </main>
    );
}
