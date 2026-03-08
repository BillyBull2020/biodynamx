/**
 * Mobile Haptic Engine — BioDynamX Web 4.1
 * ─────────────────────────────────────────
 * Zero-dependency haptic feedback utility.
 * Uses navigator.vibrate API (supported on Android Chrome, supported on
 * iOS Safari 16.4+ only with certain conditions).
 *
 * Pattern signatures:
 *  - agentWake   → strong burst (30ms) = "Neural Handoff" you can feel
 *  - collabPing  → light tap (8ms) = background agent notification
 *  - success     → double tap [20,60,20] = task completed
 *  - closingReady → triple burst [15,40,15,40,15] = all agents ready
 *  - vaultOpen   → long affirm [50,80,30] = payment confirmed
 *  - swipeNav    → light swipe tick (5ms) = carousel navigation
 */

type HapticPattern = keyof typeof HAPTIC_PATTERNS;

const HAPTIC_PATTERNS = {
    agentWake: 30,                    // New agent activated — noticeable but not jarring
    collabPing: 8,                     // Background ping — barely perceptible, subconscious
    success: [20, 60, 20],          // Double-tap — task complete
    closingReady: [15, 40, 15, 40, 15], // Triple burst — all agents ready
    vaultOpen: [50, 80, 30],          // Long + short — vault unlocked
    swipeNav: 5,                     // Minimal tick — swipe feedback
    error: [100, 50, 100],        // Error pattern
} as const;

/** Returns true if haptic feedback is supported on this device */
export function hapticSupported(): boolean {
    return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/**
 * Fire a haptic pattern. Silently no-ops on unsupported devices.
 * @param pattern - Named pattern or custom millisecond value/array
 * @param volume  - Override intensity (0.0–1.0), scales ms values proportionally
 */
export function haptic(
    pattern: HapticPattern | number | number[] = "collabPing",
    volume = 1.0
): void {
    if (typeof window === "undefined" || !hapticSupported()) return;

    try {
        // Extract to a mutable type immediately — readonly const tuples can't be passed as number[]
        let p: number | number[];
        if (typeof pattern === "string") {
            const raw = HAPTIC_PATTERNS[pattern];
            p = typeof raw === "number" ? raw : Array.from(raw);
        } else {
            p = typeof pattern === "number" ? pattern : Array.from(pattern as number[]);
        }

        // Scale by volume (clamp 0–1)
        const v = Math.max(0, Math.min(1, volume));
        if (v === 0) return;

        if (typeof p === "number") {
            p = Math.round(p * v);
        } else {
            p = [...p].map(ms => Math.round(ms * v));
        }

        navigator.vibrate(p as number | number[]);
    } catch {
        // Silently swallow — vibrate may throw in some environments
    }
}

/** Shorthand for agent selection haptic (most prominent) */
export const hapticAgentWake = () => haptic("agentWake");

/** Shorthand for background collab ping (subtle) */
export const hapticCollabPing = () => haptic("collabPing");

/** Shorthand for one-call-close all-ready burst */
export const hapticClosingReady = () => haptic("closingReady");

/** Shorthand for vault-open celebration */
export const hapticVaultOpen = () => haptic("vaultOpen");

/** Shorthand for carousel swipe tick */
export const hapticSwipe = () => haptic("swipeNav");

/** Shorthand for success confirmation */
export const hapticSuccess = () => haptic("success");
