/**
 * Neural Audio Engine — BioDynamX Web 4.0
 * ────────────────────────────────────────
 * Synthesizes ALL transition sounds via Web Audio API.
 * Zero external files. Zero latency. Zero blocking.
 *
 * Sounds:
 *  - triggerHandoffWhoop()  — spatial low→high sweep (tunnel effect)
 *  - triggerNeuralPing()    — clean high-freq validation ping
 *  - triggerDataHum()       — ambient background hum (returns stop fn)
 *  - triggerCollabPing()    — soft collab notification tick
 *  - triggerClosingPing()   — punchy agent-ready confirmation chime
 *  - triggerVaultOpen()     — celebratory vault-unlock cascade
 */

let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
    if (!_ctx || _ctx.state === "closed") {
        _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (_ctx.state === "suspended") {
        _ctx.resume().catch(() => { });
    }
    return _ctx;
}

function gain(volume: number, context = ctx()): GainNode {
    const g = context.createGain();
    g.gain.setValueAtTime(volume, context.currentTime);
    g.connect(context.destination);
    return g;
}

/** Spatial whoosh: stereo sweep from sides to center, low→high freq ramp */
export function triggerHandoffWhoop(): void {
    if (typeof window === "undefined") return;
    try {
        const c = ctx();
        const now = c.currentTime;

        // Oscillator 1: rumble base
        const osc1 = c.createOscillator();
        const g1 = c.createGain();
        const panner = c.createStereoPanner();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(60, now);
        osc1.frequency.exponentialRampToValueAtTime(240, now + 0.55);

        // Spatial: start wide (-0.8), sweep to center (0)
        panner.pan.setValueAtTime(-0.8, now);
        panner.pan.linearRampToValueAtTime(0, now + 0.5);

        g1.gain.setValueAtTime(0, now);
        g1.gain.linearRampToValueAtTime(0.22, now + 0.08);
        g1.gain.linearRampToValueAtTime(0.18, now + 0.4);
        g1.gain.linearRampToValueAtTime(0, now + 0.55);

        osc1.connect(g1);
        g1.connect(panner);
        panner.connect(c.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        // Oscillator 2: shimmer layer (higher, mirrored pan right→center)
        const osc2 = c.createOscillator();
        const g2 = c.createGain();
        const pan2 = c.createStereoPanner();

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(160, now);
        osc2.frequency.exponentialRampToValueAtTime(520, now + 0.55);

        pan2.pan.setValueAtTime(0.8, now);
        pan2.pan.linearRampToValueAtTime(0, now + 0.5);

        g2.gain.setValueAtTime(0, now);
        g2.gain.linearRampToValueAtTime(0.1, now + 0.1);
        g2.gain.linearRampToValueAtTime(0, now + 0.55);

        osc2.connect(g2);
        g2.connect(pan2);
        pan2.connect(c.destination);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.6);

    } catch { /* silent fail */ }
}

/** Clean high-frequency ping — dopamine validation cue */
export function triggerNeuralPing(): void {
    if (typeof window === "undefined") return;
    try {
        const c = ctx();
        const now = c.currentTime;

        const osc = c.createOscillator();
        const g = c.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(820, now + 0.25);

        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.18, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(g);
        g.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.4);

        // Harmonic overtone for richness
        const osc2 = c.createOscillator();
        const g2 = c.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(2400, now);
        osc2.frequency.exponentialRampToValueAtTime(1640, now + 0.2);
        g2.gain.setValueAtTime(0.06, now);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc2.connect(g2);
        g2.connect(c.destination);
        osc2.start(now);
        osc2.stop(now + 0.3);

    } catch { /* silent fail */ }
}

/** Ambient data hum — plays continuously during live session. Returns stop function. */
export function triggerDataHum(): () => void {
    if (typeof window === "undefined") return () => { };
    try {
        const c = ctx();
        const now = c.currentTime;

        const osc = c.createOscillator();
        const g = c.createGain();
        const filter = c.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(55, now); // Sub-bass hum
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(200, now);

        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.05, now + 2);

        osc.connect(filter);
        filter.connect(g);
        g.connect(c.destination);
        osc.start(now);

        return () => {
            try {
                g.gain.linearRampToValueAtTime(0, c.currentTime + 1.5);
                osc.stop(c.currentTime + 1.6);
            } catch { /* ignore */ }
        };
    } catch {
        return () => { };
    }
}

/** Soft collaboration notification — quiet enough to not distract */
export function triggerCollabPing(): void {
    if (typeof window === "undefined") return;
    try {
        const c = ctx();
        const now = c.currentTime;

        const osc = c.createOscillator();
        const g = c.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(660, now + 0.08);

        g.gain.setValueAtTime(0.07, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(g);
        g.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.25);

    } catch { /* silent fail */ }
}

/** Agent-ready closing chime — punchy, affirmative */
export function triggerClosingPing(): void {
    if (typeof window === "undefined") return;
    try {
        const c = ctx();
        const now = c.currentTime;

        [523, 659, 784].forEach((freq, i) => {
            const osc = c.createOscillator();
            const g = c.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now);
            g.gain.setValueAtTime(0.1, now + i * 0.07);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.2);
            osc.connect(g);
            g.connect(c.destination);
            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.25);
        });
    } catch { /* silent fail */ }
}

/** Vault-unlock cascade — celebratory post-payment sound */
export function triggerVaultOpen(): void {
    if (typeof window === "undefined") return;
    try {
        const c = ctx();
        const now = c.currentTime;

        const chord = [261, 329, 392, 523, 659]; // C major arpeggio
        chord.forEach((freq, i) => {
            const osc = c.createOscillator();
            const g = c.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            g.gain.setValueAtTime(0, now + i * 0.1);
            g.gain.linearRampToValueAtTime(0.12, now + i * 0.1 + 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.7);
            osc.connect(g);
            g.connect(c.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.8);
        });

    } catch { /* silent fail */ }
}

/** Full Web 4.0 handoff sequence: whoosh → wait → ping */
export function triggerFullHandoff(onComplete?: () => void): void {
    triggerHandoffWhoop();
    setTimeout(() => {
        triggerNeuralPing();
        if (onComplete) onComplete();
    }, 400);
}
