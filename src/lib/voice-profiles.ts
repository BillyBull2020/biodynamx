// ─── BioDynamX Voice Profile Registry ─────────────────────────────────────
// Vertex AI Gemini Live — Best-rated voices (March 2026)
//
// FEMALE VOICES (top-rated):
//   • Aoede    — Breezy, warm, energetic female. Best for discovery + conversion.
//   • Zephyr   — Bright, clear female. Optimistic, engaging.
//   • Leda     — Youthful, friendly female. Great for support roles.
//   • Sulafat  — Warm, expressive female. Best for nurturing/empathy.
//   • Kore     — Firm, confident female. Great for authority roles.
//
// MALE VOICES (top-rated):
//   • Fenrir   — Excitable, high-energy male. Urgency & energy.
//   • Puck     — Upbeat, playful male. Engaging & approachable.
//   • Charon   — Deep, authoritative male. Trust & gravitas.
//   • Orus     — Firm, calm male. Professional authority.
//
// NOTE: Gemini Live API supports ONE voice per session.
// ─────────────────────────────────────────────────────────────────────────────

export interface VoiceProfile {
    agentName: string;
    role: string;
    voiceName: string;
    fallbackVoice: string;
    color: string;
    personality: string;
}

// ── PRIMARY SALES AGENT — Jenny (Lead Discovery & Closing) ────────────────
export const JENNY_VOICE: VoiceProfile = {
    agentName: "Jenny",
    role: "Business Lead & Discovery",
    voiceName: "Aoede",           // Breezy, warm, energetic female — #1 rated
    fallbackVoice: "Zephyr",     // Bright, clear female backup
    color: "#6366f1",
    personality: "Challenger. High-status. Confident. Drives action.",
};

// ── NOVA — AI Strategy & Conversion (New Female) ─────────────────────────
export const NOVA_VOICE: VoiceProfile = {
    agentName: "Nova",
    role: "AI Strategy & Conversion",
    voiceName: "Zephyr",          // Bright, optimistic female — high engagement
    fallbackVoice: "Leda",       // Youthful, friendly female backup
    color: "#ec4899",
    personality: "Analytical. Decisive. Converts hesitation to commitment.",
};

// ── TITAN — ROI Closer (Replaced Mark) ──────────────────────────────────
export const TITAN_VOICE: VoiceProfile = {
    agentName: "Titan",
    role: "ROI Closer (Hard Close)",
    voiceName: "Fenrir",          // Excitable, high-energy male — urgency
    fallbackVoice: "Orus",       // Firm, calm male backup
    color: "#3b82f6",
    personality: "Executioner. Binary decisions. Zero tolerance for hesitation.",
};

// ── JULES — Strategy & Architecture ─────────────────────────────────────
export const JULES_VOICE: VoiceProfile = {
    agentName: "Jules",
    role: "Strategy & Architecture",
    voiceName: "Puck",            // Upbeat, engaging male — orchestrator energy
    fallbackVoice: "Charon",     // Deep, authoritative male backup
    color: "#60a5fa",
    personality: "Strategist. Lead orchestrator. Systems thinker.",
};

// ── BEN — Macro-Analyst ──────────────────────────────────────────────────
export const BEN_VOICE: VoiceProfile = {
    agentName: "Ben",
    role: "Macro-Analyst (Neocortex)",
    voiceName: "Charon",          // Deep, authoritative male — rational persuasion
    fallbackVoice: "Orus",
    color: "#fbbf24",
    personality: "Logician. Cold math. ROI-focused.",
};

// ── CHASE — Lead Prospecting ─────────────────────────────────────────────
export const CHASE_VOICE: VoiceProfile = {
    agentName: "Chase",
    role: "Lead Prospecting",
    voiceName: "Fenrir",          // High-energy, excitable male — hunter energy
    fallbackVoice: "Puck",
    color: "#f97316",
    personality: "Hunter. Urgency. Competitive. Relentless.",
};

// ── IRIS — AI Visibility & Content ───────────────────────────────────────
export const IRIS_VOICE: VoiceProfile = {
    agentName: "Iris",
    role: "AI Visibility & Content",
    voiceName: "Leda",            // Youthful, friendly female — approachable authority
    fallbackVoice: "Zephyr",
    color: "#8b5cf6",
    personality: "The eye. SEO/GEO/AEO expert. Visibility obsessed.",
};

// ── ALEX — Support & Retention ──────────────────────────────────────────
export const ALEX_VOICE: VoiceProfile = {
    agentName: "Alex",
    role: "Support & Retention",
    voiceName: "Zephyr",          // Bright, clear — supportive but assured
    fallbackVoice: "Leda",
    color: "#06b6d4",
    personality: "Guardian. Retention focused. 24/7 presence.",
};

// ── MEGHAN — Amygdala Soother ────────────────────────────────────────────
export const MEGHAN_VOICE: VoiceProfile = {
    agentName: "Meghan",
    role: "AI Receptionist & Amygdala Soother",
    voiceName: "Sulafat",         // Warm, expressive female — trust building
    fallbackVoice: "Kore",
    color: "#a78bfa",
    personality: "Nurturer. Builds trust instantly. Soothing presence.",
};

// ── VICKI — Empathy & Care ───────────────────────────────────────────────
export const VICKI_VOICE: VoiceProfile = {
    agentName: "Vicki",
    role: "Empathy & Care",
    voiceName: "Kore",            // Firm yet warm female — empathy with authority
    fallbackVoice: "Sulafat",
    color: "#34d399",
    personality: "Empath. Mirror neurons. Oxytocin-driven trust.",
};

/** All active voice profiles — indexed by agent key */
export const VOICE_PROFILES = {
    jenny: JENNY_VOICE,
    nova: NOVA_VOICE,
    titan: TITAN_VOICE,
    jules: JULES_VOICE,
    ben: BEN_VOICE,
    chase: CHASE_VOICE,
    iris: IRIS_VOICE,
    alex: ALEX_VOICE,
    meghan: MEGHAN_VOICE,
    vicki: VICKI_VOICE,
    // Legacy aliases kept for backward compatibility
    journey: JENNY_VOICE,
    mark: TITAN_VOICE,   // Mark → Titan
    brock: NOVA_VOICE,    // Brock → Nova
    megan: MEGHAN_VOICE,
    billy: JULES_VOICE,
    sarah: VICKI_VOICE,
};

export type AgentRole = keyof typeof VOICE_PROFILES;

/**
 * Get the Vertex AI voice name for a Gemini Live session.
 * @param leadAgent - Which agent sets the voice tone for this session
 */
export function getSessionVoice(leadAgent: AgentRole = "jenny"): string {
    return VOICE_PROFILES[leadAgent].voiceName;
}

/**
 * Get the full voice profile for an agent.
 */
export function getVoiceProfile(agent: AgentRole): VoiceProfile {
    return VOICE_PROFILES[agent];
}
