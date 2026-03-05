// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — AMBIENT INTELLIGENCE ENGINE (Web 4.0 Core)
// The site observes, learns, and acts before the visitor does.
//
// Capabilities:
//  • Cursor velocity → intent classification
//  • Scroll depth → engagement scoring
//  • Idle detection → proactive AI triggers
//  • Exit intent → Jenny fires before they leave
//  • Return visitor recognition → personalized re-engagement
//  • Rage-click detection → frustration signal
//  • Section interest scoring → conversation context priming
// ═══════════════════════════════════════════════════════════════════

export type BehaviorSignal =
    | "exit_intent"         // Mouse leaving viewport top → about to close
    | "idle_45s"            // 45 seconds of no activity
    | "idle_90s"            // 90 seconds — deeper re-engagement
    | "rage_click"          // Rapid repeated clicks → frustration
    | "scroll_pricing"      // Reached pricing section
    | "scroll_testimonials" // Reached testimonials
    | "scroll_deep"         // Scrolled 80%+ of page
    | "return_visitor"      // Been here before (localStorage)
    | "high_engagement";    // Spent 2+ min reading

export type VisitorProfile = {
    isReturnVisitor: boolean;
    visitCount: number;
    sessionDuration: number;    // seconds
    scrollDepth: number;        // 0-100%
    interestScore: number;      // 0-100
    pricingViewed: boolean;
    lastSection: string;
    city?: string;
    industry?: string;          // Inferred from referrer
    referrerSource?: string;
};

export type BehaviorIntelCallbacks = {
    onSignal: (signal: BehaviorSignal, profile: VisitorProfile) => void;
    onProfileUpdate?: (profile: VisitorProfile) => void;
};

// ─── Industry inference from referrer/UTM ─────────────────────────

const INDUSTRY_KEYWORDS: Record<string, string> = {
    dental: "dental",
    dentist: "dental",
    orthodon: "dental",
    "med spa": "med_spa",
    medspa: "med_spa",
    aesthetic: "med_spa",
    botox: "med_spa",
    hvac: "home_services",
    plumbing: "home_services",
    roofing: "home_services",
    "real estate": "real_estate",
    realtor: "real_estate",
    realty: "real_estate",
    attorney: "legal",
    lawyer: "legal",
    "law firm": "legal",
    restaurant: "food_beverage",
    salon: "beauty",
    chiropractic: "health",
    "call center": "call_center",
    startup: "startup",
};

function inferIndustryFromReferrer(referrer: string, search: string): string | undefined {
    const combined = (referrer + " " + search).toLowerCase();
    for (const [keyword, industry] of Object.entries(INDUSTRY_KEYWORDS)) {
        if (combined.includes(keyword)) return industry;
    }
    return undefined;
}

function inferReferrerSource(referrer: string): string {
    if (!referrer) return "direct";
    if (referrer.includes("google")) return "google";
    if (referrer.includes("facebook") || referrer.includes("fb.com")) return "facebook";
    if (referrer.includes("instagram")) return "instagram";
    if (referrer.includes("linkedin")) return "linkedin";
    if (referrer.includes("youtube")) return "youtube";
    if (referrer.includes("twitter") || referrer.includes("x.com")) return "twitter";
    return "referral";
}

// ─── Ambient Intelligence Engine ──────────────────────────────────

export class BehaviorIntelEngine {
    private callbacks: BehaviorIntelCallbacks;
    private profile: VisitorProfile;
    private sessionStart = Date.now();
    private lastActivity = Date.now();
    private idleTimers: NodeJS.Timeout[] = [];
    private scrollObserver: IntersectionObserver | null = null;
    private clickBuffer: number[] = []; // timestamps for rage-click detection
    private destroyed = false;

    constructor(callbacks: BehaviorIntelCallbacks) {
        this.callbacks = callbacks;
        this.profile = this.initProfile();
    }

