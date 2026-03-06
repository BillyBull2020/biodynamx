/**
 * BioDynamX GSAP Animation Suite
 * ────────────────────────────────────────────────────────────────────────────
 * World-class scroll-driven animations for the BioDynamX homepage.
 * Wired to GSAP ScrollTrigger — everything is lazy-loaded, GPU-composited,
 * and properly cleaned up on unmount via the returned cleanup function.
 *
 * Sections animated:
 *   1. Section titles     — split-by-word slide-up on scroll
 *   2. Agent cards        — staggered 3D tilt entrance (11 agents)
 *   3. Stats numbers      — count-up with easing on scroll enter
 *   4. Brain layer cards  — alternating left/right cinematic reveal
 *   5. Before/After       — simultaneous opposed slide-in
 *   6. Neuroscience cards — staggered scale-up with glow
 *   7. CTA section        — pulsing attention beacon
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────────────────────
// 1.  HERO TEXT ENTRANCE
// ─────────────────────────────────────────────────────────────────────────────
function animateHero() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-label", { opacity: 0, y: 24, duration: 0.7, delay: 0.2 })
        .from(".hero-headline", { opacity: 0, y: 40, duration: 0.9 }, "-=0.4")
        .from(".hero-sub", { opacity: 0, y: 24, duration: 0.7 }, "-=0.5")
        .from(".hero-cta-primary", { opacity: 0, scale: 0.92, duration: 0.6 }, "-=0.4")
        .from(".hero-cta-secondary", { opacity: 0, scale: 0.92, duration: 0.5 }, "-=0.4")
        .from(".hero-scarcity", { opacity: 0, y: 12, duration: 0.5 }, "-=0.3");

    return tl;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.  SECTION TITLE STAGGER (all .section-title elements)
// ─────────────────────────────────────────────────────────────────────────────
function animateSectionTitles() {
    const triggers: ScrollTrigger[] = [];

    document.querySelectorAll<HTMLElement>(".section-title").forEach((el) => {
        const st = ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            onEnter: () => {
                gsap.from(el, {
                    opacity: 0,
                    y: 48,
                    duration: 0.9,
                    ease: "power3.out",
                    clearProps: "all",
                });
            },
            once: true,
        });
        triggers.push(st);
    });

    document.querySelectorAll<HTMLElement>(".section-label").forEach((el) => {
        const st = ScrollTrigger.create({
            trigger: el,
            start: "top 90%",
            onEnter: () => {
                gsap.from(el, {
                    opacity: 0,
                    y: 16,
                    duration: 0.6,
                    ease: "power2.out",
                    clearProps: "all",
                });
            },
            once: true,
        });
        triggers.push(st);
    });

    return triggers;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.  AGENT CARDS — cinematic staggered 3D entrance
// ─────────────────────────────────────────────────────────────────────────────
function animateAgentCards() {
    const cards = document.querySelectorAll<HTMLElement>(".agent-card");
    if (!cards.length) return null;

    gsap.set(cards, { opacity: 0, y: 60, rotateX: 12, transformPerspective: 900 });

    const st = ScrollTrigger.create({
        trigger: ".agent-grid",
        start: "top 80%",
        onEnter: () => {
            gsap.to(cards, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.75,
                stagger: { each: 0.08, from: "start" },
                ease: "power3.out",
                clearProps: "rotateX,transformPerspective",
            });
        },
        once: true,
    });

    // Subtle continuous float for each card
    cards.forEach((card, i) => {
        gsap.to(card, {
            y: `${(i % 2 === 0 ? -6 : 6)}`,
            duration: 3 + (i % 3) * 0.4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * 0.15,
        });
    });

    return st;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.  STATS — count-up animation
// ─────────────────────────────────────────────────────────────────────────────
function animateStats() {
    const statNumbers = document.querySelectorAll<HTMLElement>("[data-stat-val]");
    if (!statNumbers.length) return null;

    gsap.set(statNumbers, { opacity: 0, scale: 0.8 });

    const st = ScrollTrigger.create({
        trigger: "#results",
        start: "top 75%",
        onEnter: () => {
            statNumbers.forEach((el, i) => {
                const target = parseFloat(el.getAttribute("data-stat-val") || "0");
                const suffix = el.getAttribute("data-stat-suffix") || "";
                const isLarge = target >= 1000;

                gsap.to(el, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    delay: i * 0.07,
                    ease: "back.out(1.4)",
                });

                const proxy = { val: 0 };
                gsap.to(proxy, {
                    val: target,
                    duration: 2,
                    delay: i * 0.07 + 0.2,
                    ease: "power2.out",
                    onUpdate() {
                        const v = proxy.val;
                        if (isLarge) {
                            el.textContent =
                                target === 6300
                                    ? `${Math.round(v).toLocaleString()}x`
                                    : target === 7500
                                        ? `${Math.round(v).toLocaleString()}+`
                                        : v >= 1
                                            ? `$${(v / 1000000).toFixed(1)}M+`
                                            : `$${v.toFixed(1)}M+`;
                        } else {
                            el.textContent = `${v % 1 === 0 ? Math.round(v) : v.toFixed(0)}${suffix}`;
                        }
                    },
                });
            });
        },
        once: true,
    });

    return st;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.  HOW IT WORKS — alternating left/right card reveals
// ─────────────────────────────────────────────────────────────────────────────
function animateHowItWorks() {
    const cards = document.querySelectorAll<HTMLElement>("#how-it-works .standard-card");
    if (!cards.length) return null;

    gsap.set(cards, { opacity: 0, x: 0, y: 50 });

    const triggers: ScrollTrigger[] = [];

    cards.forEach((card, i) => {
        const xFrom = i % 2 === 0 ? -60 : 60;
        gsap.set(card, { x: xFrom, y: 0, opacity: 0 });

        const st = ScrollTrigger.create({
            trigger: card,
            start: "top 82%",
            onEnter: () => {
                gsap.to(card, {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: "power3.out",
                    clearProps: "x",
                });
            },
            once: true,
        });
        triggers.push(st);
    });

    return triggers;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6.  BEFORE / AFTER — simultaneous opposed slide reveal
// ─────────────────────────────────────────────────────────────────────────────
function animateBeforeAfter() {
    const cols = document.querySelectorAll<HTMLElement>(".section-container .grid-2-col-responsive > div");
    if (cols.length < 2) return null;

    const without = cols[0];
    const with_ = cols[1];

    if (!without || !with_) return null;

    gsap.set(without, { opacity: 0, x: -60 });
    gsap.set(with_, { opacity: 0, x: 60 });

    const st = ScrollTrigger.create({
        trigger: without.parentElement,
        start: "top 80%",
        onEnter: () => {
            gsap.to([without, with_], {
                opacity: 1,
                x: 0,
                duration: 0.9,
                stagger: 0.15,
                ease: "power3.out",
                clearProps: "x",
            });
        },
        once: true,
    });

    return st;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7.  NEUROSCIENCE CARDS — scale-up with glow burst
// ─────────────────────────────────────────────────────────────────────────────
function animateNeuroCards() {
    const section = document.getElementById("neuroscience");
    if (!section) return null;

    const cards = section.querySelectorAll<HTMLElement>(".standard-card");
    if (!cards.length) return null;

    gsap.set(cards, { opacity: 0, scale: 0.88, y: 30 });

    const st = ScrollTrigger.create({
        trigger: section,
        start: "top 78%",
        onEnter: () => {
            gsap.to(cards, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: "back.out(1.6)",
                clearProps: "scale",
            });
        },
        once: true,
    });

    return st;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8.  TESTIMONIAL CARDS — shimmer reveal
// ─────────────────────────────────────────────────────────────────────────────
function animateTestimonials() {
    const cards = document.querySelectorAll<HTMLElement>(".testimonial-card");
    if (!cards.length) return null;

    gsap.set(cards, { opacity: 0, y: 40 });

    const st = ScrollTrigger.create({
        trigger: cards[0],
        start: "top 82%",
        onEnter: () => {
            gsap.to(cards, {
                opacity: 1,
                y: 0,
                duration: 0.75,
                stagger: 0.13,
                ease: "power2.out",
                clearProps: "y",
            });
        },
        once: true,
    });

    return st;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9.  ORBIT SECTION — pulsing background glow
// ─────────────────────────────────────────────────────────────────────────────
function animateOrbitSection() {
    const section = document.querySelector<HTMLElement>(".orbit-section");
    if (!section) return null;

    gsap.fromTo(
        section,
        { backgroundSize: "100% 100%" },
        {
            backgroundSize: "110% 110%",
            duration: 6,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
        }
    );

    // Title entrance
    const title = section.querySelector<HTMLElement>(".section-title");
    const desc = section.querySelector<HTMLElement>(".section-desc");

    if (title) {
        ScrollTrigger.create({
            trigger: section,
            start: "top 75%",
            onEnter: () => {
                gsap.from([title, desc].filter(Boolean), {
                    opacity: 0,
                    y: 40,
                    duration: 0.9,
                    stagger: 0.15,
                    ease: "power3.out",
                    clearProps: "all",
                });
            },
            once: true,
        });
    }

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER INIT — call once after DOM ready
// ─────────────────────────────────────────────────────────────────────────────
export function initGSAPAnimations(): () => void {
    if (typeof window === "undefined") return () => { };

    const all: (ScrollTrigger | ScrollTrigger[] | gsap.core.Timeline | null | undefined)[] = [];

    all.push(animateHero());
    all.push(...animateSectionTitles());
    all.push(animateAgentCards());
    all.push(animateStats());
    all.push(...(animateHowItWorks() ?? []));
    all.push(animateBeforeAfter());
    all.push(animateNeuroCards());
    all.push(animateTestimonials());
    animateOrbitSection();

    // Cleanup: kill all ScrollTriggers and tweens
    return () => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
        gsap.globalTimeline.clear();
    };
}
