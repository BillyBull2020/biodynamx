"use client";
// ═══════════════════════════════════════════════════════════════════
//  BIODYNAMX SIGNAL — "The Showcase" v2
//  Netflix-level editorial layout. Zero scroll dependency.
//  Hero featured player + 3D hover card rail + GSAP FLIP swap.
// ═══════════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect } from "react";
import { SIGNAL_VIDEOS, SIGNAL_CATEGORIES, type SignalVideo } from "@/data/signalVideos";

// ─────────────────────────────────────────────────────────────────────────────

export default function SignalDeckCarousel() {
    const [selected, setSelected] = useState<SignalVideo>(SIGNAL_VIDEOS[0]);
    const [filter, setFilter] = useState("All");
    const [modalOpen, setModalOpen] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLDivElement>(null);

    const filtered = filter === "All"
        ? SIGNAL_VIDEOS
        : SIGNAL_VIDEOS.filter(v => v.category === filter);

    // Keep selected in filtered list; if filtered out, pick first
    useEffect(() => {
        if (!filtered.find(v => v.id === selected.id)) {
            setSelected(filtered[0]);
        }
    }, [filter, filtered, selected.id]);

    // ── GSAP FLIP swap ─────────────────────────────────────────────
    const selectVideo = useCallback(async (video: SignalVideo) => {
        if (video.id === selected.id || isSwapping) return;
        setIsSwapping(true);

        const { default: gsap } = await import("gsap");
        const { Flip } = await import("gsap/Flip");
        gsap.registerPlugin(Flip);

        const state = Flip.getState(heroRef.current);
        setSelected(video);

        requestAnimationFrame(() => {
            Flip.from(state, {
                duration: 0.45,
                ease: "power2.inOut",
                onComplete: () => setIsSwapping(false),
            });
        });
    }, [selected.id, isSwapping]);

    const openModal = useCallback(() => {
        setModalOpen(true);
        document.body.style.overflow = "hidden";
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        document.body.style.overflow = "";
    }, []);

    return (
        <>
            {/* ── PAGE HEADER ────────────────────────────────────────────────── */}
            <div style={{ textAlign: "center", padding: "80px 24px 56px", position: "relative" }}>
                <div style={{
                    position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                    width: 700, height: 300, pointerEvents: "none",
                    background: "radial-gradient(ellipse, rgba(255,215,0,0.05) 0%, transparent 70%)",
                }} />

                {/* Live badge */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(255,215,0,0.07)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    borderRadius: 30, padding: "6px 20px", marginBottom: 24,
                    fontSize: 10, fontWeight: 900, color: "#FFD700",
                    letterSpacing: "0.18em", textTransform: "uppercase",
                }}>
                    <span style={{
                        width: 7, height: 7, background: "#FFD700", borderRadius: "50%",
                        display: "inline-block", boxShadow: "0 0 8px #FFD700",
                        animation: "sig-pulse 1.4s ease-in-out infinite",
                    }} />
                    BioDynamX Signal · AI Intelligence Library
                </div>

                <h1 style={{
                    fontSize: "clamp(36px,5vw,72px)", fontWeight: 900, letterSpacing: "-0.04em",
                    color: "#fff", margin: "0 0 16px", lineHeight: 1.05,
                }}>
                    The Knowledge{" "}
                    <span style={{
                        background: "linear-gradient(135deg,#FFD700 0%,#f97316 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        Signal.
                    </span>
                </h1>
                <p style={{
                    fontSize: 17, color: "rgba(255,255,255,0.45)",
                    maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7,
                }}>
                    Education, strategy, and deep intelligence on AI, neuroscience, and
                    autonomous business growth — from the BioDynamX lab.
                </p>

                {/* Filter pills */}
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {SIGNAL_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                padding: "7px 18px", borderRadius: 30,
                                border: filter === cat
                                    ? "1px solid rgba(255,215,0,0.6)"
                                    : "1px solid rgba(255,255,255,0.1)",
                                background: filter === cat
                                    ? "rgba(255,215,0,0.12)"
                                    : "rgba(255,255,255,0.04)",
                                color: filter === cat ? "#FFD700" : "rgba(255,255,255,0.45)",
                                fontSize: 12, fontWeight: 700, cursor: "pointer",
                                transition: "all 0.22s",
                                letterSpacing: "0.06em", outline: "none",
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── FEATURED HERO ──────────────────────────────────────────────── */}
            <div style={{ padding: "0 clamp(16px,4vw,60px) 48px", maxWidth: 1200, margin: "0 auto" }}>

                {/* Hero card */}
                <div
                    ref={heroRef}
                    onClick={openModal}
                    style={{
                        position: "relative",
                        borderRadius: 24,
                        overflow: "hidden",
                        cursor: "pointer",
                        aspectRatio: "16 / 7",
                        background: "#050508",
                        border: `1px solid ${selected.categoryColor}33`,
                        boxShadow: `0 0 80px ${selected.categoryColor}18, 0 30px 80px rgba(0,0,0,0.6)`,
                        transition: "border-color 0.5s, box-shadow 0.5s",
                    }}
                >
                    {/* Thumbnail — full bleed with cinematic gradient overlay */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://img.youtube.com/vi/${selected.youtubeId}/maxresdefault.jpg`}
                        alt={selected.title}
                        style={{
                            position: "absolute", inset: 0,
                            width: "100%", height: "100%", objectFit: "cover",
                            transition: "opacity 0.4s",
                        }}
                    />

                    {/* Cinematic gradient */}
                    <div style={{
                        position: "absolute", inset: 0,
                        background: `
                            linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.1) 100%),
                            linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)
                        `,
                    }} />

                    {/* Ambient color bleed from category */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 3,
                        background: `linear-gradient(to right, ${selected.categoryColor}, transparent)`,
                        transition: "background 0.5s",
                    }} />

                    {/* Text overlay */}
                    <div style={{
                        position: "absolute", bottom: 0, left: 0,
                        padding: "clamp(20px,3vw,40px)",
                        maxWidth: "55%",
                    }}>
                        {/* Category badge */}
                        <div style={{
                            display: "inline-flex", alignItems: "center",
                            background: `${selected.categoryColor}22`,
                            border: `1px solid ${selected.categoryColor}55`,
                            color: selected.categoryColor,
                            fontSize: 9, fontWeight: 900, padding: "4px 12px",
                            borderRadius: 20, letterSpacing: "0.14em",
                            textTransform: "uppercase", marginBottom: 12,
                        }}>
                            {selected.category} · {selected.duration}
                        </div>

                        <h2 style={{
                            fontSize: "clamp(18px,2.5vw,32px)", fontWeight: 900,
                            color: "#fff", margin: "0 0 10px", lineHeight: 1.2,
                            letterSpacing: "-0.02em",
                        }}>
                            {selected.title}
                        </h2>
                        <p style={{
                            fontSize: "clamp(12px,1.2vw,15px)",
                            color: "rgba(255,255,255,0.55)",
                            margin: "0 0 20px", lineHeight: 1.6,
                        }}>
                            {selected.description}
                        </p>

                        {/* Play CTA */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 10,
                            background: "#FFD700", color: "#000",
                            borderRadius: 12, padding: "10px 22px",
                            fontSize: 13, fontWeight: 900, letterSpacing: "-0.01em",
                            boxShadow: "0 0 30px rgba(255,215,0,0.35)",
                            transition: "transform 0.2s, box-shadow 0.2s",
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Watch Now
                        </div>
                    </div>

                    {/* Hover play ring (top-right) */}
                    <div style={{
                        position: "absolute", top: 20, right: 20,
                        width: 52, height: 52, borderRadius: "50%",
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backdropFilter: "blur(8px)",
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* ── THUMBNAIL RAIL ─────────────────────────────────────────── */}
                <div
                    ref={railRef}
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(filtered.length, 6)}, 1fr)`,
                        gap: 12,
                        marginTop: 16,
                    }}
                >
                    {filtered.map((video, i) => {
                        const isActive = video.id === selected.id;
                        return (
                            <div
                                key={video.id}
                                onClick={() => selectVideo(video)}
                                style={{
                                    position: "relative",
                                    borderRadius: 14,
                                    overflow: "hidden",
                                    cursor: isActive ? "default" : "pointer",
                                    aspectRatio: "16/10",
                                    border: isActive
                                        ? `2px solid ${video.categoryColor}`
                                        : "2px solid rgba(255,255,255,0.07)",
                                    boxShadow: isActive
                                        ? `0 0 20px ${video.categoryColor}44`
                                        : "none",
                                    transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
                                    // 3D tilt — handled via onMouseMove
                                    transformStyle: "preserve-3d",
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.transform = "scale(1.04) translateY(-3px)";
                                        e.currentTarget.style.borderColor = `${video.categoryColor}88`;
                                    }
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "";
                                    e.currentTarget.style.borderColor = isActive
                                        ? video.categoryColor
                                        : "rgba(255,255,255,0.07)";
                                }}
                                onMouseMove={e => {
                                    if (isActive) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
                                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
                                    e.currentTarget.style.transform =
                                        `scale(1.04) translateY(-3px) perspective(600px) rotateX(${y}deg) rotateY(${x}deg)`;
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                                    alt={video.title}
                                    style={{
                                        width: "100%", height: "100%",
                                        objectFit: "cover",
                                        filter: isActive ? "none" : "brightness(0.55)",
                                        transition: "filter 0.3s",
                                    }}
                                />
                                {/* Gradient overlay */}
                                <div style={{
                                    position: "absolute", inset: 0,
                                    background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
                                }} />

                                {/* Active indicator */}
                                {isActive && (
                                    <div style={{
                                        position: "absolute", top: 8, right: 8,
                                        background: video.categoryColor,
                                        borderRadius: 4, padding: "2px 7px",
                                        fontSize: 8, fontWeight: 900, color: "#000",
                                        letterSpacing: "0.08em",
                                    }}>
                                        ▶ PLAYING
                                    </div>
                                )}

                                {/* Episode number */}
                                <div style={{
                                    position: "absolute", bottom: 7, left: 8,
                                    fontSize: 9, fontWeight: 800,
                                    color: isActive ? video.categoryColor : "rgba(255,255,255,0.5)",
                                    letterSpacing: "0.1em",
                                }}>
                                    {String(i + 1).padStart(2, "0")}
                                </div>

                                {/* Duration */}
                                <div style={{
                                    position: "absolute", bottom: 7, right: 8,
                                    background: "rgba(0,0,0,0.7)", color: "#fff",
                                    fontSize: 9, fontWeight: 700, padding: "1px 5px",
                                    borderRadius: 3,
                                }}>
                                    {video.duration}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Selected episode title strip */}
                <div style={{
                    marginTop: 20, padding: "14px 20px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    display: "flex", alignItems: "center", gap: 16,
                }}>
                    <div style={{
                        width: 3, height: 36, borderRadius: 2,
                        background: `linear-gradient(to bottom, ${selected.categoryColor}, transparent)`,
                        flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: 10, fontWeight: 800, color: selected.categoryColor,
                            letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3,
                        }}>
                            Now Featured · {selected.category}
                        </div>
                        <div style={{
                            fontSize: 14, fontWeight: 800, color: "#fff",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {selected.title}
                        </div>
                    </div>
                    <button
                        onClick={openModal}
                        style={{
                            background: selected.categoryColor,
                            color: "#000", border: "none",
                            borderRadius: 8, padding: "8px 18px",
                            fontSize: 12, fontWeight: 900, cursor: "pointer",
                            boxShadow: `0 0 20px ${selected.categoryColor}44`,
                            flexShrink: 0, letterSpacing: "-0.01em",
                        }}
                    >
                        ▶ Play Full Episode
                    </button>
                </div>
            </div>

            {/* ── SEO GRID (all episodes, hidden aesthetically) ────────────── */}
            <section style={{ padding: "60px clamp(16px,4vw,60px) 80px", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 16, marginBottom: 28,
                }}>
                    <div style={{
                        flex: 1, height: 1,
                        background: "linear-gradient(to right, rgba(255,215,0,0.2), transparent)",
                    }} />
                    <span style={{
                        fontSize: 11, fontWeight: 800, color: "rgba(255,215,0,0.5)",
                        letterSpacing: "0.2em", textTransform: "uppercase",
                    }}>
                        All Episodes
                    </span>
                    <div style={{
                        flex: 1, height: 1,
                        background: "linear-gradient(to left, rgba(255,215,0,0.2), transparent)",
                    }} />
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 16,
                }}>
                    {SIGNAL_VIDEOS.map((video, i) => (
                        <article
                            key={video.id}
                            itemScope
                            itemType="https://schema.org/VideoObject"
                            onClick={() => { setFilter("All"); selectVideo(video); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                            style={{
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 14, overflow: "hidden",
                                cursor: "pointer",
                                transition: "border-color 0.3s, transform 0.3s",
                                display: "flex", flexDirection: "column",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = `${video.categoryColor}44`;
                                e.currentTarget.style.transform = "translateY(-3px)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                                e.currentTarget.style.transform = "";
                            }}
                        >
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
                                    background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)",
                                }} />
                                <div style={{
                                    position: "absolute", bottom: 8, right: 8,
                                    background: "rgba(0,0,0,0.8)", color: "#fff",
                                    fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                                }}>
                                    {video.duration}
                                </div>
                                <div style={{
                                    position: "absolute", top: 8, left: 8,
                                    background: `${video.categoryColor}22`,
                                    border: `1px solid ${video.categoryColor}55`,
                                    color: video.categoryColor,
                                    fontSize: 8, fontWeight: 900, padding: "2px 8px",
                                    borderRadius: 20, letterSpacing: "0.1em", textTransform: "uppercase",
                                }}>
                                    {video.category}
                                </div>
                            </div>
                            <div style={{ padding: "14px 16px", flex: 1 }}>
                                <div style={{
                                    fontSize: 10, color: "rgba(255,255,255,0.3)",
                                    fontWeight: 700, marginBottom: 5, letterSpacing: "0.06em",
                                }}>
                                    EP {String(i + 1).padStart(2, "0")}
                                </div>
                                <h3
                                    itemProp="name"
                                    style={{
                                        fontSize: 13, fontWeight: 800, color: "#fff",
                                        margin: "0 0 5px", lineHeight: 1.4,
                                    }}
                                >
                                    {video.title}
                                </h3>
                                <p
                                    itemProp="description"
                                    style={{
                                        fontSize: 11, color: "rgba(255,255,255,0.38)",
                                        margin: 0, lineHeight: 1.55,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    }}
                                >
                                    {video.description}
                                </p>
                                <meta itemProp="uploadDate" content="2026-03-08" />
                                <meta itemProp="embedUrl" content={`https://www.youtube.com/embed/${video.youtubeId}`} />
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* ── VIDEO MODAL ──────────────────────────────────────────────── */}
            {modalOpen && (
                <div
                    onClick={closeModal}
                    style={{
                        position: "fixed", inset: 0, zIndex: 9999,
                        background: "rgba(0,0,0,0.93)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backdropFilter: "blur(24px)",
                        animation: "modal-show 0.3s ease",
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: "min(960px, 95vw)",
                            borderRadius: 20,
                            overflow: "hidden",
                            background: "#060609",
                            border: `1px solid ${selected.categoryColor}33`,
                            boxShadow: `0 0 100px ${selected.categoryColor}20`,
                        }}
                    >
                        <div style={{ position: "relative", paddingTop: "56.25%" }}>
                            <iframe
                                style={{
                                    position: "absolute", inset: 0,
                                    width: "100%", height: "100%", border: "none",
                                }}
                                src={`https://www.youtube.com/embed/${selected.youtubeId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                                allow="autoplay; fullscreen"
                                allowFullScreen
                                title={selected.title}
                            />
                        </div>

                        <div style={{
                            padding: "18px 24px",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            gap: 16,
                        }}>
                            <div style={{ minWidth: 0 }}>
                                <div style={{
                                    fontSize: 9, fontWeight: 900, color: selected.categoryColor,
                                    letterSpacing: "0.14em", marginBottom: 4, textTransform: "uppercase",
                                }}>
                                    {selected.category} · {selected.duration}
                                </div>
                                <div style={{
                                    fontSize: 16, fontWeight: 800, color: "#fff",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                }}>
                                    {selected.title}
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    color: "rgba(255,255,255,0.7)", borderRadius: 8,
                                    padding: "8px 16px", cursor: "pointer",
                                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                                }}
                            >
                                ✕ Close
                            </button>
                        </div>
                    </div>

                    <style>{`
                        @keyframes modal-show {
                            from { opacity: 0; transform: scale(0.97); }
                            to   { opacity: 1; transform: scale(1); }
                        }
                    `}</style>
                </div>
            )}

            {/* ── GLOBAL ANIMATIONS ───────────────────────────────────────── */}
            <style>{`
                @keyframes sig-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.35; transform: scale(0.85); }
                }
            `}</style>
        </>
    );
}
