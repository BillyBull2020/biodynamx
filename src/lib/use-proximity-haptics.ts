// ═══════════════════════════════════════════════════════════════════════
// PROXIMITY HAPTICS — Web 4.0 Predictive Tactile Interface
// ═══════════════════════════════════════════════════════════════════════
//
// As the user's mouse (or finger, via touch) nears an Advanta-Pod or
// Stripe trigger, the phone provides a 2ms pre-touch vibration and the
// element gains a proximity-distance gold glow.
//
// Works on:   .advanta-pod  .stripe-trigger  .neural-plate
// Mobile:     Approximated via touchmove
// Desktop:    mousemove with distance calculation
//
// Usage:  useProximityHaptics() — call once at the root VaultUI level
// ═══════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";

const PROXIMITY_SELECTORS = ".advanta-pod, .stripe-trigger, .neural-plate, #recovery-stripe-cta";
const PROXIMITY_RADIUS = 100; // px — vibration triggers inside this radius
const GLOW_RADIUS = 140;      // px — glow starts appearing here
const HAPTIC_COOLDOWN = 600;  // ms — don't fire more often than this

export function useProximityHaptics() {
    const lastHapticRef = useRef<number>(0);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // ─── mousemove (desktop) ───────────────────────────────────────
        const onMouseMove = (e: MouseEvent) => {
            rafRef.current = requestAnimationFrame(() => {
                const pods = document.querySelectorAll<HTMLElement>(PROXIMITY_SELECTORS);
                pods.forEach(pod => {
                    const rect = pod.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const distance = Math.sqrt(
                        Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2)
                    );

                    // Glow proportional to proximity
                    if (distance < GLOW_RADIUS) {
                        const intensity = Math.max(0, (GLOW_RADIUS - distance) / GLOW_RADIUS);
                        const alpha = (intensity * 0.4).toFixed(2);
                        const size = Math.round(intensity * 24);
                        pod.style.filter = `drop-shadow(0 0 ${size}px rgba(255,215,0,${alpha}))`;
                        pod.style.transition = "filter 0.08s ease";
                    } else {
                        pod.style.filter = "";
                    }

                    // Haptic on proximity enter — mobile only (navigator.vibrate)
                    if (distance < PROXIMITY_RADIUS) {
                        const now = Date.now();
                        if (now - lastHapticRef.current > HAPTIC_COOLDOWN) {
                            lastHapticRef.current = now;
                            if (navigator.vibrate) navigator.vibrate(2);
                        }
                    }
                });
            });
        };

        // ─── touchmove (mobile) ────────────────────────────────────────
        // On mobile, finger position approximates proximity.
        // We use a slightly larger zone since touch is less precise.
        const onTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;

            rafRef.current = requestAnimationFrame(() => {
                const pods = document.querySelectorAll<HTMLElement>(PROXIMITY_SELECTORS);
                pods.forEach(pod => {
                    const rect = pod.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const distance = Math.sqrt(
                        Math.pow(touch.clientX - cx, 2) + Math.pow(touch.clientY - cy, 2)
                    );

                    if (distance < PROXIMITY_RADIUS * 1.4) {
                        const now = Date.now();
                        if (now - lastHapticRef.current > HAPTIC_COOLDOWN) {
                            lastHapticRef.current = now;
                            if (navigator.vibrate) navigator.vibrate(2);
                        }
                    }
                });
            });
        };

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("touchmove", onTouchMove);
            cancelAnimationFrame(rafRef.current);

            // Clean up any lingering glow styles
            document.querySelectorAll<HTMLElement>(PROXIMITY_SELECTORS).forEach(pod => {
                pod.style.filter = "";
            });
        };
    }, []);
}
