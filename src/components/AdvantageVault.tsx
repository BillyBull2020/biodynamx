"use client";
import { useEffect } from "react";

// Web 4.0 Immersive Vault - 21 Core Advantages
const CARDS = [
    { icon: "🎙️", title: "Interface", gain: "100% Live Voice AI (Speaking)", description: "Move past antiquated chatbots to native conversational flow." },
    { icon: "🔱", title: "Architecture", gain: "BDX Multi-Agent Core", description: "A multi-agent swarm replacing brittle single-path decision trees." },
    { icon: "🧠", title: "Visuals", gain: "Dual-Coding Visual Engine", description: "Real-time neuro-visuals synchronized to speech for higher retention." },
    { icon: "⚡", title: "Response", gain: "< 1 Second (Native Audio)", description: "Zero-latency Flash Native Audio outpaces human reflexes." },
    { icon: "🛡️", title: "Branding", gain: "Absolute Brand Secrecy", description: "Your platform, your brand. No 'powered by' vendor marks." },
    { icon: "💡", title: "Psychology", gain: "Neurobiology & SPIN Native", description: "Agents pre-trained with high-conversion neuro-sales triggers." },
    { icon: "💰", title: "Pricing", gain: "$1,497 / 90-Day Trial", description: "Straightforward monthly tiering replacing unpredictable usage taxes." },
    { icon: "🤖", title: "Autonomy", gain: "Fully Agentic / Self-Nav", description: "Complete autonomous reasoning versus rigid semi-automated workflows." },
    { icon: "🔒", title: "Trust", gain: "Triple-Lock 5X ROI Guarantee", description: "We mandate a measurable 5x compounding ROI floor." },
    { icon: "🌐", title: "Availability", gain: "Universal (24/7/365)", description: "Always on, always closing. 168 hours of uptime every week." },
    { icon: "🎵", title: "Latency", gain: "Live Flash Native Audio", description: "Deep continuous streams rather than text-to-speech halting." },
    { icon: "📍", title: "Local SEO", gain: "Free AI GMB Optimization", description: "Hyper-localized ranking strategies outperforming manual SEO." },
    { icon: "📱", title: "Social Media", gain: "24/7 AI Social Admin (Iris)", description: "An AI manager optimizing your digital social touchpoints hourly." },
    { icon: "🔍", title: "AI Visibility", gain: "GEO/AEO Indexing Ready", description: "Primed for Answer Engine Optimization and Generative Search." },
    { icon: "⭐", title: "Reviews", gain: "AI List Reactivation", description: "Mining your past network to awaken dormant revenue." },
    { icon: "📲", title: "Inbound", gain: "Instant AI Textback/Callback", description: "Instant capture mechanisms eradicating the 'missed call' bleed." },
    { icon: "🔐", title: "Security", gain: "AES-256 Military Grade", description: "Encrypted vaults locking down all enterprise data instantly." },
    { icon: "🎯", title: "Strategy", gain: "Quarterly Neuro-Audits", description: "Ongoing strategic reviews rather than reactive firefighting." },
    { icon: "🧬", title: "Intelligence", gain: "Vertex AI Enterprise Logic", description: "Google's Vertex AI ecosystem empowering deep logical branching." },
    { icon: "⚙️", title: "Integration", gain: "1,000+ API Direct Syncs", description: "Direct automation hooks replacing repetitive manual data entry." },
    { icon: "🌌", title: "Experience", gain: "Web 4.0 Immersive Vault", description: "Spline 3D environments replacing flat Web 2.0 brochure sites." }
];

export default function AdvantageVault() {
    useEffect(() => {
        const scriptId = "spline-viewer-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.type = "module";
            script.src = "https://unpkg.com/@splinetool/viewer@1.9.7/build/spline-viewer.js";
            document.head.appendChild(script);
        }
    }, []);

    return (
        <section className="web4-spline-section">
            <div className="spline-background">
                {/* @ts-expect-error spline-viewer is a custom web component without typings */}
                <spline-viewer url="https://prod.spline.design/Q7YGyUkD9T7R/scene.splinecode" loading-anim-type="spinner-small-dark"></spline-viewer>
            </div>

            <div className="advantage-scroll-track">
                {CARDS.map((card, index) => (
                    <div key={index} className="advantage-node" data-dock-section="agents">
                        <div style={{ fontSize: "52px", marginBottom: "20px", filter: "drop-shadow(0 0 16px rgba(0,255,0,0.4))" }}>
                            {card.icon}
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "#00ff00", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
                            {String(index + 1).padStart(2, "0")} — {card.title}
                        </div>
                        <h3 style={{ fontSize: "clamp(24px, 3.5vw, 42px)", fontWeight: 900, marginBottom: "16px", textAlign: "center", lineHeight: "1.2" }}>
                            {card.gain}
                        </h3>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", textAlign: "center", maxWidth: "480px", lineHeight: "1.6" }}>
                            {card.description}
                        </p>
                    </div>
                ))}
            </div>

            <style>{`
                .web4-spline-section {
                    position: relative;
                    width: 100vw;
                    margin-left: calc(-50vw + 50%); /* Full bleed override */
                    /* Neutralize parent padding if any */
                    margin-top: -80px;
                }
                .spline-background {
                    position: sticky;
                    top: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 1;
                    pointer-events: none; /* Allows scrolling through the 3D canvas */
                }
                .spline-background spline-viewer {
                    width: 100%;
                    height: 100%;
                }
                .advantage-scroll-track {
                    position: relative;
                    z-index: 10;
                    padding-bottom: 50vh; /* Gives breathing room at the end */
                    margin-top: -80vh; /* Pull content up over the sticky background */
                }
                .advantage-node {
                    min-height: 50vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    /* High-Contrast, Zero Brain Tax Typography */
                    color: #ffffff;
                    text-shadow: 0px 4px 20px rgba(0, 0, 0, 0.8);
                    background: rgba(10, 10, 15, 0.3); /* Glassmorphic background */
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    margin: 40px auto;
                    border-radius: 16px;
                    border: 1px solid rgba(0, 255, 0, 0.2);
                    width: 90%;
                    max-width: 600px;
                    padding: 40px;
                    transform: translateZ(0);
                    transition: all 0.4s ease;
                }
                .advantage-node:hover {
                    border-color: rgba(0, 255, 0, 0.6);
                    background: rgba(10, 10, 15, 0.5);
                    box-shadow: 0 12px 48px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,255,0,0.1);
                    transform: translateY(-4px);
                }
            `}</style>
        </section>
    );
}
