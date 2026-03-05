// ─── BioDynamX Voice Profile Registry ───────────────────
// Defines voice identities for Journey (Hunter) and Mark (Engineer)
// 
// NOTE: Gemini Live API supports ONE voice per session.
// The dual-agent experience works through persona switching
// in the system instruction — both agents share the audio stream
// but speak with distinct language patterns.
//
// Voice selection here sets the PRIMARY voice for the session.
// Use `getSessionVoice()` to pick the right voice based on
// which agent should "lead" the call.

export interface VoiceProfile {
    agentName: string;
    role: string;
    voiceName: string;
    fallbackVoice: string;
    personality: string;
    openingLine: string;
    color: { primary: string; glow: string };
}

/** 
 * Gemini Live API Voice Options:
 * - Sulafat: Warm, expressive, female-sounding. (Standard Jenny)
 * - Charon: Deep, authoritative, male-sounding. (Standard Mark)
 * - Fenrir: Commanding, strategic, male-sounding. (Standard Billy)
 * - Kore: Patient, warm, female-sounding. (Standard Sarah)
 * - Puck: Youthful, energetic, male-sounding.
 * - Orus: Sincere, reliable, male-sounding.
 */

export const JOURNEY_VOICE: VoiceProfile = {
    agentName: "Journey",
    role: "The Hunter (Sales Investigator)",
    voiceName: "Sulafat",        // Warm/expressive female
    fallbackVoice: "Kore",     // Backup warm female
    personality: "Energetic, empathetic, relentless. Uses 'Fear of Loss' to open.",
    openingLine:
        "Hey! I'm Journey, your AI growth strategist from BioDynamX. " +
        "Drop your website URL and I'll run a live 360-degree audit right now — " +
        "I'll show you exactly where you're leaking revenue.",
    color: { primary: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
};

export const MARK_VOICE: VoiceProfile = {
    agentName: "Mark",
    role: "The Engineer (Solution Architect)",
    voiceName: "Charon",       // Deep/authoritative male
    fallbackVoice: "Orus",     // Backup deep male
    personality: "Calm, data-driven, authoritative. Uses 'The ROI Dream' to close.",
    openingLine:
        "Billy De La Taurus protocol initialized. I am the Architect. " +
        "Let's find your revenue leaks.",
    color: { primary: "#3b82f6", glow: "rgba(59,130,246,0.5)" },
};

export const BILLY_VOICE: VoiceProfile = {
    agentName: "Billy",
    role: "Chief Strategy Officer",
    voiceName: "Fenrir",
    fallbackVoice: "Charon",
    personality: "Direct, visionary, uncompromising.",
    openingLine: "I don't audit sites. I audit business models. Let's see your engine.",
    color: { primary: "#ef4444", glow: "rgba(239,68,68,0.5)" },
};

export const SARAH_VOICE: VoiceProfile = {
    agentName: "Sarah",
    role: "Customer Success",
    voiceName: "Kore",
    fallbackVoice: "Sulafat",
    personality: "Helpful, patient, organized.",
    openingLine: "Hi! I'm Sarah. I'm here to ensure your transition to AI is perfect.",
    color: { primary: "#8b5cf6", glow: "rgba(139,92,246,0.5)" },
};

/** All available voice profiles */
export const VOICE_PROFILES = {
    journey: JOURNEY_VOICE,
    mark: MARK_VOICE,
    billy: BILLY_VOICE,
    sarah: SARAH_VOICE,
} as const;

export type AgentRole = keyof typeof VOICE_PROFILES;

/**
 * Get the voice name for a Gemini Live session.
 * Since the API only supports one voice per session,
 * we pick based on which agent "leads" the call.
 * 
 * @param leadAgent - Which agent should set the voice tone
 * @returns voiceName for the Gemini speechConfig
 */
export function getSessionVoice(leadAgent: AgentRole = "journey"): string {
    return VOICE_PROFILES[leadAgent].voiceName;
}

/**
 * Detect which agent is speaking based on text markers.
 * The Gemini model uses [Journey] and [Mark] tags in its output.
 */
export function detectSpeaker(text: string): AgentRole | null {
    const lower = text.toLowerCase();
    if (lower.includes("[journey]") || lower.includes("journey:")) return "journey";
    if (lower.includes("[mark]") || lower.includes("mark:")) return "mark";
    return null;
}

/**
 * Get the voice profile for a detected speaker
 */
export function getVoiceProfile(agent: AgentRole): VoiceProfile {
    return VOICE_PROFILES[agent];
}
