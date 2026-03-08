"use client";
// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX SIGNAL — "The Deck Throw" Carousel
// GSAP ScrollTrigger pinned section. Cards fly off the stack as you scroll.
// Web 4.0 award-winning. Replace YOUTUBE_ID placeholders with real IDs.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from "react";

export interface SignalVideo {
    id: string;
    youtubeId: string;   // ← swap in your real YouTube video ID
    title: string;
    subtitle: string;
    category: string;
    categoryColor: string;
    duration: string;
    description: string;
}

// ─── PLACEHOLDER VIDEOS — replace youtubeId with your real IDs ───────────
export const SIGNAL_VIDEOS: SignalVideo[] = [
    {
        id: "v1",
        youtubeId: "dQw4w9WgXcQ",          // ← replace
        title: "What Is Voice AI & Why It Changes Everything",
        subtitle: "The complete beginner's guide to autonomous AI agents",
        category: "Voice AI",
        categoryColor: "#00ff41",
        duration: "12:34",
        description: "Discover how Voice AI answers your business phone 24/7, qualifies leads in seconds, and transforms how customers experience your brand — all without you lifting a finger.",
    },
    {
        id: "v2",
        youtubeId: "dQw4w9WgXcQ",          // ← replace
        title: "Speed to Lead: The 60-Second Rule That Closes More Deals",
        subtitle: "Neuroscience of response time & conversion",
        category: "Neuroscience",
        categoryColor: "#a78bfa",
        duration: "8:17",
        description: "The first business to respond wins 78% of the time. Learn the neurobiological window of opportunity and how BioDynamX AI closes it automatically.",
    },
    {
        id: "v3",
        youtubeId: "dQw4w9WgXcQ",          // ← replace
        title: "GEO vs SEO: How AI Search Changes Your Visibility",
        subtitle: "Get ChatGPT & Gemini to recommend your business",
        category: "AI Search",
        categoryColor: "#60a5fa",
        duration: "15:02",
        description: "Traditional SEO is not enough. Generative Engine Optimization (GEO) means training AI systems to cite your business by name. Here's the exact playbook.",
    },
    {
        id: "v4",
        youtubeId: "dQw4w9WgXcQ",          // ← replace
        title: "The 3-Brain Framework: Sell to the Subconscious",
        subtitle: "85% of buying decisions happen before logic kicks in",
        category: "Neuroscience",
        categoryColor: "#a78bfa",
        duration: "11:45",
        description: "Your customers have a reptilian brain, a limbic brain, and a neocortex. BioDynamX agents are trained to speak to all three — in the right order, every time.",
    },
    {
        id: "v5",
        youtubeId: "dQw4w9WgXcQ",          // ← replace
        title: "Google Business Profile Optimization with AI",
        subtitle: "Dominate local search in 2026",
        category: "Local SEO",
        categoryColor: "#fbbf24",
        duration: "9:58",
        description: "46% of all Google searches have local intent. Watch how BioDynamX AI fully manages your GMB profile, automates reviews, and pushes you to position #1.",
    },
    {
        id: "v6",
        youtubeId: "dQw4w9WgXcQ",          // ← replace
        title: "Building an Autonomous Revenue Machine",
        subtitle: "How BioDynamX replaces your entire marketing stack",
        category: "Platform",
        categoryColor: "#f97316",
        duration: "18:21",
        description: "One platform. Voice AI, video, email automation, social AI, review engine, GEO, and revenue intelligence — all connected and running 24/7 on autopilot.",
    },
];

const CATEGORIES = ["All", "Voice AI", "Neuroscience", "AI Search", "Local SEO", "Platform"];

// ─────────────────────────────────────────────────────────────────────────────

