"use client";
import Link from "next/link";

const NAV_LINKS = [
    { label: "Pricing", href: "/pricing" },
    { label: "Signal", href: "/signal", highlight: true },
    { label: "Free Audit", href: "/audit" },
    { label: "Security", href: "/security" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
];

export function SiteNav() {
    return (
        <nav style={{
            position: "sticky", top: 0, zIndex: 50,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 32px",
            background: "rgba(10,10,10,0.96)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "linear-gradient(135deg, #00ff41, #00cc33)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 900, color: "#000",
                    boxShadow: "0 0 15px rgba(0,255,65,0.2)",
                }}>B</div>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>BioDynamX</div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: "#00ff41", letterSpacing: "0.15em", textTransform: "uppercase" as const }}>Engineering Group</div>
                </div>
            </Link>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <div className="site-nav-links" style={{ display: "flex", gap: 20 }}>
                    {NAV_LINKS.map(link => (
                        link.highlight ? (
                            <Link key={link.label} href={link.href} style={{
                                fontSize: 12, fontWeight: 800,
                                color: "#FFD700",
                                textDecoration: "none", transition: "color 0.2s",
                                display: "flex", alignItems: "center", gap: 5,
                                background: "rgba(255,215,0,0.07)",
                                border: "1px solid rgba(255,215,0,0.25)",
                                borderRadius: 20, padding: "4px 12px",
                                letterSpacing: "0.04em",
                            }}>
                                <span style={{
                                    width: 5, height: 5, background: "#FFD700",
                                    borderRadius: "50%", display: "inline-block",
                                    boxShadow: "0 0 6px #FFD700",
                                    animation: "nav-signal-blink 1.4s ease-in-out infinite",
                                }} />
                                {link.label}
                                <style>{`@keyframes nav-signal-blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
                            </Link>
                        ) : (
                            <Link key={link.label} href={link.href} style={{
                                fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                                textDecoration: "none", transition: "color 0.2s",
                            }}>{link.label}</Link>
                        )
                    ))}
                </div>
                <Link href="/" style={{
                    padding: "8px 20px",
                    background: "linear-gradient(135deg, #00ff41, #00cc33)",
                    border: "none", borderRadius: 8,
                    color: "#000", fontSize: 12, fontWeight: 800,
                    textDecoration: "none",
                    boxShadow: "0 0 15px rgba(0,255,65,0.2)",
                }}>Talk to Jenny</Link>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .site-nav-links { display: none !important; }
                    nav { padding: 12px 16px !important; }
                }
            `}</style>
        </nav>
    );
}

export function SiteFooter() {
    return (
        <footer style={{
            padding: "60px 32px 32px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(0,0,0,0.2)",
        }}>
            <div className="site-footer-grid" style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40,
                maxWidth: 1200, margin: "0 auto",
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 28, height: 28, background: "#00ff41", borderRadius: 6 }} />
                        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>BioDynamX</span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                        The world&apos;s first neurobiology-powered AI platform for revenue recovery and scale. Built for Web 4.0.
                    </p>
                </div>
                <div>
                    <h4 style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "0.15em" }}>COMPANY</h4>
                    {[{ l: "About Us", h: "/about" }, { l: "Revenue Dashboard", h: "/dashboard" }, { l: "Success Stories", h: "/testimonials" }, { l: "Press", h: "/press" }].map(lnk => (
                        <a key={lnk.l} href={lnk.h} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 10 }}>{lnk.l}</a>
                    ))}
                </div>
                <div>
                    <h4 style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "0.15em" }}>PLATFORM</h4>
                    {[{ l: "Elite Pricing", h: "/pricing" }, { l: "Free 20-Point Audit", h: "/audit" }, { l: "AI Directory (llms.txt)", h: "/llms.txt" }, { l: "Partner Login", h: "/partners" }, { l: "A–Z Glossary", h: "/glossary" }].map(lnk => (
                        <a key={lnk.l} href={lnk.h} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 10 }}>{lnk.l}</a>
                    ))}
                </div>
                <div>
                    <h4 style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 20, letterSpacing: "0.15em" }}>TRUST & LEGAL</h4>
                    {[{ l: "Security Protocol", h: "/security" }, { l: "Privacy Policy", h: "/privacy" }, { l: "Terms of Service", h: "/terms" }].map(lnk => (
                        <a key={lnk.l} href={lnk.h} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 10 }}>{lnk.l}</a>
                    ))}
                    <div style={{ color: "#00ff41", fontSize: 11, fontWeight: 800, marginTop: 16, letterSpacing: "0.05em" }}>✓ GDPR & SOC 2 READY</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 4 }}>Military-Grade AES-256</div>
                </div>
            </div>
            <div style={{
                marginTop: 60, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.08)",
                textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.02em",
            }}>
                © 2026 BioDynamX Engineering Group. All rights reserved. Neuroscience for the digital age.
            </div>
        </footer>
    );
}
