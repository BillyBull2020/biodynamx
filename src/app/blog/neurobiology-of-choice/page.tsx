"use client";
import Link from "next/link";

export default function NeurobiologyOfChoiceArticle() {
    return (
        <main style={{ minHeight: "100vh", background: "#050508", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <Link href="/" style={{ textDecoration: "none", color: "#fff", fontWeight: 800, fontSize: 18 }}>BioDynamX</Link>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Link href="/blog" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>Blog</Link>
                    <Link href="/" style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Try Jenny Free</Link>
                </div>
            </nav>
            <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
                <Link href="/blog" style={{ color: "#8b5cf6", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>← Back to Blog</Link>
                <div style={{ marginTop: 24, marginBottom: 32 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6", padding: "3px 10px", borderRadius: 100, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>Deep Science</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 12 }}>February 26, 2026 • 10 min read</span>
                </div>
                <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>What Is the Neurobiology of Choice? The Science Behind Every Purchase</h1>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 40 }}>By <Link href="/about" style={{ color: "#8b5cf6", textDecoration: "none" }}>Billy De La Taurus</Link></p>
                <div style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.8)", fontSize: 17 }}>
                    <p style={{ fontSize: 20, marginBottom: 28 }}>Every time a customer says &ldquo;yes&rdquo; to a purchase, a precise cascade of neurochemicals fires in their brain. <strong style={{ color: "#8b5cf6" }}>The Neurobiology of Choice</strong> is the science of understanding — and ethically engineering — that cascade.</p>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>The Three Neurochemicals of Buying</h2>
                    <div style={{ display: "grid", gap: 16, marginBottom: 28 }}>
                        {[
                            { chemical: "Dopamine", icon: "⚡", color: "#ffa726", desc: "The anticipation chemical. Released NOT when you get a reward, but when you ANTICIPATE one. This is why 'Imagine never missing another call' triggers more action than 'Get an AI receptionist.' BioDynamX engineers dopamine spikes through future-pacing and possibility framing in every AI conversation." },
                            { chemical: "Cortisol", icon: "🔥", color: "#ef4444", desc: "The urgency chemical. Released when we perceive loss or threat. Loss aversion messaging ('You're losing $14,000/month') triggers cortisol, creating neurological urgency. We calibrate cortisol triggers to ethical thresholds — enough to motivate action, never enough to cause panic." },
                            { chemical: "Oxytocin", icon: "🤝", color: "#3b82f6", desc: "The trust chemical. Released during social bonding, storytelling, and when we feel understood. Our AI agents build oxytocin through active listening, empathetic responses, and sharing success stories from similar businesses. Trust is the foundation all conversion is built on." },
                        ].map((item) => (
                            <div key={item.chemical} style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${item.color}` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                                    <strong style={{ color: item.color, fontSize: 18 }}>{item.chemical}</strong>
                                </div>
                                <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>The Six Principles of the Framework</h2>
                    <ul style={{ paddingLeft: 20, marginBottom: 28 }}>
                        <li style={{ marginBottom: 12 }}><strong style={{ color: "#ffa726" }}>Dopamine-driven reward anticipation</strong> in CTAs and offers</li>
                        <li style={{ marginBottom: 12 }}><strong style={{ color: "#ef4444" }}>Loss aversion messaging</strong> calibrated to neurobiological thresholds</li>
                        <li style={{ marginBottom: 12 }}><strong style={{ color: "#3b82f6" }}>Cognitive load reduction</strong> through clean information architecture</li>
                        <li style={{ marginBottom: 12 }}><strong style={{ color: "#8b5cf6" }}>Social proof placement</strong> aligned with mirror neuron activation</li>
                        <li style={{ marginBottom: 12 }}><strong style={{ color: "#22c55e" }}>Decision fatigue prevention</strong> through strategic choice architecture</li>
                        <li style={{ marginBottom: 12 }}><strong style={{ color: "#ec4899" }}>Urgency signals</strong> synchronized with cortisol response cycles</li>
                    </ul>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>Why This Matters for Your Business</h2>
                    <p style={{ marginBottom: 20 }}>Traditional sales and marketing appeal to the conscious mind — features, pricing, logical arguments. But <strong style={{ color: "#fff" }}>85% of decisions happen subconsciously</strong>, driven by the neurochemistry described above. Businesses that align their messaging with how the brain actually works see <strong style={{ color: "#ffa726" }}>2-3x higher conversion rates</strong>.</p>
                    <p style={{ marginBottom: 20 }}>BioDynamX is the only company that has built this science into AI. Every agent — Jenny, Mark, Aria, Sarah, Billy AI — uses the Neurobiology of Choice in real-time to guide prospects through the decision cascade: Dopamine → Cortisol → Oxytocin → Conversion.</p>

                    <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: "#fff" }}>FAQs</h2>
                    {[
                        { q: "What is the Neurobiology of Choice?", a: "BioDynamX's proprietary framework merging behavioral neuroscience with AI. It maps how neurons, neurotransmitters, and cognitive biases drive every buying decision, then engineers AI systems that align with these biological processes." },
                        { q: "How does dopamine affect buying decisions?", a: "Dopamine is released during anticipation of reward, not the reward itself. Marketing that creates anticipation ('Imagine never worrying about missed calls') triggers more action than stating benefits directly." },
                        { q: "What role does loss aversion play in purchase decisions?", a: "Losses are felt 2.5x more powerfully than equivalent gains. 'You're losing $14,000/month' is neurobiologically more motivating than 'You could gain $14,000/month.'" },
                    ].map((faq) => (
                        <div key={faq.q} style={{ padding: 20, marginBottom: 12, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{faq.q}</h3>
                            <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{faq.a}</p>
                        </div>
                    ))}

                    <div style={{ marginTop: 48, padding: 32, borderRadius: 16, background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))", border: "1px solid rgba(139,92,246,0.15)", textAlign: "center" }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Experience the Neurobiology of Choice</h3>
                        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 20, fontSize: 15 }}>Talk to Jenny and feel the science in action. 60 seconds. Completely free.</p>
                        <Link href="/" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "#fff", textDecoration: "none", fontWeight: 700 }}>Talk to Jenny — Free</Link>
                    </div>
                </div>
            </article>
            <footer style={{ padding: "32px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>© {new Date().getFullYear()} BioDynamX Engineering Group</footer>
        </main>
    );
}