export default function SignalDeckCarousel() {
    const sectionRef = useRef<HTMLElement>(null);
    const stackRef = useRef<HTMLDivElement>(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const [filter, setFilter] = useState("All");
    const [modalVideo, setModalVideo] = useState<SignalVideo | null>(null);
    const [thrown, setThrown] = useState<number[]>([]);   // indices of thrown cards
    const gsapCtxRef = useRef<{ revert?: () => void }>({});

    const filtered = filter === "All"
        ? SIGNAL_VIDEOS
        : SIGNAL_VIDEOS.filter(v => v.category === filter);

    // ── GSAP PINNED SCROLL THROW ──────────────────────────────────────────
    useEffect(() => {
        if (typeof window === "undefined") return;

        (async () => {
            const { default: gsap } = await import("gsap");
            const { ScrollTrigger } = await import("gsap/ScrollTrigger");
            gsap.registerPlugin(ScrollTrigger);

            const section = sectionRef.current;
            if (!section) return;

            const ctx = gsap.context(() => {
                const totalCards = filtered.length;
                // Each card throw takes 1 viewport-height of scroll
                const scrollLen = window.innerHeight * (totalCards - 1);

                ScrollTrigger.create({
                    trigger: section,
                    pin: true,
                    pinSpacing: true,
                    scrub: false,
                    start: "top top",
                    end: `+=${scrollLen}`,
                    onUpdate: (self) => {
                        const idx = Math.min(
                            Math.floor(self.progress * totalCards),
                            totalCards - 1
                        );
                        setActiveIdx(idx);
                        // Build thrown array: everything before current idx
                        setThrown(Array.from({ length: idx }, (_, i) => i));
                    },
                });
            }, sectionRef);

            gsapCtxRef.current.revert = () => ctx.revert();
        })();

        return () => gsapCtxRef.current.revert?.();
    }, [filter, filtered.length]);

    const openModal = useCallback((video: SignalVideo) => {
        setModalVideo(video);
        document.body.style.overflow = "hidden";
    }, []);

    const closeModal = useCallback(() => {
        setModalVideo(null);
        document.body.style.overflow = "";
    }, []);

    return (
        <>
            {/* ── CINEMATIC HEADER ───────────────────────────────────────────── */}
            <div style={{ textAlign: "center", padding: "80px 24px 48px", position: "relative" }}>
                {/* Ambient glow behind header */}
                <div style={{
                    position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                    width: 600, height: 300,
                    background: "radial-gradient(ellipse, rgba(255,215,0,0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.2)",
                    borderRadius: 30, padding: "6px 18px", marginBottom: 20,
                    fontSize: 10, fontWeight: 800, color: "#FFD700",
                    letterSpacing: "0.18em", textTransform: "uppercase",
                }}>
                    <span style={{
                        width: 6, height: 6, background: "#FFD700", borderRadius: "50%",
                        boxShadow: "0 0 8px #FFD700", display: "inline-block",
                        animation: "signal-blink 1.4s ease-in-out infinite",
                    }} />
                    BioDynamX Signal — AI Intelligence Library
                </div>

                <h1 style={{
                    fontSize: "clamp(32px,5vw,64px)", fontWeight: 900,
                    color: "#fff", margin: "0 0 16px", lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                }}>
                    The Knowledge{" "}
                    <span style={{
                        background: "linear-gradient(135deg,#FFD700,#f97316)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        Signal.
                    </span>
                </h1>
                <p style={{
                    fontSize: 17, color: "rgba(255,255,255,0.5)",
                    maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7,
                }}>
                    Education, strategy, and deep insights on AI, neuroscience, and the
                    future of business — direct from the BioDynamX lab.
                </p>

                {/* Category Filter Pills */}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setFilter(cat); setActiveIdx(0); setThrown([]); }}
                            style={{
                                padding: "7px 18px", borderRadius: 30,
                                border: filter === cat
                                    ? "1px solid rgba(255,215,0,0.6)"
                                    : "1px solid rgba(255,255,255,0.12)",
                                background: filter === cat
                                    ? "rgba(255,215,0,0.1)"
                                    : "rgba(255,255,255,0.04)",
                                color: filter === cat ? "#FFD700" : "rgba(255,255,255,0.5)",
                                fontSize: 12, fontWeight: 700, cursor: "pointer",
                                transition: "all 0.25s",
                                letterSpacing: "0.06em",
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── DECK THROW ─────────────────────────────────────────────────── */}
            <section
                ref={sectionRef}
                style={{
                    position: "relative",
                    height: "100vh",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* Scroll hint */}
                <div style={{
                    position: "absolute", bottom: 32, left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    color: "rgba(255,215,0,0.5)", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.1em", pointerEvents: "none",
                    animation: "signal-float 2s ease-in-out infinite",
                }}>
                    <span>SCROLL TO FLIP</span>
                    <span style={{ fontSize: 18 }}>↓</span>
                </div>

                {/* Progress counter */}
                <div style={{
                    position: "absolute", top: 24, right: 40,
                    fontSize: 13, fontWeight: 800,
                    color: "rgba(255,215,0,0.7)", letterSpacing: "0.06em",
                }}>
                    <span style={{ fontSize: 24, color: "#FFD700" }}>
                        {String(activeIdx + 1).padStart(2, "0")}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>
                        /{String(filtered.length).padStart(2, "0")}
                    </span>
                </div>

                {/* Card Stack */}
                <div
                    ref={stackRef}
                    style={{
                        position: "relative",
                        width: "min(640px, 92vw)",
                        height: "min(400px, 60vw)",
                    }}
                >
                    {filtered.map((video, i) => {
                        const isActive = i === activeIdx;
                        const isThrown = thrown.includes(i);
                        const isBehind = i > activeIdx;
                        const stackDrop = Math.min(i - activeIdx, 4) * 10; // max 4 visible behind
                        const stackScale = 1 - Math.min(i - activeIdx, 4) * 0.06;
                        const stackRot = (i - activeIdx) * 1.5;

                        return (
                            <div
                                key={video.id}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    borderRadius: 24,
                                    overflow: "hidden",
                                    cursor: isActive ? "pointer" : "default",
                                    transformOrigin: "center center",
                                    transition: "transform 0.7s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.5s",

                                    // Thrown: fly to the left and fade out
                                    transform: isThrown
                                        ? "translateX(-140%) rotate(-15deg) scale(0.85)"
                                        : isActive
                                            ? "translateX(0) rotate(0deg) scale(1)"
                                            : isBehind
                                                ? `translateY(${stackDrop}px) scale(${stackScale}) rotate(${stackRot}deg)`
                                                : "translateX(0) scale(1)",

                                    opacity: isThrown ? 0 : isBehind && i - activeIdx > 4 ? 0 : 1,
                                    zIndex: isThrown ? 0 : isActive ? filtered.length + 1 : filtered.length - i,

                                    background: "rgba(12,12,16,0.95)",
                                    border: isActive
                                        ? "1px solid rgba(255,215,0,0.5)"
                                        : "1px solid rgba(255,255,255,0.08)",
                                    boxShadow: isActive
                                        ? "0 0 60px rgba(255,215,0,0.15), 0 20px 60px rgba(0,0,0,0.7)"
                                        : "0 8px 30px rgba(0,0,0,0.5)",
                                    backdropFilter: "blur(20px)",
                                }}
                                onClick={() => isActive && openModal(video)}
                            >
                                {/* YouTube Thumbnail */}
                                <div style={{
                                    width: "100%", height: "55%",
                                    position: "relative", overflow: "hidden",
                                    background: "#000",
                                }}>
                                    {/* Thumbnail from YouTube */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                                        alt={video.title}
                                        style={{
                                            width: "100%", height: "100%",
                                            objectFit: "cover",
                                            filter: isActive ? "none" : "brightness(0.4)",
                                            transition: "filter 0.5s",
                                        }}
                                    />

                                    {/* Play Button overlay */}
                                    {isActive && (
                                        <div style={{
                                            position: "absolute", inset: 0,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            background: "rgba(0,0,0,0.3)",
                                        }}>
                                            <div style={{
                                                width: 64, height: 64, borderRadius: "50%",
                                                background: "rgba(255,215,0,0.9)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                boxShadow: "0 0 30px rgba(255,215,0,0.4)",
                                                transition: "transform 0.2s",
                                            }}>
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="#000">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}

                                    {/* Duration badge */}
                                    <div style={{
                                        position: "absolute", bottom: 10, right: 12,
                                        background: "rgba(0,0,0,0.85)", color: "#fff",
                                        fontSize: 11, fontWeight: 700, padding: "2px 8px",
                                        borderRadius: 4, letterSpacing: "0.04em",
                                    }}>
                                        {video.duration}
                                    </div>

                                    {/* Category pill */}
                                    <div style={{
                                        position: "absolute", top: 12, left: 12,
                                        background: `${video.categoryColor}22`,
                                        border: `1px solid ${video.categoryColor}55`,
                                        color: video.categoryColor,
                                        fontSize: 9, fontWeight: 800, padding: "3px 10px",
                                        borderRadius: 20, letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                    }}>
                                        {video.category}
                                    </div>
                                </div>

                                {/* Card body */}
                                <div style={{ padding: "20px 24px" }}>
                                    <h3 style={{
                                        fontSize: 18, fontWeight: 800, color: "#fff",
                                        margin: "0 0 6px", lineHeight: 1.25,
                                        letterSpacing: "-0.02em",
                                    }}>
                                        {video.title}
                                    </h3>
                                    <p style={{
                                        fontSize: 12, color: "rgba(255,255,255,0.45)",
                                        margin: "0 0 12px", fontStyle: "italic",
                                    }}>
                                        {video.subtitle}
                                    </p>
                                    {isActive && (
                                        <p style={{
                                            fontSize: 13, color: "rgba(255,255,255,0.55)",
                                            margin: 0, lineHeight: 1.6,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}>
                                            {video.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CSS animations */}
                <style>{`
                    @keyframes signal-blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.3; }
                    }
                    @keyframes signal-float {
                        0%, 100% { transform: translateX(-50%) translateY(0); }
                        50% { transform: translateX(-50%) translateY(6px); }
                    }
                `}</style>
            </section>

            {/* ── VIDEO MODAL ─────────────────────────────────────────────────── */}
            {modalVideo && (
                <div
                    onClick={closeModal}
                    style={{
                        position: "fixed", inset: 0, zIndex: 9999,
                        background: "rgba(0,0,0,0.92)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backdropFilter: "blur(20px)",
                        animation: "modal-in 0.3s ease",
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: "min(900px, 95vw)",
                            borderRadius: 20,
                            overflow: "hidden",
                            border: "1px solid rgba(255,215,0,0.2)",
                            boxShadow: "0 0 80px rgba(255,215,0,0.1)",
                            background: "#0a0a0f",
                        }}
                    >
                        {/* 16:9 YouTube embed */}
                        <div style={{ position: "relative", paddingTop: "56.25%" }}>
                            <iframe
                                style={{
                                    position: "absolute", top: 0, left: 0,
                                    width: "100%", height: "100%",
                                    border: "none",
                                }}
                                src={`https://www.youtube.com/embed/${modalVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                                allow="autoplay; fullscreen"
                                allowFullScreen
                                title={modalVideo.title}
                            />
                        </div>

                        {/* Modal footer */}
                        <div style={{ padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{
                                    fontSize: 10, fontWeight: 800,
                                    color: modalVideo.categoryColor,
                                    letterSpacing: "0.14em", marginBottom: 4,
                                }}>
                                    {modalVideo.category}
                                </div>
                                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>
                                    {modalVideo.title}
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    color: "#fff", borderRadius: 8,
                                    padding: "8px 16px", cursor: "pointer",
                                    fontSize: 12, fontWeight: 700,
                                }}
                            >
                                ✕ Close
                            </button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes modal-in {
                            from { opacity: 0; transform: scale(0.96); }
                            to   { opacity: 1; transform: scale(1); }
                        }
                    `}</style>
                </div>
            )}

            {/* ── EPISODE GRID (below fold, SEO-rich) ─────────────────────────── */}
            <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
                <h2 style={{
                    fontSize: 22, fontWeight: 900, color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    marginBottom: 32, textAlign: "center",
                }}>
                    All Episodes
                </h2>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 20,
                }}>
                    {SIGNAL_VIDEOS.map((video) => (
                        <article
                            key={video.id}
                            itemScope
                            itemType="https://schema.org/VideoObject"
                            onClick={() => openModal(video)}
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 16, overflow: "hidden",
                                cursor: "pointer",
                                transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
                            }}
                            onMouseEnter={e => {
                                const el = e.currentTarget;
                                el.style.borderColor = `${video.categoryColor}55`;
                                el.style.transform = "translateY(-4px)";
                                el.style.boxShadow = `0 8px 30px rgba(0,0,0,0.5)`;
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget;
                                el.style.borderColor = "rgba(255,255,255,0.07)";
                                el.style.transform = "";
                                el.style.boxShadow = "";
                            }}
                        >
                            {/* Thumbnail */}
                            <div style={{ position: "relative", paddingTop: "56.25%", background: "#111" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                                    alt={video.title}
                                    itemProp="thumbnailUrl"
                                    style={{
                                        position: "absolute", inset: 0,
                                        width: "100%", height: "100%", objectFit: "cover",
                                    }}
                                />
                                <div style={{
                                    position: "absolute", inset: 0,
                                    background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                                }} />
                                <div style={{
                                    position: "absolute", bottom: 8, right: 8,
                                    background: "rgba(0,0,0,0.85)", color: "#fff",
                                    fontSize: 10, padding: "2px 7px", borderRadius: 4,
                                    fontWeight: 700,
                                }}>
                                    {video.duration}
                                </div>
                            </div>

                            {/* Text */}
                            <div style={{ padding: "16px 18px" }}>
                                <span style={{
                                    fontSize: 9, fontWeight: 800,
                                    color: video.categoryColor,
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    display: "block", marginBottom: 6,
                                }}>
                                    {video.category}
                                </span>
                                <h3
                                    itemProp="name"
                                    style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: "0 0 6px", lineHeight: 1.4 }}
                                >
                                    {video.title}
                                </h3>
                                <p
                                    itemProp="description"
                                    style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}
                                >
                                    {video.description}
                                </p>
                                {/* Hidden SEO meta */}
                                <meta itemProp="uploadDate" content="2026-03-08" />
                                <meta itemProp="embedUrl" content={`https://www.youtube.com/embed/${video.youtubeId}`} />
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
