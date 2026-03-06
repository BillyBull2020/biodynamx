// ─── BioDynamX Agent Cloning Hub ─────────────────────────────────────────
// Vertex AI Edition — Gemini Live 2.5 Flash Native Audio
// Agent profiles sourced from: Meghan2026vertexai/profiles/
// ─────────────────────────────────────────────────────────────────────────

export {
    cloneAgent,
    duplicateAgent,
    createDefaultTeam,
    createFullSalesTeam,
    generateSystemInstruction,
    AGENT_TEMPLATES,
    // Pre-built Vertex AI agent instances
    ARIA_RECEPTIONIST,
    JENNY_LISTENER,
    MARK_ARCHITECT,
    JULES_ARCHITECT,
    SUPPORT_SPECIALIST,
    IRONCLAW_SUPER_AGENT,
    BROCK_SECURITY,
    BEN_GMB,
    JENNY_CLOSER,
    HUNTER_PROSPECTOR,
    NOVA_VISIBILITY,
    ALEX_SUPPORT,
} from "./agent-factory";

import { cloneAgent } from "./agent-factory";
import industryPainPoints from "../scripts/industry-pain-points.json";

export type { AgentClone } from "./agent-factory";

// Re-export persona template path for runtime loading
export const PERSONA_TEMPLATE_PATH = "/clones/template/persona.json";

/**
 * Quick-start: Create industry-specific agent teams
 * Routes through Jenny (discovery) → Mark (closing) for the target industry.
 */
export function createIndustryTeam(industry: string) {
    const rawPrompts = (industryPainPoints as Record<string, Record<string, string>>)[industry.toLowerCase()]
        || (industryPainPoints as Record<string, Record<string, string>>).ecommerce;

    const prompts = {
        jenny: rawPrompts.hunterScript || "Focus on churn rate and missing AI automation. Look for leaking revenue metrics.",
        mark: rawPrompts.engineerScript || "Calculate ROI based on churn reduction. Highlight we only take two clients per sector to secure the 2.1x ROI guarantee.",
    };

    return [
        cloneAgent("jenny_discovery", {
            instruction: `You are Jenny, a ${industry} growth specialist. ${prompts.jenny}`,
        }),
        cloneAgent("mark_closer", {
            instruction: `You are Mark, a ${industry} ROI specialist. ${prompts.mark}`,
        }),
    ];
}
