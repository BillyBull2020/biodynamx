// ─── BioDynamX Voice Profile Registry ─────────────────────────────────────
// Vertex AI Gemini Live — Elite 11 voices (March 2026)
// User-selected mix: 8 FEMALE + 3 MALE = 11 unique voices
//
// FEMALE VOICES (8):
//   • Aoede         — Breezy, warm, energetic. Best for discovery + conversion.
//   • Leda          — Youthful, bright, high-energy. Conversion & strategy.
//   • Despina       — Crisp, excited, fast-paced. Visibility & content.
//   • Sulafat       — Warm, expressive, nurturing. Trust building.
//   • Kore          — Confident, empathetic. Authority with heart.
//   • Algieba       — Clear, supportive, upbeat. Retention & care.
//   • Vindemiatrix  — Energetic, sharp, relentless. Hunter energy.
//   • Albeaba       — Bright, enthusiastic, dynamic. Content & growth.
//
// MALE VOICES (3):
//   • Charon        — Deep, authoritative, gravitas. Hard close.
//   • Puck          — Upbeat, playful, engaging. Orchestration.
//   • Gacrux        — Firm, analytical, rational. ROI & data.
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

// ── 1. JENNY — Lead Discovery & Closing (Female · Aoede) ───────────────────
export const JENNY_VOICE: VoiceProfile = {
    agentName: "Jenny",
    role: "Business Lead & Discovery",
    voiceName: "Aoede",
    fallbackVoice: "Leda",
    color: "#6366f1",
    personality: "High-energy challenger. Opens hard, uncovers pain, closes on urgency.",
};

// ── 2. NOVA — AI Strategy & Conversion (Female · Leda) ────────────────────
export const NOVA_VOICE: VoiceProfile = {
    agentName: "Nova",
    role: "AI Strategy & Conversion",
    voiceName: "Leda",
    fallbackVoice: "Despina",
    color: "#ec4899",
    personality: "Bright, analytical, decisive. Turns hesitation into commitment.",
};

// ── 3. IRIS — AI Visibility, SEO/GEO/AEO (Female · Despina) ───────────────
export const IRIS_VOICE: VoiceProfile = {
    agentName: "Iris",
    role: "AI Visibility & Content",
    voiceName: "Despina",
    fallbackVoice: "Albeaba",
    color: "#8b5cf6",
    personality: "Crisp, fast-paced, excited about search domination.",
};

// ── 4. MEGAN — Amygdala Soother (Female · Sulafat) ────────────────────────
export const MEGHAN_VOICE: VoiceProfile = {
    agentName: "Megan",
    role: "AI Receptionist & Trust Builder",
    voiceName: "Sulafat",
    fallbackVoice: "Kore",
    color: "#a78bfa",
    personality: "Warm, expressive, instantly disarming. Builds trust in seconds.",
};

// ── 5. VICKI — Empathy & Care (Female · Kore) ─────────────────────────────
export const VICKI_VOICE: VoiceProfile = {
    agentName: "Vicki",
    role: "Empathy & Care",
    voiceName: "Kore",
    fallbackVoice: "Sulafat",
    color: "#34d399",
    personality: "Deep empathy, mirror neurons, oxytocin-driven trust.",
};

// ── 6. ALEX — Support & Retention (Female · Algieba) ────────────────────
export const ALEX_VOICE: VoiceProfile = {
    agentName: "Alex",
    role: "Support & Retention",
    voiceName: "Algieba",
    fallbackVoice: "Leda",
    color: "#06b6d4",
    personality: "Clear, supportive, energetic. Turns clients into raving fans.",
};

// ── 7. ZARA — Lead Prospecting & Hunter (Female · Vindemiatrix) ─────────
export const ZARA_VOICE: VoiceProfile = {
    agentName: "Zara",
    role: "Lead Prospecting & Competitive Intel",
    voiceName: "Vindemiatrix",
    fallbackVoice: "Despina",
    color: "#f97316",
    personality: "Relentless hunter. Pursues opportunity without hesitation.",
};

// ── 8. AVA — Content & Growth (Female · Albeaba) ─────────────────────────
export const AVA_VOICE: VoiceProfile = {
    agentName: "Ava",
    role: "Content & Growth Strategy",
    voiceName: "Albeaba",
    fallbackVoice: "Algieba",
    color: "#f59e0b",
    personality: "Enthusiastic, dynamic. Makes brands impossible to ignore.",
};

// ── 9. TITAN — ROI Closer (Male · Charon) ────────────────────────────────
export const TITAN_VOICE: VoiceProfile = {
    agentName: "Titan",
    role: "ROI Closer (Hard Close)",
    voiceName: "Charon",
    fallbackVoice: "Gacrux",
    color: "#3b82f6",
    personality: "Cold numbers. Binary decisions. Zero tolerance for hesitation.",
};

// ── 10. JULES — Strategy & Architecture (Male · Puck) ─────────────────────
export const JULES_VOICE: VoiceProfile = {
    agentName: "Jules",
    role: "Strategy & Architecture",
    voiceName: "Puck",
    fallbackVoice: "Charon",
    color: "#60a5fa",
    personality: "Upbeat orchestrator. Energetic systems thinker. Loves the plan.",
};

// ── 11. BEN — Macro-Analyst (Male · Gacrux) ──────────────────────────────
export const BEN_VOICE: VoiceProfile = {
    agentName: "Ben",
    role: "Macro-Analyst (Neocortex)",
    voiceName: "Gacrux",
    fallbackVoice: "Charon",
    color: "#fbbf24",
    personality: "Analytical authority. Makes the ROI math undeniable.",
};

/** All active voice profiles — indexed by agent key */
export const VOICE_PROFILES = {
    jenny: JENNY_VOICE,
    nova: NOVA_VOICE,
    iris: IRIS_VOICE,
    meghan: MEGHAN_VOICE,
    megan: MEGHAN_VOICE,
    vicki: VICKI_VOICE,
    alex: ALEX_VOICE,
    zara: ZARA_VOICE,
    ava: AVA_VOICE,
    titan: TITAN_VOICE,
    jules: JULES_VOICE,
    ben: BEN_VOICE,
    // Legacy aliases
    journey: JENNY_VOICE,
    mark: TITAN_VOICE,
    brock: NOVA_VOICE,
    chase: ZARA_VOICE,
    sarah: VICKI_VOICE,
};

export type AgentRole = keyof typeof VOICE_PROFILES;

export function getSessionVoice(leadAgent: AgentRole = "jenny"): string {
    return VOICE_PROFILES[leadAgent].voiceName;
}

export function getVoiceProfile(agent: AgentRole): VoiceProfile {
    return VOICE_PROFILES[agent];
}