    private initProfile(): VisitorProfile {
        if (typeof window === "undefined") {
            return {
                isReturnVisitor: false, visitCount: 1, sessionDuration: 0,
                scrollDepth: 0, interestScore: 0, pricingViewed: false,
                lastSection: "hero",
            };
        }

        const raw = localStorage.getItem("bdx_visitor");
        const stored = raw ? JSON.parse(raw) : null;
        const visitCount = stored ? stored.visitCount + 1 : 1;
        const isReturnVisitor = visitCount > 1;

        const referrer = document.referrer || "";
        const search = window.location.search;
        const industry = inferIndustryFromReferrer(referrer, search) || stored?.industry;
        const referrerSource = inferReferrerSource(referrer);

        const profile: VisitorProfile = {
            isReturnVisitor,
            visitCount,
            sessionDuration: 0,
            scrollDepth: 0,
            interestScore: 0,
            pricingViewed: false,
            lastSection: "hero",
            industry,
            referrerSource,
        };

        // Save updated visit count
        localStorage.setItem("bdx_visitor", JSON.stringify({
            visitCount,
            industry,
            lastVisit: Date.now(),
        }));

        return profile;
    }

    /** Start all ambient sensors */
    start() {
        if (typeof window === "undefined" || this.destroyed) return;

        // Fire return visitor signal immediately
        if (this.profile.isReturnVisitor) {
            setTimeout(() => this.emit("return_visitor"), 500);
        }

        this.attachExitIntent();
        this.attachIdleDetection();
        this.attachScrollTracking();
        this.attachRageClickDetection();
        this.attachSectionTracking();
        this.startDurationTracking();

        console.log("[BehaviorIntel] 🧠 Ambient Intelligence Engine online", this.profile);
    }

    /** Clean up all event listeners */
    destroy() {
        this.destroyed = true;
        this.idleTimers.forEach(t => clearTimeout(t));
        this.scrollObserver?.disconnect();
        document.removeEventListener("mouseleave", this.handleMouseLeave);
        document.removeEventListener("mousemove", this.resetActivity);
        document.removeEventListener("keydown", this.resetActivity);
        document.removeEventListener("click", this.handleClick);
        window.removeEventListener("scroll", this.handleScroll);
    }

    getProfile(): VisitorProfile {
        return { ...this.profile };
    }

    // ─── Exit Intent ─────────────────────────────────────────────

    private exitIntentFired = false;

    private handleMouseLeave = (e: MouseEvent) => {
        if (this.exitIntentFired || this.destroyed) return;
        // Only fire if cursor leaves from the TOP of the viewport
        if (e.clientY <= 10) {
            this.exitIntentFired = true;
            this.emit("exit_intent");
            console.log("[BehaviorIntel] 🚪 Exit intent detected");
        }
    };

    private attachExitIntent() {
        document.addEventListener("mouseleave", this.handleMouseLeave);
    }

    // ─── Idle Detection ──────────────────────────────────────────

    private idle45Fired = false;
    private idle90Fired = false;

    private resetActivity = () => {
        this.lastActivity = Date.now();
        this.scheduleIdleChecks();
    };

    private scheduleIdleChecks() {
        this.idleTimers.forEach(t => clearTimeout(t));
        this.idleTimers = [];

        if (!this.idle45Fired) {
            this.idleTimers.push(setTimeout(() => {
                if (Date.now() - this.lastActivity >= 44000 && !this.idle45Fired) {
                    this.idle45Fired = true;
                    this.emit("idle_45s");
                    console.log("[BehaviorIntel] ⏱️ 45s idle detected");
                }
            }, 45000));
        }

        if (!this.idle90Fired) {
            this.idleTimers.push(setTimeout(() => {
                if (Date.now() - this.lastActivity >= 89000 && !this.idle90Fired) {
                    this.idle90Fired = true;
                    this.emit("idle_90s");
                    console.log("[BehaviorIntel] ⏱️ 90s idle detected");
                }
            }, 90000));
        }
    }

    private attachIdleDetection() {
        document.addEventListener("mousemove", this.resetActivity, { passive: true });
        document.addEventListener("keydown", this.resetActivity, { passive: true });
        window.addEventListener("scroll", this.resetActivity, { passive: true });
        this.scheduleIdleChecks();
    }

    // ─── Scroll Tracking ─────────────────────────────────────────

