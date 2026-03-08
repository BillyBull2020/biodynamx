/**
 * NEURAL MEMORY — BioDynamX Web 4.0 Context Bridge
 * ──────────────────────────────────────────────────
 * A lightweight singleton that stores the user's session context.
 * Any component can read or update this without prop-drilling.
 * Persisted to sessionStorage so state survives soft navigation.
 */

export type SessionStage = "Awareness" | "Discovery" | "Consideration" | "Intent" | "Decision";

export interface NeuralContext {
    lastTalkedTo: string | null;
    detectedPainPoint: string | null;
    sessionStage: SessionStage;
    agentColor: string | null;
    scrollSection: string | null;
    conversationActive: boolean;
}

type Listener = (ctx: NeuralContext) => void;

const DEFAULT: NeuralContext = {
    lastTalkedTo: null,
    detectedPainPoint: null,
    sessionStage: "Awareness",
    agentColor: null,
    scrollSection: null,
    conversationActive: false,
};

let _ctx: NeuralContext = { ...DEFAULT };
const _listeners = new Set<Listener>();

// Load from sessionStorage on first import (client only)
if (typeof window !== "undefined") {
    try {
        const stored = sessionStorage.getItem("bdx_neural_ctx");
        if (stored) _ctx = { ...DEFAULT, ...JSON.parse(stored) };
    } catch { /* ignore */ }
}

function save() {
    if (typeof window !== "undefined") {
        try { sessionStorage.setItem("bdx_neural_ctx", JSON.stringify(_ctx)); } catch { /* ignore */ }
    }
}

function notify() {
    _listeners.forEach(fn => fn({ ..._ctx }));
}

export const NeuralMemory = {
    get(): NeuralContext {
        return { ..._ctx };
    },

    update(patch: Partial<NeuralContext>) {
        _ctx = { ..._ctx, ...patch };
        save();
        notify();
        // Dispatch a global DOM event so non-React code can listen too
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("bdx:neural-update", { detail: { ..._ctx } }));
        }
    },

    subscribe(fn: Listener): () => void {
        _listeners.add(fn);
        fn({ ..._ctx }); // immediately call with current state
        return () => _listeners.delete(fn);
    },

    reset() {
        _ctx = { ...DEFAULT };
        save();
        notify();
    },
};