    private pricingScrollFired = false;
    private testimonialsScrollFired = false;
    private deepScrollFired = false;

    private handleScroll = () => {
        if (this.destroyed) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const depth = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

        this.profile.scrollDepth = Math.max(this.profile.scrollDepth, depth);
        this.addInterest(depth > 50 ? 5 : 2);

        if (depth >= 80 && !this.deepScrollFired) {
            this.deepScrollFired = true;
            this.emit("scroll_deep");
        }
    };

    private attachScrollTracking() {
        window.addEventListener("scroll", this.handleScroll, { passive: true });
    }

    // ─── Section Tracking via IntersectionObserver ───────────────

    private attachSectionTracking() {
        if (!("IntersectionObserver" in window)) return;

        const sectionMap: Record<string, string> = {
            "#pricing": "pricing",
            "#testimonials": "testimonials",
            "#how-it-works": "how_it_works",
            "#results": "results",
        };

        const sections = Object.keys(sectionMap)
            .map(sel => document.querySelector(sel))
            .filter(Boolean) as Element[];

        if (sections.length === 0) return;

        this.scrollObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting || this.destroyed) continue;
                const id = entry.target.getAttribute("id") || "";
                const sectionKey = `#${id}`;
                const sectionName = sectionMap[sectionKey];

                this.profile.lastSection = sectionName || id;
                this.addInterest(10);

                if (sectionName === "pricing" && !this.pricingScrollFired) {
                    this.pricingScrollFired = true;
                    this.profile.pricingViewed = true;
                    this.emit("scroll_pricing");
                } else if (sectionName === "testimonials" && !this.testimonialsScrollFired) {
                    this.testimonialsScrollFired = true;
                    this.emit("scroll_testimonials");
                }
            }
        }, { threshold: 0.3 });

        sections.forEach(el => this.scrollObserver!.observe(el));
    }

    // ─── Rage Click Detection ─────────────────────────────────────

    private rageClickFired = false;

    private handleClick = (e: MouseEvent) => {
        if (this.destroyed) return;
        const now = Date.now();
        this.clickBuffer.push(now);
        // Keep only last 3 seconds of clicks
        this.clickBuffer = this.clickBuffer.filter(t => now - t < 3000);

        if (this.clickBuffer.length >= 5 && !this.rageClickFired) {
            this.rageClickFired = true;
            this.emit("rage_click");
            console.log("[BehaviorIntel] 😤 Rage click detected", e.target);
        }

        this.resetActivity();
    };

    private attachRageClickDetection() {
        document.addEventListener("click", this.handleClick);
    }

    // ─── Duration Tracking ────────────────────────────────────────

    private highEngagementFired = false;

    private startDurationTracking() {
        const timer = setInterval(() => {
            if (this.destroyed) { clearInterval(timer); return; }
            this.profile.sessionDuration = Math.round((Date.now() - this.sessionStart) / 1000);

            if (this.profile.sessionDuration >= 120 && !this.highEngagementFired) {
                this.highEngagementFired = true;
                this.emit("high_engagement");
                console.log("[BehaviorIntel] 🎯 High engagement detected (2+ min)");
            }

            this.callbacks.onProfileUpdate?.(this.getProfile());
        }, 5000);
    }

    // ─── Helpers ─────────────────────────────────────────────────

    private addInterest(points: number) {
        this.profile.interestScore = Math.min(100, this.profile.interestScore + points);
    }

    private emit(signal: BehaviorSignal) {
        if (this.destroyed) return;
        this.callbacks.onSignal(signal, this.getProfile());
    }
}

// ─── Geo-personalization (async, non-blocking) ────────────────────

export type GeoProfile = {
    city?: string;
    region?: string;
    country?: string;
    org?: string;      // ISP / company
};

export async function fetchGeoProfile(): Promise<GeoProfile> {
    try {
        const res = await fetch("https://ipapi.co/json/", {
            signal: AbortSignal.timeout(3000),
        });
        if (!res.ok) return {};
        const data = await res.json();
        return {
            city: data.city,
            region: data.region,
            country: data.country_name,
            org: data.org,
        };
    } catch {
        return {};
    }
}
